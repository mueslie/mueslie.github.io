import {Component, Input,  OnInit} from '@angular/core';
import {isUndefined} from 'util';
import {DataService, PieItem} from '../data.service';
import * as d3 from 'd3';
import {PieData} from '../class/pie-data';
import {colors} from '@angular/cli/utilities/color';

@Component({
  selector: 'app-piechart',
  templateUrl: './piechart.component.html',
  styleUrls: ['./piechart.component.scss']
})
export class PiechartComponent implements OnInit {

  constructor(private service: DataService, private year: number) {
    this.dataSource = this.service.getDataForPie(year);
     }
  /*
  get height(): number { return  parseInt(d3.select('body').style('height'), 10); }
  get width(): number { return parseInt(d3.select('body').style('width'), 10); }

   */

  height = 100;
  width = 100;
  radius: number;
  // Arcs & pie
  private arc: any;  private pie: any;  private slices: any;
  private color: any;
  // Drawing containers
  public svg: any;  private mainContainer: any;
  // Data
  dataSource: PieItem[];


  setYear(year: number) {
    this.year = year;
    this.dataSource = this.service.getDataForPie(year);
    this.setSVGDimensions();
    // this.color = d3.scaleOrdinal(d3.schemeCategory10);
    this.color = DataService.getColors();
    this.mainContainer = this.svg.append('g').attr('transform', 'translate(50,50)');
    this.pie = d3.pie().sort(null).value((d: any) => d.abs);
    this.draw();
  }

  public setPieChart(svg) {
    this.svg = svg;
    this.setSVGDimensions();
    // this.color = d3.scaleOrdinal(d3.schemeCategory10);
    this.color = DataService.getColors();
    this.mainContainer = this.svg.append('g').attr('transform', 'translate(50,50)');
    this.pie = d3.pie().sort(null).value((d: any) => d.abs);
    this.draw();
  }

  ngOnInit(): void {
    // this.svg  = d3.select(document.getElementById('mat-tab-content-0-0').children[0]).insert('svg');

  }

    private setSVGDimensions() {
      this.radius = (Math.min(this.width, this.height)) / 2;
      this.svg.attr('width', 2 * this.radius).attr('height', 2 * this.radius);
      this.svg.select('g').attr('transform', 'translate(' + this.radius + ',' + this.radius + ')');
    }
    private draw() {
      this.setArcs();
      this.drawSlices();
      this.addText();
    }
    private setArcs() {
      this.arc = d3.arc().outerRadius(this.radius).innerRadius(this.radius * .2);
    }
    private drawSlices() {
      var arcgen = this.arc;
      this.slices = this.mainContainer.selectAll('path')
        .remove().exit()
        .data(this.pie(this.dataSource))
        .enter().append('g').append('path')
        .attr('d', this.arc)

      this.slices
        .attr('fill', (d, i) => this.color[(i+3)%4]);



    }
    private addText(){

    }

}
