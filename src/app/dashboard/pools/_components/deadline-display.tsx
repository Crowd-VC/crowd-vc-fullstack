'use client';

import { useEffect, useState } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DeadlineDisplayProps {
  deadline: Date | string;
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeRemaining(deadline: Date | string): TimeRemaining {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const total = deadlineDate.getTime() - now.getTime();

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  const seconds = Math.floor((total / 1000) % 60);

  return { days, hours, minutes, seconds, total };
}

export function DeadlineDisplay({ deadline, className }: DeadlineDisplayProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(
    calculateTimeRemaining(deadline),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(deadline));
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  // Determine urgency level
  const totalHours = timeRemaining.total / (1000 * 60 * 60);
  const urgency =
    totalHours <= 0
      ? 'expired'
      : totalHours < 24
        ? 'critical'
        : totalHours < 48
          ? 'warning'
          : 'normal';

  const urgencyConfig = {
    expired: {
      color: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      icon: AlertCircle,
      label: 'Voting Closed',
    },
    critical: {
      color: 'bg-red-500/10 text-red-500 border-red-500/20',
      icon: AlertCircle,
      label: 'Ending Soon',
    },
    warning: {
      color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      icon: Clock,
      label: 'Ending Soon',
    },
    normal: {
      color: 'bg-green-500/10 text-green-500 border-green-500/20',
      icon: Clock,
      label: 'Active',
    },
  };

  const config = urgencyConfig[urgency];
  const Icon = config.icon;

  if (timeRemaining.total <= 0) {
    return (
      <Badge
        variant="outline"
        className={cn('flex items-center gap-2', config.color, className)}
      >
        <Icon className="h-3 w-3" />
        <span>Voting Closed</span>
      </Badge>
    );
  }

  const formatTime = () => {
    if (timeRemaining.days > 0) {
      return `${timeRemaining.days}d ${timeRemaining.hours}h remaining`;
    }
    if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours}h ${timeRemaining.minutes}m remaining`;
    }
    return `${timeRemaining.minutes}m ${timeRemaining.seconds}s remaining`;
  };

  return (
    <Badge
      variant="outline"
      className={cn('flex items-center gap-2', config.color, className)}
    >
      <Icon className="h-3 w-3" />
      <span>{formatTime()}</span>
    </Badge>
  );
}

export function DeadlineCountdown({
  deadline,
  className,
}: DeadlineDisplayProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(
    calculateTimeRemaining(deadline),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(deadline));
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  if (timeRemaining.total <= 0) {
    return (
      <div className={cn('text-center', className)}>
        <div className="text-2xl font-bold text-muted-foreground">
          Voting Closed
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex gap-4', className)}>
      {timeRemaining.days > 0 && (
        <div className="flex flex-col items-center">
          <div className="text-3xl font-bold text-foreground">
            {timeRemaining.days}
          </div>
          <div className="text-sm text-muted-foreground">Days</div>
        </div>
      )}
      <div className="flex flex-col items-center">
        <div className="text-3xl font-bold text-foreground">
          {timeRemaining.hours.toString().padStart(2, '0')}
        </div>
        <div className="text-sm text-muted-foreground">Hours</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-3xl font-bold text-foreground">
          {timeRemaining.minutes.toString().padStart(2, '0')}
        </div>
        <div className="text-sm text-muted-foreground">Minutes</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-3xl font-bold text-foreground">
          {timeRemaining.seconds.toString().padStart(2, '0')}
        </div>
        <div className="text-sm text-muted-foreground">Seconds</div>
      </div>
    </div>
  );
}
