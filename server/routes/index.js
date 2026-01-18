import express from 'express';
import {
    register,
    login,
    logout,
    getCurrentUser,
    getAllUsers,
    registerValidation,
    loginValidation,
} from '../controllers/authController.js';
import {
    transferFunds,
    getTransactionHistory,
    getTransactionStats,
    transferValidation,
} from '../controllers/transactionController.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// ========================
// Authentication Routes
// ========================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/auth/register', registerValidation, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/auth/login', loginValidation, login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.post('/auth/logout', logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/auth/me', authenticate, getCurrentUser);

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (for demo/testing)
 * @access  Private
 */
router.get('/auth/users', authenticate, getAllUsers);

// ========================
// Transaction Routes
// ========================

/**
 * @route   POST /api/transfer
 * @desc    Transfer funds to another user
 * @access  Private
 */
router.post('/transfer', authenticate, transferValidation, transferFunds);

/**
 * @route   GET /api/transactions
 * @desc    Get transaction history for current user
 * @access  Private
 */
router.get('/transactions', authenticate, getTransactionHistory);

/**
 * @route   GET /api/transactions/stats
 * @desc    Get transaction statistics for current user
 * @access  Private
 */
router.get('/transactions/stats', authenticate, getTransactionStats);

export default router;
