import { Save } from 'lucide-react';

export function SavedResumes() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Saved Resumes</h1>
        <p className="text-gray-600 mt-2">View and manage your optimized resumes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder cards */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Save className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Resume {i}</h3>
                <p className="text-xs text-gray-500">Saved 2 days ago</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">Senior Product Manager role at Tech Company</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-green-600">87% Match</span>
              <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
