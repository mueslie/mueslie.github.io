import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {DataService} from '../data.service';
import {Population} from '../class/population';
import {MatSort, MatTableDataSource, MatSortModule} from '@angular/material';
import * as d3 from 'd3';
import * as slider from 'd3-simple-slider';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

  // Data hat Attribute,
 // @Input() data[];
   @ViewChild(MatSort, {static: true}) sort: MatSort;
    highlightedRow = null;
    displayedColumns: string[];
    displayedColumnsPerGroup: string[];
    data: Population[];
    tableDS = new MatTableDataSource(this.data);
    clickedDataSet = new MatTableDataSource([]);

    constructor(private dataService: DataService) { }

  ngOnInit() {
    // Time
    var dataTime = d3.range(0, 81).map(function(d) {
      return new Date(2020 + d, 1, 1);
    });

    var displayValues = d3.range(0, 81).map(function(d) {
      return new Date(2020 + d, 1, 1);
    });

    for(var i = 0; i < displayValues.length; i+=10) {
      displayValues.splice((i)+1,9);
    }


    let width = parseInt(d3.select('body').style('width'), 10);
    width = 1000;

    var sliderTime = slider
      .sliderBottom()
      .min(d3.min(dataTime))
      .max(d3.max(dataTime))
      .step(width * 60 * 60 * 24 * 365)
      .width(width)
      .tickFormat(d3.timeFormat('%Y'))
      .tickValues(dataTime)
      .default(new Date(2050, 1, 1))
      .on('onchange', val => {
        d3.select('p#value-time').text(d3.timeFormat('%Y')(val));
        this.data = this.dataService.years[Number(d3.timeFormat('%Y')(val))-2020].population;
        this.tableDS.data = this.data;
        document.getElementById('Group').hidden = true;
      });

    var gTime = d3
      .select('div#slider-time')
      .append('svg')
      .attr('width', width+50)
      .attr('height', 100)
      .append('g')
      .attr('transform', 'translate(30,30)');

    gTime.call(sliderTime);

    d3.select('p#value-time').text(d3.timeFormat('%Y')(sliderTime.value()));

      // var sliderTime = d3
      //   .sliderBottom()
      //   .min(d3.min(dataTime))
      //   .max(d3.max(dataTime))
      //   .step(1000 * 60 * 60 * 24 * 365)
      //   .width(300)
      //   .tickFormat(d3.timeFormat('%Y'))
      //   .tickValues(dataTime)
      //   .default(new Date(1998, 10, 3))
      //   .on('onchange', val => {
      //     d3.select('p#value-time').text(d3.timeFormat('%Y')(val));
      //   });


      this.displayedColumns = ['Land', 'Anzahl', 'Jahr'];
      this.displayedColumnsPerGroup = ['Alter', 'Geschlecht', 'Einzelanzahl', 'Geburtenrate'];
      this.data = this.dataService.years[30].population;
      this.tableDS.data = this.data;
      console.log(this.data);
      console.log(this.tableDS.data);

  }

  changeHiddenStatus(row: any) {
    // vielleich hidden true, timeout, hidden false , für "ladeeffekte"
    this.highlightedRow = row;
    this.clickedDataSet.data = row.female.concat(row.male);
    document.getElementById('Group').hidden = false;
    this.clickedDataSet.sort = this.sort;
  }
}
