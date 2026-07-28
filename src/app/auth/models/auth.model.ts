export interface LoginRequest {
  email: string;
  password: string;
  totp_code?: string;
}

export interface LoginResponse {
  data: {
    access_token: string | null;
    refresh_token: string | null;
    user: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      status: string;
    };
    active_role: any | null;
    requires_role_selection: boolean;
    available_roles: any[];
    requires_two_factor: boolean;
    requires_two_factor_setup: boolean;
    must_change_password: boolean;
  };
  meta: {
    timestamp: string;
  };
}

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: any | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
