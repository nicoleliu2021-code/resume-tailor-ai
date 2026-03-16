import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ResumeProvider } from './contexts/ResumeContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { ApplicationsProvider } from './contexts/ApplicationsContext';
import { OptimizerNew } from './pages/OptimizerNew';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <SubscriptionProvider>
        <ApplicationsProvider>
          <ResumeProvider>
            <Routes>
              <Route path="/" element={<OptimizerNew />} />
              <Route path="/optimizer" element={<OptimizerNew />} />
            </Routes>
          </ResumeProvider>
        </ApplicationsProvider>
      </SubscriptionProvider>
    </BrowserRouter>
  );
}

export default App;
