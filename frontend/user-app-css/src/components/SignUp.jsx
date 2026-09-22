import React, { useState } from 'react';
import axios from 'axios';

const Signup = ({ onSignupSuccess, switchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'ROLE_CUSTOMER', // Default role matching Spring Security format
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    { label: 'Customer', value: 'ROLE_CUSTOMER' },
    { label: 'Manager', value: 'ROLE_MANAGER' },
    { label: 'Admin', value: 'ROLE_ADMIN' },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setServerError('');
  };

  const handleRoleSelect = (roleValue) => {
    setFormData({ ...formData, role: roleValue });
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = 'Full Name is required';
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError('');

    try {
      // Sends name, email, password, and role to Spring Boot /api/users/register
      const response = await axios.post('http://localhost:8080/api/users/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      setLoading(false);
      if (onSignupSuccess) {
        onSignupSuccess(response.data);
      }
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'object') {
          setErrors(err.response.data);
        } else {
          setServerError(
            typeof err.response.data === 'string'
              ? err.response.data
              : err.response.data.message || 'Registration failed.'
          );
        }
      } else {
        setServerError('Cannot reach backend server. Please check connection.');
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex" style={{ backgroundColor: '#FFFFFF' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');

        .reg-mark {
          position: absolute;
          width: 18px;
          height: 18px;
        }
        .reg-mark::before,
        .reg-mark::after {
          content: '';
          position: absolute;
          background: rgba(255, 255, 255, 0.55);
        }
        .reg-mark::before {
          left: 50%;
          top: 0;
          width: 1px;
          height: 100%;
          transform: translateX(-50%);
        }
        .reg-mark::after {
          top: 50%;
          left: 0;
          height: 1px;
          width: 100%;
          transform: translateY(-50%);
        }
        .field-input {
          background-color: #FFFFFF;
          border: 1.5px solid #D3DEEA;
          transition: border-color 120ms ease, box-shadow 120ms ease;
        }
        .field-input:focus {
          outline: none;
          border-color: #1D4E89;
          box-shadow: 0 0 0 3px rgba(29, 78, 137, 0.14);
        }
        .field-input.has-error {
          border-color: #B3261E;
        }
        .field-input.has-error:focus {
          box-shadow: 0 0 0 3px rgba(179, 38, 30, 0.14);
        }
        .btn-primary {
          background-color: #1D4E89;
          transition: background-color 120ms ease, transform 120ms ease;
        }
        .btn-primary:hover:not(:disabled) {
          background-color: #163D6D;
        }
        .btn-primary:active:not(:disabled) {
          transform: translateY(1px);
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes drawLine {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .anim-fade {
          opacity: 0;
          animation: fadeUp 0.7s ease forwards;
        }
        .anim-draw {
          stroke-dasharray: 500;
          stroke-dashoffset: 500;
          animation: drawLine 1.1s ease forwards;
        }
        .anim-fade-svg {
          opacity: 0;
          animation: fadeIn 0.8s ease forwards;
        }
      `}</style>

      {/* Left panel — blueprint floor-plan motif */}
      <div
        className="hidden md:flex md:w-5/12 lg:w-1/2 relative flex-col justify-between p-12 lg:p-16 overflow-hidden"
        style={{ backgroundColor: '#1D4E89' }}
      >
        <div className="reg-mark" style={{ top: '24px', left: '24px' }} />
        <div className="reg-mark" style={{ bottom: '24px', right: '24px' }} />

        <div className="flex items-center gap-2 anim-fade" style={{ animationDelay: '0.05s' }}>
          <div
            className="w-8 h-8 flex items-center justify-center rounded-sm border"
            style={{ borderColor: 'rgba(255,255,255,0.4)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 3L21 7.5V16.5L12 21L3 16.5V7.5L12 3Z"
                stroke="#FFFFFF"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path d="M3 7.5L12 12L21 7.5" stroke="#FFFFFF" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M12 12V21" stroke="#FFFFFF" strokeWidth="1.4" />
            </svg>
          </div>
          <span
            className="text-sm tracking-wide"
            style={{ color: '#FFFFFF', fontFamily: "'IBM Plex Mono', monospace" }}
          >
            stockline
          </span>
        </div>

        <div className="relative z-10">
          <h1
            className="text-4xl lg:text-5xl leading-tight mb-6 anim-fade"
            style={{ color: '#FFFFFF', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, animationDelay: '0.15s' }}
          >
            Start your
            <br />
            first count.
          </h1>
          <p
            className="text-base leading-relaxed max-w-sm anim-fade"
            style={{ color: 'rgba(255, 255, 255, 0.72)', fontFamily: "'Inter', sans-serif", animationDelay: '0.25s' }}
          >
            Set up an account and bring every store, shelf, and unit into
            one running ledger — no more guessing what's on hand.
          </p>

          <svg
            className="mt-10 w-full max-w-sm"
            viewBox="0 0 320 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {[0, 1, 2].map((row) => (
              <rect
                key={row}
                x="10"
                y={10 + row * 40}
                width="220"
                height="22"
                rx="1"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="1.2"
                className="anim-draw"
                style={{ animationDelay: `${0.5 + row * 0.35}s` }}
              />
            ))}
            <g className="anim-fade-svg" style={{ animationDelay: '1.6s' }}>
              <line x1="10" y1="134" x2="230" y2="134" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
              <line x1="10" y1="130" x2="10" y2="138" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
              <line x1="230" y1="130" x2="230" y2="138" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
              <text
                x="120"
                y="128"
                textAnchor="middle"
                fontSize="9"
                fill="rgba(255,255,255,0.55)"
                fontFamily="'IBM Plex Mono', monospace"
              >
                AISLE 03 — 24 FT
              </text>
              <text
                x="255"
                y="26"
                fontSize="9"
                fill="rgba(255,255,255,0.5)"
                fontFamily="'IBM Plex Mono', monospace"
              >
                RACK
              </text>
              <text
                x="255"
                y="66"
                fontSize="9"
                fill="rgba(255,255,255,0.5)"
                fontFamily="'IBM Plex Mono', monospace"
              >
                RACK
              </text>
              <text
                x="255"
                y="106"
                fontSize="9"
                fill="rgba(255,255,255,0.5)"
                fontFamily="'IBM Plex Mono', monospace"
              >
                RACK
              </text>
            </g>
          </svg>
        </div>

        <div
          className="text-xs tracking-wide relative z-10 anim-fade"
          style={{ color: 'rgba(255, 255, 255, 0.45)', fontFamily: "'IBM Plex Mono', monospace", animationDelay: '1.8s' }}
        >
          SHEET 00 / NEW ACCOUNT
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm anim-fade" style={{ animationDelay: '0.2s' }}>
          <div className="mb-8">
            <h2
              className="text-2xl mb-2"
              style={{ color: '#0F2F52', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}
            >
              Create an account
            </h2>
            <p className="text-sm" style={{ color: '#5C6B7A', fontFamily: "'Inter', sans-serif" }}>
              Get started with your inventory management system.
            </p>
          </div>

          {serverError && (
            <div
              className="mb-5 px-4 py-3 rounded-sm text-sm"
              style={{
                backgroundColor: '#FBEAE9',
                color: '#B3261E',
                border: '1px solid #EFC7C4',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Account Type Toggle */}
            <div>
              <label
                className="block text-xs mb-1.5"
                style={{ color: '#5C6B7A', fontFamily: "'IBM Plex Mono', monospace" }}
              >
                Account type
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-sm" style={{ backgroundColor: '#F0F4F8', border: '1px solid #D3DEEA' }}>
                {roles.map((item) => {
                  const isSelected = formData.role === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleRoleSelect(item.value)}
                      className="py-1.5 text-xs font-medium rounded-sm transition-all duration-150"
                      style={{
                        backgroundColor: isSelected ? '#1D4E89' : 'transparent',
                        color: isSelected ? '#FFFFFF' : '#5C6B7A',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-xs mb-1.5"
                style={{ color: '#5C6B7A', fontFamily: "'IBM Plex Mono', monospace" }}
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={`field-input w-full px-3.5 py-2.5 text-sm rounded-sm ${
                  errors.name ? 'has-error' : ''
                }`}
                style={{ color: '#0F2F52', fontFamily: "'Inter', sans-serif" }}
              />
              {errors.name && (
                <p className="text-xs mt-1.5" style={{ color: '#B3261E', fontFamily: "'Inter', sans-serif" }}>
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs mb-1.5"
                style={{ color: '#5C6B7A', fontFamily: "'IBM Plex Mono', monospace" }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={`field-input w-full px-3.5 py-2.5 text-sm rounded-sm ${
                  errors.email ? 'has-error' : ''
                }`}
                style={{ color: '#0F2F52', fontFamily: "'Inter', sans-serif" }}
              />
              {errors.email && (
                <p className="text-xs mt-1.5" style={{ color: '#B3261E', fontFamily: "'Inter', sans-serif" }}>
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs mb-1.5"
                style={{ color: '#5C6B7A', fontFamily: "'IBM Plex Mono', monospace" }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`field-input w-full px-3.5 py-2.5 text-sm rounded-sm ${
                  errors.password ? 'has-error' : ''
                }`}
                style={{ color: '#0F2F52', fontFamily: "'Inter', sans-serif" }}
              />
              {errors.password && (
                <p className="text-xs mt-1.5" style={{ color: '#B3261E', fontFamily: "'Inter', sans-serif" }}>
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs mb-1.5"
                style={{ color: '#5C6B7A', fontFamily: "'IBM Plex Mono', monospace" }}
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`field-input w-full px-3.5 py-2.5 text-sm rounded-sm ${
                  errors.confirmPassword ? 'has-error' : ''
                }`}
                style={{ color: '#0F2F52', fontFamily: "'Inter', sans-serif" }}
              />
              {errors.confirmPassword && (
                <p className="text-xs mt-1.5" style={{ color: '#B3261E', fontFamily: "'Inter', sans-serif" }}>
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 rounded-sm text-sm font-medium disabled:opacity-50"
              style={{ color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}
            >
              {loading ? 'Creating account…' : 'Sign up'}
            </button>
          </form>

          <p
            className="text-sm text-center mt-8"
            style={{ color: '#5C6B7A', fontFamily: "'Inter', sans-serif" }}
          >
            Already have an account?{' '}
            <button
              onClick={switchToLogin}
              className="font-medium hover:underline"
              style={{ color: '#1D4E89' }}
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;