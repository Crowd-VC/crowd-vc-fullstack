import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/shadcn/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';

interface Pool {
  id: string;
  name: string;
  description: string;
  category: string;
  votingDeadline: Date;
  status: 'active' | 'closed' | 'upcoming';
  createdAt: Date;
  updatedAt: Date;
}

interface PoolCardProps {
  pool: Pool;
  onStatusChange: (
    poolId: string,
    status: 'active' | 'closed' | 'upcoming',
  ) => void;
  onAssignStartups: (poolId: string) => void;
}

const statusColors = {
  active: 'bg-green-500/10 text-green-500',
  closed: 'bg-gray-500/10 text-gray-500',
  upcoming: 'bg-blue-500/10 text-blue-500',
};

export function PoolCard({
  pool,
  onStatusChange,
  onAssignStartups,
}: PoolCardProps) {
  return (
    <Card className="flex h-full flex-col p-6">
      <CardHeader>
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="mb-1 text-xl font-semibold">{pool.name}</h3>
            <Badge variant="outline" className="mb-2">
              {pool.category}
            </Badge>
          </div>
          <Badge className={statusColors[pool.status]}>{pool.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
          {pool.description}
        </p>

        <div className="mb-4 space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>
              Voting ends: {format(new Date(pool.votingDeadline), 'PPP')}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-2 text-sm font-medium">Status</div>
          <Select
            value={pool.status}
            onValueChange={(value) =>
              onStatusChange(pool.id, value as 'active' | 'closed' | 'upcoming')
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onAssignStartups(pool.id)}
        >
          <Users className="mr-2 h-4 w-4" />
          Manage Startups
        </Button>
      </CardFooter>
    </Card>
  );
}
