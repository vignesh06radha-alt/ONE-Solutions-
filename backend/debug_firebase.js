require('dotenv').config();
const admin = require('firebase-admin');
const creds = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\\n').replace(/\\n/g,'\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL
};
try {
  admin.initializeApp({ credential: admin.credential.cert(creds) });
  console.log('Firebase initializeApp succeeded');
} catch (e) {
  console.error('ERR:', e && e.message);
  console.error('CREDS KEYS:', Object.keys(creds));
  console.error('project_id type:', typeof creds.project_id);
  console.error('project_id value:', creds.project_id);
}
