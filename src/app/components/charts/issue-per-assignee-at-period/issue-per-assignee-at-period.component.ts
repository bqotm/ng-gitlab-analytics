import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import { GitlabApiService } from 'src/app/services/gitlab-api.service';

@Component({
  selector: 'app-issue-per-assignee-at-period',
  templateUrl: './issue-per-assignee-at-period.component.html',
  styleUrls: ['./issue-per-assignee-at-period.component.scss']
})
export class IssuePerAssigneeAtPeriodComponent {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  constructor(private gitlabApiService: GitlabApiService) {}

  ngOnInit(): void {
    this.loadData();
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

  assigneeNames: string[] = [];

  loadData(): void {
    this.gitlabApiService.getIssuesOfProject('782').subscribe(
      (issues: any[]) => {
        const monthlyDataMap = new Map<string, { created: number; resolved: number }>();

        // Populate data for each month
        issues.forEach((issue) => {
          const month = new Date(issue.created_at).toLocaleString('default', { month: 'long', year: 'numeric' });

          if (!monthlyDataMap.has(month)) {
            monthlyDataMap.set(month, { created: 0, resolved: 0 });
          }

          if (issue.state === 'opened') {
            monthlyDataMap.get(month)!.created++;
          } else if (issue.state === 'closed') {
            monthlyDataMap.get(month)!.resolved++;
          }
        });

        const sortedKeys = Array.from(monthlyDataMap.keys()).sort((a, b) => {
          const dateA = new Date(a);
          const dateB = new Date(b);
          return dateA.getTime() - dateB.getTime();
        });

        // Update chart data and labels
        this.barChartData = {
          labels: sortedKeys,
          datasets: [
            {
              data: sortedKeys.map((month) => monthlyDataMap.get(month)!.created),
              label: 'Created Issues',
              backgroundColor: 'rgba(75,192,192,0.2)',
              borderColor: 'rgba(75,192,192,1)',
              borderWidth: 1,
            },
            {
              data: sortedKeys.map((month) => monthlyDataMap.get(month)!.resolved),
              label: 'Resolved Issues',
              backgroundColor: 'rgba(255,99,132,0.2)',
              borderColor: 'rgba(255,99,132,1)',
              borderWidth: 1,
            },
          ],
        };

        // Trigger chart update
        this.chart?.update();
      },
      (error) => {
        console.error('Error fetching issues:', error);
      }
    );
  }
}
