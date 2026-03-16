import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ResumeProvider } from './contexts/ResumeContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { ApplicationsProvider } from './contexts/ApplicationsContext';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Optimizer } from './pages/Optimizer';
import { Applications } from './pages/Applications';
import { Jobs } from './pages/Jobs';
import { Settings } from './pages/Settings';
import { HowItWorks } from './pages/HowItWorks';
import { Pricing } from './pages/Pricing';
import { MasterResumeEditor } from './pages/MasterResumeEditor';
import { SmartSelector } from './pages/SmartSelector';
import { VersionLibrary } from './pages/VersionLibrary';
import { Templates } from './pages/Templates';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <SubscriptionProvider>
        <ApplicationsProvider>
          <ResumeProvider>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="master-resume" element={<MasterResumeEditor />} />
                <Route path="smart-selector" element={<SmartSelector />} />
                <Route path="versions" element={<VersionLibrary />} />
                <Route path="templates" element={<Templates />} />
                <Route path="optimizer" element={<Optimizer />} />
                <Route path="jobs" element={<Jobs />} />
                <Route path="applications" element={<Applications />} />
                <Route path="how-it-works" element={<HowItWorks />} />
                <Route path="pricing" element={<Pricing />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </ResumeProvider>
        </ApplicationsProvider>
      </SubscriptionProvider>
    </BrowserRouter>
  );
}

export default App;
