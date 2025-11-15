require('dotenv').config();
const crypto = require('crypto');
const pkRaw = process.env.FIREBASE_PRIVATE_KEY || '';
const pk = pkRaw.replace(/\\n/g,'\n');
try {
  const keyObj = crypto.createPrivateKey({ key: pk, format: 'pem' });
  console.log('PRIVATE KEY OK, type:', keyObj.type);
} catch (e) {
  console.error('CREATE_PRIVATE_KEY_ERROR:', e && e.message);
}
