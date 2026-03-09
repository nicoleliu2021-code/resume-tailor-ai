import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ResumeProvider } from './contexts/ResumeContext';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Optimizer } from './pages/Optimizer';
import { SavedResumes } from './pages/SavedResumes';
import { Settings } from './pages/Settings';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <ResumeProvider>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="optimizer" element={<Optimizer />} />
            <Route path="saved" element={<SavedResumes />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </ResumeProvider>
    </BrowserRouter>
  );
}

export default App;
