import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Login from './Login';

interface User {
  id: string;
  email?: string;
  user_metadata?: any;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        console.log('Existing session found:', session.user);
        console.log('JWT Token:', session.access_token);
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
          
          // Save token to localStorage
          localStorage.setItem("speedthreads_token", session.access_token);
          
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
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '500px'
        }}>
          <h1 style={{
            textAlign: 'center',
            marginBottom: '2rem',
            color: '#333',
            fontSize: '1.5rem'
          }}>
            Welcome to SpeedThreads!
          </h1>
          
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>User Information:</h3>
            <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
              <strong>ID:</strong> {user.id}
            </p>
            {user.email && (
              <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
                <strong>Email:</strong> {user.email}
              </p>
            )}
            {user.user_metadata && (
              <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
                <strong>Name:</strong> {user.user_metadata.full_name || user.user_metadata.name || 'N/A'}
              </p>
            )}
          </div>

          <div style={{
            backgroundColor: '#e8f4fd',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1.5rem'
          }}>
            <p style={{ margin: '0', fontSize: '0.875rem', color: '#0066cc' }}>
              ✅ Successfully logged in! Check the browser console for the complete user object and JWT token.
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return <Login />;
};

export default App;
