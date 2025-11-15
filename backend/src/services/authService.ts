import * as jwt from 'jsonwebtoken';
import { auth } from '../config/firebase';
import { environment } from '../config/environment';
import { User, JwtPayload } from '../types/user';
import { UnauthorizedError } from '../utils/errors';
import { logger } from '../utils/logger';
import { userService } from './userService';
import { sanitizeEmail, isValidEmail } from '../utils/helpers';
import { validateEmail, validatePassword } from '../utils/validators';

export class AuthService {
  async register(
    email: string,
    password: string,
    displayName: string,
    role: string
  ): Promise<{
    user: User;
    token: string;
  }> {
    try {
      // Validate inputs
      validateEmail(email);
      validatePassword(password);

      const cleanEmail = sanitizeEmail(email);

      // Check if user already exists
      const existing = await userService.getUserByEmail(cleanEmail);
      if (existing) {
        throw new Error('User already exists');
      }

      // Create user
      const user = await userService.createUser(
        cleanEmail,
        password,
        displayName,
        role
      );

      // Generate token
      const token = this.generateToken(user);

      logger.info(`User registered: ${user.userId} - ${role}`);
      return { user, token };
    } catch (error) {
      logger.error('Error during registration:', error);
      throw error;
    }
  }

  async login(
    email: string,
    password: string
  ): Promise<{
    user: User;
    token: string;
  }> {
    try {
      const cleanEmail = sanitizeEmail(email);

      // Get Firebase user
      const firebaseUser = await auth.getUserByEmail(cleanEmail).catch(() => null);
      if (!firebaseUser) {
        throw new UnauthorizedError('Invalid email or password');
      }

      // Get user from Firestore
      const user = await userService.getUserById(firebaseUser.uid);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      // Generate token
      const token = this.generateToken(user);

      logger.info(`User logged in: ${user.userId}`);
      return { user, token };
    } catch (error) {
      logger.error('Error during login:', error);
      throw error;
    }
  }

  async refreshToken(userId: string): Promise<string> {
    try {
      const user = await userService.getUserById(userId);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      return this.generateToken(user);
    } catch (error) {
      logger.error('Error refreshing token:', error);
      throw error;
    }
  }

  generateToken(user: User): string {
    const payload: JwtPayload = {
      userId: user.userId,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    };

    return jwt.sign(payload, environment.JWT_SECRET);
  }

  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, environment.JWT_SECRET) as JwtPayload;
    } catch (error) {
      throw new UnauthorizedError('Invalid token');
    }
  }
}

export const authService = new AuthService();
