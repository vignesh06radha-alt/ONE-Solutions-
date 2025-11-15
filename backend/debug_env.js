const fs = require('fs');
require('dotenv').config();
console.log('PROJECT_ID=' + process.env.FIREBASE_PROJECT_ID);
console.log('PRIVATE_KEY_INCLUDES_BACKSLASH_N=' + (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PRIVATE_KEY.includes('\\n')));
console.log('PRIVATE_KEY_LENGTH=' + (process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.length : 0));
