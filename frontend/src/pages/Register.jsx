import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';

export default function Register() {
  const [formData, setFormData] = useState({
    business_name: '',
    owner_name: '',
    phone: '',
    email: '',
    password: '',
    password_confirmation: '',
    address: '',
    business_type: 'restaurant',
    pan_or_vat_number: '',
    is_vat_registered: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError('');

    if (formData.password !== formData.password_confirmation) {
      setErrors({ password_confirmation: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      // Connect to unified real business self-registration endpoint!
      const response = await authApi.register(formData);
      const { access_token, user, business } = response.data;
      
      showToast('Business Registered Successfully! Redirecting...', 'success');
      
      // Save tenant domain to help local staging checks
      const tenantDomain = business.domain || `${business.id}.localhost`;
      showToast(`Welcome! Please navigate to: ${tenantDomain} to log in.`, 'info', 6000);
      
      // Establish login context
      login(access_token, user, business.id);
    } catch (err) {
      console.error(err);
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setGeneralError(err.message || 'An error occurred during registration. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white text-center mb-1">Register Your Business</h2>
      <p className="text-xs text-dark-400 text-center mb-6">Launch your restaurant or cafe with isolated PostgreSQL databases</p>

      <form onSubmit={handleRegister} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        <Input
          label="Business Name"
          name="business_name"
          required
          placeholder="e.g. Annapurna Bakery"
          value={formData.business_name}
          onChange={handleChange}
          error={errors.business_name?.[0]}
        />

        <Input
          label="Owner/Admin Full Name"
          name="owner_name"
          required
          placeholder="e.g. Ram Bahadur"
          value={formData.owner_name}
          onChange={handleChange}
          error={errors.owner_name?.[0]}
        />

        <Input
          label="Phone Number"
          name="phone"
          required
          placeholder="e.g. +977-98XXXXXXXX"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone?.[0]}
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          required
          placeholder="e.g. info@annapurna.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email?.[0]}
        />

        <Input
          label="Physical Address"
          name="address"
          required
          placeholder="e.g. New Road, Kathmandu"
          value={formData.address}
          onChange={handleChange}
          error={errors.address?.[0]}
        />

        <Select
          label="Business Type"
          name="business_type"
          required
          value={formData.business_type}
          onChange={handleChange}
          error={errors.business_type?.[0]}
          options={[
            { label: 'Restaurant', value: 'restaurant' },
            { label: 'Cafe', value: 'cafe' },
            { label: 'Retail Store', value: 'retail' },
            { label: 'Service Venue', value: 'service' },
            { label: 'Other', value: 'other' },
          ]}
        />

        <Input
          label="PAN or VAT Number (Optional)"
          name="pan_or_vat_number"
          placeholder="e.g. 601234567"
          value={formData.pan_or_vat_number}
          onChange={handleChange}
          error={errors.pan_or_vat_number?.[0]}
        />

        <div className="flex items-center gap-2 py-2">
          <input
            id="is_vat_registered"
            name="is_vat_registered"
            type="checkbox"
            checked={formData.is_vat_registered}
            onChange={handleChange}
            className="rounded border-dark-800 bg-dark-950 text-brand-500 focus:ring-brand-500"
          />
          <label htmlFor="is_vat_registered" className="text-xs text-dark-300 font-semibold">
            This business is VAT registered (13% VAT standard rule)
          </label>
        </div>

        <Input
          label="Password"
          name="password"
          type="password"
          required
          placeholder="Min 8 characters"
          value={formData.password}
          onChange={handleChange}
          error={errors.password?.[0]}
        />

        <Input
          label="Confirm Password"
          name="password_confirmation"
          type="password"
          required
          placeholder="Retype password"
          value={formData.password_confirmation}
          onChange={handleChange}
          error={errors.password_confirmation}
        />

        {generalError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl">
            {generalError}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="w-full mt-2"
        >
          Create Business & Workspace
        </Button>
      </form>

      <div className="text-center mt-6 pt-4 border-t border-dark-800/40">
        <p className="text-xs text-dark-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
            Login Admin
          </Link>
        </p>
      </div>
    </div>
  );
}
