'use client';

import { useState } from 'react';
import { useCreatePool } from '@/hooks/use-admin-pools';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface CreatePoolModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
  'FinTech',
  'HealthTech',
  'EdTech',
  'E-commerce',
  'SaaS',
  'AI/ML',
  'Blockchain',
  'Clean Energy',
  'Biotech',
  'Other',
];

export function CreatePoolModal({ open, onOpenChange }: CreatePoolModalProps) {
  const createPool = useCreatePool();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    votingDeadline: '',
    status: 'upcoming' as 'active' | 'closed' | 'upcoming',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.description ||
      !formData.category ||
      !formData.votingDeadline
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createPool.mutateAsync({
        ...formData,
        votingDeadline: new Date(formData.votingDeadline),
      });

      toast.success('Pool created successfully');
      onOpenChange(false);
      setFormData({
        name: '',
        description: '',
        category: '',
        votingDeadline: '',
        status: 'upcoming',
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create pool',
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Investment Pool</DialogTitle>
          <DialogDescription>
            Create a new investment pool for startups to compete for funding
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Pool Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Q1 2024 FinTech Pool"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the focus and goals of this investment pool..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="votingDeadline">Voting Deadline *</Label>
            <Input
              id="votingDeadline"
              type="datetime-local"
              value={formData.votingDeadline}
              onChange={(e) =>
                setFormData({ ...formData, votingDeadline: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Initial Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  status: value as 'active' | 'closed' | 'upcoming',
                })
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

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createPool.isPending}>
              {createPool.isPending ? 'Creating...' : 'Create Pool'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
