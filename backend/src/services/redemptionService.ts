import { db } from '../config/firebase';
import { RewardRedemption, Reward, RedeemRewardRequest } from '../types/redemption';
import { COLLECTIONS, REDEMPTION_STATUS } from '../config/constants';
import { generateId } from '../utils/helpers';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';
import { userService } from './userService';

export class RedemptionService {
  async listAvailableRewards(): Promise<Reward[]> {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.REWARDS)
        .where('isActive', '==', true)
        .get();

      return snapshot.docs.map((doc: any) => doc.data() as Reward);
    } catch (error) {
      logger.error('Error fetching available rewards:', error);
      throw error;
    }
  }

  async redeemReward(
    userId: string,
    rewardId: string
  ): Promise<RewardRedemption> {
    try {
      // Get reward
      const rewardDoc = await db.collection(COLLECTIONS.REWARDS).doc(rewardId).get();
      if (!rewardDoc.exists) {
        throw new NotFoundError('Reward not found');
      }

      const reward = rewardDoc.data() as Reward;

      // Get user and check credits
      const user = await userService.getUserById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (user.oneCreditsBalance < reward.creditsRequired) {
        throw new Error('Insufficient credits');
      }

      // Create redemption record
      const redemptionId = generateId('redeem');
      const redemption: RewardRedemption = {
        redemptionId,
        userId,
        type: reward.type,
        creditsSpent: reward.creditsRequired,
        rewardDetails: {
          partnerId: reward.partnerId,
          description: reward.description,
          rewardCode: generateId('code').toUpperCase(),
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        },
        status: REDEMPTION_STATUS.COMPLETED,
        createdAt: new Date(),
        completedAt: new Date(),
      };

      // Save redemption
      await db
        .collection(COLLECTIONS.REDEMPTIONS)
        .doc(redemptionId)
        .set(redemption);

      // Update user credits
      const newBalance = user.oneCreditsBalance - reward.creditsRequired;
      await userService.updateUserCredits(userId, newBalance);

      logger.info(`Reward redeemed: ${redemptionId} by user ${userId}`);
      return redemption;
    } catch (error) {
      logger.error('Error redeeming reward:', error);
      throw error;
    }
  }

  async getRedemptionHistory(userId: string): Promise<RewardRedemption[]> {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.REDEMPTIONS)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map((doc: any) => doc.data() as RewardRedemption);
    } catch (error) {
      logger.error('Error fetching redemption history:', error);
      throw error;
    }
  }

  async createReward(reward: Reward): Promise<Reward> {
    try {
      const rewardId = generateId('reward');
      const newReward: Reward = {
        ...reward,
        rewardId,
      };

      await db.collection(COLLECTIONS.REWARDS).doc(rewardId).set(newReward);
      logger.info(`Reward created: ${rewardId}`);
      return newReward;
    } catch (error) {
      logger.error('Error creating reward:', error);
      throw error;
    }
  }
}

export const redemptionService = new RedemptionService();
