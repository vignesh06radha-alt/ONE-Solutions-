try {
  const admin = require('./src/config/firebase');
  console.log('Loaded firebase module, admin.apps length =', admin.apps ? admin.apps.length : 'n/a');
} catch (e) {
  console.error('LOAD_ERROR', e && e.message);
}
