import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

export default function Register() {
    const navigate = useNavigate();
    const { register, isLoading, error, clearError } = useStore();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        initialBalance: '1000',
    });

    const [validationErrors, setValidationErrors] = useState({});

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        clearError();
        setValidationErrors({});
    };

    const validateForm = () => {
        const errors = {};

        if (formData.username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
        }

        if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email';
        }

        if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        if (formData.initialBalance < 0) {
            errors.initialBalance = 'Initial balance must be positive';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const result = await register({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            initialBalance: parseFloat(formData.initialBalance),
        });

        if (result.success) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="page-container">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <h1 className="text-4xl font-bold text-gradient mb-2">
                        Create Account
                    </h1>
                    <p className="text-gray-400">
                        Join our transaction system today
                    </p>
                </div>

                {/* Register Card */}
                <div className="card-glow p-8 animate-slide-up">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="label">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className="input"
                                placeholder="johndoe"
                                autoComplete="username"
                            />
                            {validationErrors.username && (
                                <p className="error-message">{validationErrors.username}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="label">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="input"
                                placeholder="you@example.com"
                                autoComplete="email"
                            />
                            {validationErrors.email && (
                                <p className="error-message">{validationErrors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="label">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="input"
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                            {validationErrors.password && (
                                <p className="error-message">{validationErrors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="label">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="input"
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                            {validationErrors.confirmPassword && (
                                <p className="error-message">{validationErrors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Initial Balance */}
                        <div>
                            <label htmlFor="initialBalance" className="label">
                                Initial Balance ($)
                            </label>
                            <input
                                id="initialBalance"
                                name="initialBalance"
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={formData.initialBalance}
                                onChange={handleChange}
                                className="input"
                                placeholder="1000"
                            />
                            {validationErrors.initialBalance && (
                                <p className="error-message">{validationErrors.initialBalance}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Starting balance for your account
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-danger/10 border border-danger/30 rounded-lg">
                                <p className="text-danger-light text-sm">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <span className="spinner mr-2"></span>
                                    Creating account...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                            >
                                Login here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
