import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HttpClientModule } from '@angular/common/http';
import { GitlabApiService } from './services/gitlab-api.service';
import { NgChartsModule } from 'ng2-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule} from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { PieComponent } from './components/charts/pie/pie.component';
import { IssueAssigneeBarChartComponent } from './components/charts/issue-assignee-bar-chart/issue-assignee-bar-chart.component';
import {MatCardModule} from '@angular/material/card';
import { IssueStateBarChartComponent } from './components/charts/issue-state-bar-chart/issue-state-bar-chart.component';
import { IssuePerAssigneeAtPeriodComponent } from './components/charts/issue-per-assignee-at-period/issue-per-assignee-at-period.component';
import { CardComponent } from './components/card/card.component';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import { CreatedVsResolvedIssuesByCollabComponent } from './components/charts/created-vs-resolved-issues-by-collab/created-vs-resolved-issues-by-collab.component';
import { BacklogAgeComponent } from './components/charts/backlog-age/backlog-age.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    PieComponent,
    IssueStateBarChartComponent,
    IssueAssigneeBarChartComponent,
    IssuePerAssigneeAtPeriodComponent,
    CardComponent,
    CreatedVsResolvedIssuesByCollabComponent,
    BacklogAgeComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    NgChartsModule.forRoot(),
    BrowserAnimationsModule,
    MatButtonModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule
  ],
  providers: [GitlabApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
