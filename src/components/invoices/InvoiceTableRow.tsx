'use client';

import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Eye, Repeat, Ban, Check, X } from 'lucide-react';
import { Invoice } from '@/types/invoice';
import { getStatusColor, formatCurrency, isReadyToGenerate, needsApproval } from './invoiceConstants';

interface InvoiceTableRowProps {
  invoice: Invoice;
  onEdit: (invoice: Invoice) => void;
  onView: (invoice: Invoice) => void;
  onDelete: (invoiceId: string) => void;
  onStopRecurring: (invoiceId: string) => void;
  onApprove: (invoiceId: string, type: 'cancellation' | 'payment') => void;
  onReject: (invoiceId: string, type: 'cancellation' | 'payment') => void;
  isProcessing?: boolean;
  processingInvoiceId?: string;
}

export default function InvoiceTableRow({
  invoice,
  onEdit,
  onView,
  onDelete,
  onStopRecurring,
  onApprove,
  onReject,
  isProcessing = false,
  processingInvoiceId,
}: InvoiceTableRowProps) {
  const requiresApproval = needsApproval(invoice.displayStatus);
  const isCancellationRequest = invoice.displayStatus === 'CANCELLATION_REQUESTED';
  const isPaymentPending = invoice.displayStatus === 'PAYMENT_PENDING';
  const isThisInvoiceProcessing = isProcessing && processingInvoiceId === invoice.id;

  return (
    <TableRow>
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
            {invoice.recurringFrequency 
              ? invoice.recurringFrequency.charAt(0) + invoice.recurringFrequency.slice(1).toLowerCase()
              : 'Unknown'
            }
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
      <TableCell className="font-semibold">{formatCurrency(invoice.total)}</TableCell>
      <TableCell className="text-right">
        {requiresApproval ? (
          <div className="flex gap-2 justify-end">
            <Button
              variant="default"
              size="sm"
              onClick={() => onApprove(invoice.id, isCancellationRequest ? 'cancellation' : 'payment')}
              disabled={isThisInvoiceProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isThisInvoiceProcessing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
              ) : (
                <Check className="w-4 h-4 mr-1" />
              )}
              Approve
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onReject(invoice.id, isCancellationRequest ? 'cancellation' : 'payment')}
              disabled={isThisInvoiceProcessing}
            >
              {isThisInvoiceProcessing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
              ) : (
                <X className="w-4 h-4 mr-1" />
              )}
              Reject
            </Button>
          </div>
        ) : (
          <>
            {invoice.isRecurring && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStopRecurring(invoice.id)}
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
              onClick={() => onDelete(invoice.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </TableCell>
    </TableRow>
  );
}