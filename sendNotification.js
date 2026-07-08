const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

// Firebase Admin initialize karo (ek baar)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function sendPushNotification({ pushToken, title, body, data = {} }) {
  if (!pushToken) return false;

  try {
    // Expo token se FCM token nikalna padega
    // Pehle Expo Push API try karo (V2 with service account)
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: pushToken,
        title,
        body,
        sound: 'default',
        priority: 'high',
        data,
      }),
    });

    const result = await response.json();

    // Agar Expo fail kare, Firebase Admin se bhejo
    if (result.data?.status === 'error') {
      console.log('Expo push failed, trying Firebase Admin...');

      const message = {
        notification: { title, body },
        data: Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, String(v)])
        ),
        android: {
          priority: 'high',
          notification: { sound: 'default', channelId: 'default' },
        },
        token: pushToken,
      };

      await admin.messaging().send(message);
      console.log('Firebase Admin notification sent!');
    } else {
      console.log('Expo push sent:', result);
    }
    return true;
  } catch (e) {
    console.log('Notification error:', e.message);
    return false;
  }
}

module.exports = sendPushNotification;
