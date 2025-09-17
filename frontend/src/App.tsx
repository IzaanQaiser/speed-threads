import React, { useState } from 'react';
import LandingPage from './LandingPage';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';

type Page = 'landing' | 'privacy' | 'terms';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  const navigateToPage = (page: Page) => {
    setCurrentPage(page);
  };

  const navigateBack = () => {
    setCurrentPage('landing');
  };

  switch (currentPage) {
    case 'privacy':
      return <PrivacyPolicy onBack={navigateBack} />;
    case 'terms':
      return <TermsOfService onBack={navigateBack} />;
    default:
      return <LandingPage onNavigate={navigateToPage} />;
  }
};

export default App;
