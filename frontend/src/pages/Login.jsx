import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, tenantSlug } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.login({ email, password, tenant: tenantSlug });
      
      // Successfully authenticated
      const { access_token, user, business } = response.data;
      login(access_token, user, business?.id);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid email or password. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white text-center mb-1">
        {tenantSlug ? 'Welcome Back' : 'Super Admin Portal'}
      </h2>
      <p className="text-xs text-dark-400 text-center mb-6">
        {tenantSlug ? (
          <>Sign in to manage workspace <span className="text-brand-400 font-semibold uppercase">{tenantSlug}</span></>
        ) : (
          'Access central registries and billing control panelling'
        )}
      </p>

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          label="Email Address"
          name="email"
          type="email"
          required
          placeholder="admin@growstro.test"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-center justify-between text-xs mt-1">
          <div></div>
          <Link 
            to={tenantSlug ? `/app/${tenantSlug}/forgot-password` : '/forgot-password'} 
            className="text-brand-400 hover:text-brand-300 transition-colors font-semibold"
          >
            Forgot Password?
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl">
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="w-full mt-2"
        >
          {tenantSlug ? 'Sign In Workspace' : 'Sign In Central Admin'}
        </Button>
      </form>

      {tenantSlug && (
        <div className="text-center mt-6 pt-4 border-t border-dark-800/40">
          <p className="text-xs text-dark-400">
            Need an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
              Register Business Admin
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
