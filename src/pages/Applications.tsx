import { ApplicationsBoard } from '../components/applications/ApplicationsBoard';

export function Applications() {
  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-indigo-50 overflow-hidden">
      <div className="h-full p-4 sm:p-6 lg:p-8">
        <ApplicationsBoard />
      </div>
    </div>
  );
}
