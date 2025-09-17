import React, { useEffect } from 'react';
import { supabase } from './supabaseClient';

const AuthCallback: React.FC = () => {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          // Redirect to login with error
          window.location.href = '/login?error=' + encodeURIComponent(error.message);
          return;
        }

        if (data.session) {
          console.log('User:', data.session.user);
          console.log('JWT Token:', data.session.access_token);
          
          // Save token and user to localStorage
          localStorage.setItem("speedthreads_token", data.session.access_token);
          localStorage.setItem("speedthreads_user", JSON.stringify(data.session.user));
          
          // Notify extension if running in extension context
          if (window.chrome && window.chrome.runtime) {
            try {
              chrome.runtime.sendMessage({
                type: 'AUTH_SUCCESS',
                token: data.session.access_token,
                user: data.session.user
              });
            } catch (error) {
              console.log('Not running in extension context, skipping extension notification');
            }
          }
          
          // Redirect to main app
          window.location.href = '/';
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        window.location.href = '/login?error=' + encodeURIComponent('Authentication failed');
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f0f0f',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h2>Completing authentication...</h2>
        <p>Please wait while we finish setting up your account.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
