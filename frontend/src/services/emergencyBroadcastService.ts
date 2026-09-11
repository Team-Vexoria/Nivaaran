// ─────────────────────────────────────────────────────────────────────────────
// NIVAARAN — Emergency Broadcast & Web Audio Siren Service (SIH 26043)
// Real-time disaster alert dispatch, Web Audio API siren synthesis,
// and cross-tab/cross-portal notification synchronization.
// ─────────────────────────────────────────────────────────────────────────────

export interface EmergencyAlertPayload {
  id: string;
  district: string;
  hazard: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
  messageHindi: string;
  messageEnglish: string;
  messageSanthali: string;
  channels: {
    sms: boolean;
    whatsapp: boolean;
    ivr: boolean;
    siren: boolean;
  };
  timestamp: string;
  active: boolean;
}

const BROADCAST_STORAGE_KEY = 'nivaaran_active_broadcast';
const BROADCAST_EVENT_NAME = 'nivaaran-emergency-broadcast';

// ── Web Audio API Emergency Siren Synthesizer ──────────────────────────────────
let audioCtx: AudioContext | null = null;
let oscillator1: OscillatorNode | null = null;
let oscillator2: OscillatorNode | null = null;
let gainNode: GainNode | null = null;
let sirenInterval: NodeJS.Timeout | null = null;
let isSirenActive = false;

/**
 * Generates an authentic dual-tone oscillating disaster warning siren
 * using the browser's Web Audio API.
 */
export function startEmergencySiren(volume = 0.3): boolean {
  try {
    if (isSirenActive) return true;

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) {
      console.warn('Web Audio API not supported in this browser.');
      return false;
    }

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Master Gain
    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.connect(audioCtx.destination);

    // Primary Siren Oscillator (Sweeps 650Hz to 1150Hz)
    oscillator1 = audioCtx.createOscillator();
    oscillator1.type = 'sawtooth';
    oscillator1.frequency.setValueAtTime(700, audioCtx.currentTime);

    // Harmonic Sub-Oscillator (Adds piercing alarm harmonic)
    oscillator2 = audioCtx.createOscillator();
    oscillator2.type = 'sine';
    oscillator2.frequency.setValueAtTime(350, audioCtx.currentTime);

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);

    oscillator1.start();
    oscillator2.start();
    isSirenActive = true;

    // Siren Pitch Modulation (European/Indian Disaster Standard: ~0.8s cycle)
    let isHigh = false;
    sirenInterval = setInterval(() => {
      if (!audioCtx || !oscillator1 || !isSirenActive) return;
      const targetFreq1 = isHigh ? 1150 : 680;
      const targetFreq2 = isHigh ? 575 : 340;
      
      oscillator1.frequency.exponentialRampToValueAtTime(
        targetFreq1,
        audioCtx.currentTime + 0.7
      );
      if (oscillator2) {
        oscillator2.frequency.exponentialRampToValueAtTime(
          targetFreq2,
          audioCtx.currentTime + 0.7
        );
      }
      isHigh = !isHigh;
    }, 750);

    return true;
  } catch (err) {
    console.error('Error starting Web Audio siren:', err);
    return false;
  }
}

/**
 * Stops the active emergency siren and cleans up audio nodes.
 */
export function stopEmergencySiren(): void {
  try {
    if (sirenInterval) {
      clearInterval(sirenInterval);
      sirenInterval = null;
    }

    if (gainNode && audioCtx && audioCtx.state === 'running') {
      gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
    }

    setTimeout(() => {
      if (oscillator1) {
        try { oscillator1.stop(); oscillator1.disconnect(); } catch { /* ignore */ }
        oscillator1 = null;
      }
      if (oscillator2) {
        try { oscillator2.stop(); oscillator2.disconnect(); } catch { /* ignore */ }
        oscillator2 = null;
      }
      if (gainNode) {
        try { gainNode.disconnect(); } catch { /* ignore */ }
        gainNode = null;
      }
      isSirenActive = false;
    }, 250);
  } catch (err) {
    console.error('Error stopping Web Audio siren:', err);
    isSirenActive = false;
  }
}

export function isSirenPlaying(): boolean {
  return isSirenActive;
}

// ── Native Browser Push Notification ───────────────────────────────────────────
export async function sendNativeNotification(payload: EmergencyAlertPayload): Promise<boolean> {
  try {
    if (!('Notification' in window)) return false;

    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      await Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
      new Notification(`⚠️ EMERGENCY ALERT: ${payload.hazard} (${payload.district})`, {
        body: payload.messageHindi || payload.messageEnglish,
        icon: '/favicon.ico',
        tag: 'nivaaran-disaster-alert',
        requireInteraction: true,
      });
      return true;
    }
  } catch (err) {
    console.warn('Native notification failed:', err);
  }
  return false;
}

// ── State Persistence & Cross-Tab Broadcast Dispatcher ─────────────────────────
export function dispatchBroadcast(payload: EmergencyAlertPayload): void {
  try {
    localStorage.setItem(BROADCAST_STORAGE_KEY, JSON.stringify(payload));
    
    // Trigger in current tab
    window.dispatchEvent(new CustomEvent(BROADCAST_EVENT_NAME, { detail: payload }));
    
    // Trigger cross-tab storage notification
    window.dispatchEvent(new StorageEvent('storage', {
      key: BROADCAST_STORAGE_KEY,
      newValue: JSON.stringify(payload)
    }));

    // Trigger Native Notification if permitted
    sendNativeNotification(payload);

    // Trigger local siren if channel includes siren
    if (payload.channels.siren) {
      startEmergencySiren();
    }
  } catch (err) {
    console.error('Failed to dispatch emergency broadcast:', err);
  }
}

export function dismissBroadcast(): void {
  try {
    localStorage.removeItem(BROADCAST_STORAGE_KEY);
    stopEmergencySiren();
    window.dispatchEvent(new CustomEvent(BROADCAST_EVENT_NAME, { detail: null }));
    window.dispatchEvent(new StorageEvent('storage', {
      key: BROADCAST_STORAGE_KEY,
      newValue: null
    }));
  } catch (err) {
    console.error('Failed to dismiss broadcast:', err);
  }
}

export function getActiveBroadcast(): EmergencyAlertPayload | null {
  try {
    const raw = localStorage.getItem(BROADCAST_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EmergencyAlertPayload;
    return parsed.active ? parsed : null;
  } catch {
    return null;
  }
}

export function subscribeToEmergencyBroadcast(callback: (payload: EmergencyAlertPayload | null) => void): () => void {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<EmergencyAlertPayload | null>;
    callback(customEvent.detail ?? getActiveBroadcast());
  };

  const storageHandler = (e: StorageEvent) => {
    if (e.key === BROADCAST_STORAGE_KEY) {
      callback(getActiveBroadcast());
    }
  };

  window.addEventListener(BROADCAST_EVENT_NAME, handler);
  window.addEventListener('storage', storageHandler);

  // Initial emit
  callback(getActiveBroadcast());

  return () => {
    window.removeEventListener(BROADCAST_EVENT_NAME, handler);
    window.removeEventListener('storage', storageHandler);
  };
}
