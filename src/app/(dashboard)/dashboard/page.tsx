'use client';

import { useAuthStore } from '@/lib/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, TrendingUp, Clock, CheckCircle, FileText } from 'lucide-react';
import VerificationBanner from '@/components/dashboard/VerificationBanner';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8">
      <VerificationBanner/>
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
            <TrendingUp className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-slate-500 mt-1">No invoices yet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Pending</CardDescription>
            <Clock className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-slate-500 mt-1">0 invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Paid</CardDescription>
            <CheckCircle className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-slate-500 mt-1">0 invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Clients</CardDescription>
            <Plus className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-slate-500 mt-1">Add your first client</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/invoices/new" className="block">
              <Button className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Create New Invoice
              </Button>
            </Link>
            <Link href="/dashboard/clients/new" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Add New Client
              </Button>
            </Link>
            <Link href="/dashboard/products/new" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Add New Product
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">No recent activity</p>
              <p className="text-xs mt-1">Create your first invoice to get started</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Your latest invoices and their status</CardDescription>
            </div>
            <Link href="/dashboard/invoices">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium">No invoices yet</p>
            <p className="text-xs mt-1 mb-4">Create your first invoice to start tracking payments</p>
            <Link href="/dashboard/invoices/new">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}