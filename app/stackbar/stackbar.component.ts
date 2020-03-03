import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as d3Scale from 'd3-scale';
import * as d3Axis from 'd3-axis';
import {DataService} from '../data.service';

@Component({
  selector: 'app-stackbar',
  templateUrl: './stackbar.component.html',
  styleUrls: ['./stackbar.component.scss']
})
export class StackbarComponent implements OnInit {
  private x: any;
  margin;
  height = 500; // 600
  width = 800; // 900
  y;
  z;
  g;
  public svg;
  constructor(public dataService: DataService) { }

  ngOnInit() {
   // this.createChart();
  }

  setYear(year: number){
    //nothing needs to be done here. THIS GRAPH NEVER CHANGES MUHAHAHAH
  }

  public createChart(svg) {
    this.svg = svg;
    this.margin = {top: 20, right: 20, bottom: 30, left: 40};
    /*
      // ADD A GROUP FOR THE SPACE WITHIN THE MARGINS
    this.svg = d3.select('#stackbar').append('svg')
      .attr('width', this.margin.left + this.width + this.margin.right)
      .attr('height', this.margin.top + this.height + this.margin.bottom);
 this.svg =   d3.select('body').append('svg')
      .attr('width', this.margin.left + this.width + this.margin.right)
      .attr('height', this.margin.top + this.height + this.margin.bottom);

     */
    this.svg.attr('width', this.margin.left + this.width + this.margin.right)
      .attr('height', this.margin.top + this.height + this.margin.bottom);


    this.g = this.svg.append('g')
      .attr('transform', this.dataService.translation(this.margin.left, this.margin.top));

    const stack = d3.stack().keys(this.dataService.getKeys());
    const data = this.dataService.getPopulationForStackbar();
    const dataset = stack(this.dataService.getPopulationForStackbar());
    //  console.log(data, dataset);
    // this.removeOld();
    this.x = // d3.scaleLinear().rangeRound([0, this.width]);
      d3Scale.scaleBand()
        .rangeRound([0, this.width])
        .paddingInner(0.15)
        .align(0.1);
    this.x.domain(data.map(function(d) {
      return d.year;
    }));
   // const maxY = 75000000; // d3.max(dataset, function(d) { return d; } );
    const maxY =  this.dataService.getMaximumAmount()*1.2;
    this.y = d3.scaleLinear().rangeRound([this.height, 0]).domain([0, maxY]);
    // ToDO: Anpassen auf Feste X Breite für alle Jahre
    // Grün für die Muslims und Orange (o.Ä) für die non muslim
    //    const colors = ['#b05522', '#d25c4d', '#00AA00', '#10AA44'];
    const colors = DataService.getColors(); // ['#b33040', '#d25c4d', '#f2b448', '#d9d574'];

    const xAxis = d3.axisBottom(this.x).ticks(d3.timeYear.every(1));

    this.g.append('g')
      .attr('class', 'axis')
      .call(d3Axis.axisLeft(this.y).ticks(null, 's'))
      .append('text')
      .attr('x', 2)
      .attr('y', this.y(this.y.ticks().pop()) + 0.5)
      .attr('dy', '0.32em')
      .attr('fill', '#000')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'start')
      .text('Population');
    this.g.append('g')
      .attr('class', 'xAxis')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('font-weight', 'italic')
      .attr('dx', '-.7em')
      .attr('dy', '.2em')
      .attr('transform', 'rotate(-65)');
    const tooltip = this.svg.append('g')
      .attr('class', 'tooltip')
      .style('display', 'none');

    tooltip.append('rect')
      .attr('width', 30)
      .attr('height', 20)
      .attr('fill', 'none')
      .style('opacity', 0.5);

    tooltip.append('text')
      .attr('x', 15)
      .attr('dy', '1.2em')
      .style('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold');


    const groups = this.g.selectAll('g.amount')
      .data(dataset)
      .enter().append('g')
      .attr('class', 'amount')
      .style('fill', (d, i) => colors[i]);

    // TODO : Ich denke hier noch auf dicke anpassen damit die immer gleihc dick sind die Graphen
    const rect = groups.selectAll('rect')
      .data(d => d)
      .enter()
      .append('rect')
      .attr('x', d =>
        this.x(d.data.year)
      )
      .attr('width', d => this.x.bandwidth())
      // .attr('width', this.width/60)
      .attr('y', d => this.y(d[1]))
      .attr('height', d => {
        return this.y(d[0]) - this.y(d[1]);
      })
      .attr('typeComb', d => d.data.typecomb)
      .on('mouseover', function() {
        tooltip.style('display', null);
      })
      .on('mouseout', function() {
        tooltip.style('display', 'none');
      })
      .on('mousemove', function(d, i) {
        const xPosition = d3.mouse(this)[0] - 15;
        const yPosition = d3.mouse(this)[1] - 25;
        tooltip.attr('transform', 'translate(' + xPosition + ',' + yPosition + ')');
        tooltip.select('text').text(Number(d[1] - d[0]).toLocaleString());

      });
  }

}
