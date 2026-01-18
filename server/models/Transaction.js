import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Sender ID is required'],
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Receiver ID is required'],
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0.01, 'Amount must be at least 0.01'],
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending',
        },
        errorMessage: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient queries
transactionSchema.index({ senderId: 1, createdAt: -1 });
transactionSchema.index({ receiverId: 1, createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });

// Virtual for transaction type from user perspective
transactionSchema.methods.getTypeForUser = function (userId) {
    return this.senderId.toString() === userId.toString() ? 'sent' : 'received';
};

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
