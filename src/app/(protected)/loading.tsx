import { HeaderSkeleton } from '@/components/dashboard/HeaderSkeleton';
import { QuickActionsSkeleton } from '@/components/dashboard/QuickActionsSkeleton';
import { TodaysCalendarSkeleton } from '@/components/dashboard/TodaysCalendarSkeleton';
import { UpcomingTodosSkeleton } from '@/components/dashboard/UpcomingTodosSkeleton';

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <HeaderSkeleton />

      {/* Grid for Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <UpcomingTodosSkeleton />

        <TodaysCalendarSkeleton />

        <QuickActionsSkeleton />
      </div>
    </div>
  );
}
