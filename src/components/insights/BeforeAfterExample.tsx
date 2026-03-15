interface BeforeAfterExampleProps {
  before: string;
  after: string;
}

export function BeforeAfterExample({ before, after }: BeforeAfterExampleProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
      {/* Before */}
      <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
            ❌
          </span>
          <p className="font-bold text-red-800">Before:</p>
        </div>
        <p className="text-gray-700 leading-relaxed pl-7">{before}</p>
      </div>

      {/* After */}
      <div className="p-3 bg-green-50 border-2 border-green-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
            ✓
          </span>
          <p className="font-bold text-green-800">After:</p>
        </div>
        <p className="text-gray-700 leading-relaxed pl-7">{after}</p>
      </div>
    </div>
  );
}
