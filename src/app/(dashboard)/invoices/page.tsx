'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvoicesList from '@/components/invoices/InvoicesList';
import InvoiceForm from '@/components/invoices/InvoiceForm';
import type { Invoice } from '@/types/invoice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function InvoicesPage() {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>();
  const [viewInvoice, setViewInvoice] = useState<Invoice | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setActiveTab('edit');
  };

  const handleView = (invoice: Invoice) => {
    setViewInvoice(invoice);
  };

  const handleAdd = () => {
    setSelectedInvoice(undefined);
    setActiveTab('create');
  };

  const handleSuccess = () => {
    setActiveTab('list');
    setSelectedInvoice(undefined);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancel = () => {
    setActiveTab('list');
    setSelectedInvoice(undefined);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Invoices</h1>
        <p className="text-slate-600 mt-2">Manage your invoices and track payments</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">All Invoices</TabsTrigger>
          <TabsTrigger value="create">Create Invoice</TabsTrigger>
          {selectedInvoice && <TabsTrigger value="edit">Edit Invoice</TabsTrigger>}
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <InvoicesList 
            onEdit={handleEdit}
            onView={handleView}
            onAdd={handleAdd}
            refreshTrigger={refreshTrigger}
          />
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <div className="max-w-4xl">
            <h2 className="text-xl font-semibold mb-6">Create New Invoice</h2>
            <InvoiceForm onSuccess={handleSuccess} onCancel={handleCancel} />
          </div>
        </TabsContent>

        {selectedInvoice && (
          <TabsContent value="edit" className="mt-6">
            <div className="max-w-4xl">
              <h2 className="text-xl font-semibold mb-6">Edit Invoice</h2>
              <InvoiceForm 
                invoice={selectedInvoice}
                onSuccess={handleSuccess} 
                onCancel={handleCancel} 
              />
            </div>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={!!viewInvoice} onOpenChange={() => setViewInvoice(undefined)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {viewInvoice && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Invoice Number</p>
                  <p className="font-semibold">{viewInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Client</p>
                  <p className="font-semibold">{viewInvoice.clientName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Issue Date</p>
                  <p>{new Date(viewInvoice.issueDate).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Due Date</p>
                  <p>{new Date(viewInvoice.dueDate).toLocaleDateString('id-ID')}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left text-sm text-slate-600">
                      <th className="pb-2">Product</th>
                      <th className="pb-2 text-right">Qty</th>
                      <th className="pb-2 text-right">Price</th>
                      <th className="pb-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewInvoice.items.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2">{item.productName}</td>
                        <td className="py-2 text-right">{item.quantity}</td>
                        <td className="py-2 text-right">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(item.unitPrice || 0)}
                        </td>
                        <td className="py-2 text-right">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(item.total || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(viewInvoice.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({viewInvoice.taxRate}%):</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(viewInvoice.taxAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(viewInvoice.total)}
                  </span>
                </div>
              </div>

              {viewInvoice.notes && (
                <div>
                  <p className="text-sm text-slate-600">Notes</p>
                  <p className="mt-1">{viewInvoice.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}