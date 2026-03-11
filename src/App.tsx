import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ResumeProvider } from './contexts/ResumeContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Optimizer } from './pages/Optimizer';
import { Settings } from './pages/Settings';
import { FormatAdvisor } from './components/FormatAdvisor';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <SubscriptionProvider>
        <ResumeProvider>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="optimizer" element={<Optimizer />} />
              <Route path="format-advisor" element={<FormatAdvisor />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </ResumeProvider>
      </SubscriptionProvider>
    </BrowserRouter>
  );
}

export default App;
