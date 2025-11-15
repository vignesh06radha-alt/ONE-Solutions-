import { db } from '../config/firebase';
import { Bid, BiddingSession, CreateBidRequest } from '../types/bidding';
import { COLLECTIONS, BIDDING_STATUS, PROBLEM_STATUS } from '../config/constants';
import { generateId } from '../utils/helpers';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';
import { n8nClient } from '../integrations/n8n';
import { problemService } from './problemService';
import { userService } from './userService';

export class BiddingService {
  async createBiddingSession(problemId: string): Promise<BiddingSession> {
    try {
      const sessionId = generateId('bid_sess');
      const session: BiddingSession = {
        biddingSessionId: sessionId,
        problemId,
        bids: [],
        status: BIDDING_STATUS.OPEN,
      };

      await db
        .collection(COLLECTIONS.BIDDING_SESSIONS)
        .doc(sessionId)
        .set(session);
      logger.info(`Bidding session created: ${sessionId}`);
      return session;
    } catch (error) {
      logger.error('Error creating bidding session:', error);
      throw error;
    }
  }

  async getBiddingSessionByProblem(problemId: string): Promise<BiddingSession | null> {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.BIDDING_SESSIONS)
        .where('problemId', '==', problemId)
        .limit(1)
        .get();
      return snapshot.empty ? null : (snapshot.docs[0].data() as BiddingSession);
    } catch (error) {
      logger.error('Error fetching bidding session:', error);
      throw error;
    }
  }

  async submitBid(
    contractorId: string,
    data: CreateBidRequest
  ): Promise<Bid> {
    try {
      // Get bidding session for this problem
      const session = await this.getBiddingSessionByProblem(data.problemId);
      if (!session) {
        throw new NotFoundError('Bidding session not found for this problem');
      }

      if (session.status !== BIDDING_STATUS.OPEN) {
        throw new Error('Bidding session is no longer open');
      }

      const bidId = generateId('bid');
      const bid: Bid = {
        bidId,
        contractorId,
        problemId: data.problemId,
        quoteAmount: data.quoteAmount,
        notes: data.notes,
        createdAt: new Date(),
      };

      // Add bid to session
      session.bids.push(bid);
      await db
        .collection(COLLECTIONS.BIDDING_SESSIONS)
        .doc(session.biddingSessionId)
        .update({
          bids: session.bids,
          updatedAt: new Date(),
        });

      // Also save individual bid for easier querying
      await db.collection(COLLECTIONS.BIDS).doc(bidId).set(bid);

      logger.info(`Bid submitted: ${bidId} by ${contractorId}`);
      return bid;
    } catch (error) {
      logger.error('Error submitting bid:', error);
      throw error;
    }
  }

  async getBidsForProblem(problemId: string): Promise<Bid[]> {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.BIDS)
        .where('problemId', '==', problemId)
        .get();
      return snapshot.docs.map((doc: any) => doc.data() as Bid);
    } catch (error) {
      logger.error('Error fetching bids:', error);
      throw error;
    }
  }

  async selectWinningBid(biddingSessionId: string): Promise<void> {
    try {
      const sessionDoc = await db
        .collection(COLLECTIONS.BIDDING_SESSIONS)
        .doc(biddingSessionId)
        .get();

      if (!sessionDoc.exists) {
        throw new NotFoundError('Bidding session not found');
      }

      const session = sessionDoc.data() as BiddingSession;

      if (session.bids.length === 0) {
        throw new Error('No bids available for selection');
      }

      // Get contractor details for scoring
      const bidsWithDetails = await Promise.all(
        session.bids.map(async (bid) => {
          const contractor = await userService.getUserById(bid.contractorId);
          const contractorData = contractor || { trustScore: 0, completedJobs: 0 };
          return {
            bidId: bid.bidId,
            contractorId: bid.contractorId,
            quoteAmount: bid.quoteAmount,
            contractorTrustScore: (contractorData as any).trustScore || 0,
            contractorCompletedJobs: (contractorData as any).completedJobs || 0,
          };
        })
      );

      // Call n8n to select best bid
      const selection = await n8nClient.selectBestBid({
        problemId: session.problemId,
        bids: bidsWithDetails,
      });

      // Update session with selection
      session.selectedBidId = selection.selectedBidId;
      session.selectedContractorId = selection.selectedContractorId;
      session.n8nRationale = selection.rationale;
      session.status = BIDDING_STATUS.AWARDED;
      session.awardedAt = new Date();

      await db
        .collection(COLLECTIONS.BIDDING_SESSIONS)
        .doc(biddingSessionId)
        .set(session);

      // Update problem with assigned contractor
      await problemService.assignContractor(
        session.problemId,
        selection.selectedContractorId,
        biddingSessionId
      );

      logger.info(
        `Bid selected: ${selection.selectedBidId} for session ${biddingSessionId}`
      );
    } catch (error) {
      logger.error('Error selecting winning bid:', error);
      throw error;
    }
  }

  async closeBiddingSession(biddingSessionId: string): Promise<void> {
    try {
      await db
        .collection(COLLECTIONS.BIDDING_SESSIONS)
        .doc(biddingSessionId)
        .update({
          status: BIDDING_STATUS.CLOSED,
          closedAt: new Date(),
        });
      logger.info(`Bidding session closed: ${biddingSessionId}`);
    } catch (error) {
      logger.error('Error closing bidding session:', error);
      throw error;
    }
  }
}

export const biddingService = new BiddingService();
