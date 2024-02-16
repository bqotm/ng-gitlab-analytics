import { ChangeDetectionStrategy, Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import { GitlabApiService } from 'src/app/services/gitlab-api.service';

@Component({
  selector: 'app-issue-per-assignee-at-period',
  templateUrl: './issue-per-assignee-at-period.component.html',
  styleUrls: ['./issue-per-assignee-at-period.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssuePerAssigneeAtPeriodComponent {

  @Input() issues: any[] = [];

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  constructor() { }

  ngOnInit(): void {
  }

  public barChartOptions: ChartConfiguration['options'] = {
    scales: {
      x: {
        type: 'category',
      },
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
      },
    },
  };
  public barChartType: ChartType = 'bar';
  public barChartPlugins = [DataLabelsPlugin];

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [],
  };

  assigneeMap: any = {};

  loadData(): void {
    const today = new Date();
    const monthsInPeriod = 12;
    // Generate an array of the last 6 months including the current month
    const allMonths = Array.from({ length: monthsInPeriod }, (_, index) => {
      const month = new Date(today);
      month.setMonth(today.getMonth() - index);
      return month.toLocaleString('default', { month: 'long', year: 'numeric' });
    }).reverse();
  
    const monthlyDataMap = new Map<string, { created: number; closed: number }>(
      allMonths.map(month => [month, { created: 0, closed: 0 }])
    );
  
    // Populate data for each issue
    this.issues.forEach((issue) => {
      const createdDate = new Date(issue.created_at);
      const createdMonth = `${createdDate.toLocaleString('default', { month: 'long' })} ${createdDate.getFullYear()}`;
  
      // Increment created count for the created month
      if (!monthlyDataMap.has(createdMonth)) {
        monthlyDataMap.set(createdMonth, { created: 0, closed: 0 });
      }
      monthlyDataMap.get(createdMonth)!.created++;
  
      // Check if issue is resolved and increment resolved count for the resolved month
      if (issue.state === 'closed' && issue.closed_at) {
        const closedDate = new Date(issue.closed_at);
        const resolvedMonth = `${closedDate.toLocaleString('default', { month: 'long' })} ${closedDate.getFullYear()}`;
  
        if (!monthlyDataMap.has(resolvedMonth)) {
          monthlyDataMap.set(resolvedMonth, { created: 0, closed: 0 });
        }
        monthlyDataMap.get(resolvedMonth)!.closed++;
      }
    });
  
    // Sort data based on sortedKeys
    const sortedData = Array.from(monthlyDataMap.keys()).map((month) => ({
      month,
      created: monthlyDataMap.get(month)!.created,
      resolved: monthlyDataMap.get(month)!.closed,
    }));
  
    // Update chart data and labels
    this.barChartData = {
      labels: sortedData.map(data => data.month),
      datasets: [
        {
          data: sortedData.map(data => data.created),
          label: 'Created Issues',
        },
        {
          data: sortedData.map(data => data.resolved),
          label: 'Resolved Issues',
        },
      ],
    };
  
    // Trigger chart update
    this.chart?.update();
  }
  
  
  

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['issues'] && this.issues.length!==0) {
      this.loadData();
    }
  }
}
