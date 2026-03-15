import { useState } from 'react';
import { Plus, TrendingUp, Target, CheckCircle, Calendar } from 'lucide-react';
import { StatusColumn } from './StatusColumn';
import { ApplicationDetails } from './ApplicationDetails';
import { StatusTransitionModal } from './StatusTransitionModal';
import { CreateApplicationModal } from './CreateApplicationModal';
import { useApplications } from '../../contexts/ApplicationsContext';
import { getVersion } from '../../services/resumeVersions';
import type { Application, ApplicationStatus } from '../../types/application';

export function ApplicationsBoard() {
  const { applications, addApplication, updateStatus, stats } = useApplications();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [transitionApp, setTransitionApp] = useState<Application | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const stages: ApplicationStatus[] = ['saved', 'tailored', 'applied', 'interview', 'offer'];

  const getStageApplications = (stage: ApplicationStatus) => {
    return applications.filter(app => app.status === stage);
  };

  const handleCardClick = (app: Application) => {
    setSelectedApp(app);
  };

  const handleStatusChange = (app: Application) => {
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

  const handleCreateApplication = (applicationData: {
    jobTitle: string;
    company: string;
    jobUrl?: string;
    jobDescription: string;
    location?: string;
    salary?: string;
    remote: boolean;
    resumeVersionId: string;
    notes: string;
  }) => {
    const version = getVersion(applicationData.resumeVersionId);
    if (!version) {
      alert('Resume version not found');
      return;
    }

    // Calculate basic match score (can be enhanced with AI later)
    const matchScore = 75; // Default for now

    const newApplication: Application = {
      id: `app-${Date.now()}`,
      jobTitle: applicationData.jobTitle,
      company: applicationData.company,
      jobUrl: applicationData.jobUrl,
      jobDescription: applicationData.jobDescription,
      location: applicationData.location,
      salary: applicationData.salary,
      remote: applicationData.remote,
      resumeVersion: {
        id: version.id,
        fileName: `${version.name}.pdf`,
        optimizedFor: version.targetRole,
        content: version.optimizedContent,
        exportedAt: version.lastExportedAt || new Date(),
      },
      status: 'saved',
      dateAdded: new Date(),
      matchScore,
      matchType: matchScore >= 80 ? 'strong' : matchScore >= 60 ? 'adjacent' : 'stretch',
      whyItMatches: [],
      missingSkills: [],
      notes: applicationData.notes,
      reminders: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addApplication(newApplication);
    setShowCreateModal(false);
  };

  return (
    <div className="h-full">
      {/* Board Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Tracker</h1>
            <p className="text-gray-600">Track your job applications from saved to offer</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Track New Application
          </button>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase">Total</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600 mt-1">Applications</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase">Applied</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.byStatus.applied}</p>
            <p className="text-sm text-gray-600 mt-1">Submitted</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase">Interviews</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.byStatus.interview}</p>
            <p className="text-sm text-gray-600 mt-1">Scheduled</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase">Success Rate</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{Math.round(stats.successRate)}%</p>
            <p className="text-sm text-gray-600 mt-1">Offer Rate</p>
          </div>
        </div>
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
          onStatusChange={() => handleStatusChange(selectedApp)}
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

      {/* Create Application Modal */}
      {showCreateModal && (
        <CreateApplicationModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateApplication}
        />
      )}
    </div>
  );
}
