import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Login = ({ onLoginSuccess, switchToSignup }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [itemCount, setItemCount] = useState(0);

  // Animated count-up for the "items tracked" stat, timed to start
  // right as the stat fades into view.
  useEffect(() => {
    const target = 12480;
    const duration = 1200;
    const startDelay = 1900;
    let rafId;

    const timer = setTimeout(() => {
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        setItemCount(Math.floor(progress * target));
        if (progress < 1) rafId = requestAnimationFrame(step);
      };
      rafId = requestAnimationFrame(step);
    }, startDelay);

    return () => {
      clearTimeout(timer);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setServerError('');
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      tempErrors.password = 'Password is required';
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
    const response = await axios.post('http://localhost:8080/api/users/login', {
      email: formData.email,
      password: formData.password,
    });

    console.log('=== FULL LOGIN RESPONSE DATA ===', response.data);

    // 1. Save JWT token separately
    const token = response.data?.token || response.data?.jwt || response.data?.accessToken;
    if (token) {
      localStorage.setItem('jwtToken', token);
    } else {
      console.warn('No token found in login response payload:', response.data);
    }

    // 2. Save Full User Object (Including role & token)
    let userDataToSave = null;

    if (response.data?.user) {
      userDataToSave = response.data.user;
    } else if (response.data?.id || response.data?.userId) {
      userDataToSave = {
        id: response.data.id || response.data.userId,
        email: response.data.email,
        name: response.data.name || response.data.username,
        role: response.data.role || response.data.roles || response.data.userType || '',
        token: token || '',
      };
    } else {
      userDataToSave = response.data;
    }

    if (userDataToSave) {
      localStorage.setItem('user', JSON.stringify(userDataToSave));
    } else {
      console.warn('Could not find user ID in the response to save to localStorage.');
    }

    if (onLoginSuccess) {
      onLoginSuccess(response.data);
    }
  } catch (err) {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      (err.request ? 'Could not reach the server. Please try again.' : 'Something went wrong. Please try again.');
    setServerError(message);
  } finally {
    setLoading(false);
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
        @keyframes walkAcross {
          0% { transform: translate(14px, 41px); }
          100% { transform: translate(196px, 41px); }
        }
        @keyframes legSwingA {
          0%, 100% { transform: rotate(22deg); }
          50% { transform: rotate(-22deg); }
        }
        @keyframes legSwingB {
          0%, 100% { transform: rotate(-22deg); }
          50% { transform: rotate(22deg); }
        }
        .walker-move {
          opacity: 0;
          animation: fadeIn 0.6s ease forwards, walkAcross 5.5s linear infinite alternate;
          animation-delay: 1.9s, 1.9s;
        }
        .walk-leg-a {
          transform-origin: 0px 1px;
          transform-box: fill-box;
          animation: legSwingA 0.55s ease-in-out infinite;
        }
        .walk-leg-b {
          transform-origin: 0px 1px;
          transform-box: fill-box;
          animation: legSwingB 0.55s ease-in-out infinite;
        }
      `}</style>

      {/* Left panel — blueprint floor-plan motif, hidden on small screens */}
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
            Blueprint your
            <br />
            stockroom.
          </h1>
          <p
            className="text-base leading-relaxed max-w-sm anim-fade"
            style={{ color: 'rgba(255, 255, 255, 0.72)', fontFamily: "'Inter', sans-serif", animationDelay: '0.25s' }}
          >
            Map every rack, aisle, and unit across your stores, and know
            exactly where things stand at a glance.
          </p>

          {/* Simple floor-plan illustration: shelving rows with a dimension line */}
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

            {/* Simple line-art figure walking the aisle between racks, pushing a small box */}
            <g className="walker-move">
              <circle cx="0" cy="-9" r="2.4" stroke="rgba(255,255,255,0.75)" strokeWidth="1.1" />
              <line x1="0" y1="-6.6" x2="0" y2="1" stroke="rgba(255,255,255,0.75)" strokeWidth="1.1" />
              <line x1="0" y1="-4.5" x2="6" y2="-2" stroke="rgba(255,255,255,0.75)" strokeWidth="1.1" />
              <rect x="5.5" y="-3.5" width="4" height="4" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
              <line x1="0" y1="1" x2="-3.2" y2="6.5" stroke="rgba(255,255,255,0.75)" strokeWidth="1.1" className="walk-leg-a" />
              <line x1="0" y1="1" x2="3.2" y2="6.5" stroke="rgba(255,255,255,0.75)" strokeWidth="1.1" className="walk-leg-b" />
            </g>
          </svg>

          {/* Live counter — starts once the panel has finished revealing */}
          <div
            className="mt-6 flex items-baseline gap-2 anim-fade"
            style={{ animationDelay: '1.9s' }}
          >
            <span
              className="text-2xl"
              style={{ color: '#FFFFFF', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}
            >
              {itemCount.toLocaleString()}
            </span>
            <span
              className="text-xs tracking-wide"
              style={{ color: 'rgba(255,255,255,0.55)', fontFamily: "'IBM Plex Mono', monospace" }}
            >
              items tracked across every store
            </span>
          </div>
        </div>

        <div
          className="text-xs tracking-wide relative z-10 anim-fade"
          style={{ color: 'rgba(255, 255, 255, 0.45)', fontFamily: "'IBM Plex Mono', monospace", animationDelay: '1.8s' }}
        >
          SHEET 01 / FLOOR — SCALE 1:100
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
              Welcome back
            </h2>
            <p className="text-sm" style={{ color: '#5C6B7A', fontFamily: "'Inter', sans-serif" }}>
              Log in to manage your stores and inventory.
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 rounded-sm text-sm font-medium disabled:opacity-50"
              style={{ color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}
            >
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p
            className="text-sm text-center mt-8"
            style={{ color: '#5C6B7A', fontFamily: "'Inter', sans-serif" }}
          >
            Don't have an account?{' '}
            <button
              onClick={switchToSignup}
              className="font-medium hover:underline"
              style={{ color: '#1D4E89' }}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
