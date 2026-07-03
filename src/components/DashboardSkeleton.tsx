import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse p-6 bg-[#f9f0ff]">
      {/* Metrics Row Mock */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, idx) => (
          <div 
            key={idx} 
            /* Fixed structural aspect ratio prevents layout pop-in */
            className="aspect-video sm:aspect-auto sm:h-28 bg-[#f4ede4] rounded-2xl border border-[#4a154b]/5"
          />
        ))}
      </div>

      {/* Large Content Block Mock */}
      <div className="w-full h-64 bg-[#f4ede4] rounded-2xl border border-[#4a154b]/5" />
    </div>
  );
}
