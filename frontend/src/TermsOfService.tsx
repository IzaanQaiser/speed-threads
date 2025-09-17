import React, { useEffect } from 'react';

interface TermsOfServiceProps {
  onBack: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: 'white',
      padding: '2rem',
      margin: 0,
      overflow: 'hidden'
    }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(15, 15, 15, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#b0b0b0',
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
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
          ← Back
        </button>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #7c9eff 0%, #a78bfa 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
          backgroundSize: '300% 300%',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'gradient-shift 6s ease-in-out infinite'
        }}>
          speedthreads
        </div>
      </nav>

      {/* Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        paddingTop: '100px'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '700',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #7c9eff 0%, #a78bfa 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
          backgroundSize: '300% 300%',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'gradient-shift 6s ease-in-out infinite'
        }}>
          Terms of Service
        </h1>

        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <p style={{
            color: '#b0b0b0',
            fontSize: '1.1rem',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            <strong>Last updated:</strong> September 2025
          </p>

          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '1rem',
            marginTop: '2rem'
          }}>
            1. Acceptance of Terms
          </h2>
          <p style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            By accessing and using SpeedThreads, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>

          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '1rem',
            marginTop: '2rem'
          }}>
            2. Description of Service
          </h2>
          <p style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            SpeedThreads is a Chrome extension that provides AI-powered summarization of Reddit and X (Twitter) threads. The service includes:
          </p>
          <ul style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem',
            paddingLeft: '1.5rem'
          }}>
            <li>Thread content analysis and summarization</li>
            <li>AI-powered insights and categorization</li>
            <li>Local and cloud processing options</li>
            <li>Browser extension functionality</li>
          </ul>

          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '1rem',
            marginTop: '2rem'
          }}>
            3. User Responsibilities
          </h2>
          <p style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            As a user of SpeedThreads, you agree to:
          </p>
          <ul style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem',
            paddingLeft: '1.5rem'
          }}>
            <li>Use the service in compliance with all applicable laws and regulations</li>
            <li>Respect the terms of service of Reddit and X (Twitter)</li>
            <li>Not use the service for illegal or unauthorized purposes</li>
            <li>Not attempt to reverse engineer or modify the extension</li>
            <li>Not abuse or overload our systems</li>
          </ul>

          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '1rem',
            marginTop: '2rem'
          }}>
            4. Privacy and Data
          </h2>
          <p style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices. By default, all processing happens locally on your device.
          </p>

          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '1rem',
            marginTop: '2rem'
          }}>
            5. Intellectual Property
          </h2>
          <p style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            SpeedThreads is open-source software. The extension code, documentation, and related materials are available under the MIT License. You may use, modify, and distribute the software in accordance with the license terms.
          </p>

          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '1rem',
            marginTop: '2rem'
          }}>
            6. Service Availability
          </h2>
          <p style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            We strive to provide reliable service, but we cannot guarantee uninterrupted access. The service may be temporarily unavailable due to maintenance, updates, or technical issues. We reserve the right to modify or discontinue the service at any time.
          </p>

          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '1rem',
            marginTop: '2rem'
          }}>
            7. Limitation of Liability
          </h2>
          <p style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            To the fullest extent permitted by law, SpeedThreads shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
          </p>

          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '1rem',
            marginTop: '2rem'
          }}>
            8. Disclaimer of Warranties
          </h2>
          <p style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            The service is provided "as is" and "as available" without warranties of any kind, either express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
          </p>

          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '1rem',
            marginTop: '2rem'
          }}>
            9. Third-Party Services
          </h2>
          <p style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            SpeedThreads may integrate with third-party services (Reddit, X/Twitter, AI providers). Your use of these services is subject to their respective terms of service and privacy policies. We are not responsible for the content or practices of these third-party services.
          </p>

          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '1rem',
            marginTop: '2rem'
          }}>
            10. Termination
          </h2>
          <p style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            We may terminate or suspend your access to the service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>

          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '1rem',
            marginTop: '2rem'
          }}>
            11. Changes to Terms
          </h2>
          <p style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
          </p>

          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '1rem',
            marginTop: '2rem'
          }}>
            12. Governing Law
          </h2>
          <p style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            These Terms shall be interpreted and governed by the laws of the jurisdiction in which SpeedThreads operates, without regard to its conflict of law provisions.
          </p>

          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '1rem',
            marginTop: '2rem'
          }}>
            13. Contact Information
          </h2>
          <p style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <p style={{
            color: '#7c9eff',
            lineHeight: '1.6',
            marginBottom: '2rem'
          }}>
            Email: <a href="mailto:iqvention@gmail.com" style={{ color: '#7c9eff', textDecoration: 'none' }}>iqvention@gmail.com</a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        * {
          box-sizing: border-box;
        }
        html, body {
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%);
          overflow-x: hidden;
        }
        #root {
          background: linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%);
        }
      `}</style>
    </div>
  );
};

export default TermsOfService;
