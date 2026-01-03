import React, { useMemo } from 'react';

interface ActivityData {
  date: string; // YYYY-MM-DD format
  count: number;
}

interface GreenChartProps {
  data: ActivityData[];
  year?: number;
  colorScheme?: 'green' | 'blue' | 'purple';
  showMonths?: boolean;
  showWeekdays?: boolean;
  tooltipFormatter?: (date: string, count: number) => string;
  onDayClick?: (date: string, count: number) => void;
}

const GreenChart: React.FC<GreenChartProps> = ({
  data,
  year = new Date().getFullYear(),
  colorScheme = 'green',
  showMonths = true,
  showWeekdays = true,
  tooltipFormatter,
  onDayClick
}) => {
  // Color schemes
  const colorSchemes = {
    green: {
      0: 'bg-gray-800',
      1: 'bg-green-900',
      2: 'bg-green-700',
      3: 'bg-green-500',
      4: 'bg-green-400'
    },
    blue: {
      0: 'bg-gray-800',
      1: 'bg-blue-900',
      2: 'bg-blue-700',
      3: 'bg-blue-500',
      4: 'bg-blue-400'
    },
    purple: {
      0: 'bg-gray-800',
      1: 'bg-purple-900',
      2: 'bg-purple-700',
      3: 'bg-purple-500',
      4: 'bg-purple-400'
    }
  };

  const colors = colorSchemes[colorScheme];

  // Create activity map for quick lookup
  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(item => {
      map.set(item.date, item.count);
    });
    return map;
  }, [data]);

  // Calculate the max count for intensity levels
  const maxCount = useMemo(() => {
    if (data.length === 0) return 1;
    return Math.max(...data.map(d => d.count), 1);
  }, [data]);

  // Get intensity level (0-4) based on count
  const getIntensity = (count: number): 0 | 1 | 2 | 3 | 4 => {
    if (count === 0) return 0;
    const ratio = count / maxCount;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  };

  // Generate calendar grid
  const calendarData = useMemo(() => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    // Adjust start to first Sunday
    const firstDayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - firstDayOfWeek);
    
    // Adjust end to last Saturday
    const lastDayOfWeek = endDate.getDay();
    endDate.setDate(endDate.getDate() + (6 - lastDayOfWeek));
    
    const weeks: Array<Array<{ date: Date; count: number; isCurrentYear: boolean }>> = [];
    let currentWeek: Array<{ date: Date; count: number; isCurrentYear: boolean }> = [];
    
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const count = activityMap.get(dateStr) || 0;
      const isCurrentYear = current.getFullYear() === year;
      
      currentWeek.push({
        date: new Date(current),
        count,
        isCurrentYear
      });
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  }, [year, activityMap]);

  // Month labels
  const monthLabels = useMemo(() => {
    const months: Array<{ name: string; position: number }> = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    calendarData.forEach((week, weekIndex) => {
      week.forEach(day => {
        if (day.isCurrentYear && day.date.getDate() <= 7 && day.date.getDay() === 0) {
          months.push({
            name: monthNames[day.date.getMonth()],
            position: weekIndex
          });
        }
      });
    });
    
    return months;
  }, [calendarData]);

  // Weekday labels
  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate total contributions
  const totalContributions = useMemo(() => {
    return data
      .filter(d => d.date.startsWith(year.toString()))
      .reduce((sum, d) => sum + d.count, 0);
  }, [data, year]);

  // Default tooltip formatter
  const defaultTooltipFormatter = (date: string, count: number) => {
    const d = new Date(date);
    const formatted = d.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    if (count === 0) return `No activity on ${formatted}`;
    return `${count} problem${count > 1 ? 's' : ''} solved on ${formatted}`;
  };

  const formatTooltip = tooltipFormatter || defaultTooltipFormatter;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300">
          {totalContributions} problems solved in {year}
        </h3>
        
        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className={`w-3 h-3 rounded-sm ${colors[level as keyof typeof colors]}`}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-1">
          {/* Month Labels */}
          {showMonths && (
            <div className="flex ml-8">
              <div className="flex relative" style={{ minWidth: calendarData.length * 13 + 'px' }}>
                {monthLabels.map((month, idx) => (
                  <span
                    key={idx}
                    className="absolute text-xs text-gray-400"
                    style={{ left: month.position * 13 + 'px' }}
                  >
                    {month.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Grid */}
          <div className="flex">
            {/* Weekday Labels */}
            {showWeekdays && (
              <div className="flex flex-col gap-1 mr-2 text-xs text-gray-400">
                {weekdayLabels.map((day, idx) => (
                  <div 
                    key={day} 
                    className="h-3 flex items-center"
                    style={{ visibility: idx % 2 === 1 ? 'visible' : 'hidden' }}
                  >
                    {day}
                  </div>
                ))}
              </div>
            )}

            {/* Calendar Grid */}
            <div className="flex gap-1">
              {calendarData.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {week.map((day, dayIdx) => {
                    const dateStr = day.date.toISOString().split('T')[0];
                    const intensity = getIntensity(day.count);
                    
                    return (
                      <div
                        key={dayIdx}
                        className={`
                          w-3 h-3 rounded-sm cursor-pointer
                          transition-all duration-150
                          hover:ring-2 hover:ring-white/30
                          ${day.isCurrentYear ? colors[intensity] : 'bg-transparent'}
                        `}
                        title={day.isCurrentYear ? formatTooltip(dateStr, day.count) : ''}
                        onClick={() => {
                          if (day.isCurrentYear && onDayClick) {
                            onDayClick(dateStr, day.count);
                          }
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreenChart;
