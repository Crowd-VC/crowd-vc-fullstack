'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/shadcn/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface AdminToolbarProps {
  onSearchChange: (search: string) => void;
  onStatusFilter: (status: string) => void;
  onSortChange: (sort: string) => void;
  stats?: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export function AdminToolbar({
  onSearchChange,
  onStatusFilter,
  onSortChange,
  stats,
}: AdminToolbarProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange(value);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onStatusFilter(value);
  };

  return (
    <div className="space-y-4">
      {/* Search and Sort */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, company, or submission ID..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select onValueChange={onSortChange} defaultValue="newest">
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="title-asc">Title A-Z</SelectItem>
            <SelectItem value="title-desc">Title Z-A</SelectItem>
            <SelectItem value="funding-high">Funding High-Low</SelectItem>
            <SelectItem value="funding-low">Funding Low-High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: 'all', label: `All ${stats ? `(${stats.total})` : ''}` },
          {
            value: 'pending',
            label: `Pending ${stats ? `(${stats.pending})` : ''}`,
          },
          { value: 'under-review', label: 'Under Review' },
          {
            value: 'approved',
            label: `Approved ${stats ? `(${stats.approved})` : ''}`,
          },
          {
            value: 'rejected',
            label: `Rejected ${stats ? `(${stats.rejected})` : ''}`,
          },
        ].map((tab) => (
          <Button
            key={tab.value}
            variant={activeTab === tab.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTabChange(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
