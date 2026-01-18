import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import TransferForm from '../components/TransferForm';
import TransactionHistory from '../components/TransactionHistory';

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, logout, fetchTransactions, fetchStats, stats } = useStore();

    useEffect(() => {
        if (user) {
            fetchTransactions();
            fetchStats();
        }
    }, [user, fetchTransactions, fetchStats]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleTransferSuccess = () => {
        // Transactions are automatically refreshed in the store
        // This is just for additional UI feedback if needed
        fetchStats();
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50 sticky top-0 z-10">
                <div className="dashboard-container">
                    <div className="flex items-center justify-between py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gradient">
                                Transaction Dashboard
                            </h1>
                            <p className="text-gray-400 text-sm mt-1">
                                Welcome back, <span className="font-semibold">{user?.username}</span>
                            </p>
                        </div>
                        <button onClick={handleLogout} className="btn-secondary">
                            <svg
                                className="w-4 h-4 mr-2 inline"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="dashboard-container">
                {/* Balance Card */}
                <div className="card-glow p-8 mb-8 animate-fade-in bg-gradient-to-br from-primary-900/20 to-primary-800/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm mb-2">Current Balance</p>
                            <h2 className="text-5xl font-bold text-gradient">
                                ${user?.balance.toFixed(2)}
                            </h2>
                        </div>
                        <div className="text-right">
                            <svg
                                className="w-20 h-20 text-primary-500/20"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Stats */}
                    {stats && (
                        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700/50">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Total Sent</p>
                                <p className="text-xl font-semibold text-danger-light">
                                    ${stats.totalSent?.toFixed(2) || '0.00'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Total Received</p>
                                <p className="text-xl font-semibold text-success-light">
                                    ${stats.totalReceived?.toFixed(2) || '0.00'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Total Transactions</p>
                                <p className="text-xl font-semibold text-primary-400">
                                    {stats.totalTransactions || 0}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Transfer Form and History */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Transfer Form */}
                    <div className="lg:col-span-1 animate-slide-up">
                        <TransferForm onSuccess={handleTransferSuccess} />
                    </div>

                    {/* Transaction History */}
                    <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <TransactionHistory />
                    </div>
                </div>
            </main>
        </div>
    );
}
