import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { SessionService } from '../services/session.service';
import { UserService } from '../services/user.service';
import { isValidEmail, isValidPhone } from '../utils/validators';
import { comparePassword } from '../utils/hash.utils';
import { config } from '../config/constants';

const sessionService = new SessionService();
const userService = new UserService();

/**
 * Registration of a new user
 * Creates a user and sets up a session
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const {
      name, email, login, phone, password,
    } = req.body;

    // Validation of required fields
    if (!name || !email || !login || !phone || !password) {
      res.status(400).json({
        message: 'All fields are required: name, email, login, phone, password',
        error: 'MISSING_FIELDS',
      });
      return;
    }

    // Email validation
    if (!isValidEmail(email)) {
      res.status(400).json({
        message: 'Invalid email format',
        error: 'INVALID_EMAIL',
      });
      return;
    }

    // Phone validation
    if (!isValidPhone(phone)) {
      res.status(400).json({
        message: 'Invalid phone format. Expected: +1234567890 (10-15 digits)',
        error: 'INVALID_PHONE',
      });
      return;
    }

    // Password length validation
    if (password.length < 6) {
      res.status(400).json({
        message: 'Password must be at least 6 characters',
        error: 'WEAK_PASSWORD',
      });
      return;
    }

    // Check uniqueness of email and login
    const existingUser = await userService.findByEmailOrLogin(email, login);
    if (existingUser) {
      if (existingUser.email === email) {
        res.status(409).json({
          message: 'User with this email already exists',
          error: 'EMAIL_EXISTS',
        });
        return;
      }
      res.status(409).json({
        message: 'User with this login already exists',
        error: 'LOGIN_EXISTS',
      });
      return;
    }

    // Create user (password is hashed in UserService)
    const newUser = await userService.createUser({
      name,
      email,
      login,
      phone,
      password,
    });

    // Create session and set cookie
    const token = await sessionService.createSession(newUser.id);
    res.cookie('sessionToken', token, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'strict',
      maxAge: config.sessionDurationMs,
    });

    res.status(201).json({
      message: 'Registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Failed to register user',
      error: 'REGISTRATION_ERROR',
    });
  }
}

/**
 * User login
 * Verifies credentials and creates a session
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { login, password } = req.body;

    // Check for credentials
    if (!login || !password) {
      res.status(400).json({
        message: 'Login and password are required',
        error: 'MISSING_CREDENTIALS',
      });
      return;
    }

    // Find user
    const user = await userService.findByLoginOrEmail(login);

    if (!user) {
      res.status(401).json({
        message: 'Invalid login or password',
        error: 'INVALID_CREDENTIALS',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        message: 'Invalid login or password',
        error: 'INVALID_CREDENTIALS',
      });
      return;
    }

    // Create session and set cookie
    const token = await sessionService.createSession(user.id);
    res.cookie('sessionToken', token, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'strict',
      maxAge: config.sessionDurationMs,
    });

    res.json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Failed to login',
      error: 'LOGIN_ERROR',
    });
  }
}

/**
 * User logout
 * Deletes session and clears cookie
 */
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const token = req.cookies?.sessionToken;

    if (token) {
      await sessionService.deleteSession(token);
      res.clearCookie('sessionToken', {
        httpOnly: true,
        sameSite: 'strict',
      });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.json({ message: 'Logged out successfully' });
  }
}

/**
 * Get current user info
 * Requires authorization
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req;

    if (!userId) {
      res.status(401).json({
        message: 'Unauthorized',
        error: 'UNAUTHORIZED',
      });
      return;
    }

    const user = await userService.getUserById(userId);

    if (!user) {
      res.status(404).json({
        message: 'User not found',
        error: 'USER_NOT_FOUND',
      });
      return;
    }

    // Return user data without password
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      login: user.login,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      message: 'Failed to get user info',
      error: 'GET_USER_ERROR',
    });
  }
}
