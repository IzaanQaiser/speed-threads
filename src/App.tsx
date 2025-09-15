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
            Welcome to SpeedThreads!
          </h1>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '2rem'
          }}>
            <h3 style={{ 
              margin: '0 0 1rem 0', 
              color: '#fff',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}>User Information:</h3>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
              padding: '0.75rem',
              background: 'rgba(124, 158, 255, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(124, 158, 255, 0.2)'
            }}>
              <span style={{ fontSize: '1.2rem' }}>{providerIcon}</span>
              <span style={{ color: '#7c9eff', fontWeight: '600' }}>Logged in with {providerName}</span>
            </div>

            {user.email && (
              <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#e0e0e0' }}>
                <strong style={{ color: '#7c9eff' }}>Email:</strong> {user.email}
              </p>
            )}
            {user.user_metadata && (
              <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#e0e0e0' }}>
                <strong style={{ color: '#7c9eff' }}>Name:</strong> {user.user_metadata.full_name || user.user_metadata.name || 'N/A'}
              </p>
            )}
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
