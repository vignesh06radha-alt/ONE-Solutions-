import { db } from '../config/firebase';
import { Problem, CreateProblemRequest } from '../types/problem';
import { COLLECTIONS, PROBLEM_STATUS } from '../config/constants';
import { generateId } from '../utils/helpers';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';
import { n8nClient } from '../integrations/n8n';
import { userService } from './userService';

export class ProblemService {
  async createProblem(
    userId: string,
    data: CreateProblemRequest
  ): Promise<Problem> {
    try {
      const problemId = generateId('prob');

      // Create problem with pending status
      const problem: Problem = {
        problemId,
        reportedByUserId: userId,
        description: data.description,
        photoUrl: data.photoUrl,
        location: data.location,
        category: 'other',
        severityScore: 0,
        environmentalPriority: 0,
        status: PROBLEM_STATUS.CLASSIFYING,
        oneCreditsAllocated: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to DB
      await db.collection(COLLECTIONS.PROBLEMS).doc(problemId).set(problem);

      // Call n8n for classification
      try {
        const classification = await n8nClient.classifyProblem({
          problem: data.description,
          location: `lat: ${data.location.lat}, lng: ${data.location.lng}`,
        });

        // Call n8n for token allocation
        const tokenAllocation = await n8nClient.allocateTokens({
          category: classification.category,
          severityScore: classification.severityScore,
          environmentalPriority: classification.environmentalPriority,
        });

        // Update problem with classification results
        problem.category = classification.category;
        problem.severityScore = classification.severityScore;
        problem.environmentalPriority = classification.environmentalPriority;
        problem.oneCreditsAllocated = tokenAllocation.oneCreditsToAllocate;
        problem.n8nAnalysisMetadata = {
          classificationRationale: classification.rationale,
          allocationRationale: tokenAllocation.rationale,
          confidence: classification.confidence,
        };
        problem.status = PROBLEM_STATUS.BIDDING;

        // Update in DB
        await db.collection(COLLECTIONS.PROBLEMS).doc(problemId).set(problem);

        // Update user credits
        const user = await userService.getUserById(userId);
        if (user) {
          const newBalance =
            user.oneCreditsBalance + tokenAllocation.oneCreditsToAllocate;
          await userService.updateUserCredits(userId, newBalance);
        }

        logger.info(`Problem created and classified: ${problemId}`);
      } catch (n8nError) {
        logger.error('n8n classification error:', n8nError);
        // n8n is not ready or failed. Create a job so it can be processed later
        try {
          const jobId = generateId('job');
          await db.collection(COLLECTIONS.N8N_JOBS).doc(jobId).set({
            jobId,
            type: 'classify',
            status: 'pending',
            problemId,
              // store payload with text fields expected by the webhook
              payload: {
                problem: data.description,
                location: `lat: ${data.location.lat}, lng: ${data.location.lng}`,
              },
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          // Keep problem in pending state until n8n processes the job
          problem.status = PROBLEM_STATUS.PENDING;
          await db.collection(COLLECTIONS.PROBLEMS).doc(problemId).set(problem);
          logger.info(`Queued n8n classify job: ${jobId} for problem ${problemId}`);
        } catch (jobError) {
          // If job creation itself fails, fall back to marking problem pending
          logger.error('Failed to queue n8n job:', jobError);
          problem.status = PROBLEM_STATUS.PENDING;
          await db.collection(COLLECTIONS.PROBLEMS).doc(problemId).set(problem);
        }
      }

      return problem;
    } catch (error) {
      logger.error('Error creating problem:', error);
      throw error;
    }
  }

  async getProblemById(problemId: string): Promise<Problem | null> {
    try {
      const doc = await db.collection(COLLECTIONS.PROBLEMS).doc(problemId).get();
      return doc.exists ? (doc.data() as Problem) : null;
    } catch (error) {
      logger.error('Error fetching problem:', error);
      throw error;
    }
  }

  async getUserProblems(userId: string): Promise<Problem[]> {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.PROBLEMS)
        .where('reportedByUserId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      return snapshot.docs.map((doc) => doc.data() as Problem);
    } catch (error) {
      logger.error('Error fetching user problems:', error);
      throw error;
    }
  }

  async getOpenProblems(domain?: string): Promise<Problem[]> {
    try {
      let query = db
        .collection(COLLECTIONS.PROBLEMS)
        .where('status', 'in', [PROBLEM_STATUS.BIDDING, PROBLEM_STATUS.ASSIGNED])
        .orderBy('createdAt', 'desc');

      const snapshot = await query.get();
      let problems = snapshot.docs.map((doc) => doc.data() as Problem);

      // If domain specified, filter by category/type
      if (domain) {
        problems = problems.filter((p) => {
          // You could map domain to category or filter by metadata
          return true; // Placeholder
        });
      }

      return problems;
    } catch (error) {
      logger.error('Error fetching open problems:', error);
      throw error;
    }
  }

  async updateProblemStatus(
    problemId: string,
    status: string
  ): Promise<void> {
    try {
      await db
        .collection(COLLECTIONS.PROBLEMS)
        .doc(problemId)
        .update({
          status,
          updatedAt: new Date(),
        });
      logger.info(`Updated problem status: ${problemId} -> ${status}`);
    } catch (error) {
      logger.error('Error updating problem status:', error);
      throw error;
    }
  }

  async assignContractor(
    problemId: string,
    contractorId: string,
    biddingSessionId: string
  ): Promise<void> {
    try {
      await db
        .collection(COLLECTIONS.PROBLEMS)
        .doc(problemId)
        .update({
          assignedContractorId: contractorId,
          biddingSessionId,
          status: PROBLEM_STATUS.ASSIGNED,
          updatedAt: new Date(),
        });
      logger.info(
        `Assigned contractor ${contractorId} to problem ${problemId}`
      );
    } catch (error) {
      logger.error('Error assigning contractor:', error);
      throw error;
    }
  }

  async getHeatmapData(bounds?: {
    ne: { lat: number; lng: number };
    sw: { lat: number; lng: number };
  }): Promise<any[]> {
    try {
      let query = db
        .collection(COLLECTIONS.PROBLEMS)
        .where('status', 'in', [
          PROBLEM_STATUS.BIDDING,
          PROBLEM_STATUS.ASSIGNED,
          PROBLEM_STATUS.IN_PROGRESS,
        ]);

      const snapshot = await query.get();
      let problems = snapshot.docs.map((doc) => doc.data() as Problem);

      // Filter by bounds if provided
      if (bounds) {
        problems = problems.filter((p) => {
          const lat = p.location.lat;
          const lng = p.location.lng;
          return (
            lat >= bounds.sw.lat &&
            lat <= bounds.ne.lat &&
            lng >= bounds.sw.lng &&
            lng <= bounds.ne.lng
          );
        });
      }

      // Aggregate into heatmap format
      return problems.map((p) => ({
        lat: p.location.lat,
        lng: p.location.lng,
        severity: p.severityScore,
        category: p.category,
        problemId: p.problemId,
      }));
    } catch (error) {
      logger.error('Error fetching heatmap data:', error);
      throw error;
    }
  }
}

export const problemService = new ProblemService();
