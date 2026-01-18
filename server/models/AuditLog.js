import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
    {
        transactionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transaction',
            required: true,
            index: true,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['completed', 'failed'],
            required: true,
        },
        metadata: {
            senderBalanceBefore: Number,
            senderBalanceAfter: Number,
            receiverBalanceBefore: Number,
            receiverBalanceAfter: Number,
            errorMessage: String,
            ipAddress: String,
            userAgent: String,
        },
    },
    {
        timestamps: true,
        // Make audit logs immutable
        strict: 'throw',
    }
);

// Prevent updates to audit logs (immutability)
auditLogSchema.pre('findOneAndUpdate', function () {
    throw new Error('Audit logs are immutable and cannot be updated');
});

auditLogSchema.pre('updateOne', function () {
    throw new Error('Audit logs are immutable and cannot be updated');
});

auditLogSchema.pre('updateMany', function () {
    throw new Error('Audit logs are immutable and cannot be updated');
});

// Compound indexes for efficient queries
auditLogSchema.index({ senderId: 1, createdAt: -1 });
auditLogSchema.index({ receiverId: 1, createdAt: -1 });
auditLogSchema.index({ transactionId: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
