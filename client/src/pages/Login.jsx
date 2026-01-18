import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

export default function Login() {
    const navigate = useNavigate();
    const { login, isLoading, error, clearError } = useStore();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(formData);
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
                        Welcome Back
                    </h1>
                    <p className="text-gray-400">
                        Login to access your transaction dashboard
                    </p>
                </div>

                {/* Login Card */}
                <div className="card-glow p-8 animate-slide-up">
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                autoComplete="current-password"
                            />
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
                                    Logging in...
                                </span>
                            ) : (
                                'Login'
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                            >
                                Create one here
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Demo Credentials */}
                <div className="mt-6 card p-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <p className="text-xs text-gray-400 mb-2 font-semibold">Demo Credentials:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <div>
                            <span className="text-gray-400">Email:</span> alice@demo.com
                        </div>
                        <div>
                            <span className="text-gray-400">Email:</span> bob@demo.com
                        </div>
                        <div className="col-span-2">
                            <span className="text-gray-400">Password:</span> password123
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
