import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  // Add CSS animation keyframes and reset styles
  useEffect(() => {
    if (!document.getElementById('speedthreads-gradient-animation')) {
      const style = document.createElement('style');
      style.id = 'speedthreads-gradient-animation';
      style.textContent = `
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        * {
          box-sizing: border-box;
        }
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          background: #0f0f0f;
          overflow: hidden;
        }
        #root {
          height: 100vh;
          width: 100vw;
          background: #0f0f0f;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback'
        }
      });

      if (error) {
        setError(error.message);
        console.error('Google login error:', error);
      } else {
        console.log('Google login initiated:', data);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Google login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let data, error;
      
      if (isSignUp) {
        // Sign up
        const result = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password
        });
        data = result.data;
        error = result.error;
      } else {
        // Sign in
        const result = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        data = result.data;
        error = result.error;
      }

      if (error) {
        setError(error.message);
        console.error(`${isSignUp ? 'Sign up' : 'Login'} error:`, error);
      } else if (data.user && data.session) {
        console.log('User:', data.user);
        console.log('JWT Token:', data.session.access_token);
        
        // Save token to localStorage
        localStorage.setItem("speedthreads_token", data.session.access_token);
        
        // Notify extension if running in extension context
        if (window.chrome && window.chrome.runtime) {
          try {
            chrome.runtime.sendMessage({
              type: 'AUTH_SUCCESS',
              token: data.session.access_token,
              user: data.user
            });
          } catch (error) {
            console.log('Not running in extension context, skipping extension notification');
          }
        }
        
        // Clear form
        setFormData({ email: '', password: '' });
        
        alert(`${isSignUp ? 'Sign up' : 'Login'} successful! Check console for user data and JWT token.`);
      } else if (isSignUp && data.user && !data.session) {
        // Sign up successful but needs email confirmation
        alert('Sign up successful! Please check your email to confirm your account.');
        setFormData({ email: '', password: '' });
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(`${isSignUp ? 'Sign up' : 'Login'} error:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      height: '100vh',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Gradient border container */}
      <div style={{
        background: 'linear-gradient(135deg, #6b8cff 0%, #9a7bfa 25%, #e893fb 50%, #e5576c 75%, #3facfe 100%)',
        backgroundSize: '300% 300%',
        animation: 'gradient-shift 6s ease-in-out infinite',
        padding: '2px',
        borderRadius: '22px',
        width: '424px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          background: '#1a1a1a',
          padding: '3rem',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          width: '100%',
          boxSizing: 'border-box',
          position: 'relative',
          border: 'none',
          outline: 'none'
        }}>
        <div style={{
          background: 'linear-gradient(135deg, #6b8cff 0%, #9a7bfa 25%, #e893fb 50%, #e5576c 75%, #3facfe 100%)',
          backgroundSize: '300% 300%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: '2.2rem',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em',
          animation: 'gradient-shift 6s ease-in-out infinite'
        }}>
          speedthreads
        </div>
        
        <h1 style={{
          textAlign: 'center',
          marginBottom: '2rem',
          color: '#ffffff',
          fontSize: '1.5rem',
          fontWeight: '600',
          letterSpacing: '-0.01em'
        }}>
          Welcome to SpeedThreads
        </h1>

        {error && (
          <div style={{
            backgroundColor: 'rgba(255, 107, 157, 0.1)',
            border: '1px solid rgba(255, 107, 157, 0.3)',
            color: '#ff6b9d',
            padding: '0.875rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.875rem',
            background: 'linear-gradient(135deg, #6b8cff 0%, #9a7bfa 25%, #e893fb 50%, #e5576c 75%, #3facfe 100%)',
            backgroundSize: '300% 300%',
            animation: 'gradient-shift 6s ease-in-out infinite',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '1.5rem',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(124, 158, 255, 0.2)',
            letterSpacing: '-0.01em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '44px'
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(124, 158, 255, 0.3)';
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(124, 158, 255, 0.2)';
            }
          }}
        >
          {loading ? 'Loading...' : 'Continue with Google'}
        </button>

        <div style={{
          textAlign: 'center',
          margin: '1.5rem 0',
          color: '#666',
          fontSize: '0.9rem',
          fontWeight: '500'
        }}>
          or
        </div>

        {/* Toggle between Login and Sign Up */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem',
          gap: '0.5rem'
        }}>
          <button
            type="button"
            onClick={() => setIsSignUp(false)}
            style={{
              padding: '0.5rem 1.5rem',
              background: isSignUp ? '#2a2a2a' : '#404040',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            style={{
              padding: '0.5rem 1.5rem',
              background: isSignUp ? '#404040' : '#2a2a2a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="email" style={{
              display: 'block',
              marginBottom: '0.75rem',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: '#2a2a2a',
                border: '1px solid #404040',
                borderRadius: '12px',
                fontSize: '0.95rem',
                color: '#ffffff',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              placeholder="Enter your email"
              onFocus={(e) => {
                e.target.style.borderColor = '#ff6b9d';
                e.target.style.boxShadow = '0 0 0 3px rgba(255, 107, 157, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#404040';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label htmlFor="password" style={{
              display: 'block',
              marginBottom: '0.75rem',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: '#2a2a2a',
                border: '1px solid #404040',
                borderRadius: '12px',
                fontSize: '0.95rem',
                color: '#ffffff',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              placeholder="Enter your password"
              onFocus={(e) => {
                e.target.style.borderColor = '#ff6b9d';
                e.target.style.boxShadow = '0 0 0 3px rgba(255, 107, 157, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#404040';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: 'linear-gradient(135deg, #6b8cff 0%, #9a7bfa 25%, #e893fb 50%, #e5576c 75%, #3facfe 100%)',
              backgroundSize: '300% 300%',
              animation: 'gradient-shift 6s ease-in-out infinite',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(124, 158, 255, 0.2)',
              letterSpacing: '-0.01em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '44px'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(124, 158, 255, 0.3)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(124, 158, 255, 0.2)';
              }
            }}
          >
            {loading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Sign Up with Email' : 'Login with Email')}
          </button>
        </form>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'rgba(255, 107, 157, 0.1)',
          border: '1px solid rgba(255, 107, 157, 0.2)',
          borderRadius: '12px',
          fontSize: '0.8rem',
          color: '#ff6b9d',
          fontWeight: '500'
        }}>
          <strong>💡 Note:</strong> After successful login, check the browser console for user data and JWT token.
        </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
