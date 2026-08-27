import React, { useState } from 'react';
import { IntroVideoSplash } from './components/IntroVideoSplash';
import { LandingPage } from './pages/LandingPage';

export const App: React.FC = () => {
  const [forceShowIntro, setForceShowIntro] = useState<boolean>(false);

  const handleReplayIntro = () => {
    setForceShowIntro(true);
  };

  return (
    <>
      <IntroVideoSplash 
        forceShow={forceShowIntro} 
        onComplete={() => setForceShowIntro(false)} 
      />
      <LandingPage onReplayIntro={handleReplayIntro} />
    </>
  );
};

export default App;
