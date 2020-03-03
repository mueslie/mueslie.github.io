import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { svg } from 'd3';
import { debug } from 'util';

@Injectable({
  providedIn: 'root'
})

export class ChartService {
  private connectedGraph: ChartService = null;
  public svg;
  private width: number;
  private height: number;
  private mod: number;
  private points = [];
  private lines = [];
  private saveButton: HTMLButtonElement;
  private values: number[];
  private dirty = false;
  private margin = {top: 20, right: 20, bottom: 30, left: 40};
  private yGraph = undefined;
  private editable: boolean;
  private changeScaling: boolean;

  public getDirty(){
    return this.dirty;
  }

  setConnectedGraph(connectedGraph: ChartService) {
    this.connectedGraph = connectedGraph;
  }

  getSvg(){
    return this.svg;
  }

  getValues(){
    this.calculateNewValues();
    return this.values;
  }

  getUserPoints(){
    var points = [];
    for(var i = 0; i<100; i++){
      if (this.points[i]!= undefined){
        points.push(i);
      }
    }
    return points;
  }

  constructor(data:number[], scale: number[], width: number, height: number, svg, saveButton: HTMLButtonElement, editable=true, changeScaling=true) {
    
    this.saveButton = saveButton;
    this.editable = editable;
    this.width = width-this.margin.left-this.margin.right;
    this.height = height-this.margin.top - this.margin.bottom;
    this.mod = Math.round((this.width) / scale[scale.length-1]);
    this.changeScaling = changeScaling;

    // lets svg objects be moved to the front. This is needed so I can add lines and can place the dots above them again
    d3.selection.prototype.moveToFront = function () {
      return this.each(function () {
        this.parentNode.appendChild(this);
      });
    };
    // Create the SVG
    const t = this;
    
    this.svg = svg
      .attr('width', this.width+this.margin.left+this.margin.right)
      .attr('height', this.height+this.margin.top+this.margin.left)
      .on('click', function (){
        // Ignore the click event if it was suppressed
        if (d3.event.defaultPrevented) { return; }
    
        // Extract the click location\
        const point = d3.mouse(this), p = { x: point[0], y: point[1]};
    
        let x = t.getModValue(p.x-t.margin.left)+t.margin.left;
    
        t.clickGraph(x, p.y);

        t.dirty = true;
        t.saveButton.style.visibility = 'visible';
    
      });


    var xscale = d3.scaleLinear()
        .domain([0, d3.max(scale)])
        .range([0, this.width - this.mod]);

    var x_axis = d3.axisBottom(xscale);
    
    // Add a background
    this.svg.append('rect')
      .attr("transform", "translate(" + this.margin.left + ", " + this.margin.top + ")")
      .attr('width', this.width - this.mod)
      .attr('height', height-this.margin.top - this.margin.bottom)
      .style('stroke', '#999999')
      .style('fill', '#F6F6F6');

    var xAxisTranslate = height-this.margin.bottom;
    this.svg.append("g")
            .attr("transform", "translate("+this.margin.left +", " + xAxisTranslate  +")")
            .call(x_axis)

    var max = d3.max(data);
    for(var i = 0; i<=100; i++){
      if (data[i]!= undefined){
        this.clickGraph(i*this.mod + this.margin.left, this.height - this.height*(data[i]/max) +this.margin.top)
      }
    }

    if (!editable){
      svg.on('click', function (){
        // Ignore the click event if it was suppressed
        if (d3.event.defaultPrevented) { return; }    
      });
    }

    this.updateYAxis(data);
  }

  updateYAxis(data:number[]){
    if (this.yGraph != undefined){
      this.yGraph.remove();
    }
    var yscale = d3.scaleLinear()
    .domain([0, d3.max(data)])
    .range([this.height, 0]);

    var y_axis = d3.axisLeft(yscale);

    this.yGraph = this.svg.append("g");
    this.yGraph.attr("transform", "translate("+this.margin.left+", "+this.margin.top+")")
    .call(y_axis);
  }

  remove(){
    this.svg.remove();
  }

  dragGraph(y, point) {
    const id = d3.select(point).attr('id');
    let pos = 0;
    while (this.points[pos] == undefined || this.points[pos].attr('id') != id) {
      pos += 1;
    }
    const x = this.points[pos].attr('x');

    this.updatePoint(x, y);

    let i = pos - 1;
    while (this.lines[i] == undefined && i > 0) {
      i--;
    }

    this.updateLine(i, 'x2', x);
    this.updateLine(i, 'y2', y);
    this.updateLine(pos, 'x1', x);
    this.updateLine(pos, 'y1', y);
    this.lines[pos].attr('x1', x);

    this.calculateNewValues();
    this.updateYAxis(this.values);
  }

  updatePoint(x, newY, updateOther = true) {
    let index = (x-this.margin.left)/ this.mod
    this.dirty = true;
    this.saveButton.style.visibility = 'visible';
    if (updateOther && this.connectedGraph != null) {
      this.connectedGraph.updatePoint(x, newY, false);
    }
    this.points[index].attr('transform', 'translate(' + x + ',' + newY + ')');
    this.points[index].attr('y', newY);
  }

  updateLine(i, attr, newValue, updateOther = true) {
    if (i>-1){
      if (updateOther && this.connectedGraph != null) {
        this.connectedGraph.updateLine(i, attr, newValue, false);
      }
      this.lines[i].attr(attr, newValue);
    }
  }

  removeLine(i, updateOther = true) {
    if (updateOther && this.connectedGraph != null) {
      this.connectedGraph.removeLine(i, false);
    }
    if (this.lines[i] != undefined){
      this.lines[i].remove();
      this.lines.splice(i, 1);
    }
  }

  removePoint(i, updateOther = true) {
    if (updateOther && this.connectedGraph != null) {
      this.connectedGraph.removeLine(i, false);
    }
    if (this.points[i] != undefined){
      this.points[i].remove();
      this.points.splice(i, 1);
    }
  }

  updateGraph(y, point) {

    if (y > this.height+this.margin.top || y < this.margin.top) {
      const id = d3.select(point).attr('id');
      let pos = 0;
      while (this.points[pos] == undefined || this.points[pos].attr('id') != id) {
        pos += 1;
      }
      let i = pos - 1;
      while (this.lines[i] == undefined && i > 0) {
        i--;
      }
      this.updateLine(i, "x2", this.lines[pos].attr('x2'));
      this.updateLine(i, "y2", this.lines[pos].attr('y2'))
      this.removeLine(pos);
      this.removePoint(pos);
    }
    
    this.calculateNewValues();
    this.updateYAxis(this.values);
  }

  calculateNewValues() {
    let last = 0;
    this.values = [];

    for(let i = 0; i<=100; i++){
      if(this.points[i]!= undefined){
        let y = this.height - Number(this.points[i].attr('y'))
        if(last < i-1){ //if the last found point is more than 1 difference we have to do some calculations
          let b = 0;  //this is only viable if the index is 0
          let dx = i;
          let dy = y;
          if (i != 0 && this.points[last] != undefined){
            dx = i-last;
            b = this.height - Number(this.points[last].attr('y'));
            dy = y - b;
          }
          let a = dy / dx;
          for(let j = 0; j<=dx; j++){
            this.values[last + j] = (a * j) + b;
          }
        }else{
          this.values[i] = y;
        }
        last = i;
      }
    }
    if(last != 100){
      let b = 0;  //this is only viable if the index is 0
      let dx = 100;
      let dy = 0;
      if (this.points[last] != undefined){
        dx = 100-last;
        b = this.height - Number(this.points[last].attr('y'));
        dy = 0 - b;
      }
      let a = dy / dx;
      for(let j = 0; j<=dx; j++){
        this.values[last + j] = (a * j) + b;
      }
    }
    let amount =  this.values.reduce(function (total, num) { return total + num } ); //calculate the total amount
    if(amount == 0){
      this.values.forEach(function (element, index, arr){arr[index]=1});
      amount = this.values.length;
    }
    const relative = 1 / amount; 
    this.values.forEach(function (element, index, arr){arr[index]*=relative});


    // let value = 0;
    // this.values.forEach(element => {
    //   value += element;
    // });
    // value = (1 - value) / 101;
    // for (let i = 0; i < this.values.length; i++) {
    //   this.values[i] += value;
    // }
    // value = 0;
    // this.values.forEach(element => {
    //   value += element;
    // });
    // // console.log(value);
    // // console.log(this.values);
  }

  clickGraph(x, y, updateOther = true) {
    if(x>=this.margin.left && x<=this.margin.left+this.width && y <= this.height + this.margin.top && y >= this.margin.top){

      let index = (x-this.margin.left) / this.mod;
      if (updateOther && this.connectedGraph != null) {
        this.connectedGraph.clickGraph(x, y, false);
      }
  
      if (this.points[index] == undefined) {
  
        if (this.lines.length == 0) {
          this.lines[0] = this.svg.append('line')
            .style('stroke', 'gray') // <<<<< Add a color
            .attr('x1', 0+this.margin.left)
            .attr('y1', this.height+this.margin.top)
            .attr('x2', x)
            .attr('y2', y);
        } else {
          let i = index;
          while (this.lines[i] == undefined) {
            i--;
          }
          this.lines[i].attr('x2', x)
            .attr('y2', y);
        }
  
        if (this.lines.length < index) {
          this.lines[index] = this.svg.append('line')
            .style('stroke', 'gray') // <<<<< Add a color
            .attr('x1', x)
            .attr('y1', y)
            .attr('x2', this.width+this.margin.left-this.mod)
            .attr('y2', this.height+this.margin.top);
        } else {
          let i = index + 1;
          while (this.points[i] == undefined && i <= this.lines.length) {
            i++;
          }
          let x2 = this.width+this.margin.left - this.mod;
          let y2 = this.height+this.margin.top;
          if (this.points[i] != undefined) {
            x2 = this.points[i].attr('x');
            y2 = this.points[i].attr('y');
          }
          this.lines[index] = this.svg.append('line')
            .style('stroke', 'gray') // <<<<< Add a color
            .attr('x1', x)
            .attr('y1', y)
            .attr('x2', x2)
            .attr('y2', y2);
          //this.points[i].moveToFront();
        }
        const chart = this;
        // Append a new point
        this.points[index] = this.svg.append('circle')
          .attr('transform', 'translate(' + x + ',' + y + ')')
          .attr('r', '5')
          .attr('id', (Math.random().toString(16) + '000000000').substr(2, 8))
          .attr('y', y)
          .attr('x', x)
          .attr('class', 'dot')
          .style('cursor', 'pointer')
          .attr('fill', 'steelblue');
        if (this.editable){
          this.points[index].call(d3.drag().on('start', function () {
            d3.select(this).attr('fill', 'orange');
          })
            .on('drag', function () {
              const y = d3.event.y;
              chart.dragGraph(y, this);
            })
            .on('end', function () {
              const thisElement = d3.select(this);
              thisElement.attr('fill', 'steelblue');
              const x = Number(thisElement.attr('x'));
              const y = Number(thisElement.attr('y'));
              chart.updateGraph(y, this);
            }));
        }
  
      } else {
        this.points[index].attr('transform', 'translate(' + x + ',' + y + ')');
        const pos = index;
        let i = pos - 1;
        while (this.lines[i] == undefined&& i >-1) {
          i--;
        }
        this.lines[i].attr('x2', x)
          .attr('y2', y);
        this.lines[pos].attr('x1', x)
          .attr('y1', y);
      }
      
      
      this.calculateNewValues();
      this.updateYAxis(this.values);
    }
  }

  getModValue(x: number) {
    if ((x % this.mod) > Math.round(this.mod / 2)) {
      x += this.mod;
    }
    return x - (x % this.mod);
  }
}
