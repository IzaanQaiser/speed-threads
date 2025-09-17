import React, { useEffect } from 'react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
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
          Privacy Policy
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
            1. Information We Collect
          </h2>
          <p style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            SpeedThreads is designed with privacy in mind. We collect minimal information:
          </p>
          <ul style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem',
            paddingLeft: '1.5rem'
          }}>
            <li>Thread content you choose to summarize (processed locally)</li>
            <li>Basic usage analytics (anonymized)</li>
            <li>Account information if you choose to sign up (email only)</li>
          </ul>

          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '1rem',
            marginTop: '2rem'
          }}>
            2. How We Use Your Information
          </h2>
          <p style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            Your data is used solely to provide the SpeedThreads service:
          </p>
          <ul style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem',
            paddingLeft: '1.5rem'
          }}>
            <li>Generate AI-powered thread summaries</li>
            <li>Improve our service quality</li>
            <li>Provide customer support</li>
            <li>Send important service updates (if you opt-in)</li>
          </ul>

          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '1rem',
            marginTop: '2rem'
          }}>
            3. Data Processing
          </h2>
          <p style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            <strong>Local Processing:</strong> All AI processing happens locally on your device using open-source models. Your thread content never leaves your computer unless you explicitly choose to use our cloud processing option.
          </p>
          <p style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            <strong>No Data Selling:</strong> We never sell, rent, or trade your personal information to third parties.
          </p>

          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '1rem',
            marginTop: '2rem'
          }}>
            4. Data Security
          </h2>
          <p style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            We implement industry-standard security measures to protect your information:
          </p>
          <ul style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem',
            paddingLeft: '1.5rem'
          }}>
            <li>End-to-end encryption for data transmission</li>
            <li>Secure authentication systems</li>
            <li>Regular security audits</li>
            <li>Minimal data collection principles</li>
          </ul>

          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '1rem',
            marginTop: '2rem'
          }}>
            5. Your Rights
          </h2>
          <p style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            You have the right to:
          </p>
          <ul style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem',
            paddingLeft: '1.5rem'
          }}>
            <li>Access your personal data</li>
            <li>Request data deletion</li>
            <li>Opt-out of data collection</li>
            <li>Export your data</li>
            <li>Withdraw consent at any time</li>
          </ul>

          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '1rem',
            marginTop: '2rem'
          }}>
            6. Third-Party Services
          </h2>
          <p style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            SpeedThreads may integrate with third-party services for authentication and analytics. These services have their own privacy policies, and we encourage you to review them.
          </p>

          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '1rem',
            marginTop: '2rem'
          }}>
            7. Children's Privacy
          </h2>
          <p style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            SpeedThreads is not intended for children under 13. We do not knowingly collect personal information from children under 13.
          </p>

          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '1rem',
            marginTop: '2rem'
          }}>
            8. Changes to This Policy
          </h2>
          <p style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
          </p>

          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '1rem',
            marginTop: '2rem'
          }}>
            9. Contact Us
          </h2>
          <p style={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            If you have any questions about this privacy policy, please contact us at:
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

export default PrivacyPolicy;
