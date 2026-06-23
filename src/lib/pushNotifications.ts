'use client';

import { Capacitor } from '@capacitor/core';

export async function registerPushNotifications() {
  if (typeof window === 'undefined') return;

  // Check if running on native platform (iOS / Android wrapper)
  if (!Capacitor.isNativePlatform()) {
    console.log('Push Notifications: Running in browser. Reverting to web notification permission request.');
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        try {
          await Notification.requestPermission();
        } catch (e) {
          console.warn('Web notification request failed:', e);
        }
      }
    }
    return;
  }

  // Dynamic import of Capacitor plugins to avoid server-side Next.js node resolution errors
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');

    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('Capacitor native push notification permission was denied.');
      return;
    }

    // Register with Apple APNS / Google FCM push services
    await PushNotifications.register();

    // Listeners for native device events
    PushNotifications.addListener('registration', (token) => {
      console.log('Capacitor Push Registration Token:', token.value);
      // In production, send this token to the API server to map it to the user profile
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Capacitor Push Registration Error:', error.error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Capacitor Push Received:', notification);
      // Display alert banner in-app if needed
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Capacitor Push Action performed:', action);
    });
  } catch (err) {
    console.error('Failed to initialize Capacitor Push Notification listeners:', err);
  }
}

// Helper to trigger a local alert notification (supports both Web and Mobile Capacitor)
export async function triggerLocalNotification(title: string, body: string) {
  if (typeof window === 'undefined') return;

  if (Capacitor.isNativePlatform()) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            extra: null,
          }
        ]
      });
      return;
    } catch (e) {
      console.warn('Capacitor local notifications plugin not found. Reverting to HTML5 fallback.', e);
    }
  }

  // HTML5 browser notification fallback
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
  } else {
    console.log(`[ALERT NOTIFICATION]: ${title} — ${body}`);
  }
}
