import { ChangeDetectionStrategy, Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import { GitlabApiService } from 'src/app/services/gitlab-api.service';

@Component({
  selector: 'app-backlog-age',
  templateUrl: './backlog-age.component.html',
  styleUrls: ['./backlog-age.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BacklogAgeComponent {

  @Input() issues: any[] = [];

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  constructor() { }

  ngOnInit(): void {
  }

  public barChartOptions: ChartConfiguration['options'] = {
    scales: {
      x: {
        type: 'category',
        position: 'bottom',
        labels: ['<3 days', '<1 week', '<2 weeks', '<1 month','<2 months', '<3 months'],
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

  loadData(): void {
    const ageGroupsMap = new Map<string, number>();
    
    const determineAgeCategory = (ageInDays: number): string => {
      const ageMapping: { [key: string]: number } = {
        '<3 days': 3,
        '<1 week': 10,
        '<2 weeks': 14,
        '<1 month': 30,
        '<2 months':60,
        '<3 months': 110,
      };

      return Object.entries(ageMapping)
        .find(([label, threshold]) => ageInDays < threshold)?.[0] || '';
    };

    // Calculate the age of each issue and group them into age categories
    this.issues.filter(issue => issue.state === 'opened').forEach((issue) => {
      const createdDate = new Date(issue.created_at);
      const currentDate = new Date();
      const ageInDays = Math.floor((currentDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

      const ageCategory = determineAgeCategory(ageInDays);

      if (!ageGroupsMap.has(ageCategory)) {
        ageGroupsMap.set(ageCategory, 0);
      }

      ageGroupsMap.set(ageCategory, ageGroupsMap.get(ageCategory)! + 1);
    });

    // Update chart data and labels
    this.barChartData = {
      labels: ['<3 days', '<1 week', '<2 weeks', '<1 month','<2 months', '<3 months'], // Keep the order consistent
      datasets: [
        {
          data: ['<3 days', '<1 week', '<2 weeks', '<1 month', '<2 months', '<3 months'].map(label => ageGroupsMap.get(label) || 0),
          backgroundColor: 'rgba(75,192,192,0.2)',
          borderColor: 'rgba(75,192,192,1)',
          borderWidth: 1,
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
