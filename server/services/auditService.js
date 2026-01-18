import AuditLog from '../models/AuditLog.js';

/**
 * Asynchronous audit logging service
 * Logs transaction details without blocking the main transaction flow
 */
class AuditService {
    /**
     * Create an audit log entry
     * @param {Object} data - Audit log data
     * @returns {Promise<Object>} Created audit log
     */
    static async createAuditLog(data) {
        try {
            const {
                transactionId,
                senderId,
                receiverId,
                amount,
                status,
                metadata = {},
            } = data;

            const auditLog = await AuditLog.create({
                transactionId,
                senderId,
                receiverId,
                amount,
                status,
                metadata,
            });

            console.log(`✅ Audit log created: ${auditLog._id}`);
            return auditLog;
        } catch (error) {
            // Log error but don't throw - audit log failures shouldn't affect transactions
            console.error('❌ Audit log creation failed:', error.message);
            console.error('Audit data:', data);

            // In production, you might want to:
            // 1. Send alerts to monitoring service
            // 2. Write to backup log file
            // 3. Queue for retry

            return null;
        }
    }

    /**
     * Get audit logs for a specific user
     * @param {String} userId - User ID
     * @param {Object} options - Query options (limit, skip, sort)
     * @returns {Promise<Array>} Audit logs
     */
    static async getUserAuditLogs(userId, options = {}) {
        try {
            const {
                limit = 50,
                skip = 0,
                sortBy = 'createdAt',
                sortOrder = 'desc',
            } = options;

            const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

            const auditLogs = await AuditLog.find({
                $or: [{ senderId: userId }, { receiverId: userId }],
            })
                .populate('senderId', 'username email')
                .populate('receiverId', 'username email')
                .sort(sortOptions)
                .limit(limit)
                .skip(skip)
                .lean();

            return auditLogs;
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            throw error;
        }
    }

    /**
     * Get audit log by transaction ID
     * @param {String} transactionId - Transaction ID
     * @returns {Promise<Object>} Audit log
     */
    static async getAuditLogByTransaction(transactionId) {
        try {
            const auditLog = await AuditLog.findOne({ transactionId })
                .populate('senderId', 'username email')
                .populate('receiverId', 'username email')
                .lean();

            return auditLog;
        } catch (error) {
            console.error('Error fetching audit log:', error);
            throw error;
        }
    }

    /**
     * Get audit log statistics for a user
     * @param {String} userId - User ID
     * @returns {Promise<Object>} Statistics
     */
    static async getUserStats(userId) {
        try {
            const stats = await AuditLog.aggregate([
                {
                    $match: {
                        $or: [
                            { senderId: userId },
                            { receiverId: userId }
                        ],
                        status: 'completed',
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalSent: {
                            $sum: {
                                $cond: [{ $eq: ['$senderId', userId] }, '$amount', 0],
                            },
                        },
                        totalReceived: {
                            $sum: {
                                $cond: [{ $eq: ['$receiverId', userId] }, '$amount', 0],
                            },
                        },
                        totalTransactions: { $sum: 1 },
                    },
                },
            ]);

            return stats[0] || { totalSent: 0, totalReceived: 0, totalTransactions: 0 };
        } catch (error) {
            console.error('Error fetching user stats:', error);
            throw error;
        }
    }
}

export default AuditService;
