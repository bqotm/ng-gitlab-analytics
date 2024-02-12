import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, mergeMap, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GitlabApiService {

  // Adjust the URL based on your GitLab instance
  private gitLabApiUrl = 'https://gitlab.altengroup.net/api/v4';

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'PRIVATE-TOKEN': 'UR8ux8KxxBrhjXeyzG-K',
  });

  constructor(private http: HttpClient) { }

  private getPaginatedData(url: string, page: number = 1, perPage: number = 20): Observable<any[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

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


}
