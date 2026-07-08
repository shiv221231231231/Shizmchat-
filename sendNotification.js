const admin = require('firebase-admin');

let initialized = false;

function initFirebase() {
  if (initialized) return;
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : require('./service-account.json');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    initialized = true;
    console.log('Firebase Admin initialized!');
  } catch (e) {
    console.log('Firebase init error:', e.message);
  }
}

async function sendPushNotification({ pushToken, title, body, data = {} }) {
  if (!pushToken) return false;
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: pushToken, title, body, sound: 'default', priority: 'high', data }),
    });
    const result = await response.json();
    if (result.data?.status === 'error') {
      console.log('Expo failed, trying Firebase Admin...');
      initFirebase();
      const message = {
        notification: { title, body },
        data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
        android: { priority: 'high', notification: { sound: 'default', channelId: 'default' } },
        token: pushToken,
      };
      await admin.messaging().send(message);
      console.log('Firebase Admin notification sent!');
    } else {
      console.log('Expo push sent!');
    }
    return true;
  } catch (e) {
    console.log('Notification error:', e.message);
    return false;
  }
}

module.exports = sendPushNotification;
