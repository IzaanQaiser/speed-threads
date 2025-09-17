import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

interface LoginFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginProps {
  onBackToLanding: () => void;
}

const Login: React.FC<LoginProps> = ({ onBackToLanding }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errorHighlighted, setErrorHighlighted] = useState(false);

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
        @keyframes toastSlideIn {
          0% { 
            transform: translateX(100%); 
            opacity: 0; 
          }
          100% { 
            transform: translateX(0); 
            opacity: 1; 
          }
        }
        @keyframes errorHighlight {
          0% { 
            background-color: rgba(255, 107, 157, 0.1);
            border-color: rgba(255, 107, 157, 0.3);
            transform: scale(1);
          }
          50% { 
            background-color: rgba(255, 107, 157, 0.3);
            border-color: rgba(255, 107, 157, 0.6);
            transform: scale(1.02);
            box-shadow: 0 0 20px rgba(255, 107, 157, 0.4);
          }
          100% { 
            background-color: rgba(255, 107, 157, 0.1);
            border-color: rgba(255, 107, 157, 0.3);
            transform: scale(1);
          }
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
        }
        #root {
          min-height: 100vh;
          width: 100vw;
          background: #0f0f0f;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Auto-dismiss error after 5 seconds and trigger highlight animation
  useEffect(() => {
    if (error) {
      // Trigger highlight animation
      setErrorHighlighted(true);
      const highlightTimer = setTimeout(() => {
        setErrorHighlighted(false);
      }, 1000); // Animation duration

      // Auto-dismiss error after 5 seconds
      const dismissTimer = setTimeout(() => {
        setError(null);
        setErrorHighlighted(false);
      }, 5000);

      return () => {
        clearTimeout(highlightTimer);
        clearTimeout(dismissTimer);
      };
    }
  }, [error]);

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

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address first');
      return;
    }

    // Clear the email field immediately when button is pressed
    setFormData(prev => ({
      ...prev,
      email: ''
    }));

    // Close modal after 1 second delay
    setTimeout(() => {
      setShowForgotPassword(false);
    }, 750);

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth/callback`
      });

      if (error) {
        // Handle rate limiting with a generic message
        if (error.message.includes('rate limit') || error.message.includes('too many requests') || error.message.includes('security purposes')) {
          setError('For security reasons, you can try again in 5-10 minutes');
        } else {
          setError(error.message);
        }
        console.error('Password reset error:', error);
      } else {
        setToast({ 
          message: 'Password reset email sent! Please check your inbox.', 
          type: 'success' 
        });
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Password reset error:', err);
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

    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
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
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
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
        
        // Save token and user to localStorage
        localStorage.setItem("speedthreads_token", data.session.access_token);
        localStorage.setItem("speedthreads_user", JSON.stringify(data.user));
        
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
        setFormData({ email: '', password: '', confirmPassword: '' });
        
        setToast({ 
          message: `${isSignUp ? 'Sign up' : 'Login'} successful! Check console for user data and JWT token.`, 
          type: 'success' 
        });
      } else if (isSignUp && data.user && !data.session) {
        // Sign up successful but needs email confirmation
        setToast({ 
          message: 'Sign up successful! Please check your email to confirm your account.', 
          type: 'success' 
        });
        setFormData({ email: '', password: '', confirmPassword: '' });
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.5rem'
        }}>
          <button
            onClick={onBackToLanding}
            style={{
              background: 'none',
              border: 'none',
              color: '#b0b0b0',
              fontSize: '1.2rem',
              cursor: 'pointer',
              marginRight: '1rem',
              padding: '0.5rem',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = '#b0b0b0';
            }}
          >
            ←
          </button>
          <div style={{
            background: 'linear-gradient(135deg, #6b8cff 0%, #9a7bfa 25%, #e893fb 50%, #e5576c 75%, #3facfe 100%)',
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '2.2rem',
            fontWeight: '700',
            textAlign: 'center',
            letterSpacing: '-0.02em',
            animation: 'gradient-shift 6s ease-in-out infinite'
          }}>
            speedthreads
          </div>
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
            fontWeight: '500',
            animation: errorHighlighted ? 'errorHighlight 1s ease-in-out' : 'none',
            transition: 'all 0.3s ease'
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
              (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(124, 158, 255, 0.3)';
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(124, 158, 255, 0.2)';
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

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{
              display: 'block',
              marginBottom: '0.75rem',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  paddingRight: '4rem',
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'none';
                }}
              >
                {showPassword ? 'HIDE' : 'VIEW'}
              </button>
            </div>
          </div>

          {!isSignUp && (
            <div style={{ 
              textAlign: 'right', 
              marginBottom: '1.5rem',
              marginTop: '-0.5rem'
            }}>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b8cff',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLButtonElement).style.color = '#9a7bfa';
                  (e.target as HTMLButtonElement).style.textDecoration = 'underline';
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.color = '#6b8cff';
                  (e.target as HTMLButtonElement).style.textDecoration = 'none';
                }}
              >
                Forgot your password?
              </button>
            </div>
          )}

          {isSignUp && (
            <div style={{ marginBottom: '2rem' }}>
              <label htmlFor="confirmPassword" style={{
                display: 'block',
                marginBottom: '0.75rem',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    paddingRight: '4rem',
                    background: '#2a2a2a',
                    border: '1px solid #404040',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    color: '#ffffff',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  placeholder="Confirm your password"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ff6b9d';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255, 107, 157, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#404040';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    (e.target as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    (e.target as HTMLButtonElement).style.background = 'none';
                  }}
                >
                  {showConfirmPassword ? 'HIDE' : 'VIEW'}
                </button>
              </div>
            </div>
          )}

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
                (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(124, 158, 255, 0.3)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(124, 158, 255, 0.2)';
              }
            }}
          >
            {loading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Sign Up with Email' : 'Login with Email')}
          </button>
        </form>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#1a1a1a',
            padding: '2rem',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            width: '400px',
            maxWidth: '90vw',
            border: '1px solid #404040',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowForgotPassword(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.25rem',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                (e.target as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseOut={(e) => {
                (e.target as HTMLButtonElement).style.background = 'none';
              }}
            >
              ×
            </button>
            
            <h2 style={{
              color: '#ffffff',
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              Reset Password
            </h2>
            
            <p style={{
              color: '#cccccc',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
              textAlign: 'center',
              lineHeight: '1.5'
            }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="forgotEmail" style={{
                display: 'block',
                marginBottom: '0.75rem',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                Email Address
              </label>
              <input
                type="email"
                id="forgotEmail"
                value={formData.email}
                onChange={handleInputChange}
                name="email"
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
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowForgotPassword(false)}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#2a2a2a',
                  color: '#ffffff',
                  border: '1px solid #404040',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.7 : 1
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    (e.target as HTMLButtonElement).style.background = '#404040';
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    (e.target as HTMLButtonElement).style.background = '#2a2a2a';
                  }
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleForgotPassword}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #6b8cff 0%, #9a7bfa 25%, #e893fb 50%, #e5576c 75%, #3facfe 100%)',
                  backgroundSize: '300% 300%',
                  animation: 'gradient-shift 6s ease-in-out infinite',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(124, 158, 255, 0.2)'
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
                    (e.target as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(124, 158, 255, 0.3)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                    (e.target as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(124, 158, 255, 0.2)';
                  }
                }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          background: toast.type === 'success' 
            ? 'linear-gradient(135deg, #6b8cff 0%, #9a7bfa 25%, #e893fb 50%, #e5576c 75%, #3facfe 100%)'
            : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          backgroundSize: toast.type === 'success' ? '300% 300%' : '100% 100%',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxWidth: '400px',
          animation: toast.type === 'success' 
            ? 'toastSlideIn 0.3s ease-out, gradient-shift 6s ease-in-out infinite 0.3s' 
            : 'toastSlideIn 0.3s ease-out',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            fontSize: '1.2rem',
            flexShrink: 0
          }}>
            {toast.type === 'success' ? '✅' : '❌'}
          </div>
          <div style={{
            flex: 1,
            fontSize: '0.9rem',
            fontWeight: '500',
            lineHeight: '1.4'
          }}>
            {toast.message}
          </div>
          <button
            onClick={() => setToast(null)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;
