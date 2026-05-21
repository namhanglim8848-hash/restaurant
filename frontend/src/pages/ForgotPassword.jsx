import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { tenantSlug } = useAuth();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authApi.forgotPassword({ email });
      setSuccess(response.message || 'A recovery link has been simulated & dispatched to your email address!');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to dispatch recovery request. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white text-center mb-1">
        Reset Password
      </h2>
      <p className="text-xs text-dark-400 text-center mb-6">
        {tenantSlug ? (
          <>Recover access to <span className="text-brand-400 font-semibold uppercase">{tenantSlug}</span> staff profile</>
        ) : (
          'Recover central platform administrator password'
        )}
      </p>

      {success ? (
        <div className="space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-4 rounded-xl">
            <h4 className="font-bold text-sm mb-1">Recovery Dispatched!</h4>
            <p className="mb-2">{success}</p>
            <p className="text-[10px] text-dark-400">
              Note: Under local environments, SMS & SMTP mail dispatching is configured to mock execution.
            </p>
          </div>
          <Link to={tenantSlug ? `/app/${tenantSlug}/login` : '/login'}>
            <Button variant="secondary" className="w-full">
              Back to Login
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <Input
            label="Registered Email Address"
            name="email"
            type="email"
            required
            placeholder="admin@growstro.test"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

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
            Send Reset Link
          </Button>
          
          <div className="text-center mt-4">
            <Link 
              to={tenantSlug ? `/app/${tenantSlug}/login` : '/login'} 
              className="text-xs text-dark-400 hover:text-white transition-colors"
            >
              Cancel and go back
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
