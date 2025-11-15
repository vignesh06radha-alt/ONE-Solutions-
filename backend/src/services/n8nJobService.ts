import { db } from '../config/firebase';
import { COLLECTIONS, PROBLEM_STATUS } from '../config/constants';
import { n8nClient } from '../integrations/n8n';
import { logger } from '../utils/logger';

export class N8nJobService {
  async getJob(jobId: string) {
    const doc = await db.collection(COLLECTIONS.N8N_JOBS).doc(jobId).get();
    return doc.exists ? doc.data() : null;
  }

  async listJobs(filter: { status?: string; limit?: number } = {}) {
    let query: any = db.collection(COLLECTIONS.N8N_JOBS);
    if (filter.status) {
      query = query.where('status', '==', filter.status);
    }
    if (filter.limit) {
      query = query.limit(filter.limit);
    }
    const snapshot = await query.get();
    return snapshot.docs.map((d: any) => d.data());
  }

  async processJob(jobId: string) {
    const job = await this.getJob(jobId);
    if (!job) throw new Error(`Job not found: ${jobId}`);

    if (job.status === 'completed') {
      return { status: 'already_completed' };
    }

    if (job.type === 'classify') {
      const { problemId, payload } = job as any;
      try {
        const classification = await n8nClient.classifyProblem(payload);

        // attempt to allocate tokens if n8n supports it
        let tokenAllocation: any = { oneCreditsToAllocate: 0, rationale: '' };
        try {
          tokenAllocation = await n8nClient.allocateTokens({
            category: classification.category,
            severityScore: classification.severityScore,
            environmentalPriority: classification.environmentalPriority,
          });
        } catch (allocErr) {
          logger.warn('Token allocation failed after classification', allocErr);
        }

        // Update problem in DB
        const problemRef = db.collection(COLLECTIONS.PROBLEMS).doc(problemId);
        const doc = await problemRef.get();
        if (!doc.exists) throw new Error(`Problem not found: ${problemId}`);

        const problem = doc.data() as any;
        problem.category = classification.category;
        problem.severityScore = classification.severityScore;
        problem.environmentalPriority = classification.environmentalPriority;
        problem.oneCreditsAllocated = tokenAllocation.oneCreditsToAllocate || 0;
        problem.n8nAnalysisMetadata = {
          classificationRationale: classification.rationale,
          allocationRationale: tokenAllocation.rationale || '',
          confidence: classification.confidence,
        };
        problem.status = PROBLEM_STATUS.BIDDING;
        problem.updatedAt = new Date();

        await problemRef.set(problem);

        // mark job completed
        await db.collection(COLLECTIONS.N8N_JOBS).doc(jobId).update({
          status: 'completed',
          updatedAt: new Date(),
          result: { classification, tokenAllocation },
        });

        return { status: 'processed', problemId };
      } catch (err: any) {
        logger.error('Failed to process n8n job', err);
        await db.collection(COLLECTIONS.N8N_JOBS).doc(jobId).update({
          status: 'failed',
          updatedAt: new Date(),
          error: err && err.message ? err.message : String(err),
        });
        throw err;
      }
    }

    throw new Error(`Unsupported job type: ${job.type}`);
  }
}

export const n8nJobService = new N8nJobService();
