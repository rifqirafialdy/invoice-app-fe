'use client';

import { useState } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClientsList from '@/components/clients/ClientsList';
import ClientForm from '@/components/clients/ClientForm';
import type { Client } from '@/types/client';

type View = 'list' | 'create' | 'edit';

export default function ClientsPage() {
  const [view, setView] = useState<View>('list');
  const [selectedClient, setSelectedClient] = useState<Client | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAdd = () => {
    setSelectedClient(undefined);
    setView('create');
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setView('edit');
  };

  const handleSuccess = () => {
    setView('list');
    setSelectedClient(undefined);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancel = () => {
    setView('list');
    setSelectedClient(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {view !== 'list' && (
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {view === 'list' && 'Clients'}
              {view === 'create' && 'Add New Client'}
              {view === 'edit' && 'Edit Client'}
            </h1>
            <p className="text-slate-600 mt-1">
              {view === 'list' && 'Manage your client information'}
              {view === 'create' && 'Create a new client record'}
              {view === 'edit' && 'Update client information'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {view === 'list' && (
        <ClientsList
          onEdit={handleEdit}
          onAdd={handleAdd}
          refreshTrigger={refreshTrigger}
        />
      )}

      {(view === 'create' || view === 'edit') && (
        <div className="max-w-2xl">
          <div className="bg-white rounded-lg shadow p-6">
            <ClientForm
              client={selectedClient}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
}