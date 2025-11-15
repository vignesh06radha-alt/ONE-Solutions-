import { N8nClient } from './n8nClient';

const baseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
const apiKey = process.env.N8N_API_KEY;
const timeout = Number(process.env.N8N_TIMEOUT) || 30000;

const n8nClient = new N8nClient({ baseUrl, apiKey, timeout });

export { n8nClient, N8nClient };
