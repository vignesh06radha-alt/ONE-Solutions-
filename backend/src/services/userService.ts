import { db, auth } from '../config/firebase';
import { User, CompanyProfile, ContractorProfile } from '../types/user';
import { COLLECTIONS, ROLES } from '../config/constants';
import { generateId } from '../utils/helpers';
import { NotFoundError, ConflictError } from '../utils/errors';
import { logger } from '../utils/logger';

export class UserService {
  async createUser(
    email: string,
    password: string,
    displayName: string,
    role: string
  ): Promise<User> {
    try {
      // Create Firebase Auth user
      const authUser = await auth.createUser({
        email,
        password,
        displayName,
      });

      const userId = authUser.uid;

      // Create Firestore user document
      const user: User = {
        userId,
        email,
        passwordHash: '', // Firebase handles password
        role: role as 'public' | 'company' | 'contractor',
        displayName,
        oneCreditsBalance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isVerified: false,
      };

      await db.collection(COLLECTIONS.USERS).doc(userId).set(user);

      // Initialize One Credits
      await db.collection(COLLECTIONS.ONE_CREDITS).doc(userId).set({
        userId,
        balance: 0,
        totalEarned: 0,
        totalRedeemed: 0,
        updatedAt: new Date(),
      });

      logger.info(`User created: ${userId}`);
      return user;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const doc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
      return doc.exists ? (doc.data() as User) : null;
    } catch (error) {
      logger.error('Error fetching user:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.USERS)
        .where('email', '==', email)
        .limit(1)
        .get();
      return snapshot.empty ? null : (snapshot.docs[0].data() as User);
    } catch (error) {
      logger.error('Error fetching user by email:', error);
      throw error;
    }
  }

  async updateUserCredits(userId: string, amount: number): Promise<void> {
    try {
      const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
      await userRef.update({
        oneCreditsBalance: amount,
        updatedAt: new Date(),
      });

      // Also update One Credits collection
      const oneCreditsRef = db.collection(COLLECTIONS.ONE_CREDITS).doc(userId);
      const oneCreditsDoc = await oneCreditsRef.get();
      if (oneCreditsDoc.exists) {
        const current = oneCreditsDoc.data() || {};
        await oneCreditsRef.update({
          balance: amount,
          updatedAt: new Date(),
        });
      }

      logger.info(`Updated credits for user ${userId}: ${amount}`);
    } catch (error) {
      logger.error('Error updating user credits:', error);
      throw error;
    }
  }

  async registerContractor(
    userId: string,
    domain: string,
    serviceAreas: string[]
  ): Promise<ContractorProfile> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      const contractor: ContractorProfile = {
        ...user,
        domain,
        trustScore: 50,
        completedJobs: 0,
        averageRating: 0,
        serviceAreas,
      };

      await db.collection(COLLECTIONS.USERS).doc(userId).set(contractor);
      logger.info(`Contractor registered: ${userId} - ${domain}`);
      return contractor;
    } catch (error) {
      logger.error('Error registering contractor:', error);
      throw error;
    }
  }

  async registerCompany(
    userId: string,
    companyName: string,
    registrationNumber: string
  ): Promise<CompanyProfile> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      const company: CompanyProfile = {
        ...user,
        companyName,
        registrationNumber,
        greenCreditsBalance: 0,
        greenCreditSpent: 0,
        impactScore: 0,
      };

      await db.collection(COLLECTIONS.USERS).doc(userId).set(company);
      logger.info(`Company registered: ${userId} - ${companyName}`);
      return company;
    } catch (error) {
      logger.error('Error registering company:', error);
      throw error;
    }
  }

  async getContractorsByDomain(domain: string): Promise<ContractorProfile[]> {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.USERS)
        .where('domain', '==', domain)
        .where('role', '==', ROLES.CONTRACTOR)
        .get();
      return snapshot.docs.map((doc: any) => doc.data() as ContractorProfile);
    } catch (error) {
      logger.error('Error fetching contractors by domain:', error);
      throw error;
    }
  }

  async updateContractorTrustScore(userId: string, score: number): Promise<void> {
    try {
      await db
        .collection(COLLECTIONS.USERS)
        .doc(userId)
        .update({
          trustScore: Math.min(100, Math.max(0, score)),
          updatedAt: new Date(),
        });
      logger.info(`Updated contractor trust score for ${userId}: ${score}`);
    } catch (error) {
      logger.error('Error updating contractor trust score:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
