import React, { useEffect, useState } from 'react';

const LandingPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
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
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => window.open('https://tally.so/r/wvR8gg', '_blank')}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        paddingTop: '120px',
        paddingBottom: '80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background elements */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(124, 158, 255, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'pulse 4s ease-in-out infinite'
        }}></div>
        
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(240, 147, 251, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite'
        }}></div>

        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(245, 87, 108, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite reverse'
        }}></div>

        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 2rem',
          position: 'relative',
          zIndex: 10,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease-out'
        }}>
          <h1 style={{
            fontSize: '4rem',
            fontWeight: '800',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #7c9eff 0%, #a78bfa 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
            backgroundSize: '300% 300%',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradient-shift 6s ease-in-out infinite',
            lineHeight: '1.1'
          }}>
            Summarize Threads
            <br />
            <span style={{ fontSize: '3.5rem' }}>Instantly</span>
          </h1>

          <p style={{
            fontSize: '1.25rem',
            color: '#b0b0b0',
            marginBottom: '2.5rem',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 2.5rem auto'
          }}>
            Transform long Reddit and X (Twitter) threads into digestible summaries with AI-powered insights. 
            Save time, stay informed, and never miss the signal in the noise.
          </p>

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '3rem'
          }}>
            <button 
              onClick={() => window.open('https://tally.so/r/wvR8gg', '_blank')}
              style={{
                background: 'linear-gradient(135deg, #7c9eff 0%, #a78bfa 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
                backgroundSize: '300% 300%',
                animation: 'gradient-shift 6s ease-in-out infinite',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 32px rgba(124, 158, 255, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(124, 158, 255, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(124, 158, 255, 0.3)';
              }}>
              Get Started
            </button>
            <button style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '3rem',
            flexWrap: 'wrap',
            marginTop: '4rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #7c9eff 0%, #a78bfa 50%, #f093fb 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem'
              }}>
                10x
              </div>
              <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Faster Reading</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem'
              }}>
                100%
              </div>
              <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Privacy First</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #4facfe 0%, #7c9eff 50%, #a78bfa 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem'
              }}>
                AI-Powered
              </div>
              <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Smart Analysis</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '80px 2rem',
        background: 'rgba(255, 255, 255, 0.02)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: '700',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #7c9eff 0%, #a78bfa 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
            backgroundSize: '300% 300%',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradient-shift 6s ease-in-out infinite'
          }}>
            Why SpeedThreads?
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: '#b0b0b0',
            marginBottom: '4rem',
            maxWidth: '600px',
            margin: '0 auto 4rem auto'
          }}>
            Stop wasting time scrolling through endless comments. Get the key insights instantly.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginTop: '3rem'
          }}>
            {[
              {
                icon: '⚡',
                title: 'Lightning Fast',
                description: 'Get comprehensive summaries in seconds, not minutes. Our AI processes threads instantly.'
              },
              {
                icon: '🔒',
                title: 'Privacy First',
                description: 'All processing happens locally with open-source AI models. Your data never leaves your device.'
              },
              {
                icon: '🧠',
                title: 'Smart Analysis',
                description: 'Identifies post types, highlights best answers, controversial takes, and unexpected insights.'
              },
              {
                icon: '🎯',
                title: 'Context Aware',
                description: 'Understands Reddit and X nuances to provide platform-specific, relevant summaries.'
              },
              {
                icon: '📱',
                title: 'Seamless Integration',
                description: 'Works directly in your browser. No copy-pasting, no external tools needed.'
              },
              {
                icon: '🆓',
                title: 'Completely Free',
                description: 'Open-source and free forever. No subscriptions, no hidden costs, no data selling.'
              }
            ].map((feature, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(124, 158, 255, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '1rem'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: '#b0b0b0',
                  lineHeight: '1.6'
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{
        padding: '80px 2rem',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: '700',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #7c9eff 0%, #a78bfa 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
            backgroundSize: '300% 300%',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradient-shift 6s ease-in-out infinite'
          }}>
            How It Works
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: '#b0b0b0',
            marginBottom: '4rem',
            maxWidth: '600px',
            margin: '0 auto 4rem auto'
          }}>
            Three simple steps to transform any thread into actionable insights.
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
            marginTop: '3rem'
          }}>
            {[
              {
                step: '1',
                title: 'Install Extension',
                description: 'Add SpeedThreads to Chrome in seconds. No setup required.',
                icon: '📥'
              },
              {
                step: '2',
                title: 'Visit Any Thread',
                description: 'Go to Reddit or X. See the "Summarize" button appear automatically.',
                icon: '🔍'
              },
              {
                step: '3',
                title: 'Get Instant Summary',
                description: 'Click and receive AI-powered insights in seconds.',
                icon: '✨'
              }
            ].map((step, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '2.5rem',
                textAlign: 'center',
                maxWidth: '300px',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #7c9eff 0%, #a78bfa 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
                  backgroundSize: '300% 300%',
                  animation: 'gradient-shift 6s ease-in-out infinite',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  color: 'white'
                }}>
                  {step.step}
                </div>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem',
                  marginTop: '1rem'
                }}>
                  {step.icon}
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '1rem'
                }}>
                  {step.title}
                </h3>
                <p style={{
                  color: '#b0b0b0',
                  lineHeight: '1.6'
                }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 2rem',
        background: 'linear-gradient(135deg, rgba(124, 158, 255, 0.1) 0%, rgba(167, 139, 250, 0.1) 50%, rgba(240, 147, 251, 0.1) 100%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: '700',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #7c9eff 0%, #a78bfa 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
            backgroundSize: '300% 300%',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradient-shift 6s ease-in-out infinite'
          }}>
            Ready to Save Time?
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: '#b0b0b0',
            marginBottom: '3rem',
            lineHeight: '1.6'
          }}>
            Join thousands of users who are already reading smarter, not harder. 
            Install SpeedThreads today and never miss the important stuff again.
          </p>
          <button 
            onClick={() => window.open('https://tally.so/r/wvR8gg', '_blank')}
            style={{
              background: 'linear-gradient(135deg, #7c9eff 0%, #a78bfa 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
              backgroundSize: '300% 300%',
              animation: 'gradient-shift 6s ease-in-out infinite',
              color: 'white',
              border: 'none',
              padding: '1.2rem 3rem',
              borderRadius: '16px',
              fontSize: '1.2rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 12px 40px rgba(124, 158, 255, 0.4)',
              marginBottom: '2rem'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 16px 50px rgba(124, 158, 255, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(124, 158, 255, 0.4)';
            }}>
            Get Started Now
          </button>
          <p style={{
            color: '#888',
            fontSize: '0.9rem'
          }}>
            Free • No signup required • Works on Reddit & X
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '3rem 2rem',
        background: 'rgba(0, 0, 0, 0.3)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #7c9eff 0%, #a78bfa 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
            backgroundSize: '300% 300%',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradient-shift 6s ease-in-out infinite',
            marginBottom: '1rem'
          }}>
            speedthreads
          </div>
          <p style={{
            color: '#888',
            marginBottom: '2rem'
          }}>
            Privacy-first AI summarization for Reddit and X threads
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
            marginBottom: '2rem'
          }}>
            <button 
              onClick={() => alert('Privacy Policy coming soon!')}
              style={{ 
                background: 'none',
                border: 'none',
                color: '#b0b0b0', 
                textDecoration: 'none',
                cursor: 'pointer',
                fontSize: 'inherit',
                fontFamily: 'inherit',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#7c9eff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#b0b0b0';
              }}
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => alert('Terms of Service coming soon!')}
              style={{ 
                background: 'none',
                border: 'none',
                color: '#b0b0b0', 
                textDecoration: 'none',
                cursor: 'pointer',
                fontSize: 'inherit',
                fontFamily: 'inherit',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#7c9eff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#b0b0b0';
              }}
            >
              Terms of Service
            </button>
            <a 
              href="https://github.com/IzaanQaiser/speed-threads" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#b0b0b0', 
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#7c9eff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#b0b0b0';
              }}
            >
              GitHub
            </a>
            <a 
              href="mailto:iqvention@gmail.com"
              style={{ 
                color: '#b0b0b0', 
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#7c9eff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#b0b0b0';
              }}
            >
              Support
            </a>
          </div>
          <p style={{
            color: '#666',
            fontSize: '0.9rem'
          }}>
            © 2024 SpeedThreads. Open source and free forever.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
