import { useState, useEffect, useMemo } from 'react';
import useStore from '../store/useStore';

/**
 * AI-Generated Sortable Table Component for Transaction History
 * Features:
 * - Sortable columns (date, amount)
 * - Visual distinction for sent vs received
 * - Real-time updates
 * - Responsive design
 */
export default function TransactionHistory() {
    const { transactions, isLoadingTransactions, fetchTransactions } = useStore();

    const [sortConfig, setSortConfig] = useState({
        key: 'timestamp',
        direction: 'desc',
    });

    // Fetch transactions on mount
    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // Sort handler
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Sorted transactions using useMemo for optimization
    const sortedTransactions = useMemo(() => {
        const sorted = [...transactions];

        sorted.sort((a, b) => {
            let aValue, bValue;

            if (sortConfig.key === 'timestamp') {
                aValue = new Date(a.timestamp);
                bValue = new Date(b.timestamp);
            } else if (sortConfig.key === 'amount') {
                aValue = a.amount;
                bValue = b.amount;
            } else {
                return 0;
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        return sorted;
    }, [transactions, sortConfig]);

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    // Sort indicator component
    const SortIndicator = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) {
            return (
                <svg className="w-4 h-4 ml-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
            );
        }

        return sortConfig.direction === 'asc' ? (
            <svg className="w-4 h-4 ml-1 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
        ) : (
            <svg className="w-4 h-4 ml-1 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        );
    };

    if (isLoadingTransactions && transactions.length === 0) {
        return (
            <div className="card p-6">
                <div className="flex items-center justify-center py-12">
                    <span className="spinner mr-3"></span>
                    <span className="text-gray-400">Loading transactions...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center">
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    Transaction History
                </h2>
                <button
                    onClick={() => fetchTransactions()}
                    className="btn-secondary text-sm"
                    disabled={isLoadingTransactions}
                >
                    {isLoadingTransactions ? (
                        <span className="flex items-center">
                            <span className="spinner mr-2 !w-4 !h-4"></span>
                            Refreshing...
                        </span>
                    ) : (
                        <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </span>
                    )}
                </button>
            </div>

            {transactions.length === 0 ? (
                <div className="text-center py-12">
                    <svg
                        className="w-16 h-16 mx-auto text-gray-600 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <p className="text-gray-400 text-lg">No transactions yet</p>
                    <p className="text-gray-500 text-sm mt-2">
                        Transfer funds to see your transaction history
                    </p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th
                                    onClick={() => handleSort('timestamp')}
                                    className="text-left"
                                >
                                    <div className="flex items-center">
                                        Date & Time
                                        <SortIndicator columnKey="timestamp" />
                                    </div>
                                </th>
                                <th className="text-left">Type</th>
                                <th className="text-left">Counterparty</th>
                                <th
                                    onClick={() => handleSort('amount')}
                                    className="text-right"
                                >
                                    <div className="flex items-center justify-end">
                                        Amount
                                        <SortIndicator columnKey="amount" />
                                    </div>
                                </th>
                                <th className="text-center">Status</th>
                                <th className="text-right">Balance After</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTransactions.map((transaction) => (
                                <tr key={transaction.id} className="group">
                                    {/* Date */}
                                    <td className="text-gray-300">
                                        {formatDate(transaction.timestamp)}
                                    </td>

                                    {/* Type */}
                                    <td>
                                        {transaction.type === 'sent' ? (
                                            <span className="flex items-center text-danger-light">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                                Sent
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-success-light">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                                                </svg>
                                                Received
                                            </span>
                                        )}
                                    </td>

                                    {/* Counterparty */}
                                    <td className="text-gray-300">
                                        <div>
                                            <div className="font-semibold">
                                                {transaction.counterparty.username}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {transaction.counterparty.email}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Amount */}
                                    <td
                                        className={`text-right font-bold ${transaction.type === 'sent'
                                                ? 'text-danger-light'
                                                : 'text-success-light'
                                            }`}
                                    >
                                        {transaction.type === 'sent' ? '-' : '+'}$
                                        {transaction.amount.toFixed(2)}
                                    </td>

                                    {/* Status */}
                                    <td className="text-center">
                                        <span
                                            className={
                                                transaction.status === 'completed'
                                                    ? 'badge-success'
                                                    : 'badge-danger'
                                            }
                                        >
                                            {transaction.status}
                                        </span>
                                    </td>

                                    {/* Balance After */}
                                    <td className="text-right text-gray-300">
                                        {transaction.balanceAfter !== undefined
                                            ? `$${transaction.balanceAfter.toFixed(2)}`
                                            : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
