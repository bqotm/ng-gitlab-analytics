import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { GitlabApiService } from 'src/app/services/gitlab-api.service';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-pie',
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.scss']
})
export class PieComponent implements OnInit, AfterViewInit {

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  // Pie
  public pieChartOptions: ChartConfiguration['options'] = {
    plugins: {
      legend: {
        display: true,
        position: 'left',
      },
    },
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [
      {
        data: [],
      },
    ],
  };
  public pieChartType: ChartType = 'pie';
  public pieChartPlugins = [DatalabelsPlugin];
  constructor(private gitlabApiService: GitlabApiService) { }
  ngAfterViewInit(): void {
    this.loadData();
  }

  ngOnInit(): void {
    
  }

  loadData(): void {
    this.gitlabApiService.getIssuesOfProject('782').subscribe(
      (issues: any[]) => {
        const assigneesMap = new Map<string, number>();

        // Count issues by assignee
        issues.forEach((issue) => {
          issue.assignees.forEach((assignee: any) => {
            const assigneeName = assignee.name || 'Unassigned';
            assigneesMap.set(assigneeName, (assigneesMap.get(assigneeName) || 0) + 1);
          });
        });

        // Update chart data and labels
        this.pieChartData = {
          labels: Array.from(assigneesMap.keys()),
          datasets: [
            {
              data: Array.from(assigneesMap.values()),
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
