import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { Brain } from 'lucide-react';
import type { ReactNode } from 'react';

interface LoadingSpinnerProps {
  /**
   * The title displayed during loading
   */
  title?: string;
  /**
   * Optional description text shown below the title
   */
  description?: string;
  /**
   * Optional icon to display - defaults to Brain icon
   */
  icon?: LucideIcon;
  /**
   * Optional custom icon element to use instead of Lucide icons
   */
  customIcon?: ReactNode;
  /**
   * Optional class to apply to the container
   */
  className?: string;
}

export function LoadingSpinner({
  title = 'Loading...',
  description = 'Getting things ready.',
  icon: Icon = Brain,
  customIcon,
  className = '',
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        `flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center`,
        className
      )}
    >
      {customIcon || (
        <Icon className="h-16 w-16 animate-pulse text-primary mb-4" />
      )}
      <h2 className="text-2xl font-semibold text-primary mb-2">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
