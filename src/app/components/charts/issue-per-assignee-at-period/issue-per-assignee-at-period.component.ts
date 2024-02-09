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
    const monthsInPeriod = 3;
    // Generate an array of the last 6 months including the current month
    const allMonths = Array.from({ length: monthsInPeriod + 1 }, (_, index) => {
      const month = new Date(today);
      month.setMonth(today.getMonth() - index);
      return month.toLocaleString('default', { month: 'long', year: 'numeric' });
    }).reverse();
    console.log(allMonths)
    const monthlyDataMap = new Map<string, { created: number; resolved: number }>(
      allMonths.map(month => [month, { created: 0, resolved: 0 }])
    );
    
    // Populate data for each month
    this.issues.forEach((issue) => {
      const createdDate = new Date(issue.created_at);
      const month = `${createdDate.toLocaleString('default', { month: 'long' })} ${createdDate.getFullYear()}`;
  
      if (!monthlyDataMap.has(month)) {
        monthlyDataMap.set(month, { created: 0, resolved: 0 });
      }
  
      if (issue.state === 'opened') {
        monthlyDataMap.get(month)!.created++;
      } else if (issue.state === 'closed') {
        monthlyDataMap.get(month)!.resolved++;
      }
    });
    
    // Sort data based on sortedKeys
    const sortedData = Array.from(monthlyDataMap.keys()).map((month) => ({
      month,
      created: monthlyDataMap.get(month)!.created,
      resolved: monthlyDataMap.get(month)!.resolved,
    }));
  
    // Update chart data and labels
    this.barChartData = {
      labels: sortedData.map(data => data.month),
      datasets: [
        {
          data: sortedData.map(data => data.created),
          label: 'Created Issues',
          backgroundColor: 'rgba(75,192,192,0.2)',
          borderColor: 'rgba(75,192,192,1)',
          borderWidth: 1,
        },
        {
          data: sortedData.map(data => data.resolved),
          label: 'Resolved Issues',
          backgroundColor: 'rgba(255,99,132,0.2)',
          borderColor: 'rgba(255,99,132,1)',
          borderWidth: 1,
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
