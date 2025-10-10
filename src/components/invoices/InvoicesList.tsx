'use client';

import { useState, useEffect, useMemo } from 'react';
import { useInvoiceStore } from '@/lib/stores/invoiceStore';
import { useListFilters } from '@/hooks/useListFilters';
import { ListFilters } from '@/components/common/ListFilters';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import SuccessDialog from '@/components/common/SuccessDialog';
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
import { Pencil, Trash2, Eye, Repeat, Ban } from 'lucide-react';
import { InvoiceStatus, type Invoice } from '@/types/invoice';
import { useSearchParams } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

const isReadyToGenerate = (nextDateString?: string) => {
  if (!nextDateString) return false;
  const nextDate = new Date(nextDateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate <= today;
};

export default function InvoicesList({ onEdit, onView, onAdd, refreshTrigger }: InvoicesListProps) {
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();

  const [confirmDialogState, setConfirmDialogState] = useState<{
    isOpen: boolean;
    type: 'delete' | 'stopRecurring' | null;
    invoiceId: string | null;
  }>({ isOpen: false, type: null, invoiceId: null });
  
  const [successDialogState, setSuccessDialogState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
  }>({ isOpen: false, title: '', description: '' });

  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'ALL');
  const [isRecurringFilter, setIsRecurringFilter] = useState<string>(searchParams.get('isRecurring') || 'ALL'); 

  const additionalFilters = useMemo(() => ({
    status: statusFilter,
    isRecurring: isRecurringFilter,
  }), [statusFilter, isRecurringFilter]);
  
  const filters = useListFilters({
    additionalFilters: additionalFilters 
  });
  
  const { invoices, totalPages, loading, fetchInvoices, deleteInvoice, invalidateCache, stopRecurringInvoice } = useInvoiceStore();

    useEffect(() => {
    fetchInvoices(
      filters.page,
      filters.sortBy,
      filters.sortDir,
      filters.debouncedSearch,
      statusFilter,
      isRecurringFilter
    );
  }, [filters.page, filters.sortBy, filters.sortDir, filters.debouncedSearch, statusFilter, isRecurringFilter, fetchInvoices]);

  useEffect(() => {
    if (refreshTrigger) {
      invalidateCache();
      fetchInvoices(
        filters.page,
        filters.sortBy,
        filters.sortDir,
        filters.debouncedSearch,
        statusFilter,
        isRecurringFilter
      );
    }
  }, [refreshTrigger, invalidateCache, fetchInvoices, filters, statusFilter, isRecurringFilter]);
  
  const openConfirmationDialog = (type: 'delete' | 'stopRecurring', invoiceId: string) => {
    setConfirmDialogState({ isOpen: true, type, invoiceId });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialogState.invoiceId || !confirmDialogState.type) return;

    try {
      if (confirmDialogState.type === 'delete') {
        await deleteInvoice(confirmDialogState.invoiceId);
        setSuccessDialogState({
          isOpen: true,
          title: 'Success!',
          description: 'The invoice has been deleted successfully.',
        });
      } else if (confirmDialogState.type === 'stopRecurring') {
        await stopRecurringInvoice(confirmDialogState.invoiceId);
        setSuccessDialogState({
          isOpen: true,
          title: 'Success!',
          description: 'The invoice will no longer recur.',
        });
      }
      
      fetchInvoices(filters.page, filters.sortBy, filters.sortDir, filters.debouncedSearch, statusFilter, isRecurringFilter);
      
    } catch (error) {
      console.error(`Failed to ${confirmDialogState.type} invoice:`, error);
    }
  };

  const handleReset = () => {
    filters.reset();
    setStatusFilter('ALL');
    setIsRecurringFilter('ALL'); 
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'SENT': return 'bg-blue-100 text-blue-800';
      case 'DUE': return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-slate-100 text-slate-800';
      case 'CANCELLATION_REQUESTED': return 'bg-orange-100 text-orange-800'; 
      case 'PAYMENT_PENDING': return 'bg-purple-100 text-purple-800'; 
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
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
            <SelectItem value={InvoiceStatus.CANCELLATION_REQUESTED}>Cancel Requested</SelectItem>
            <SelectItem value={InvoiceStatus.PAYMENT_PENDING}>Payment Pending</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={isRecurringFilter} onValueChange={setIsRecurringFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Recurring" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Invoices</SelectItem>
            <SelectItem value="true">Recurring Only</SelectItem>
            <SelectItem value="false">One-Time Only</SelectItem>
          </SelectContent>
        </Select>
      </ListFilters>

      {isMobile ? (
        <div className="space-y-4">
          {invoices.length === 0 ? (
            <div className="text-center text-slate-500 h-24 flex items-center justify-center border rounded-md bg-white">
              No invoices found.
            </div>
          ) : (
            invoices.map((invoice) => (
              <Card key={invoice.id} className="p-4 flex flex-col gap-3">
                <CardHeader className="p-0 flex-row items-center justify-between">
                  <div className="text-left">
                    <CardTitle className="text-base font-bold text-blue-600">
                      {invoice.invoiceNumber}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {invoice.clientName}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.displayStatus)}`}>
                      {invoice.displayStatus}
                    </span>
                    <p className="text-xl font-bold mt-1">
                      {formatCurrency(invoice.total)}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="p-0 border-t pt-3 flex justify-between items-center text-xs text-slate-600">
                  <div className="flex flex-col gap-1">
                    <p>Due: {new Date(invoice.dueDate).toLocaleDateString('id-ID')}</p>
                    {invoice.isRecurring && (
                      <p className={`flex items-center ${isReadyToGenerate(invoice.nextGenerationDate) ? 'text-red-600 font-medium' : 'text-purple-700'}`}>
                        <Repeat className="w-3 h-3 mr-1" />
                        Next: {invoice.nextGenerationDate ? new Date(invoice.nextGenerationDate).toLocaleDateString('id-ID') : 'N/A'}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1">
                    {invoice.isRecurring && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openConfirmationDialog('stopRecurring', invoice.id)}
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      >
                        <Ban className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => onView(invoice)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(invoice)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openConfirmationDialog('delete', invoice.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Recurring</TableHead>
                <TableHead className="w-[150px]">Next Gen Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-slate-500">
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
                    <TableCell>
                      {invoice.isRecurring ? (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isReadyToGenerate(invoice.nextGenerationDate) ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'}`}>
                          <Repeat className="w-3 h-3 mr-1" />
                          {invoice.recurringFrequency ? (
                            invoice.recurringFrequency.charAt(0) + invoice.recurringFrequency.slice(1).toLowerCase()
                          ) : (
                            'Unknown'
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">No</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {invoice.nextGenerationDate ? (
                        <span className={`text-sm ${isReadyToGenerate(invoice.nextGenerationDate) ? 'font-semibold text-red-600' : 'text-slate-800'}`}>
                          {new Date(invoice.nextGenerationDate).toLocaleDateString('id-ID')}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(invoice.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      {invoice.isRecurring && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openConfirmationDialog('stopRecurring', invoice.id)}
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 mr-2"
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => onView(invoice)} className="mr-2">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(invoice)} className="mr-2">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openConfirmationDialog('delete', invoice.id)}
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
      )}

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

      <ConfirmationDialog
        isOpen={confirmDialogState.isOpen}
        onClose={() => setConfirmDialogState({ isOpen: false, type: null, invoiceId: null })}
        onConfirm={handleConfirmAction}
        title={confirmDialogState.type === 'delete' ? 'Delete Invoice' : 'Stop Recurring Invoice'}
        description={
          confirmDialogState.type === 'delete'
            ? 'Are you sure you want to permanently delete this invoice? This action cannot be undone.'
            : 'Are you sure you want to stop this invoice from recurring? Future invoices will no longer be generated automatically.'
        }
        confirmText={confirmDialogState.type === 'delete' ? 'Delete' : 'Stop Recurring'}
        isDestructive={confirmDialogState.type === 'delete'}
      />
      
      <SuccessDialog
        isOpen={successDialogState.isOpen}
        onClose={() => setSuccessDialogState({ isOpen: false, title: '', description: '' })}
        title={successDialogState.title}
        description={successDialogState.description}
      />
    </div>
  );
}