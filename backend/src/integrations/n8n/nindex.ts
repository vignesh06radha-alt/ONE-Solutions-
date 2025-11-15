import { environment } from '../../config/environment';
import { N8nClient } from './n8nClient';

export const n8nClient = new N8nClient({
  baseUrl: environment.N8N_BASE_URL,
  apiKey: environment.N8N_API_KEY,
  timeout: environment.N8N_TIMEOUT,
});

export default n8nClient;
