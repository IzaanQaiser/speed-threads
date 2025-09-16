import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Login from './Login';
import AuthCallback from './AuthCallback';

interface User {
  id: string;
  email?: string;
  user_metadata?: any;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);


  // Check if we're on the auth callback route
  const isAuthCallback = window.location.pathname === '/auth/callback';

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        console.log('Existing session found:', session.user);
        console.log('JWT Token:', session.access_token);
        
        // Save token and user to localStorage
        localStorage.setItem("speedthreads_token", session.access_token);
        localStorage.setItem("speedthreads_user", JSON.stringify(session.user));
      }
      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          console.log('Auth state changed - User:', session.user);
          console.log('JWT Token:', session.access_token);
          
          // Save token and user to localStorage
          localStorage.setItem("speedthreads_token", session.access_token);
          localStorage.setItem("speedthreads_user", JSON.stringify(session.user));
          
          // Notify extension if running in extension context
          if (window.chrome && window.chrome.runtime) {
            try {
              chrome.runtime.sendMessage({
                type: 'AUTH_SUCCESS',
                token: session.access_token,
                user: session.user
              });
            } catch (error) {
              console.log('Not running in extension context, skipping extension notification');
            }
          }
        } else {
          setUser(null);
          localStorage.removeItem("speedthreads_token");
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem("speedthreads_token");
  };

  // Show auth callback component if we're on the callback route
  if (isAuthCallback) {
    return <AuthCallback />;
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (user) {
    // Determine login provider
    const provider = user.app_metadata?.provider || 'email';
    const providerName = provider === 'google' ? 'Google' : 'Email';
    const providerIcon = provider === 'google' ? '🔗' : '📧';

    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        position: 'fixed',
        top: 0,
        left: 0
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '3rem',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          width: '100%',
          maxWidth: '500px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Gradient border effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #7c9eff 0%, #a78bfa 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
            backgroundSize: '300% 300%',
            animation: 'gradient-shift 6s ease-in-out infinite',
            borderRadius: '16px',
            padding: '2px',
            zIndex: -1
          }}>
            <div style={{
              background: 'rgba(15, 15, 15, 0.9)',
              borderRadius: '14px',
              height: '100%',
              width: '100%'
            }}></div>
          </div>

          <h1 style={{
            textAlign: 'center',
            marginBottom: '2rem',
            fontSize: '2rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #7c9eff 0%, #a78bfa 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
            backgroundSize: '300% 300%',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradient-shift 6s ease-in-out infinite'
          }}>
            Welcome back to speedthreads!
          </h1>
          
          {/* User Profile Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(124, 158, 255, 0.1) 0%, rgba(167, 139, 250, 0.1) 50%, rgba(240, 147, 251, 0.1) 100%)',
            border: '1px solid rgba(124, 158, 255, 0.3)',
            padding: '2rem',
            borderRadius: '20px',
            marginBottom: '2rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Animated background gradient */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, #7c9eff 0%, #a78bfa 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
              backgroundSize: '300% 300%',
              animation: 'gradient-shift 6s ease-in-out infinite',
              opacity: 0.1,
              zIndex: -1
            }}></div>

            {/* User Avatar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c9eff 0%, #a78bfa 50%, #f093fb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'white',
                boxShadow: '0 8px 32px rgba(124, 158, 255, 0.3)'
              }}>
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 style={{ 
                  color: '#fff',
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #7c9eff 0%, #a78bfa 50%, #f093fb 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {user.email || 'User'}
                </h3>
                <p style={{ 
                  margin: 0, 
                  color: '#b0b0b0',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}>
                  Authentication: {providerName}
                </p>
              </div>
            </div>

          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(220, 53, 69, 0.3)';
            }}
          >
            Logout
          </button>
        </div>

        <style>{`
          @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
          html {
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
        `}</style>
      </div>
    );
  }

  return <Login />;
};

export default App;
