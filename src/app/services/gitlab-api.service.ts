import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GitlabApiService {

  private gitLabApiUrl = 'https://gitlab.altengroup.net/api/v4'; // Adjust the URL based on your GitLab instance

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'PRIVATE-TOKEN': 'UR8ux8KxxBrhjXeyzG-K',
  });

  constructor(private http: HttpClient) { }

  getIssuesOfProject(projectId: string, page: number = 1, perPage: number = 100): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    const url = `${this.gitLabApiUrl}/projects/${projectId}/issues`;
    return this.http.get(url, { headers: this.headers, params });
  }

  getEpicsOfGroup(groupId: string): Observable<any> {
    const url = `${this.gitLabApiUrl}/groups/${groupId}/epics`;
    return this.http.get(url, { headers: this.headers });
  }


}
