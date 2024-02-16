import { ChangeDetectionStrategy, Component, DoCheck, Input, KeyValueDiffers, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import { GitlabApiService } from 'src/app/services/gitlab-api.service';
import { ChartOptions, ChartDataset } from 'chart.js';
import { FormControl, FormGroup } from '@angular/forms';


interface AssigneeMap {
  [assigneeName: string]: {
    [monthYear: string]: number;
  };
}

@Component({
  selector: 'app-created-vs-resolved-issues-by-collab',
  templateUrl: './created-vs-resolved-issues-by-collab.component.html',
  styleUrls: ['./created-vs-resolved-issues-by-collab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatedVsResolvedIssuesByCollabComponent implements OnInit {

  @Input() issues: any[] = [];

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  constructor(private differs: KeyValueDiffers) {
    this.differ = this.differs.find([]).create();
    this.endDate = new Date();
  }

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
  timeUnit: 'months' | 'weeks' | 'days' = 'months'; // Default to months
  startDate: Date | undefined;
  endDate: Date | undefined;
  maxEndDate: Date = new Date();
  ngOnInit(): void {
    this.timeUnit = 'months';
  }

  assigneeMap: any = {};

  loadData(): void {
    const today = new Date();
    let periodsInPeriod: number;
    switch (this.timeUnit) {
      case 'months':
        periodsInPeriod = 12;
        break;
      case 'weeks':
        periodsInPeriod = 4;
        break;
      case 'days':
        periodsInPeriod = 10; 
        break;
      default:
        periodsInPeriod = 12;
        break;
    }
    // Generate an array of the last 6 months including the current month
    const allPeriods = Array.from({ length: periodsInPeriod }, (_, index) => {
      const period = new Date(today);

      switch (this.timeUnit) {
        case 'months':
          period.setMonth(today.getMonth() - index);
          break;
        case 'weeks':
          period.setDate(today.getDate() - index * 7);
          break;
        case 'days':
          period.setDate(today.getDate() - index);
          break;
        default:
          period.setMonth(today.getMonth() - index);
          break;
      }

      return this.formatPeriodLabel(period);
    }).reverse();


    const monthlyDataMap = new Map<string, { created: number }>(
      allPeriods.map(month => [month, { created: 0 }])
    );

    this.issues.forEach((issue) => {

      let closedDate = new Date(issue.closed_at);
      if (closedDate > today) {
        closedDate = today;
      }
      const monthYear = this.formatPeriodLabel(closedDate);
      const createdDate = new Date(issue.created_at);
      const createdMonthYear = this.formatPeriodLabel(createdDate);

      // Increment created count for the created month
      if (!monthlyDataMap.has(createdMonthYear)) {
        monthlyDataMap.set(createdMonthYear, { created: 0 });
      }
      monthlyDataMap.get(createdMonthYear)!.created++;
      issue.assignees.forEach((assignee: any) => {
        const assigneeName = assignee.name;


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
    // Sort data based on sortedKeys
    const sortedData = Array.from(monthlyDataMap.keys()).map((month) => ({
      month,
      created: monthlyDataMap.get(month)!.created,
    }));
    // Prepare chart data
    const chartData: ChartDataset[] = [];
    // Transform assigneeMap values into arrays
    for (const assigneeName in this.assigneeMap) {
      if (Object.prototype.hasOwnProperty.call(this.assigneeMap, assigneeName)) {
        const assigneeValues = this.assigneeMap[assigneeName];
        const assigneeArray = allPeriods.map((month) => assigneeValues[month] || 0);
        this.assigneeMap[assigneeName] = assigneeArray;
        chartData.push({
          data: assigneeArray,
          label: `${assigneeName} - closed`,
          stack: 'a'
        })
      }
    }
    // Set chart labels and data
    this.barChartLabels = allPeriods;
    this.barChartData = [
      { data: sortedData.map(data => data.created), label: 'opened' },
      ...chartData,
    ];

    // Trigger chart update
    this.chart?.update();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['issues'] && this.issues.length !== 0) || (changes['timeUnit'])) {
      //this runs two times when component is first loaded
      console.log(changes)
      this.loadData();
    }
  }

  private formatPeriodLabel(date: Date): string {
    switch (this.timeUnit) {
      case 'months':
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
      case 'weeks':
        const adjustedDate = this.adjustDateForWeeks(date);
        return adjustedDate.toLocaleDateString('default');
      case 'days':
        return date.toISOString().split('T')[0]; // Using ISO string for consistent formatting
      default:
        return '';
    }
  }

  private adjustDateForWeeks(date: Date): Date {
    const adjustedDate = new Date(date);
    adjustedDate.setDate(date.getDate() - date.getDay()); // Adjust to the start of the week
    return adjustedDate;
  }

  onTimeUnitChange(newTimeUnit: 'days' | 'weeks' | 'months'): void {
    this.timeUnit = newTimeUnit;
  }

  private differ: any

  ngDoCheck(): void {
    const changes = this.differ.diff(this);

    if (changes) {
      changes.forEachChangedItem((change: any) => {
        if (change.key === 'issues' || change.key === 'timeUnit') {
          this.loadData();
        }
      });
    }
  }

}
