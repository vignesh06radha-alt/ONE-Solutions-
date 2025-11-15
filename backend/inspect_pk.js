require('dotenv').config();
const pkRaw = process.env.FIREBASE_PRIVATE_KEY || '';
console.log('RAW_INCLUDES_BACKSLASH_N=' + pkRaw.includes('\\n'));
const pk = pkRaw.replace(/\\n/g,'\n');
console.log('PK_START=' + pk.slice(0,30).replace(/\n/g,'\\n'));
console.log('PK_END=' + pk.slice(-30).replace(/\n/g,'\\n'));
console.log('PK_LINES=' + pk.split('\n').length);
