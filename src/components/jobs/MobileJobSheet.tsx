import { useState, useRef } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { JobCard } from './JobCard';
import { JobPreviewModal } from './JobPreviewModal';
import type { JobMatch } from '../../types/resume';

interface Props {
  jobs: JobMatch[];
  onJobSelect: (jobDescription: string, jobTitle: string) => void;
  onClose: () => void;
}

export function MobileJobSheet({ jobs, onJobSelect, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previewJob, setPreviewJob] = useState<JobMatch | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [sheetHeight, setSheetHeight] = useState('85vh');
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  const currentJob = jobs[currentIndex];

  // Handle sheet drag
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.job-card-content')) return;
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaY = currentY - startY;

    // If dragged down more than 100px, close
    if (deltaY > 100) {
      onClose();
    } else if (deltaY < -100) {
      // If dragged up, expand to full height
      setSheetHeight('95vh');
    } else {
      // Snap back
      setSheetHeight('85vh');
    }
  };

  // Handle card swipe
  const handleCardTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  };

  const handleCardTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartRef.current.y);
    const deltaTime = Date.now() - touchStartRef.current.time;

    // Only register swipe if horizontal movement > vertical and was fast
    if (Math.abs(deltaX) > 100 && deltaY < 50 && deltaTime < 300) {
      if (deltaX < 0 && currentIndex < jobs.length - 1) {
        // Swipe left - next job
        setCurrentIndex(currentIndex + 1);
      } else if (deltaX > 0 && currentIndex > 0) {
        // Swipe right - previous job
        setCurrentIndex(currentIndex - 1);
      }
    }
  };

  const handleTailorClick = (job: JobMatch) => {
    onJobSelect(job.job.description, job.job.title);
    onClose();
  };

  const translateY = isDragging ? Math.max(0, currentY - startY) : 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        style={{ backdropFilter: 'blur(4px)' }}
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 transition-all"
        style={{
          height: sheetHeight,
          transform: `translateY(${translateY}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease, height 0.3s ease',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle Bar */}
        <div className="sticky top-0 bg-white rounded-t-3xl pt-3 pb-4 px-6 border-b border-gray-200">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Jobs For You</h2>
              <p className="text-xs text-gray-600">
                {currentIndex + 1} of {jobs.length} • Swipe to browse
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Job Card Container */}
        <div className="overflow-y-auto h-full pb-32">
          <div className="p-4">
            {/* Progress Dots */}
            <div className="flex items-center justify-center gap-1.5 mb-4">
              {jobs.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`transition-all ${
                    idx === currentIndex
                      ? 'w-8 h-2 bg-indigo-600 rounded-full'
                      : 'w-2 h-2 bg-gray-300 rounded-full'
                  }`}
                />
              ))}
            </div>

            {/* Current Job Card */}
            {currentJob && (
              <div
                className="job-card-content"
                onTouchStart={handleCardTouchStart}
                onTouchEnd={handleCardTouchEnd}
              >
                <JobCard
                  jobMatch={currentJob}
                  onTailorClick={() => handleTailorClick(currentJob)}
                  onPreviewClick={() => setPreviewJob(currentJob)}
                />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <ChevronUp className="w-4 h-4" />
                Previous
              </button>
              <button
                onClick={() => setCurrentIndex(Math.min(jobs.length - 1, currentIndex + 1))}
                disabled={currentIndex === jobs.length - 1}
                className="flex-1 py-3 px-4 border-2 border-indigo-300 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                Next
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Helper Text */}
            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-xs text-blue-900 text-center">
                <strong>💡 Tip:</strong> Swipe left/right or use arrows to browse jobs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewJob && (
        <JobPreviewModal
          jobMatch={previewJob}
          onClose={() => setPreviewJob(null)}
          onTailorClick={() => {
            handleTailorClick(previewJob);
            setPreviewJob(null);
          }}
        />
      )}
    </>
  );
}
