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
    const today = new Date();
    const monthsInPeriod = 3;
    // Generate an array of the last 6 months including the current month
    const allMonths = Array.from({ length: monthsInPeriod + 1 }, (_, index) => {
      const month = new Date(today);
      month.setMonth(today.getMonth() - index);
      return month.toLocaleString('default', { month: 'long', year: 'numeric' });
    }).reverse();
  
    const monthlyDataMap = new Map<string, { created: number }>(
      allMonths.map(month => [month, { created: 0 }])
    );

    this.issues.filter(issue => issue.state === 'opened').forEach((issue) => {
      const createdDate = new Date(issue.created_at);
      const createdMonth = `${createdDate.toLocaleString('default', { month: 'long' })} ${createdDate.getFullYear()}`;
  
      // Increment created count for the created month
      if (!monthlyDataMap.has(createdMonth)) {
        monthlyDataMap.set(createdMonth, { created: 0 });
      }
      monthlyDataMap.get(createdMonth)!.created++;

    });

    // Sort data based on sortedKeys
    const sortedData = Array.from(monthlyDataMap.keys()).map((month) => ({
      month,
      created: monthlyDataMap.get(month)!.created
    }));


      this.barChartData = {
        labels: sortedData.map(data => data.month),
        datasets: [
          {
            data: sortedData.map(data => data.created),
            label: 'Open Issues (created at)'
          },
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
