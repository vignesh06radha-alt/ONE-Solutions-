const admin = require('firebase-admin');
const fs = require('fs');
const sa = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
console.log('SA keys:', Object.keys(sa));
try{
  admin.initializeApp({ credential: admin.credential.cert(sa) });
  console.log('Initialize with parsed JSON succeeded');
} catch (e) {
  console.error('INIT_ERROR', e && e.message);
}
