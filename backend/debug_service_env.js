require('dotenv').config();
const fs = require('fs');
console.log('ENV PATH VAR:', process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
try{
  const raw = fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8');
  const sa = JSON.parse(raw);
  console.log('SA keys:', Object.keys(sa));
} catch(e) {
  console.error('READ_ERROR', e && e.message);
}
