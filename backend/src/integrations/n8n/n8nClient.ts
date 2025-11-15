import axios, { AxiosInstance } from 'axios';
import { logger } from '../../utils/logger';
import {
  N8nClassifyProblemPayload,
  N8nClassifyProblemResponse,
  N8nAllocateTokensPayload,
  N8nAllocateTokensResponse,
  N8nSelectBidPayload,
  N8nSelectBidResponse,
} from '../../types/n8n';

interface N8nConfig {
  baseUrl: string;
  apiKey?: string;
  timeout: number;
}

export class N8nClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(config: N8nConfig) {
    this.baseUrl = config.baseUrl;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: config.apiKey ? { 'X-N8N-API-KEY': config.apiKey } : {},
    });
  }

  async classifyProblem(
    payload: N8nClassifyProblemPayload
  ): Promise<N8nClassifyProblemResponse> {
    try {
      // Use configurable webhook path so we can change webhooks without code edits
      const classifyPath = process.env.N8N_CLASSIFY_WEBHOOK || '/webhook/classify-problem';
      logger.info('Calling n8n classify problem workflow', { path: classifyPath, payload });
      const response = await this.client.post(classifyPath, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      logger.info('n8n classification response:', response.data);
      return response.data;
    } catch (error) {
      throw this.handleError('classifyProblem', error);
    }
  }

  async allocateTokens(
    payload: N8nAllocateTokensPayload
  ): Promise<N8nAllocateTokensResponse> {
    try {
      logger.info('Calling n8n allocate tokens workflow', payload);
      const response = await this.client.post('/webhook/allocate-tokens', payload);
      logger.info('n8n token allocation response:', response.data);
      return response.data;
    } catch (error) {
      throw this.handleError('allocateTokens', error);
    }
  }

  async selectBestBid(
    payload: N8nSelectBidPayload
  ): Promise<N8nSelectBidResponse> {
    try {
      logger.info('Calling n8n select best bid workflow', payload);
      const response = await this.client.post('/webhook/select-bid', payload);
      logger.info('n8n bid selection response:', response.data);
      return response.data;
    } catch (error) {
      throw this.handleError('selectBestBid', error);
    }
  }

  async computeHeatmap(bounds: {
    ne: { lat: number; lng: number };
    sw: { lat: number; lng: number };
  }): Promise<any> {
    try {
      logger.info('Calling n8n compute heatmap workflow', bounds);
      const response = await this.client.post('/webhook/compute-heatmap', bounds);
      logger.info('n8n heatmap computation response:', response.data);
      return response.data;
    } catch (error) {
      throw this.handleError('computeHeatmap', error);
    }
  }

  private handleError(method: string, error: any): Error {
    logger.error(`n8n ${method} error:`, error);
    if (error.response) {
      const message = `n8n ${method} failed: ${error.response.status} - ${
        error.response.data?.message || 'Unknown error'
      }`;
      return new Error(message);
    }
    if (error.code === 'ECONNABORTED') {
      return new Error(`n8n ${method} timeout`);
    }
    return error;
  }
}
