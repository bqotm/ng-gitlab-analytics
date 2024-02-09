import { ChangeDetectionStrategy, Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import { GitlabApiService } from 'src/app/services/gitlab-api.service';

@Component({
  selector: 'app-issue-assignee-bar-chart',
  templateUrl: './issue-assignee-bar-chart.component.html',
  styleUrls: ['./issue-assignee-bar-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueAssigneeBarChartComponent implements OnInit {

  @Input() issues: any[] = [];

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  constructor() { }

  ngOnInit(): void {
  }

  public barChartOptions: ChartConfiguration['options'] = {
    // We use these empty structures as placeholders for dynamic theming.
    scales: {
      x: {},
      y: {
        beginAtZero: true
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
  public barChartType: ChartType = 'bar';
  public barChartPlugins = [DataLabelsPlugin];

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'opened' },
      { data: [], label: 'closed' },
    ],
  };

  loadData(): void {
    const assigneesMap = new Map<string, { opened: number; closed: number }>();

    // Count open and closed issues by assignee
    this.issues.forEach((issue) => {
      issue.assignees.forEach((assignee: any) => {
        const assigneeName = assignee.name || 'Unassigned';

        if (!assigneesMap.has(assigneeName)) {
          assigneesMap.set(assigneeName, { opened: 0, closed: 0 });
        }

        if (issue.state === 'opened') {
          assigneesMap.get(assigneeName)!.opened++;
        } else if (issue.state === 'closed') {
          assigneesMap.get(assigneeName)!.closed++;
        }
      });
    });

    // Update chart data and labels
    this.barChartData = {
      labels: Array.from(assigneesMap.keys()),
      datasets: [
        {
          data: Array.from(assigneesMap.values()).map((value) => value.opened),
          label: 'Opened',
        },
        {
          data: Array.from(assigneesMap.values()).map((value) => value.closed),
          label: 'Closed',
        },
      ],
    };

    // Trigger chart update
    this.chart?.update();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['issues'] && this.issues.length!==0) {
      this.loadData();
    }
  }
  
}

