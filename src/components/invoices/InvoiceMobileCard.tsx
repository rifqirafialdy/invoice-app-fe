'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2, Eye, Repeat, Ban, Check, X } from 'lucide-react';
import { Invoice } from '@/types/invoice';
import { getStatusColor, formatCurrency, isReadyToGenerate, needsApproval } from './invoiceConstants';

interface InvoiceMobileCardProps {
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

export default function InvoiceMobileCard({
  invoice,
  onEdit,
  onView,
  onDelete,
  onStopRecurring,
  onApprove,
  onReject,
  isProcessing = false,
  processingInvoiceId,
}: InvoiceMobileCardProps) {
  const requiresApproval = needsApproval(invoice.displayStatus);
  const isCancellationRequest = invoice.displayStatus === 'CANCELLATION_REQUESTED';
  const isThisInvoiceProcessing = isProcessing && processingInvoiceId === invoice.id;

  return (
    <Card className="p-4 flex flex-col gap-3">
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

      <CardContent className="p-0 border-t pt-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 text-xs text-slate-600">
            <p>Due: {new Date(invoice.dueDate).toLocaleDateString('id-ID')}</p>
            {invoice.isRecurring && (
              <p className={`flex items-center ${isReadyToGenerate(invoice.nextGenerationDate) ? 'text-red-600 font-medium' : 'text-purple-700'}`}>
                <Repeat className="w-3 h-3 mr-1" />
                Next: {invoice.nextGenerationDate ? new Date(invoice.nextGenerationDate).toLocaleDateString('id-ID') : 'N/A'}
              </p>
            )}
          </div>

          {requiresApproval ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onApprove(invoice.id, isCancellationRequest ? 'cancellation' : 'payment')}
                disabled={isThisInvoiceProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700"
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
                className="flex-1"
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
            <div className="flex gap-1 justify-end">
              {invoice.isRecurring && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onStopRecurring(invoice.id)}
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
                onClick={() => onDelete(invoice.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}