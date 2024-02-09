import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import { GitlabApiService } from 'src/app/services/gitlab-api.service';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import { map } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(private breakpointObserver: BreakpointObserver, private gitlabApiService: GitlabApiService) {
  }

  sharedIssues: any[] = []

  ngOnInit(): void {
    this.gitlabApiService.getIssuesOfProject('782').subscribe(
      (data) => {
        this.sharedIssues = data;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    )
  }


  cardLayout = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map((matches: any) => {
      if (matches) {
        return {
          columns: 4,
          chart: { cols: 1, rows: 3 },
        };
      }

      return {
        columns: 4,
        miniCard: { cols: 1, rows: 1 },
        chart: { cols: 2, rows: 2 },
        table: { cols: 4, rows: 4 },
      };
    })
  );

}
