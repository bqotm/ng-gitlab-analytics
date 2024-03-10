import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
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
        beginAtZero: true,
      },
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
    datasets: [],
  };

  public barChartType: ChartType = 'bar';
  public barChartPlugins = [DataLabelsPlugin];
  counts : any= {};
  constructor() {}

  ngOnInit(): void {}

  loadData(): void {

    // Generate an array of the last 12 months including the current month
    this.issues
      .filter((issue) => issue.state === 'opened')
      .forEach((issue) => {
        const createdAt = new Date(issue.created_at);
        const monthYear = `${createdAt.toLocaleString('en-US', {
          month: 'long',
        })}/${createdAt.getFullYear()}`;

        if (!this.counts[monthYear]) {
          this.counts[monthYear] = 1;
        } else {
          this.counts[monthYear]++;
        }
      });

    this.barChartData = {
      labels: Object.keys(this.counts).reverse(),
      datasets: [
        {
          data: Object.values(this.counts).reverse() as number[],
          label: 'Open Issues (created at)',
        },
      ],
    };
    this.chart?.update();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['issues'] && this.issues.length !== 0) {
      console.log(this.issues.slice(88));
      this.loadData();
    }
  }
}
