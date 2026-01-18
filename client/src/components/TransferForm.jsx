import { useState, useEffect } from 'react';
import useStore from '../store/useStore';

export default function TransferForm({ onSuccess }) {
    const {
        user,
        transferFunds,
        isLoadingTransactions,
        transactionError,
        clearTransactionError,
        users,
        fetchUsers,
    } = useStore();

    const [formData, setFormData] = useState({
        receiverEmail: '',
        amount: '',
    });

    const [validationError, setValidationError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch users on component mount
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setValidationError('');
        clearTransactionError();
        setSuccessMessage('');
    };

    const validateForm = () => {
        if (!formData.receiverEmail) {
            setValidationError('Please enter receiver email');
            return false;
        }

        if (formData.receiverEmail === user.email) {
            setValidationError('Cannot transfer to yourself');
            return false;
        }

        const amount = parseFloat(formData.amount);
        if (!amount || amount <= 0) {
            setValidationError('Amount must be greater than zero');
            return false;
        }

        if (amount > user.balance) {
            setValidationError(`Insufficient balance. Available: $${user.balance.toFixed(2)}`);
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const result = await transferFunds({
            receiverEmail: formData.receiverEmail,
            amount: parseFloat(formData.amount),
        });

        if (result.success) {
            setSuccessMessage(
                `Successfully transferred $${parseFloat(formData.amount).toFixed(2)} to ${result.data.receiver.username
                }`
            );

            // Reset form
            setFormData({
                receiverEmail: '',
                amount: '',
            });

            // Call onSuccess callback
            if (onSuccess) {
                onSuccess(result.data);
            }

            // Clear success message after 5 seconds
            setTimeout(() => setSuccessMessage(''), 5000);
        }
    };

    return (
        <div className="card p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
                <svg
                    className="w-6 h-6 mr-2 text-primary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                Transfer Funds
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Receiver Email */}
                <div>
                    <label htmlFor="receiverEmail" className="label">
                        Receiver Email
                    </label>
                    <input
                        id="receiverEmail"
                        name="receiverEmail"
                        type="email"
                        required
                        value={formData.receiverEmail}
                        onChange={handleChange}
                        className="input"
                        placeholder="receiver@example.com"
                        list="users-list"
                    />
                    {/* Datalist for autocomplete */}
                    <datalist id="users-list">
                        {users
                            .filter((u) => u.email !== user.email)
                            .map((u) => (
                                <option key={u.id} value={u.email}>
                                    {u.username}
                                </option>
                            ))}
                    </datalist>
                </div>

                {/* Amount */}
                <div>
                    <label htmlFor="amount" className="label">
                        Amount ($)
                    </label>
                    <input
                        id="amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={formData.amount}
                        onChange={handleChange}
                        className="input"
                        placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Available balance: ${user?.balance.toFixed(2)}
                    </p>
                </div>

                {/* Validation Error */}
                {validationError && (
                    <div className="p-4 bg-danger/10 border border-danger/30 rounded-lg">
                        <p className="text-danger-light text-sm">{validationError}</p>
                    </div>
                )}

                {/* Transaction Error */}
                {transactionError && (
                    <div className="p-4 bg-danger/10 border border-danger/30 rounded-lg">
                        <p className="text-danger-light text-sm">{transactionError}</p>
                    </div>
                )}

                {/* Success Message */}
                {successMessage && (
                    <div className="p-4 bg-success/10 border border-success/30 rounded-lg animate-fade-in">
                        <p className="text-success-light text-sm flex items-center">
                            <svg
                                className="w-5 h-5 mr-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            {successMessage}
                        </p>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoadingTransactions}
                    className="btn-primary w-full"
                >
                    {isLoadingTransactions ? (
                        <span className="flex items-center justify-center">
                            <span className="spinner mr-2"></span>
                            Processing...
                        </span>
                    ) : (
                        'Transfer Now'
                    )}
                </button>
            </form>
        </div>
    );
}
