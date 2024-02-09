import { ChangeDetectionStrategy, Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { GitlabApiService } from 'src/app/services/gitlab-api.service';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-issue-state-bar-chart',
  templateUrl: './issue-state-bar-chart.component.html',
  styleUrls: ['./issue-state-bar-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueStateBarChartComponent implements OnInit {

  @Input() issues: any[] = [];

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: true,
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
      },
    },
  };

  public barChartData: ChartData<'bar', number[], string> = {
    labels: ['Issues'],
    datasets: [

    ]
  };

  public barChartType: ChartType = 'bar';
  public barChartPlugins = [DataLabelsPlugin];

  constructor() { }

  ngOnInit(): void {
  }

  loadData(): void {
    
      const openedCount = this.issues.filter(issue => issue.state === 'opened').length;
      const closedCount = this.issues.filter(issue => issue.state === 'closed').length;

      this.barChartData = {
        labels: ['Issues'],
        datasets: [
          {
            data: [openedCount],
            label: 'Opened'
          },
          {
            data: [closedCount],
            label: 'Closed'
          }
        ]
      };
      this.chart?.update();
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['issues'] && this.issues.length!==0) {
      this.loadData();
    }
  }

}
