import { useState, useEffect } from 'react';

export type NotificationType = 
  | 'status_change'
  | 'allocation'
  | 'evidence_request'
  | 'proposal'
  | 'deployment'
  | 'emergency'
  | 'message'
  | 'sms_dispatched'
  | 'email_dispatched';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: NotificationType;
  reportId?: string;
  targetRole?: string;
  channel?: 'in_app' | 'sms' | 'email';
  recipientContact?: string;
}

const STORAGE_KEY = 'nivaaran_live_notifications_v1';

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'NOTIF-001',
    title: 'Prototype Approved for Field Deployment',
    message: 'Jharkhand State Nodal Officer authorized LoRaWAN telemetry station deployment for challenge JH-2026-RNC-001 (Ranchi Basin).',
    timestamp: '10 minutes ago',
    read: false,
    type: 'deployment',
    reportId: 'JH-2026-RNC-001',
    targetRole: 'Government Department',
    channel: 'in_app',
  },
  {
    id: 'NOTIF-002',
    title: 'SMS Dispatched to Citizen',
    message: 'Alert sent to +91-9431100000: "Your report JH-2026-RNC-001 has advanced to Stage 12. Panchayat validation verified."',
    timestamp: '25 minutes ago',
    read: false,
    type: 'sms_dispatched',
    reportId: 'JH-2026-RNC-001',
    channel: 'sms',
    recipientContact: '+91-9431100000',
  },
  {
    id: 'NOTIF-003',
    title: 'New R&D Team Formed by BIT Mesra',
    message: 'Department of Electronics & Communication assigned 6 student innovators and 1 faculty mentor for Water Drainage telemetry.',
    timestamp: '1 hour ago',
    read: false,
    type: 'allocation',
    reportId: 'JH-2026-RNC-001',
    targetRole: 'University Admin',
    channel: 'in_app',
  },
  {
    id: 'NOTIF-004',
    title: 'CSR Co-Financing Committed',
    message: 'Tata Steel CSR committed ₹18,50,000 for hardware fabrication and community sensor arrays.',
    timestamp: '2 hours ago',
    read: true,
    type: 'proposal',
    reportId: 'JH-2026-DHN-002',
    targetRole: 'Industry / MSME',
    channel: 'in_app',
  },
  {
    id: 'NOTIF-005',
    title: 'Official Email Dispatched',
    message: 'Formal briefing sent to bitmesera@nivaaran.com with Stage 10 lab allocation terms and Panchayat signoff coordinates.',
    timestamp: '3 hours ago',
    read: true,
    type: 'email_dispatched',
    reportId: 'JH-2026-RNC-001',
    channel: 'email',
    recipientContact: 'bitmesera@nivaaran.com',
  },
  {
    id: 'NOTIF-006',
    title: 'Urgent Evidence Verification Required',
    message: 'Panchayat Cell requested geotag confirmation on Bokaro colliery water contamination (JH-2026-BKR-004).',
    timestamp: '5 hours ago',
    read: true,
    type: 'evidence_request',
    reportId: 'JH-2026-BKR-004',
    targetRole: 'Citizen',
    channel: 'in_app',
  },
  {
    id: 'NOTIF-007',
    title: 'Patent Specification Filed',
    message: 'Indian Patent Office filing completed for "IoT Ultrasonic Hydro Level Early Warning Station" (App No: 202631008492).',
    timestamp: '1 day ago',
    read: true,
    type: 'status_change',
    reportId: 'JH-2026-RNC-001',
    channel: 'in_app',
  },
];

let cachedNotifications: AppNotification[] = [];
let initialized = false;
const listeners: Array<(items: AppNotification[]) => void> = [];

function loadStoredNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[NotificationService] Failed to parse stored notifications:', e);
  }
  const initial = [...SEED_NOTIFICATIONS];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  } catch (e) {
    /* storage write skipped */
  }
  return initial;
}

function saveNotifications(items: AppNotification[]): void {
  cachedNotifications = items;
  initialized = true;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nivaaran_notification_update', { detail: items }));
    }
  } catch (e) {
    console.warn('[NotificationService] Failed to save notifications:', e);
  }
  listeners.forEach(fn => {
    try {
      fn(items);
    } catch (err) {
      console.warn('[NotificationService] Listener callback error:', err);
    }
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue !== null) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed)) {
          cachedNotifications = parsed;
          initialized = true;
          listeners.forEach(fn => fn(parsed));
        }
      } catch (err) {
        /* storage parse error skipped */
      }
    }
  });

  window.addEventListener('nivaaran_notification_update', (e: Event) => {
    const custom = e as CustomEvent<AppNotification[]>;
    if (custom.detail && Array.isArray(custom.detail)) {
      cachedNotifications = custom.detail;
      initialized = true;
      listeners.forEach(fn => fn(custom.detail));
    }
  });
}

export const notificationService = {
  getNotifications(): AppNotification[] {
    if (!initialized) {
      cachedNotifications = loadStoredNotifications();
      initialized = true;
    }
    return cachedNotifications;
  },

  getUnreadCount(): number {
    return this.getNotifications().filter(n => !n.read).length;
  },

  subscribe(listener: (items: AppNotification[]) => void): () => void {
    if (!initialized) {
      cachedNotifications = loadStoredNotifications();
      initialized = true;
    }
    listeners.push(listener);
    listener(cachedNotifications);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  },

  markAsRead(id: string): void {
    const list = this.getNotifications().map(item => 
      item.id === id ? { ...item, read: true } : item
    );
    saveNotifications(list);
  },

  markAllAsRead(): void {
    const list = this.getNotifications().map(item => ({ ...item, read: true }));
    saveNotifications(list);
  },

  deleteNotification(id: string): void {
    const list = this.getNotifications().filter(item => item.id !== id);
    saveNotifications(list);
  },

  clearAll(): void {
    saveNotifications([]);
  },

  resetSeed(): void {
    saveNotifications([...SEED_NOTIFICATIONS]);
  },

  addNotification(item: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): AppNotification {
    const full: AppNotification = {
      ...item,
      id: `NOTIF_${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      timestamp: 'Just now',
      read: false,
    };
    const current = this.getNotifications();
    const updated = [full, ...current];
    saveNotifications(updated);
    return full;
  },

  sendSimulatedSMS(phone: string, text: string, reportId?: string): AppNotification {
    return this.addNotification({
      title: 'SMS Dispatched',
      message: `SMS sent to ${phone}: "${text}"`,
      type: 'sms_dispatched',
      reportId,
      channel: 'sms',
      recipientContact: phone,
    });
  },

  sendSimulatedEmail(email: string, subject: string, body: string, reportId?: string): AppNotification {
    return this.addNotification({
      title: `Email: ${subject}`,
      message: `Email dispatched to ${email}: ${body.slice(0, 120)}...`,
      type: 'email_dispatched',
      reportId,
      channel: 'email',
      recipientContact: email,
    });
  },
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => notificationService.getNotifications());
  const [unread, setUnread] = useState<number>(() => notificationService.getUnreadCount());

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((items) => {
      setNotifications(items);
      setUnread(items.filter(n => !n.read).length);
    });
    return () => unsubscribe();
  }, []);

  return {
    notifications,
    unread,
    markAsRead: (id: string) => notificationService.markAsRead(id),
    markAllAsRead: () => notificationService.markAllAsRead(),
    deleteNotification: (id: string) => notificationService.deleteNotification(id),
    clearAll: () => notificationService.clearAll(),
    resetSeed: () => notificationService.resetSeed(),
    addNotification: (item: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => notificationService.addNotification(item),
    sendSimulatedSMS: (phone: string, text: string, reportId?: string) => notificationService.sendSimulatedSMS(phone, text, reportId),
    sendSimulatedEmail: (email: string, subject: string, body: string, reportId?: string) => notificationService.sendSimulatedEmail(email, subject, body, reportId),
  };
}
