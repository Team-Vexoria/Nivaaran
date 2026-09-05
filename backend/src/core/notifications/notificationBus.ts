export interface NotificationPayload { userId: string; message: string; challengeId?: string; severity: 'LOW'|'MEDIUM'|'HIGH'; }
export class NotificationBus { async broadcast(p: NotificationPayload) { console.log('[NOTIFY]', p); } }
