import { useState } from 'react';
import { StatusColumn } from './StatusColumn';
import { ApplicationDetails } from './ApplicationDetails';
import { StatusTransitionModal } from './StatusTransitionModal';
import { useApplications } from '../../contexts/ApplicationsContext';
import type { Application, ApplicationStatus } from '../../types/application';

export function ApplicationsBoard() {
  const { applications, updateStatus } = useApplications();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [transitionApp, setTransitionApp] = useState<Application | null>(null);

  const stages: ApplicationStatus[] = ['saved', 'tailored', 'applied', 'interview', 'offer'];

  const getStageApplications = (stage: ApplicationStatus) => {
    return applications.filter(app => app.status === stage);
  };

  const handleCardClick = (app: Application) => {
    setSelectedApp(app);
  };

  const handleStatusChange = (app: Application, newStatus: ApplicationStatus) => {
    setTransitionApp(app);
  };

  const handleTransitionConfirm = (newStatus: ApplicationStatus, notes?: string) => {
    if (transitionApp) {
      updateStatus(transitionApp.id, newStatus, {
        date: new Date(),
        notes,
      });
      setTransitionApp(null);
    }
  };

  return (
    <div className="h-full">
      {/* Board Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Tracker</h1>
        <p className="text-gray-600">Track your job applications from saved to offer</p>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map(stage => {
          const stageApps = getStageApplications(stage);
          return (
            <StatusColumn
              key={stage}
              stage={stage}
              applications={stageApps}
              count={stageApps.length}
              onCardClick={handleCardClick}
            />
          );
        })}
      </div>

      {/* Application Details Modal */}
      {selectedApp && (
        <ApplicationDetails
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onStatusChange={(newStatus) => handleStatusChange(selectedApp, newStatus)}
        />
      )}

      {/* Status Transition Modal */}
      {transitionApp && (
        <StatusTransitionModal
          application={transitionApp}
          currentStatus={transitionApp.status}
          onConfirm={handleTransitionConfirm}
          onCancel={() => setTransitionApp(null)}
        />
      )}
    </div>
  );
}
