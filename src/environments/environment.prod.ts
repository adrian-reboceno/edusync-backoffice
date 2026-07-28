export const environment = {
  production: true,
  apiUrl: 'https://api.edusyncbridge.com/api/v1',
  appName: 'EduSync Bridge BackOffice',
  inactivityTimeoutMinutes: 30,
  endpoints: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
    },
    analytics: {
      users: '/analytics/users',
      usersSummary: '/analytics/users/summary',
      userDetail: (neoId: number) => `/analytics/users/${neoId}`,
    },
  },
};
