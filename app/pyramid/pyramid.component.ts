import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import * as d3 from 'd3';
import {isUndefined} from 'util';
import {DataService} from '../data.service';

@Component({
  selector: 'app-pyramid',
  templateUrl: './pyramid.component.html',
  styleUrls: ['./pyramid.component.scss']
})
export class PyramidComponent implements OnInit {

  private margin: { middle: number; top: number; left: number; bottom: number; right: number };
  private colors: string[];
  private readonly regionWidth: number;
  private readonly keys: any;
  private readonly pointA: number;
  private readonly pointB: number;
  private width = 800;
  private height = 500;
  private readonly heightPerBar: number;
  public svg: any;
  private g: any;
  private year: number;
  constructor(public dataService: DataService, year: number) { // public dataService: DataService
    this.margin = this.dataService.getMargins();
    this.colors = DataService.getColors();
    this.keys = this.dataService.getKeys();
    this.regionWidth = this.width / 2 - this.margin.middle;
    this.pointA = this.regionWidth;
    this.pointB = this.width - this.regionWidth;
    this.heightPerBar = (this.height - this.margin.top - this.margin.bottom) / 101; // evtl 80?
    this.year = year;
  }
  ngOnInit() {
  }
  setYear(year: number) {
    this.year = year;
    // this.removeOld();
    this.svg.selectAll('*').remove();
    this.createChart(this.svg);
  }


  public createChart(svg) {
    this.svg = svg
      .attr('width', this.margin.left + this.width + this.margin.right)
      .attr('height', this.margin.top + this.height + this.margin.bottom + 100) ;

    // ADD A GROUP FOR THE SPACE WITHIN THE MARGINS
    this.g = this.svg.append('g')
      .attr('transform', this.dataService.translation(this.margin.left, this.margin.top));

    const data = this.dataService.getPopulationForPyramid(this.year);
    const stack = d3.stack().keys(this.keys);

    const dataSetMale = stack(data[0]);
    const dataSetFemale = stack(data[1]);

    let    max = 0;
    for (let i = 0 ; i < dataSetFemale[dataSetFemale.length - 1].length; i ++) {
      const fmale = dataSetFemale[dataSetFemale.length - 1][i][1];
      const male = dataSetMale[dataSetMale.length - 1][i][1];
      if ( max < fmale) {
        max = fmale;
      }
      if (max < male) {
        max = male;
      }
    }


    // console.log(dataSetFemale, dataSetMale , maxFemale, maxMale, maxPopulation);
    const maxPopulation =  max * 1.1;
    // Todo: Domain 0 to maximum Sum
    console.log(maxPopulation);
    const xScale = d3.scaleLinear()
      .domain([0, maxPopulation])// Math.max(maxValLeft, maxValRight)])
      .range([0, this.regionWidth])
      .nice();


    const yScale = d3.scaleLinear()
      .rangeRound([this.height, 0])
      .domain([0, 101]);

    // const z = d3.scaleOrdinal(d3.schemeBrBG).domain(this.keys);


    const yAxisLeft = d3.axisRight(yScale)
      .tickSize(4)
      .tickPadding(this.margin.middle - 4);

    const yAxisRight = d3.axisLeft(yScale); // .tickSize(4);

    const xAxisRight = d3.axisBottom(xScale); //        .tickFormat(d3.format('%'));


    const xAxisLeft = d3.axisBottom(xScale.copy().range([this.pointA, 0])); // .tickFormat(d3.format('%'));
    // REVERSE THE X-AXIS SCALE ON THE LEFT SIDE BY REVERSING THE RANGE
    // Text
    this.svg.append('text')
      .attr('transform',
        'translate(' + (this.pointA / 2) + ' ,' +
        (this.height + this.margin.top + 40) + ')')
      .style('text-anchor', 'middle')
      .text('Frauen');

    this.svg.append('text')
      .attr('transform',
        'translate(' + (this.regionWidth + this.pointB / 2) + ' ,' +
        (this.height + this.margin.top + 40) + ')')
      .style('text-anchor', 'middle')
      .text('Männer');

    //
    // DRAW AXES
    this.g.append('g')
      .attr('class', 'axis y left')
      .attr('transform', this.dataService.translation(this.pointA, 0))
      .call(yAxisLeft)
      .selectAll('text')
      .style('text-anchor', 'middle');

    this.g.append('g')
      .attr('class', 'axis y right')
      .attr('transform', this.dataService.translation(this.pointB, 0))
      .call(yAxisRight);

    this.g.append('g')
      .attr('class', 'axis x left')
      .attr('transform', this.dataService.translation(0, this.height))
      .call(xAxisLeft);

    this.g.append('g')
      .attr('class', 'axis x right')
      .attr('transform', this.dataService.translation(this.pointB, this.height))
      .call(xAxisRight);
    //  MAKE GROUPS FOR EACH SIDE OF CHART
    // scale(-1,1) is used to reverse the left side so the bars grow left instead of right
    const leftBarGroup = this.g.selectAll('g.FemaleAmount')
      .data(dataSetFemale).enter()
      .append('g')
      .attr('class', 'amount')
      .style('fill', (d, i) => this.colors[i])
      .attr('transform', this.dataService.translation(this.pointA, 0) + ' scale(-1,1)');
    // .enter().append('g').attr('class', 'amount').style('fill', (d,i) => colors[i])

    const rightBarGroup =
      this.g.selectAll('g.MaleAmount')
        .data(dataSetMale).enter()
        .append('g')
        .attr('class', 'amount')
        .style('fill', (d, i) => this.colors[i])
        .attr('transform', this.dataService.translation(this.pointB, 0));
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

    leftBarGroup.selectAll('rect')
      .data(d => d)
      .enter()
      .append('rect')
      .attr('x', d =>
        xScale(d[0])
      )
      .attr('width', d => xScale(d[1]) - xScale(d[0]))
      .attr('y', d => yScale(d.data.age) - this.heightPerBar)
      .attr('height', this.heightPerBar)
    ; // .attr('fill', (d, i) => colors[i]);

    rightBarGroup.selectAll('.bar.right')
      .data(d => d)
      .enter()
      .append('rect')
      .attr('x', d =>
        xScale(d[0])
      )
      .attr('width', d => xScale(d[1]) - xScale(d[0]))
      .attr('y', d => yScale(d.data.age) - this.heightPerBar)
      .attr('height', this.heightPerBar)
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
    //   .attr('fill', d => z('Native Non Muslim'));

    // function(d) {return z('Native Non Muslim'); });



  }
}
