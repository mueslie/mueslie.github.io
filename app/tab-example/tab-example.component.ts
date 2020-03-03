import { Component, ViewChild, OnInit, AfterViewInit} from '@angular/core';
import { FormControl } from '@angular/forms';
import {DataService} from '../data.service';
import {Population} from '../class/population';
import {NativeType} from '../class/native-type';
import { ChartService } from '../chart.service';
import { PiechartComponent } from '../piechart/piechart.component';
import { MatTabGroup } from '@angular/material';
import {MatSlider} from '@angular/material'
import * as d3 from 'd3';
import { group } from '@angular/animations';
import {StackbarComponent} from '../stackbar/stackbar.component';
import {PyramidComponent} from '../pyramid/pyramid.component';

@Component({
  selector: 'app-tab-example',
  templateUrl: './tab-example.component.html',
  styleUrls: ['./tab-example.component.scss']
})

export class TabExampleComponent implements OnInit{
  @ViewChild('gender', { static: false }) gender: MatTabGroup;
  @ViewChild('fertility', { static: false }) fertility: MatTabGroup;
  @ViewChild('migration', { static: false }) migration: MatTabGroup;
  @ViewChild('deatRate', { static: false }) deatRate: MatTabGroup;
  @ViewChild('followUp', { static: false }) followUp: MatTabGroup;


  tabs = ['Einheimische Nicht-Muslime', 'Einheimische Muslime', 'Nicht-Muslimische Einwanderer', 'Muslimische Einwanderer'];
  overheadtabs = ['Übersicht', 'Geschlechtsverteilung', 'Fertilität', 'Einwanderung', 'Überlebensrate', 'Nachzug'];
  invader = 2;
  graphs = [];
  data: Population[];
  groupIndex = 0;
  categoryIndex = 0;
  lastIndex = 0;
  unsavedState = false;
  private year = 2020;

  selectCategory(tab) {
    this.groupIndex = tab.index;
    this.loadContent();
  }

  selectedTab(tab) {
    this.loadContent();
  }


  loadContent() {
    if (this.categoryIndex === 0) {
      if (this.lastIndex == this.categoryIndex){
        this.graphs.map(val => val.setYear(this.year));
      }else{
        this.graphs.map(val => val.svg.remove());
        this.graphs = [];
        this.buildOverview();
      }
    }else {
      this.graphs.map(val => val.svg.remove());
      this.graphs = [];
      if (this.categoryIndex === 1) { // gender distribution
        this.buildGenderDistributionGraph();
      } else if (this.categoryIndex === 2) { // fertility
        this.buildFertilityGraph();
      } else if (this.categoryIndex === 3) { // immigration
        this.buildimmigrationGraph();
      } else if (this.categoryIndex === 4) { // survive rate
        this.buildSurviveGraph();
      } else if (this.categoryIndex === 5) { // reunification
        this.buildReunificationGraph();
      }
    }
    this.lastIndex = this.categoryIndex;

  }

  constructor(private dataService: DataService) { }

  ngAfterViewInit(){
    this.buildOverview();
  }

  ngOnInit() {
    const slider = document.getElementById('yearSliderInput');
    const output = document.getElementById('yearTextInput');
    const site = this;

    (output as HTMLInputElement).value = (slider as HTMLInputElement).value;

    slider.oninput = function() {
      (output as HTMLInputElement).value = (slider as HTMLInputElement).value;
      site.year = Number((slider as HTMLInputElement).value);
      site.loadContent();
    };
    output.onchange = function() {
      if (Number((output as HTMLInputElement).value) > 2100) {
        (output as HTMLInputElement).value = '2100';
      } else if (Number((output as HTMLInputElement).value) < 2020) {
        (output as HTMLInputElement).value = '2020';
      }
      (slider as HTMLInputElement).value = (output as HTMLInputElement).value;
      site.year = (Number)((output as HTMLInputElement).value);
      site.loadContent();
    };
    this.data = this.dataService.years[Number((slider as HTMLInputElement).value) - 2020].population;
    this.loadContent();
  }

  clearGraph() {
    d3.select('#graphFemale').html('');
    d3.select('#graphMale').html('');
  }

  savePopulation() {
    let femaleValues = this.graphs[0].getValues();
    let maleValues = this.graphs[1].getValues();

    const groupValue = this.dataService.getGraph(Number((document.getElementById('yearSliderInput') as HTMLInputElement).value), this.getNativeTypeFromIndex(this.groupIndex));
    groupValue.calculateAmount();

    let female = this.dataService.years[this.year - 2020].getPopulation(this.getNativeTypeFromIndex(this.groupIndex)).female
    let male = this.dataService.years[this.year - 2020].getPopulation(this.getNativeTypeFromIndex(this.groupIndex)).male

    let amountFemale = Number((document.getElementById('femaleAmountInput') as HTMLInputElement).value);
    let amountMale = Number((document.getElementById('maleAmountInput') as HTMLInputElement).value);
    if(this.categoryIndex === 1){
      for(let i = 0; i<=100; i ++){
        female[i].amount = amountFemale*femaleValues[i];
        female[i].amount_generated = true;
        male[i].amount = amountMale*maleValues[i];
        male[i].amount_generated = true;
      }
    }

    for(var userPoint in this.graphs[0].getUserPoints()){
      female[userPoint].amount_generated = false;
    }
    for(var userPoint in this.graphs[1].getUserPoints()){
      female[userPoint].amount_generated = false;
    }
    this.dataService.years[this.year - 2020].getPopulation(this.getNativeTypeFromIndex(this.groupIndex)).male = male;
    this.dataService.years[this.year - 2020].getPopulation(this.getNativeTypeFromIndex(this.groupIndex)).female = female;
    this.dataService.calculatePopulation(2021);
  }

  saveImmigration() {
    let femaleValues = this.graphs[0].getValues();
    let maleValues = this.graphs[1].getValues();

    const groupValue = this.dataService.getGraph(Number((document.getElementById('yearSliderInput') as HTMLInputElement).value), this.getNativeTypeFromIndex(this.groupIndex));

    let female = this.dataService.years[this.year - 2020].getPopulation(this.getNativeTypeFromIndex(this.groupIndex)).female
    let male = this.dataService.years[this.year - 2020].getPopulation(this.getNativeTypeFromIndex(this.groupIndex)).male

    let amountFemale = Number((document.getElementById('femaleAmountInput') as HTMLInputElement).value);
    let amountMale = Number((document.getElementById('maleAmountInput') as HTMLInputElement).value);
    
    for(let i = 0; i<=100; i ++){
      female[i].immigration = amountFemale*femaleValues[i];
      female[i].immigration_generated = true;
      male[i].immigration = amountMale*maleValues[i];
      male[i].immigration_generated = true;
    }
    let userPoints = this.graphs[0].getUserPoints();
    for(var userPoint in userPoints){
      female[userPoints[userPoint]].immigration_generated = false;
    }
    userPoints = this.graphs[1].getUserPoints();
    for(var userPoint in userPoints){
      male[userPoints[userPoint]].immigration_generated = false;
    }
    this.dataService.years[this.year - 2020].getPopulation(this.getNativeTypeFromIndex(this.groupIndex)).male = male;
    this.dataService.years[this.year - 2020].getPopulation(this.getNativeTypeFromIndex(this.groupIndex)).immigration_male = amountMale;
    this.dataService.years[this.year - 2020].getPopulation(this.getNativeTypeFromIndex(this.groupIndex)).female = female;
    this.dataService.years[this.year - 2020].getPopulation(this.getNativeTypeFromIndex(this.groupIndex)).immigration_female = amountFemale;
    this.dataService.years[this.year - 2020].getPopulation(this.getNativeTypeFromIndex(this.groupIndex)).immigration = amountMale + amountFemale;
    this.dataService.calculatePopulation(this.year + 1);
  }

  saveFertility() {
    let femaleValues = this.graphs[0].getValues();

    let female = this.dataService.years[this.year - 2020].getPopulation(this.getNativeTypeFromIndex(this.groupIndex)).female

    for(let i = 0; i<=100; i ++){
      female[i].immigration = femaleValues[i];
      female[userPoint].immigration_generated = true;
    }
    let userPoints = this.graphs[1].getUserPoints();
    for(var userPoint in userPoints){
      female[userPoints[userPoint]].immigration_generated = false;
    }
    this.dataService.years[this.year - 2020].getPopulation(this.getNativeTypeFromIndex(this.groupIndex)).birth_amount = Number((document.getElementById('femaleAmountInput') as HTMLInputElement).value);
    this.dataService.years[this.year - 2020].getPopulation(this.getNativeTypeFromIndex(this.groupIndex)).female = female;
    this.dataService.calculatePopulation(this.year);
  }

  saveSurvive() {
    let femaleValues = this.graphs[0].getValues();
    let maleValues = this.graphs[1].getValues();

    const groupValue = this.dataService.getGraph(Number((document.getElementById('yearSliderInput') as HTMLInputElement).value), this.getNativeTypeFromIndex(this.groupIndex));

    let female = this.dataService.years[this.year - 2020].getPopulation(this.getNativeTypeFromIndex(this.groupIndex)).female
    let male = this.dataService.years[this.year - 2020].getPopulation(this.getNativeTypeFromIndex(this.groupIndex)).male

    let amountFemale = Number((document.getElementById('femaleAmountInput') as HTMLInputElement).value);
    let amountMale = Number((document.getElementById('maleAmountInput') as HTMLInputElement).value);
    for(let i = 0; i<=100; i ++){
      female[i].immigration = amountFemale*femaleValues[i];
      male[i].immigration = amountMale*maleValues[i];
    }
    for(var userPoint in this.graphs[0].getUserPoints()){
      female[userPoint].amount_generated = false;
    }
    for(var userPoint in this.graphs[1].getUserPoints()){
      female[userPoint].amount_generated = false;
    }
    this.dataService.years[this.year - 2020].getPopulation(this.getNativeTypeFromIndex(this.groupIndex)).male = male;
    this.dataService.years[this.year - 2020].getPopulation(this.getNativeTypeFromIndex(this.groupIndex)).female = female;
    this.dataService.calculatePopulation(this.year);
  }

  saveReunification() {
    let femaleValues = this.graphs[0].getValues();
    let maleValues = this.graphs[1].getValues();

    const groupValue = this.dataService.getGraph(Number((document.getElementById('yearSliderInput') as HTMLInputElement).value), this.getNativeTypeFromIndex(this.groupIndex));

    let female = this.dataService.years[this.year - 2020].getPopulation(this.getNativeTypeFromIndex(this.groupIndex)).female
    let male = this.dataService.years[this.year - 2020].getPopulation(this.getNativeTypeFromIndex(this.groupIndex)).male

    let amountFemale = Number((document.getElementById('femaleAmountInput') as HTMLInputElement).value);
    let amountMale = Number((document.getElementById('maleAmountInput') as HTMLInputElement).value);
    for(let i = 0; i<=100; i ++){
      female[i].immigration = amountFemale*femaleValues[i];
      male[i].immigration = amountMale*maleValues[i];
    }
    for(var userPoint in this.graphs[0].getUserPoints()){
      female[userPoint].amount_generated = false;
    }
    for(var userPoint in this.graphs[1].getUserPoints()){
      female[userPoint].amount_generated = false;
    }
    this.dataService.years[this.year - 2020].getPopulation(this.getNativeTypeFromIndex(this.groupIndex)).male = male;
    this.dataService.years[this.year - 2020].getPopulation(this.getNativeTypeFromIndex(this.groupIndex)).female = female;
    this.dataService.calculatePopulation(this.year);
  }

  buildGenderDistributionGraph() {
    // diesen part muesste man jetzt nur noch auslagern auf die einzelnen websites. Entweder auf die klick action der einzelnen tabs oder auf ne unter seite die man lädt wenn man ein tab drückt. .
    // müssen wir uns noch mal überlegen

    //  random pro/kontra
    //  eigene website: wäre vermutlich übersichtlicher die einzelnen divs vorzubereiten und dann anzuzeigen. du hast das ja schon mal mit den graphen gemacht. man könnte das eifnach kopieren
    // wie sieht das mit der komplexität aus? ich weiß es nicht

    // als click action: man müsste dann quasi die seite aus dynamischen divs zusammenbauen die dann gefüllt werden können.
    // könnte unübersichtlch werden wenn hier alles ist.

    // const div = d3.select(document.getElementById('mat-tab-content-' + this.categoryIndex + '-' + this.groupIndex + '').children[0]);
    let year = Number((document.getElementById('yearSliderInput') as HTMLInputElement).value);
    const groupValue = this.dataService.getGraph(year, this.getNativeTypeFromIndex(this.groupIndex));

    groupValue.calculateAmount();
    (document.getElementById('femaleAmountInput') as HTMLInputElement).value = String(Math.round(groupValue.amountfemale));
    (document.getElementById('maleAmountInput') as HTMLInputElement).value = String(Math.round(groupValue.amountmale));
    if (year == 2020){
      (document.getElementById('femaleAmountInput') as HTMLInputElement).disabled = false;
      (document.getElementById('maleAmountInput') as HTMLInputElement).disabled = false;
      (document.getElementById('saveButton') as HTMLButtonElement).style.visibility="visible";
    }else{
      (document.getElementById('femaleAmountInput') as HTMLInputElement).disabled = true;
      (document.getElementById('maleAmountInput') as HTMLInputElement).disabled = true;
      (document.getElementById('saveButton') as HTMLButtonElement).style.visibility="hidden";
    }

    const femaleValues = [];
    const maleValues = [];
    for (let i = 0; i <= 100; i ++) {
        femaleValues.push(groupValue.female[i].amount / groupValue.amountfemale);
        maleValues.push(groupValue.male[i].amount / groupValue.amountmale);
    }

    let editable = year == 2020;

    this.graphs[0] = new ChartService(femaleValues, [0, 100], 767, 370, d3.select(document.getElementById('genderF')).insert('svg'), (document.getElementById('saveButton') as HTMLButtonElement), editable);
    this.graphs[1] = new ChartService(maleValues, [0, 100], 767, 370, d3.select(document.getElementById('genderM')).insert('svg'), (document.getElementById('saveButton') as HTMLButtonElement), editable);


    // this.graphs[0].setConnectedGraph(this.graphs[1]);
    // this.graphs[1].setConnectedGraph(this.graphs[0]);
    // this.setRandomValues();
  }

  buildFertilityGraph() {
    const div = d3.select(document.getElementById('mat-tab-content-' + this.categoryIndex + '-' + this.groupIndex + '').children[0]);

    const groupValue = this.dataService.getGraph(Number((document.getElementById('yearSliderInput') as HTMLInputElement).value), this.getNativeTypeFromIndex(this.groupIndex));
    let femaleValues = [];
    (document.getElementById('femaleAmountInput') as HTMLInputElement).value = String(Math.round(groupValue.birth_amount));
    for (let i = 0; i <= 100; i++) {
      if(groupValue.female[i].birthrate_generated){
        femaleValues.push(undefined);
      }else{
        femaleValues.push(groupValue.female[i].birthrate)
      }
    }
    (document.getElementById('saveButton') as HTMLButtonElement).style.visibility="hidden";

    this.graphs[0] = new ChartService(femaleValues, [0, 100], 767, 370, d3.select(document.getElementById('fertilityF')).insert('svg'), (document.getElementById('saveButton') as HTMLButtonElement));
    // this.setRandomValues();
  }

  buildimmigrationGraph() {
    const groupValue = this.dataService.getGraph(Number((document.getElementById('yearSliderInput') as HTMLInputElement).value), this.getNativeTypeFromIndex(this.groupIndex));
    
    let maleTotal = groupValue.immigration_male;
    let femaleTotal = groupValue.immigration_female;
    (document.getElementById('femaleAmountInput') as HTMLInputElement).value = String(Math.round(femaleTotal));
    (document.getElementById('maleAmountInput') as HTMLInputElement).value = String(Math.round(maleTotal));

    let femaleValues = [];
    let maleValues = [];
    for (let i = 0; i <= 100; i ++) {
      if (groupValue.female[i].immigration_generated){
        femaleValues.push(undefined);
      }else{
        femaleValues.push(groupValue.female[i].immigration / femaleTotal);
      }
      if (groupValue.male[i].immigration_generated){
        maleValues.push(undefined);
      }else{
        maleValues.push(groupValue.male[i].immigration / maleTotal);
      }
    }
    (document.getElementById('saveButton') as HTMLButtonElement).style.visibility="hidden";

    this.graphs[0] = new ChartService(femaleValues, [0, 100], 767, 370, d3.select(document.getElementById('migrationF')).insert('svg'), (document.getElementById('saveButton') as HTMLButtonElement));
    this.graphs[1] = new ChartService(maleValues, [0, 100], 767, 370, d3.select(document.getElementById('migrationM')).insert('svg'), (document.getElementById('saveButton') as HTMLButtonElement));
    // this.setRandomValues();
  }

  buildSurviveGraph() {
    const groupValue = this.dataService.getGraph(Number((document.getElementById('yearSliderInput') as HTMLInputElement).value), this.getNativeTypeFromIndex(this.groupIndex));

    let femaleValues = [];
    let maleValues = [];
    for(let i = 0; i <= 100; i++){
      if (groupValue.female[i].surviverate_generated){
        femaleValues.push(undefined);
      }else{
        femaleValues.push(groupValue.female[i].surviverate);
      }
      if(groupValue.male[i].surviverate_generated){
        maleValues.push(undefined);
      }else{
        maleValues.push(groupValue.male[i].surviverate);
      }
    }
    (document.getElementById('saveButton') as HTMLButtonElement).style.visibility="hidden";

    this.graphs[0] = new ChartService(femaleValues, [0, 100], 767, 370, d3.select(document.getElementById('surviveF')).insert('svg'), (document.getElementById('saveButton') as HTMLButtonElement));
    this.graphs[1] = new ChartService(maleValues, [0, 100], 767, 370, d3.select(document.getElementById('surviveM')).insert('svg'), (document.getElementById('saveButton') as HTMLButtonElement));
  }

  buildReunificationGraph() {
    const groupValue = this.dataService.getGraph(Number((document.getElementById('yearSliderInput') as HTMLInputElement).value), this.getNativeTypeFromIndex(this.groupIndex));

    let maleTotal = 0;
    let femaleTotal = 0;
    for(let i = 0; i <= 100; i++){
      femaleTotal += groupValue.female[i].reunification;
      maleTotal += groupValue.male[i].reunification;
    }
    (document.getElementById('femaleAmountInput') as HTMLInputElement).value = String(Math.round(femaleTotal));
    (document.getElementById('maleAmountInput') as HTMLInputElement).value = String(Math.round(maleTotal));

    let femaleValues = [];
    let maleValues = [];
    for(let i = 0; i <= 100; i++){
      if (groupValue.female[i].reunification_generated){
        femaleValues.push(undefined);
      }else{
        femaleValues.push(groupValue.female[i].reunification / femaleTotal);
      }
      if(groupValue.male[i].reunification_generated){
        maleValues.push(undefined);
      }else{
        maleValues.push(groupValue.male[i].reunification / maleTotal);
      }
    }
    (document.getElementById('saveButton') as HTMLButtonElement).style.visibility="hidden";

    this.graphs[0] = new ChartService(femaleValues, [0, 100], 767, 370, d3.select(document.getElementById('reunificationF')).insert('svg'), (document.getElementById('saveButton') as HTMLButtonElement));
    this.graphs[1] = new ChartService(maleValues, [0, 100], 767, 370, d3.select(document.getElementById('reunificationM')).insert('svg'), (document.getElementById('saveButton') as HTMLButtonElement));
  }

  buildOverview() {
   //  if  d3.select(document.getElementById('mat-tab-content-0-0').children[0])        #
    console.log('build overview')                 ;
    const pchart = new PiechartComponent(this.dataService,this.year);
    this.graphs[0] = pchart;
    pchart.setPieChart(d3.select(document.getElementById('mat-tab-content-0-0').children[0]).insert('svg'));
    const stackbar = new StackbarComponent(this.dataService);
    this.graphs[1] = stackbar;
    stackbar.createChart(d3.select(document.getElementById('mat-tab-content-0-0').children[0]).insert('svg'));
    const pyramid = new PyramidComponent(this.dataService,this.year);
    this.graphs[2] = pyramid;
    pyramid.createChart(d3.select(document.getElementById('mat-tab-content-0-0').children[0]).insert('svg'));

    }


  getNativeTypeFromIndex(index: number) {
    switch (index) {
      case 0:
        return NativeType.EinheimischeNichtMuslime;
      case 1:
        return NativeType.EinheimischeMuslime;
      case 2:
        return NativeType.NichtMuslimischeEinwanderer;
      case 3:
        return NativeType.MuslimischeEinwanderer;
      default:
        break;
    }
  }

  setRandomValues() {
    const first = true;
    for (const graph of this.graphs) {
        for (let i = 1; i < 100; i++) {
          if (i % 10 == 0) {
            graph.clickGraph(i * 8, Math.round(Math.random() * 200));
          } else {
            graph.removeLine(i);
            graph.removePoint(i);
          }
        }
    }
  }


}
