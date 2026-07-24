import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AnalyticsSummary {
  data: {
    organization: {
      id: number;
      name: string;
    };
    totals: {
      total: number;
      activated: number;
      never_logged_in: number;
      activation_rate: number;
      archived: number;
    };
    by_role: {
      students: number;
      teachers: number;
      administrators: number;
      others: number;
    };
    sessions: {
      total_sessions: number;
      users_with_sessions: number;
      avg_sessions_per_user: number;
    };
    last_synced_at: string;
  };
  meta: {
    timestamp: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = 'http://localhost:8000/api/v1/analytics/users/summary';

  constructor(private http: HttpClient) {}

  getUsersSummary(): Observable<AnalyticsSummary> {
    return this.http.get<AnalyticsSummary>(this.apiUrl);
  }
}