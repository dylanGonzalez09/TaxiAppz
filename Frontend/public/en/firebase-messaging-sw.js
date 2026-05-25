importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAvyBnOqMKu5C3gQbK82KI_f87g3ME3Tow',
  authDomain: 'taxiappz-new.firebaseapp.com',
  projectId: 'taxiappz-new',
  storageBucket: 'taxiappz-new.firebasestorage.app',
  messagingSenderId: '996273313700',
  appId: '1:996273313700:web:322c26c8fc88c092349331',
  measurementId: 'G-KVX7FEZRTG'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  if (!payload.notification) return;

  // Create unique notification ID for vertical stacking
  const notificationId = `bg-notif-${Date.now()}`;
  
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/Logo-Korssa.svg',
    // Vertical stacking configuration
    tag: notificationId, // Unique tag for each notification
    requireInteraction: false, // Don't stay persistent
    data: {
      ...payload.data,
      notificationId: notificationId
    }
  };

  self.registration.showNotification(
    payload.notification.title,
    notificationOptions
  );
});

// Notification click handler remains the same
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});