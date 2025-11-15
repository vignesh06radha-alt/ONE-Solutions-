import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StorageFile {
  [key: string]: any;
}

class MemoryDatabase {
  private collections: Map<string, StorageFile> = new Map();
  private collectionPaths: Map<string, string> = new Map();

  constructor() {
    this.initializeCollections();
  }

  private initializeCollections() {
    const collections = [
      'users',
      'problems',
      'biddingSessions',
      'bids',
      'greenCredits',
      'oneCredits',
      'redemptions',
      'rewards',
    ];

    for (const collection of collections) {
      const filePath = path.join(DATA_DIR, `${collection}.json`);
      this.collectionPaths.set(collection, filePath);

      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        this.collections.set(collection, data);
      } else {
        this.collections.set(collection, {});
        this.saveCollection(collection);
      }
    }
  }

  private saveCollection(collection: string) {
    const data = this.collections.get(collection) || {};
    const filePath = this.collectionPaths.get(collection)!;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  // Simulates Firestore collection().doc(id).set(data)
  set(collection: string, docId: string, data: any) {
    if (!this.collections.has(collection)) {
      this.collections.set(collection, {});
    }
    const col = this.collections.get(collection)!;
    col[docId] = { id: docId, ...data };
    this.saveCollection(collection);
    return Promise.resolve();
  }

  // Simulates Firestore collection().doc(id).get()
  async get(collection: string, docId: string) {
    const col = this.collections.get(collection) || {};
    const data = col[docId];
    return {
      exists: !!data,
      data: () => data || null,
      id: docId,
    };
  }

  // Simulates Firestore collection().doc(id).update(data)
  update(collection: string, docId: string, data: any) {
    if (!this.collections.has(collection)) {
      this.collections.set(collection, {});
    }
    const col = this.collections.get(collection)!;
    if (col[docId]) {
      col[docId] = { ...col[docId], ...data };
      this.saveCollection(collection);
    }
    return Promise.resolve();
  }

  // Simulates Firestore collection().where(...).get()
  async query(collection: string, whereField: string, operator: string, value: any) {
    const col = this.collections.get(collection) || {};
    const results = Object.values(col).filter((doc: any) => {
      if (operator === '==') return doc[whereField] === value;
      if (operator === 'in') return (value as any[]).includes(doc[whereField]);
      return false;
    });
    return {
      empty: results.length === 0,
      docs: results.map((doc: any) => ({
        data: () => doc,
        id: doc.id,
      })),
    };
  }

  // Simulates Firestore collection().where(...).orderBy(...).get()
  async queryWithSort(
    collection: string,
    whereField: string | null,
    operator: string | null,
    value: any | null,
    orderByField: string,
    direction: 'asc' | 'desc'
  ) {
    const col = this.collections.get(collection) || {};
    let results: any[] = Object.values(col);

    // Apply where clause if provided
    if (whereField && operator) {
      results = results.filter((doc: any) => {
        if (operator === '==') return doc[whereField] === value;
        if (operator === 'in') return (value as any[]).includes(doc[whereField]);
        return false;
      });
    }

    // Sort results
    results.sort((a: any, b: any) => {
      const aVal = a[orderByField];
      const bVal = b[orderByField];
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return {
      empty: results.length === 0,
      docs: results.map((doc: any) => ({
        data: () => doc,
        id: doc.id,
      })),
    };
  }

  // Simulates Firestore collection().doc(id).delete()
  delete(collection: string, docId: string) {
    const col = this.collections.get(collection);
    if (col && col[docId]) {
      delete col[docId];
      this.saveCollection(collection);
    }
    return Promise.resolve();
  }

  // Get all documents in collection
  async getAll(collection: string) {
    const col = this.collections.get(collection) || {};
    const docs = Object.values(col).map((doc: any) => ({
      data: () => doc,
      id: doc.id,
    }));
    return {
      empty: docs.length === 0,
      docs,
    };
  }
}

// Singleton instance
const memDB = new MemoryDatabase();

// Export a Firestore-like interface
export const db = {
  collection: (name: string) => ({
    doc: (id: string) => ({
      set: (data: any) => memDB.set(name, id, data),
      get: () => memDB.get(name, id),
      update: (data: any) => memDB.update(name, id, data),
      delete: () => memDB.delete(name, id),
    }),
    where: (field: string, op: string, val: any) => ({
      get: () => memDB.query(name, field, op, val),
      limit: (n: number) => ({
        get: async () => {
          const result = await memDB.query(name, field, op, val);
          return { ...result, docs: result.docs.slice(0, n) };
        },
      }),
      orderBy: (orderField: string, dir?: string) => ({
        get: () =>
          memDB.queryWithSort(
            name,
            field,
            op,
            val,
            orderField,
            (dir === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc'
          ),
      }),
      where: (field2: string, op2: string, val2: any) => ({
        get: () => memDB.query(name, field2, op2, val2),
        orderBy: (orderField: string, dir?: string) => ({
          get: () =>
            memDB.queryWithSort(
              name,
              field2,
              op2,
              val2,
              orderField,
              (dir === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc'
            ),
        }),
      }),
    }),
    orderBy: (field: string, dir?: string) => ({
      get: () =>
        memDB.queryWithSort(
          name,
          null,
          null,
          null,
          field,
          (dir === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc'
        ),
    }),
  }),
};

// Mock auth and storage
export const auth = {
  createUser: async (_data: any) => ({ uid: 'user_' + Date.now() }),
  getUser: async (uid: string) => ({ uid }),
  getUserByEmail: async (email: string) => {
    // Mock: return a user if email matches pattern, else throw
    if (email) return { uid: 'user_email_' + Date.now(), email };
    throw new Error('User not found');
  },
  verifyIdToken: async (_token: string) => ({ uid: 'test_user' }),
};

export const storage = {
  bucket: () => ({
    file: (name: string) => ({
      save: async (_buffer: any) => ({ name }),
    }),
  }),
};

export default { firestore: () => db, auth, storage };
