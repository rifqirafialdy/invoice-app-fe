'use client';

import { useState, useEffect,useMemo } from 'react';
import { useInvoiceStore } from '@/lib/stores/invoiceStore';
import { useListFilters } from '@/hooks/useListFilters';
import { ListFilters } from '@/components/common/ListFilters';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Pencil, Trash2, Eye } from 'lucide-react';
import { InvoiceStatus, type Invoice } from '@/types/invoice';
import { useSearchParams } from 'next/navigation';

interface InvoicesListProps {
  onEdit: (invoice: Invoice) => void;
  onView: (invoice: Invoice) => void;
  onAdd: () => void;
  refreshTrigger?: number;
}

const SORT_OPTIONS = [
  { value: 'invoiceNumber', label: 'Invoice Number' },
  { value: 'issueDate', label: 'Issue Date' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'total', label: 'Total Amount' },
  { value: 'createdAt', label: 'Date Created' },
];

export default function InvoicesList({ onEdit, onView, onAdd, refreshTrigger }: InvoicesListProps) {
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'ALL');
  const additionalFilters = useMemo(() => ({
    status: statusFilter,
  }), [statusFilter]);
 const filters = useListFilters({
    additionalFilters: additionalFilters 
  });
  const { invoices, totalPages, loading, fetchInvoices, deleteInvoice, invalidateCache } = useInvoiceStore();

    useEffect(() => {
    fetchInvoices(
      filters.page,
      filters.sortBy,
      filters.sortDir,
      filters.debouncedSearch,
      statusFilter
    );
  }, [filters.page, filters.sortBy, filters.sortDir, filters.debouncedSearch, statusFilter]);

  useEffect(() => {
    if (refreshTrigger) {
      invalidateCache();
      fetchInvoices(
        filters.page,
        filters.sortBy,
        filters.sortDir,
        filters.debouncedSearch,
        statusFilter
      );
    }
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      await deleteInvoice(id);
      fetchInvoices(
        filters.page,
        filters.sortBy,
        filters.sortDir,
        filters.debouncedSearch,
        statusFilter
      );
    } catch (error) {
      console.error('Failed to delete invoice:', error);
    }
  };

  

  const handleReset = () => {
    filters.reset();
    setStatusFilter('ALL');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'SENT': return 'bg-blue-100 text-blue-800';
      case 'DUE': return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-slate-100 text-slate-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ListFilters
        search={filters.search}
        onSearchChange={filters.setSearch}
        sortBy={filters.sortBy}
        onSortByChange={filters.setSortBy}
        sortDir={filters.sortDir}
        onSortDirChange={filters.setSortDir}
        onReset={handleReset}
        onAdd={onAdd}
        addLabel="Create Invoice"
        sortOptions={SORT_OPTIONS}
      >
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value={InvoiceStatus.DRAFT}>Draft</SelectItem>
            <SelectItem value={InvoiceStatus.SENT}>Sent</SelectItem>
            <SelectItem value={InvoiceStatus.DUE}>Due</SelectItem>
            <SelectItem value={InvoiceStatus.OVERDUE}>Overdue</SelectItem>
            <SelectItem value={InvoiceStatus.PAID}>Paid</SelectItem>
            <SelectItem value={InvoiceStatus.CANCELLED}>Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </ListFilters>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.clientName}</TableCell>
                  <TableCell>{new Date(invoice.issueDate).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.displayStatus)}`}>
                      {invoice.displayStatus}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(invoice.total)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => onView(invoice)} className="mr-2">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(invoice)} className="mr-2">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(invoice.id)}
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