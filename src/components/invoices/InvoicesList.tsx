'use client';

import { useState, useEffect, useMemo } from 'react';
import { useInvoiceStore } from '@/lib/stores/invoiceStore';
import { useListFilters } from '@/hooks/useListFilters';
import { ListFilters } from '@/components/common/ListFilters';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import SuccessDialog from '@/components/common/SuccessDialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InvoiceStatus, type Invoice } from '@/types/invoice';
import { useSearchParams } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import InvoiceTableRow from './InvoiceTableRow';
import InvoiceMobileCard from './InvoiceMobileCard';
import { SORT_OPTIONS } from './invoiceConstants';

interface InvoicesListProps {
  onEdit: (invoice: Invoice) => void;
  onView: (invoice: Invoice) => void;
  onAdd: () => void;
  refreshTrigger?: number;
}

type ActionType = 'delete' | 'stopRecurring' | 'approveCancellation' | 'rejectCancellation' | 'approvePayment' | 'rejectPayment';

export default function InvoicesList({ onEdit, onView, onAdd, refreshTrigger }: InvoicesListProps) {
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();

  const [confirmDialogState, setConfirmDialogState] = useState<{
    isOpen: boolean;
    type: ActionType | null;
    invoiceId: string | null;
  }>({ isOpen: false, type: null, invoiceId: null });

  const [successDialogState, setSuccessDialogState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
  }>({ isOpen: false, title: '', description: '' });

  const [processingState, setProcessingState] = useState<{
    isProcessing: boolean;
    invoiceId: string | null;
  }>({ isProcessing: false, invoiceId: null });

  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'ALL');
  const [isRecurringFilter, setIsRecurringFilter] = useState<string>(searchParams.get('isRecurring') || 'ALL');

  const additionalFilters = useMemo(() => ({
    status: statusFilter,
    isRecurring: isRecurringFilter,
  }), [statusFilter, isRecurringFilter]);

  const filters = useListFilters({ additionalFilters });

  const {
    invoices,
    totalPages,
    loading,
    fetchInvoices,
    deleteInvoice,
    invalidateCache,
    stopRecurringInvoice,
    approveCancellation,
    rejectCancellation,
    confirmPayment,
    rejectPayment,
  } = useInvoiceStore();

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

  const openConfirmDialog = (type: ActionType, invoiceId: string) => {
    setConfirmDialogState({ isOpen: true, type, invoiceId });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialogState.invoiceId || !confirmDialogState.type) return;

    setProcessingState({ isProcessing: true, invoiceId: confirmDialogState.invoiceId });

    try {
      const { type, invoiceId } = confirmDialogState;

      switch (type) {
        case 'delete':
          await deleteInvoice(invoiceId);
          setSuccessDialogState({
            isOpen: true,
            title: 'Success!',
            description: 'The invoice has been deleted successfully.',
          });
          break;
        case 'stopRecurring':
          await stopRecurringInvoice(invoiceId);
          setSuccessDialogState({
            isOpen: true,
            title: 'Success!',
            description: 'The invoice will no longer recur.',
          });
          break;
        case 'approveCancellation':
          await approveCancellation(invoiceId);
          setSuccessDialogState({
            isOpen: true,
            title: 'Cancellation Approved!',
            description: 'The invoice has been cancelled successfully.',
          });
          break;
        case 'rejectCancellation':
          await rejectCancellation(invoiceId);
          setSuccessDialogState({
            isOpen: true,
            title: 'Cancellation Rejected!',
            description: 'The cancellation request has been rejected.',
          });
          break;
        case 'approvePayment':
          await confirmPayment(invoiceId);
          setSuccessDialogState({
            isOpen: true,
            title: 'Payment Confirmed!',
            description: 'The payment has been confirmed successfully.',
          });
          break;
        case 'rejectPayment':
          await rejectPayment(invoiceId);
          setSuccessDialogState({
            isOpen: true,
            title: 'Payment Rejected!',
            description: 'The payment confirmation has been rejected.',
          });
          break;
      }

      fetchInvoices(filters.page, filters.sortBy, filters.sortDir, filters.debouncedSearch, statusFilter, isRecurringFilter);
    } catch (error) {
      console.error(`Failed to ${confirmDialogState.type}:`, error);
    } finally {
      setProcessingState({ isProcessing: false, invoiceId: null });
      setConfirmDialogState({ isOpen: false, type: null, invoiceId: null });
    }
  };

  const getDialogContent = () => {
    switch (confirmDialogState.type) {
      case 'delete':
        return {
          title: 'Delete Invoice',
          description: 'Are you sure you want to permanently delete this invoice? This action cannot be undone.',
          confirmText: 'Delete',
          isDestructive: true,
        };
      case 'stopRecurring':
        return {
          title: 'Stop Recurring Invoice',
          description: 'Are you sure you want to stop this invoice from recurring? Future invoices will no longer be generated automatically.',
          confirmText: 'Stop Recurring',
          isDestructive: false,
        };
      case 'approveCancellation':
        return {
          title: 'Approve Cancellation',
          description: 'Are you sure you want to approve this cancellation request? The invoice will be marked as cancelled.',
          confirmText: 'Approve',
          isDestructive: false,
        };
      case 'rejectCancellation':
        return {
          title: 'Reject Cancellation',
          description: 'Are you sure you want to reject this cancellation request? The invoice will remain active.',
          confirmText: 'Reject',
          isDestructive: true,
        };
      case 'approvePayment':
        return {
          title: 'Confirm Payment',
          description: 'Are you sure you want to confirm this payment? The invoice will be marked as paid.',
          confirmText: 'Confirm',
          isDestructive: false,
        };
      case 'rejectPayment':
        return {
          title: 'Reject Payment',
          description: 'Are you sure you want to reject this payment confirmation? The invoice will remain unpaid.',
          confirmText: 'Reject',
          isDestructive: true,
        };
      default:
        return {
          title: '',
          description: '',
          confirmText: 'Confirm',
          isDestructive: false,
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const dialogContent = getDialogContent();

  return (
    <div className="space-y-6">
      <ListFilters
        search={filters.search}
        onSearchChange={filters.setSearch}
        sortBy={filters.sortBy}
        onSortByChange={filters.setSortBy}
        sortDir={filters.sortDir}
        onSortDirChange={filters.setSortDir}
        onReset={() => {
          filters.reset();
          setStatusFilter('ALL');
          setIsRecurringFilter('ALL');
        }}
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
              <InvoiceMobileCard
                key={invoice.id}
                invoice={invoice}
                onView={onView}
                onEdit={onEdit}
                onDelete={(id) => openConfirmDialog('delete', id)}
                onStopRecurring={(id) => openConfirmDialog('stopRecurring', id)}
                onApprove={(id, type) => openConfirmDialog(type === 'cancellation' ? 'approveCancellation' : 'approvePayment', id)}
                onReject={(id, type) => openConfirmDialog(type === 'cancellation' ? 'rejectCancellation' : 'rejectPayment', id)}
                isProcessing={processingState.isProcessing}
                processingInvoiceId={processingState.invoiceId || undefined}
              />
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
                  <InvoiceTableRow
                    key={invoice.id}
                    invoice={invoice}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={(id) => openConfirmDialog('delete', id)}
                    onStopRecurring={(id) => openConfirmDialog('stopRecurring', id)}
                    onApprove={(id, type) => openConfirmDialog(type === 'cancellation' ? 'approveCancellation' : 'approvePayment', id)}
                    onReject={(id, type) => openConfirmDialog(type === 'cancellation' ? 'rejectCancellation' : 'rejectPayment', id)}
                  />
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
        title={dialogContent.title}
        description={dialogContent.description}
        confirmText={dialogContent.confirmText}
        isDestructive={dialogContent.isDestructive}
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