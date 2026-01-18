import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import AuditService from '../services/auditService.js';

/**
 * Validation rules for fund transfer
 */
export const transferValidation = [
    body('receiverEmail')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid receiver email')
        .normalizeEmail(),
    body('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be at least 0.01')
        .custom((value) => {
            // Ensure only 2 decimal places
            if (!/^\d+(\.\d{1,2})?$/.test(value.toString())) {
                throw new Error('Amount can have at most 2 decimal places');
            }
            return true;
        }),
];

/**
 * Transfer funds between users with atomic transaction
 * This is the core endpoint demonstrating MongoDB transactions
 */
export const transferFunds = async (req, res) => {
    // Start a session for transaction
    const session = await mongoose.startSession();

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

        const { receiverEmail, amount } = req.body;
        const senderId = req.user._id;

        // Validate sender is not sending to themselves
        if (req.user.email === receiverEmail) {
            return res.status(400).json({
                success: false,
                message: 'Cannot transfer funds to yourself',
            });
        }

        // Start transaction
        session.startTransaction();

        // 1. Get sender and receiver with session (for transaction consistency)
        const sender = await User.findById(senderId).session(session);
        const receiver = await User.findOne({ email: receiverEmail }).session(session);

        if (!receiver) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Receiver not found',
            });
        }

        // 2. Check if sender has sufficient balance
        if (sender.balance < amount) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: `Insufficient balance. Available: $${sender.balance.toFixed(2)}`,
            });
        }

        // Store balances before transaction for audit log
        const senderBalanceBefore = sender.balance;
        const receiverBalanceBefore = receiver.balance;

        // 3. Create transaction record
        const transaction = await Transaction.create(
            [{
                senderId: sender._id,
                receiverId: receiver._id,
                amount: parseFloat(amount),
                status: 'pending',
            }],
            { session }
        );

        // 4. Perform the atomic fund transfer
        // Deduct from sender
        sender.balance -= parseFloat(amount);
        await sender.save({ session });

        // Credit to receiver
        receiver.balance += parseFloat(amount);
        await receiver.save({ session });

        // 5. Update transaction status to completed
        transaction[0].status = 'completed';
        await transaction[0].save({ session });

        // 6. Commit the transaction
        await session.commitTransaction();

        console.log(`✅ Transaction successful: ${transaction[0]._id}`);
        console.log(`   ${sender.username} -> ${receiver.username}: $${amount}`);

        // 7. Asynchronously create audit log (non-blocking)
        // This happens after the transaction is committed
        setImmediate(async () => {
            await AuditService.createAuditLog({
                transactionId: transaction[0]._id,
                senderId: sender._id,
                receiverId: receiver._id,
                amount: parseFloat(amount),
                status: 'completed',
                metadata: {
                    senderBalanceBefore,
                    senderBalanceAfter: sender.balance,
                    receiverBalanceBefore,
                    receiverBalanceAfter: receiver.balance,
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                },
            });
        });

        // 8. Return success response
        res.json({
            success: true,
            message: 'Transfer successful',
            transaction: {
                id: transaction[0]._id,
                amount: parseFloat(amount),
                receiver: {
                    username: receiver.username,
                    email: receiver.email,
                },
                newBalance: sender.balance,
                timestamp: transaction[0].createdAt,
            },
        });

    } catch (error) {
        // Rollback transaction on error
        await session.abortTransaction();

        console.error('❌ Transaction failed:', error.message);

        // Log failed transaction for audit
        if (error.transactionId) {
            setImmediate(async () => {
                await AuditService.createAuditLog({
                    transactionId: error.transactionId,
                    senderId: req.user._id,
                    receiverId: error.receiverId || null,
                    amount: parseFloat(req.body.amount),
                    status: 'failed',
                    metadata: {
                        errorMessage: error.message,
                        ipAddress: req.ip,
                        userAgent: req.get('user-agent'),
                    },
                });
            });
        }

        res.status(500).json({
            success: false,
            message: 'Transaction failed',
            error: error.message,
        });
    } finally {
        // End session
        session.endSession();
    }
};

/**
 * Get transaction history for authenticated user
 */
export const getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            limit = 50,
            skip = 0,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Fetch audit logs for the user
        const auditLogs = await AuditService.getUserAuditLogs(userId, {
            limit: parseInt(limit),
            skip: parseInt(skip),
            sortBy,
            sortOrder,
        });

        // Format response
        const formattedLogs = auditLogs.map((log) => {
            const isSender = log.senderId._id.toString() === userId.toString();

            return {
                id: log._id,
                type: isSender ? 'sent' : 'received',
                amount: log.amount,
                counterparty: isSender
                    ? { username: log.receiverId.username, email: log.receiverId.email }
                    : { username: log.senderId.username, email: log.senderId.email },
                status: log.status,
                timestamp: log.createdAt,
                balanceBefore: isSender
                    ? log.metadata?.senderBalanceBefore
                    : log.metadata?.receiverBalanceBefore,
                balanceAfter: isSender
                    ? log.metadata?.senderBalanceAfter
                    : log.metadata?.receiverBalanceAfter,
            };
        });

        res.json({
            success: true,
            count: formattedLogs.length,
            transactions: formattedLogs,
        });
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transaction history',
        });
    }
};

/**
 * Get user transaction statistics
 */
export const getTransactionStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const stats = await AuditService.getUserStats(userId);

        res.json({
            success: true,
            stats,
        });
    } catch (error) {
        console.error('Error fetching transaction stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
        });
    }
};
