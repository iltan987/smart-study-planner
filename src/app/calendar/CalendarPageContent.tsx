'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const hours = Array.from({ length: 10 }, (_, i) => 8 + i); // 08:00 to 17:00

// Mock events (replace this with real data or API later)
const events = [
  {
    day: 'Monday',
    hour: 10,
    label: 'AIEN422 GR01 ST115',
    type: 'Theoretical',
    color: 'bg-blue-600',
  },
  {
    day: 'Tuesday',
    hour: 8,
    label: 'VICD108 GR01 CU217',
    type: 'Theoretical',
    color: 'bg-blue-600',
  },
  {
    day: 'Tuesday',
    hour: 9,
    label: 'INDE335 GR01 ST113',
    type: 'Theoretical',
    color: 'bg-red-600',
  },
  {
    day: 'Wednesday',
    hour: 11,
    label: 'CMPE412 GR02',
    type: 'Theoretical',
    color: 'bg-red-600',
  },
  {
    day: 'Wednesday',
    hour: 11,
    label: 'INDE335 GR01 ST113',
    type: 'Theoretical',
    color: 'bg-red-600',
  },
  {
    day: 'Thursday',
    hour: 11,
    label: 'CMPE412 GR02 ST232',
    type: 'Theoretical',
    color: 'bg-blue-600',
  },
  {
    day: 'Friday',
    hour: 14,
    label: 'AIEN422 GR01 ST234',
    type: 'Lab',
    color: 'bg-blue-600',
  },
  {
    day: 'Saturday',
    hour: 10,
    label: 'VICD108 GR01 CU217',
    type: 'Theoretical',
    color: 'bg-blue-600',
  },
];

export default function StudyPlanner() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Smart Study Planner</h2>
      <div className="grid grid-cols-7 gap-px border bg-border text-sm text-muted-foreground">
        <div className="bg-background p-2 font-medium text-center">Time</div>
        {days.map((day) => (
          <div key={day} className="bg-background p-2 font-medium text-center">
            {day}
          </div>
        ))}
        {hours.map((hour, i) => (
          <>
            <div key={i} className="bg-background text-center p-2 font-medium">
              {hour}:00
            </div>
            {days.map((day) => {
              const slot = events.find((e) => e.day === day && e.hour === hour);
              return (
                <div
                  key={day + hour + i}
                  className="h-20 border bg-muted flex items-center justify-center relative"
                >
                  {slot && (
                    <Card
                      className={cn(
                        'absolute inset-1 text-white text-xs p-2',
                        slot.color
                      )}
                    >
                      <CardContent className="p-1">
                        <p className="font-semibold">{slot.label}</p>
                        <p>{slot.type}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}
