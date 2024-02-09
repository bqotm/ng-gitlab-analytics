import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import { GitlabApiService } from 'src/app/services/gitlab-api.service';
import { ChartOptions, ChartDataset } from 'chart.js';


interface AssigneeMap {
  [assigneeName: string]: {
    [monthYear: string]: number;
  };
}

@Component({
  selector: 'app-created-vs-resolved-issues-by-collab',
  templateUrl: './created-vs-resolved-issues-by-collab.component.html',
  styleUrls: ['./created-vs-resolved-issues-by-collab.component.scss']
})
export class CreatedVsResolvedIssuesByCollabComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  constructor(private gitlabApiService: GitlabApiService) { }

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {
        type: 'category',
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 20
        }
      },
    },
    plugins: {
      legend: {
        display: false,
        position: 'left',
      },
    },
  };
  public barChartType: ChartType = 'bar';
  public barChartPlugins = [];
  public barChartLegend = false;
  public barChartLabels: any = [];
  public barChartData: ChartDataset[] = [
  ];

  assigneeNames: string[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  assigneeMap: any = {};

  loadData(): void {
    this.gitlabApiService.getIssuesOfProject('782').subscribe(
      (issues: any[]) => {
        const today = new Date();
        const monthsInPeriod = 7;
        // Generate an array of the last 6 months including the current month
        const allMonths = Array.from({ length: monthsInPeriod + 1 }, (_, index) => {
          const month = new Date(today);
          month.setMonth(today.getMonth() - index);
          return month.toLocaleString('default', { month: 'long', year: 'numeric' });
        }).reverse();
        console.log(allMonths)

        issues.forEach((issue) => {
          issue.assignees.forEach((assignee: any) => {
            const assigneeName = assignee.name;
            const createdDate = new Date(issue.created_at);
            const monthYear = `${createdDate.toLocaleString('default', { month: 'long' })} ${createdDate.getFullYear()}`;

            if (!this.assigneeMap[assigneeName]) {
              this.assigneeMap[assigneeName] = {};
            }

            if (!this.assigneeMap[assigneeName][monthYear]) {
              this.assigneeMap[assigneeName][monthYear] = 1;
            } else {
              this.assigneeMap[assigneeName][monthYear]++;
            }
          });
        });
        console.log(this.assigneeMap)
        // Prepare chart data
        const chartData: ChartDataset[] = [];
        // Transform assigneeMap values into arrays
        for (const assigneeName in this.assigneeMap) {
          if (Object.prototype.hasOwnProperty.call(this.assigneeMap, assigneeName)) {
            const assigneeValues = this.assigneeMap[assigneeName];
            const assigneeArray = allMonths.map((month) => assigneeValues[month] || 0);
            this.assigneeMap[assigneeName] = assigneeArray;
            chartData.push({
              data: assigneeArray,
              label: assigneeName,
              stack: 'a'
            })
          }
        }
        // Set chart labels and data
        this.barChartLabels = allMonths;
        this.barChartData = [...chartData,
        { data: [10, 5, 20, 67, 2, 0, 8, 4], label: 'resolved' }
        ];

        // Trigger chart update
        this.chart?.update();
      },
      (error) => {
        console.error('Error fetching issues:', error);
      }
    );
  }


}
