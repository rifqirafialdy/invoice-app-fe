'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { dashboardApi, DashboardStats, RecentInvoice } from '@/lib/api/dashboardApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, TrendingUp, Clock, CheckCircle, FileText, AlertCircle, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, invoicesRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRecentInvoices(5),
      ]);

      setStats(statsRes.data.data);
      setRecentInvoices(invoicesRes.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-slate-600 mt-2">
          Here's an overview of your business today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {stats?.paidInvoicesCount || 0} paid invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Pending</CardDescription>
            <Clock className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.pendingAmount || 0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {stats?.pendingInvoicesCount || 0} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Overdue</CardDescription>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats?.overdueAmount || 0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {stats?.overdueInvoicesCount || 0} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Clients</CardDescription>
            <Users className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
            <p className="text-xs text-slate-500 mt-1">
              {stats?.totalInvoices || 0} total invoices
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Status Overview</CardTitle>
          <CardDescription>Summary of your invoices by status</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-slate-600">Paid</p>
                <p className="text-2xl font-bold">{stats?.paidInvoicesCount || 0}</p>
              </div>
            </div>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(stats?.paidAmount || 0)}
            </p>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-slate-600">Pending</p>
                <p className="text-2xl font-bold">{stats?.pendingInvoicesCount || 0}</p>
              </div>
            </div>
            <p className="text-lg font-semibold text-yellow-600">
              {formatCurrency(stats?.pendingAmount || 0)}
            </p>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-sm text-slate-600">Overdue</p>
                <p className="text-2xl font-bold">{stats?.overdueInvoicesCount || 0}</p>
              </div>
            </div>
            <p className="text-lg font-semibold text-red-600">
              {formatCurrency(stats?.overdueAmount || 0)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Your latest invoices and their status</CardDescription>
            </div>
            <Link href="/invoices">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentInvoices.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium">No invoices yet</p>
              <p className="text-xs mt-1 mb-4">Create your first invoice to start tracking payments</p>
              <Link href="/dashboard/invoices">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Go to Invoices
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold">{invoice.invoiceNumber}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.displayStatus)}`}>
                        {invoice.displayStatus}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{invoice.clientName}</p>
                    <p className="text-xs text-slate-500">
                      Due: {new Date(invoice.dueDate).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">{formatCurrency(invoice.total)}</p>
                    <Link href={`/dashboard/invoices/${invoice.id}`}>
                      <Button variant="ghost" size="sm" className="mt-1">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}