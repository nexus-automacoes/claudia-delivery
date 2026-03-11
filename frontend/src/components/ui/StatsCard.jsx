export default function StatsCard({ icon, title, value, subtitle, trend, iconBg = 'bg-primary/10', iconColor = 'text-primary' }) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500',
  };

  const trendIcons = {
    up: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    down: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
  };

  return (
    <div className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-300 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {(subtitle || trend) && (
            <div className="mt-2 flex items-center gap-1.5">
              {trend && (
                <span className={`inline-flex items-center gap-0.5 text-sm font-medium ${trendColors[trend.direction] || trendColors.neutral}`}>
                  {trendIcons[trend.direction]}
                  {trend.value}
                </span>
              )}
              {subtitle && (
                <span className="text-sm text-gray-500">{subtitle}</span>
              )}
            </div>
          )}
        </div>
        <div className={`${iconBg} ${iconColor} p-3 rounded-full`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
