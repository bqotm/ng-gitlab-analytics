import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import { GitlabApiService } from 'src/app/services/gitlab-api.service';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import { Subscription, map } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  constructor(private breakpointObserver: BreakpointObserver, private gitlabApiService: GitlabApiService) {
  }
  ngOnDestroy(): void {
    if(this.gitlabApiServiceSubscription) {
      this.gitlabApiServiceSubscription.unsubscribe();
    }
  }

  sharedIssues: any[] = []
  gitlabApiServiceSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.gitlabApiServiceSubscription = this.gitlabApiService.getIssuesOfProject('782').subscribe(
      (data) => {
        console.log(data)
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
          columns: 3,
          chart: { cols: 1, rows: 3 },
        };
      }

      return {
        columns: 1,
        miniCard: { cols: 1, rows: 1 },
        chart: { cols: 3, rows: 2 },
        table: { cols: 4, rows: 4 },
      };
    })
  );

}
