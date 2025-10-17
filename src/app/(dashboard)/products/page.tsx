'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductsList from '@/components/products/ProductsList';
import ProductForm from '@/components/products/ProductForm';
import type { Product } from '@/types/product';

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setActiveTab('edit');
  };

  const handleAdd = () => {
    setSelectedProduct(undefined);
    setActiveTab('create');
  };

  const handleSuccess = () => {
    setActiveTab('list');
    setSelectedProduct(undefined);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancel = () => {
    setActiveTab('list');
    setSelectedProduct(undefined);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Products</h1>
        <p className="text-slate-600 mt-2">Manage your products and services</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">All Products</TabsTrigger>
          <TabsTrigger value="create">Create Product</TabsTrigger>
          {selectedProduct && <TabsTrigger value="edit">Edit Product</TabsTrigger>}
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <ProductsList 
            onEdit={handleEdit} 
            onAdd={handleAdd}
            refreshTrigger={refreshTrigger}
          />
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold mb-6">Create New Product</h2>
            <ProductForm onSuccess={handleSuccess} onCancel={handleCancel} />
          </div>
        </TabsContent>

        {selectedProduct && (
          <TabsContent value="edit" className="mt-6">
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold mb-6">Edit Product</h2>
              <ProductForm 
                product={selectedProduct}
                onSuccess={handleSuccess} 
                onCancel={handleCancel} 
              />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}