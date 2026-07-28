import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

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
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  getUsersSummary(): Observable<AnalyticsSummary> {
    return this.http.get<AnalyticsSummary>(this.configService.analyticsUsersSummaryUrl);
  }
}