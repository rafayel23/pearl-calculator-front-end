import { Component, ViewChild, ElementRef, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { Chart } from 'chart.js';

const BG_COLOR = '#2196f3'
const BORDER_COLOR = '#1d79c2';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})

export class GraphComponent implements OnChanges {

  @ViewChild('graphRef', {static: true, read: ElementRef})
  graphRef: ElementRef<HTMLCanvasElement>;

  @Input() title: string = 'Default title'
  @Input() values: number[];
  @Input() max: number;
  @Input() step: number;

  @Output() graphReady = new EventEmitter<HTMLCanvasElement>();

  ngOnChanges(): void {
    const max = this.max || Math.max(...this.values);
    const stepSize = this.step || Math.round(max / 3);

    this.drawGraph({

      type: 'bar',

      data: {
          labels: ['1st', '2nd', '3rd', '4th'],
          datasets: [{
              label: this.title,
              data: this.values,
              borderColor: BORDER_COLOR,
              backgroundColor: BG_COLOR,
              borderWidth: 1
          }]
      },

      options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    max,
                    stepSize,
                }
            }]
        },
      }

    })
  }

  drawGraph(options) {
    new Chart(this.graphRef.nativeElement, options);
    this.graphReady.emit(this.graphRef.nativeElement);
  }

}
