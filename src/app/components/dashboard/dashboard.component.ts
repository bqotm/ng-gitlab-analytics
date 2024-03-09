import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import { GitlabApiService } from 'src/app/services/gitlab-api.service';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import { Subscription, map } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class DashboardComponent implements OnInit, OnDestroy {

  constructor(
    private breakpointObserver: BreakpointObserver,
    private gitlabApiService: GitlabApiService,
    private cdr: ChangeDetectorRef,
    private spinner: NgxSpinnerService) {
  }
  ngOnDestroy(): void {
    if(this.gitlabApiServiceSubscription) {
      this.gitlabApiServiceSubscription.unsubscribe();
    }
  }

  sharedIssues: any[] = []
  gitlabApiServiceSubscription: Subscription | null = null;

  selectedMonthsObject = { value: 6 };

  ngOnInit(): void {
    this.spinner.show();
    this.gitlabApiServiceSubscription = this.gitlabApiService.getIssuesOfProject('36189', this.selectedMonthsObject.value).subscribe(
      (data) => {
        console.log(data)
        this.sharedIssues = data;
      },
      (error) => {
        console.error('Error fetching data:', error);
      },
      ()=>{
        this.spinner.hide();
      }
    )
  }

  onMonthsSelectionChange(event: MatSelectChange) {
    this.spinner.show();
    this.selectedMonthsObject.value = event.value;
    // Call your service method with the updated value
    this.gitlabApiServiceSubscription = this.gitlabApiService.getIssuesOfProject('36189', this.selectedMonthsObject.value).subscribe(
      (data) => {
        console.log(data)
        this.sharedIssues = data;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching data:', error);
      },
      ()=>{
        this.spinner.hide();
      }
    );
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
