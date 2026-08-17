// Production API Client for Icestock Global Tournament Management System

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

class ApiClient {
  private baseUrl = '/api';
  private authToken: string | null = null;

  constructor() {
    // Load stored token if present
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('ifi_access_token');
    }
  }

  public setToken(token: string | null) {
    this.authToken = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('ifi_access_token', token);
      } else {
        localStorage.removeItem('ifi_access_token');
      }
    }
  }

  public getToken(): string | null {
    return this.authToken;
  }

  public async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include'
      });

      const json = await res.json();
      return json;
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: err.message || 'Unable to connect to the Icestock production server.'
        }
      };
    }
  }

  // Auth helpers
  public async login(identifier: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });
  }

  public async verify2FA(tempToken: string, totpCode: string) {
    return this.request('/auth/2fa/verify-login', {
      method: 'POST',
      body: JSON.stringify({ tempToken, totpCode })
    });
  }

  public async setup2FA() {
    return this.request('/auth/2fa/setup', { method: 'POST' });
  }

  public async confirm2FA(code: string) {
    return this.request('/auth/2fa/verify-setup', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  }

  public async register(payload: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async getMe() {
    return this.request('/auth/me');
  }

  public async logout() {
    const res = await this.request('/auth/logout', { method: 'POST' });
    this.setToken(null);
    return res;
  }

  // Scoring helpers
  public async submitScore(matchId: string, payload: any) {
    return this.request(`/matches/${matchId}/scores`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async lockScorecard(matchId: string, state = 'LOCKED') {
    return this.request(`/matches/${matchId}/lock`, {
      method: 'POST',
      body: JSON.stringify({ state })
    });
  }

  public async overrideScore(matchId: string, scorePayload: any, reason: string) {
    return this.request(`/matches/${matchId}/override`, {
      method: 'POST',
      body: JSON.stringify({ scorePayload, reason })
    });
  }

  // Tournament & Match helpers
  public async getTournaments() {
    return this.request('/tournaments');
  }

  public async getMatches(tournamentId?: string) {
    const query = tournamentId ? `?tournamentId=${encodeURIComponent(tournamentId)}` : '';
    return this.request(`/matches${query}`);
  }

  public async getRankings(discipline?: string, category?: string) {
    const params = new URLSearchParams();
    if (discipline) params.append('discipline', discipline);
    if (category) params.append('category', category);
    return this.request(`/rankings?${params.toString()}`);
  }

  public async getKycUsers() {
    return this.request('/kyc/users');
  }

  public async reviewKyc(payload: { userId: string; decision: string; notes?: string; rejectionReason?: string }) {
    return this.request('/kyc/review', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async getAuditLogs() {
    return this.request('/audit');
  }
}

export const api = new ApiClient();
