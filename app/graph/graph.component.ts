import * as d3 from 'd3';
import * as dc from 'dc';
import * as crossfilter from 'crossfilter2';
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Data} from '@angular/router';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit {

  // @ViewChild('nameOfDiv') chartDiv: ElementRef;
  private ndx: crossfilter.Crossfilter<Data> = crossfilter<Data>(
    [{ date: '2011-11-14T16:17:54Z', quantity: 2, total: 190, tip: 100, type: 'tab' } ]);
  paint() {
    // const chart = dc.scatterPlot(this.chartDiv.nativeElement);
    // chart.render();
  }
  constructor() { }

  ngOnInit() {
    this.paint();
  }

}
