const admin = require('firebase-admin');
const sa = require(process.argv[1]);
try{
  admin.initializeApp({ credential: admin.credential.cert(sa) });
  console.log('Initialize with JSON file succeeded');
} catch (e) {
  console.error('INIT_ERROR', e && e.message);
}
