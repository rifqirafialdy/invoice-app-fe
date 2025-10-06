'use client';

import { useState, useEffect,useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useClientStore } from '@/lib/stores/clientStore';
import { useListFilters } from '@/hooks/useListFilters';
import { ListFilters } from '@/components/common/ListFilters';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import type { Client } from '@/types/client';

interface ClientsListProps {
  onEdit: (client: Client) => void;
  onAdd: () => void;
  refreshTrigger?: number;
}

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'createdAt', label: 'Date Created' },
];

export default function ClientsList({ onEdit, onAdd, refreshTrigger }: ClientsListProps) {
  const searchParams = useSearchParams();
  
  const additionalFilters = useMemo(() => ({}), []); 
  
  const filters = useListFilters({
    additionalFilters: additionalFilters 
  });
  
  const { clients, totalPages, loading, fetchClients, deleteClient, invalidateCache } = useClientStore();

  useEffect(() => {
    fetchClients(
      filters.page,
      filters.sortBy,
      filters.sortDir,
      filters.debouncedSearch
    );
  }, [filters.page, filters.sortBy, filters.sortDir, filters.debouncedSearch]);

  useEffect(() => {
    if (refreshTrigger) {
      invalidateCache();
      fetchClients(
        filters.page,
        filters.sortBy,
        filters.sortDir,
        filters.debouncedSearch
      );
    }
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      await deleteClient(id);
      fetchClients(
        filters.page,
        filters.sortBy,
        filters.sortDir,
        filters.debouncedSearch
      );
    } catch (error) {
      console.error('Failed to delete client:', error);
    }
  };

  const handleReset = () => {
    filters.reset();
  };

  return (
    <div className="space-y-6">
      <ListFilters
        search={filters.search}
        onSearchChange={filters.setSearch}
        sortBy={filters.sortBy}
        onSortByChange={filters.setSortBy}
        sortDir={filters.sortDir}
        onSortDirChange={filters.setSortDir}
        onReset={filters.reset}
        onAdd={onAdd}
        addLabel="Add Client"
        sortOptions={SORT_OPTIONS}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  No clients found.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.address}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(client)} className="mr-2">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(client.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => filters.setPage((p) => Math.max(0, p - 1))}
            disabled={filters.page === 0}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-slate-600">
            Page {filters.page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => filters.setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={filters.page === totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}