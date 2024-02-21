import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, mergeMap, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GitlabApiService {

  // Adjust the URL based on your GitLab instance
  private gitLabApiUrl = 'gitlab-instance-url';


  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'PRIVATE-TOKEN': 'ACCESS_TOKEN',
  });

  constructor(private http: HttpClient) { }

  private getPaginatedData(url: string, page: number = 1, perPage: number = 100): Observable<any[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString())
      .set('created_after', this.getDateTwelveMonthsAgo());

    return this.http.get(url, { headers: this.headers, params, observe: 'response' }).pipe(
      mergeMap((response) => {
        const data: any[] = response.body as any[];
        const nextPage = +(response as any).headers.get('X-Next-Page');

        if (nextPage) {
          return this.getPaginatedData(url, nextPage, perPage).pipe(
            map((nextPageData) => data.concat(nextPageData))
          );
        } else {
          return of(data);
        }
      })
    );
  }

  getIssuesOfProject(projectId: string): Observable<any> {
    const url = `${this.gitLabApiUrl}/projects/${projectId}/issues`;
    return this.getPaginatedData(url);
  }



  getEpicsOfGroup(groupId: string): Observable<any> {
    const url = `${this.gitLabApiUrl}/groups/${groupId}/epics`;
    return this.http.get(url, { headers: this.headers });
  }

  getDateTwelveMonthsAgo() {
    const currentDate = new Date();

    // Subtract 12 months from the current date
    const twelveMonthsAgo = new Date(currentDate);
    twelveMonthsAgo.setMonth(currentDate.getMonth() - 12);
    twelveMonthsAgo.setHours(0, 0, 0, 0);
    twelveMonthsAgo.setDate(1);

    // Format the date in ISO 8601 format
    const iso8601Date = twelveMonthsAgo.toISOString();
    return iso8601Date
  }


}
