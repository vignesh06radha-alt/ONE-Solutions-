// Using in-memory JSON database instead of Firebase for simplicity
import { db, auth, storage } from './memoryDb';

console.log('Using in-memory JSON database (local file storage)');
console.log('Data will be stored in ./backend/data/ directory');

export { db, auth, storage };
export default { firestore: () => db, auth, storage };
