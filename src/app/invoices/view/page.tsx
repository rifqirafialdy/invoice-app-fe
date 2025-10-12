'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { publicInvoiceApi } from '@/lib/api/invoiceApi';
import { PublicInvoiceResponse } from '@/types/invoice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Building2, Mail, Phone, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { getStatusColor, formatCurrency } from '@/components/invoices/invoiceConstants';

export default function PublicInvoiceViewPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [invoice, setInvoice] = useState<PublicInvoiceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing token');
      setLoading(false);
      return;
    }

    const fetchInvoice = async () => {
      try {
        const response = await publicInvoiceApi.viewInvoice(token);
        setInvoice(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Invoice</h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="space-y-4">
                {invoice.companyLogoUrl && (
                  <img 
                    src={invoice.companyLogoUrl} 
                    alt={invoice.companyName}
                    className="h-16 object-contain"
                  />
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{invoice.companyName}</h1>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    {invoice.companyEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {invoice.companyEmail}
                      </div>
                    )}
                    {invoice.companyPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {invoice.companyPhone}
                      </div>
                    )}
                    {invoice.companyAddress && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {invoice.companyAddress}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-left md:text-right space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Invoice Number</p>
                  <p className="text-lg font-bold text-blue-600">{invoice.invoiceNumber}</p>
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.displayStatus)}`}>
                  {invoice.displayStatus}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Bill To
                </h3>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{invoice.clientName}</p>
                  {invoice.clientEmail && <p className="text-gray-600">{invoice.clientEmail}</p>}
                  {invoice.clientPhone && <p className="text-gray-600">{invoice.clientPhone}</p>}
                  {invoice.clientAddress && <p className="text-gray-600">{invoice.clientAddress}</p>}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Invoice Details
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Issue Date:</span>
                    <span className="font-medium">{new Date(invoice.issueDate).toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-medium">{new Date(invoice.dueDate).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Items</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoice.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{item.productName}</p>
                            {item.productDescription && (
                              <p className="text-sm text-gray-500">{item.productDescription}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-900">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="w-full md:w-1/2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
                  <span className="font-medium">{formatCurrency(invoice.taxAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>

            {invoice.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>This is a read-only view of the invoice.</p>
          <p>For questions, please contact {invoice.companyEmail}</p>
        </div>
      </div>
    </div>
  );
}