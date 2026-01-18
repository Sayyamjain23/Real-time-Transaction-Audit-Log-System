import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

/**
 * Validation rules for registration
 */
export const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    body('initialBalance')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Initial balance must be a positive number'),
];

/**
 * Validation rules for login
 */
export const loginValidation = [
    body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Register a new user
 */
export const register = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }

        const { username, email, password, initialBalance = 1000 } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email
                    ? 'Email already registered'
                    : 'Username already taken',
            });
        }

        // Create new user
        const user = await User.create({
            username,
            email,
            password,
            balance: initialBalance,
        });

        // Generate token
        const token = user.generateAuthToken();

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite:'none',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Return user data (without password)
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                balance: user.balance,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message,
        });
    }
};

/**
 * Login user
 */
export const login = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }

        const { email, password } = req.body;

        // Find user (include password for comparison)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Generate token
        const token = user.generateAuthToken();

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Return user data
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                balance: user.balance,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message,
        });
    }
};

/**
 * Logout user
 */
export const logout = (req, res) => {
    res.clearCookie('token');
    res.json({
        success: true,
        message: 'Logout successful',
    });
};

/**
 * Get current user
 */
export const getCurrentUser = async (req, res) => {
    try {
        // User is already attached to req by auth middleware
        const user = await User.findById(req.user._id).select('-password');

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                balance: user.balance,
            },
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user data',
        });
    }
};

/**
 * Get all users (for testing/demo purposes)
 */
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').limit(50);

        res.json({
            success: true,
            users: users.map(user => ({
                id: user._id,
                username: user.username,
                email: user.email,
            })),
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
        });
    }
};
