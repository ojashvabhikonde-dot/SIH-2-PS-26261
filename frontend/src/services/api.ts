import { Application, ComplianceRule, Notification, AuditLog, User } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    designation?: string;
    institutionId?: string;
    newInstitutionName?: string;
    institutionCode?: string;
    institutionState?: string;
  }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getPublicInstitutions(): Promise<{ institutions: any[] }> {
    const res = await fetch(`${API_BASE}/auth/institutions`);
    return handleResponse(res);
  },

  async demoLogin(role: 'APPLICANT' | 'OFFICER' | 'ADMIN'): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    return handleResponse(res);
  },

  async me(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // Institutions
  async getInstitutions(): Promise<{ institutions: any[] }> {
    const res = await fetch(`${API_BASE}/institutions`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // Applications
  async getApplications(params?: {
    status?: string;
    programCategory?: string;
    risk?: string;
    search?: string;
  }): Promise<{ applications: Application[] }> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.programCategory) query.set('programCategory', params.programCategory);
    if (params?.risk) query.set('risk', params.risk);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`${API_BASE}/applications?${query.toString()}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async getApplicationById(id: string): Promise<{ application: Application }> {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async createApplication(data: {
    institutionId?: string;
    programCategory: string;
    academicYear: string;
  }): Promise<{ application: Application }> {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async submitApplication(id: string): Promise<{ message: string; applicationId: string; status: string }> {
    const res = await fetch(`${API_BASE}/applications/${id}/submit`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async triggerAiScan(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/applications/${id}/scan`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // Documents
  async uploadDocument(formData: FormData): Promise<{ document: any }> {
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData
    });
    return handleResponse(res);
  },

  async deleteDocument(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // Rules
  async getRules(): Promise<{ rules: ComplianceRule[] }> {
    const res = await fetch(`${API_BASE}/rules`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async createRule(data: Partial<ComplianceRule>): Promise<{ rule: ComplianceRule }> {
    const res = await fetch(`${API_BASE}/rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateRule(id: string, data: Partial<ComplianceRule>): Promise<{ rule: ComplianceRule }> {
    const res = await fetch(`${API_BASE}/rules/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async toggleRule(id: string): Promise<{ rule: ComplianceRule }> {
    const res = await fetch(`${API_BASE}/rules/${id}/toggle`, {
      method: 'PATCH',
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // Reviews
  async submitDecision(data: {
    applicationId: string;
    decision: 'APPROVED' | 'REJECTED' | 'CLARIFICATION_REQUESTED';
    remarks: string;
    conditions?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Analytics
  async getAnalytics(): Promise<any> {
    const res = await fetch(`${API_BASE}/analytics`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // Audit
  async getAuditLogs(params?: { applicationId?: string; action?: string }): Promise<{ logs: AuditLog[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.applicationId) query.set('applicationId', params.applicationId);
    if (params?.action) query.set('action', params.action);

    const res = await fetch(`${API_BASE}/audit?${query.toString()}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async markNotificationRead(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  }
};
