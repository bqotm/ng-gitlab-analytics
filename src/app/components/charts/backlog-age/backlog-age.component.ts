import { ChangeDetectionStrategy, Component, Input, SimpleChanges, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';


const ageMapping: { [key: string]: number } = {
  '<3 days': 3,
  '<1 week': 7,
  '<2 weeks': 14,
  '<3 weeks': 21,
  '<1 month' : 30,
  '<2 months': 60,
  '<3 months': 90,
};

@Component({
  selector: 'app-backlog-age',
  templateUrl: './backlog-age.component.html',
  styleUrls: ['./backlog-age.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BacklogAgeComponent {

  @Input() issues: any[] = [];

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  public ageCategories: string[] = Object.keys(ageMapping);

  public barChartOptions: ChartConfiguration['options'] = {
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true
      },
      y: {
        type: 'category',
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
    labels: this.ageCategories,
    datasets: [
      {
        data: this.ageCategories.map(label => this.calculateIssueCount(label)),
      },
    ],
  };

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['issues'] && this.issues.length !== 0) {
      this.loadData();
    }
  }

  private calculateIssueCount(ageCategory: string): number {
    const ageGroupsMap = new Map<string, number>();

    this.issues.filter(issue => issue.state === 'opened').forEach((issue) => {
      const createdDate = new Date(issue.created_at);
      const currentDate = new Date();
      const ageInDays = Math.floor((currentDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

      const category = this.determineAgeCategory(ageInDays);

      if (!ageGroupsMap.has(category)) {
        ageGroupsMap.set(category, 0);
      }

      ageGroupsMap.set(category, ageGroupsMap.get(category)! + 1);
    });

    return ageGroupsMap.get(ageCategory) || 0;
  }

  private determineAgeCategory(ageInDays: number): string {
    return Object.entries(ageMapping)
      .find(([label, threshold]) => ageInDays <= threshold)?.[0] || '';
  }

  private loadData(): void {
    this.barChartData = {
      labels: this.ageCategories,
      datasets: [
        {
          data: this.ageCategories.map(label => this.calculateIssueCount(label)),
        },
      ],
    };

    this.chart?.update();
  }
}
