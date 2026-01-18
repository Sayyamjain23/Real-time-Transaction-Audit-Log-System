import { create } from 'zustand';
import { authAPI, transactionAPI } from '../utils/api';

/**
 * Zustand store for application state management
 * Manages authentication, user data, and transactions
 */

export const useStore = create((set, get) => ({
    // ========================
    // Auth State
    // ========================
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    // ========================
    // Transaction State
    // ========================
    transactions: [],
    stats: null,
    isLoadingTransactions: false,
    transactionError: null,

    // Users list (for transfer recipient selection)
    users: [],

    // ========================
    // Auth Actions
    // ========================

    /**
     * Initialize app - check if user is already logged in
     */
    initialize: async () => {
        try {
            set({ isLoading: true, error: null });
            const data = await authAPI.getCurrentUser();
            set({
                user: data.user,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null, // Don't show error on initial load
            });
        }
    },

    /**
     * Register new user
     */
    register: async (userData) => {
        try {
            set({ isLoading: true, error: null });
            const data = await authAPI.register(userData);
            set({
                user: data.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
            return { success: true };
        } catch (error) {
            set({
                isLoading: false,
                error: error.message,
            });
            return { success: false, error: error.message };
        }
    },

    /**
     * Login user
     */
    login: async (credentials) => {
        try {
            set({ isLoading: true, error: null });
            const data = await authAPI.login(credentials);
            set({
                user: data.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
            return { success: true };
        } catch (error) {
            set({
                isLoading: false,
                error: error.message,
            });
            return { success: false, error: error.message };
        }
    },

    /**
     * Logout user
     */
    logout: async () => {
        try {
            await authAPI.logout();
            set({
                user: null,
                isAuthenticated: false,
                transactions: [],
                stats: null,
                error: null,
            });
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local state even if API call fails
            set({
                user: null,
                isAuthenticated: false,
                transactions: [],
                stats: null,
            });
        }
    },

    /**
     * Clear error message
     */
    clearError: () => set({ error: null }),

    /**
     * Update user balance (after transaction)
     */
    updateUserBalance: (newBalance) => {
        const currentUser = get().user;
        if (currentUser) {
            set({
                user: { ...currentUser, balance: newBalance },
            });
        }
    },

    // ========================
    // Transaction Actions
    // ========================

    /**
     * Transfer funds
     */
    transferFunds: async (transferData) => {
        try {
            set({ isLoadingTransactions: true, transactionError: null });
            const data = await transactionAPI.transfer(transferData);

            // Update user balance
            get().updateUserBalance(data.transaction.newBalance);

            // Refresh transaction history
            await get().fetchTransactions();

            set({
                isLoadingTransactions: false,
                transactionError: null,
            });

            return { success: true, data: data.transaction };
        } catch (error) {
            set({
                isLoadingTransactions: false,
                transactionError: error.message,
            });
            return { success: false, error: error.message };
        }
    },

    /**
     * Fetch transaction history
     */
    fetchTransactions: async (params = {}) => {
        try {
            set({ isLoadingTransactions: true, transactionError: null });
            const data = await transactionAPI.getHistory(params);
            set({
                transactions: data.transactions,
                isLoadingTransactions: false,
            });
        } catch (error) {
            set({
                isLoadingTransactions: false,
                transactionError: error.message,
            });
        }
    },

    /**
     * Fetch transaction statistics
     */
    fetchStats: async () => {
        try {
            const data = await transactionAPI.getStats();
            set({ stats: data.stats });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    },

    /**
     * Fetch all users (for recipient selection)
     */
    fetchUsers: async () => {
        try {
            const data = await authAPI.getAllUsers();
            set({ users: data.users });
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    },

    /**
     * Clear transaction error
     */
    clearTransactionError: () => set({ transactionError: null }),
}));

export default useStore;
