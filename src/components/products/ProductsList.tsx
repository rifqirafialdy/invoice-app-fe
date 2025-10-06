'use client';

import { useState, useEffect,useMemo } from 'react';
import { useProductStore } from '@/lib/stores/productStore';
import { useListFilters } from '@/hooks/useListFilters';
import { ListFilters } from '@/components/common/ListFilters';
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
import { Pencil, Trash2 } from 'lucide-react';
import { ProductType, type Product } from '@/types/product';
import { useSearchParams } from 'next/navigation';

interface ProductsListProps {
  onEdit: (product: Product) => void;
  onAdd: () => void;
  refreshTrigger?: number;
}

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'price', label: 'Price' },
  { value: 'createdAt', label: 'Date Created' },
];

export default function ProductsList({ onEdit, onAdd, refreshTrigger }: ProductsListProps) {
  const searchParams = useSearchParams();
  const [typeFilter, setTypeFilter] = useState<string>(searchParams.get('type') || 'ALL');
  
  const additionalFilters = useMemo(() => ({
    type: typeFilter,
  }), [typeFilter]);
  
  const filters = useListFilters({
    additionalFilters: additionalFilters 
  });
  
  const { products, totalPages, loading, fetchProducts, deleteProduct, invalidateCache } = useProductStore();

  useEffect(() => {
    fetchProducts(
      filters.page,
      filters.sortBy,
      filters.sortDir,
      filters.debouncedSearch,
      typeFilter
    );
  }, [filters.page, filters.sortBy, filters.sortDir, filters.debouncedSearch, typeFilter]);

  useEffect(() => {
    if (refreshTrigger) {
      invalidateCache();
      fetchProducts(
        filters.page,
        filters.sortBy,
        filters.sortDir,
        filters.debouncedSearch,
        typeFilter
      );
    }
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteProduct(id);
      fetchProducts(
        filters.page,
        filters.sortBy,
        filters.sortDir,
        filters.debouncedSearch,
        typeFilter
      );
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleReset = () => {
    filters.reset();
    setTypeFilter('ALL');
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
        addLabel="Add Product"
        sortOptions={SORT_OPTIONS}
      >
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value={ProductType.PRODUCT}>Product</SelectItem>
            <SelectItem value={ProductType.SERVICE}>Service</SelectItem>
          </SelectContent>
        </Select>
      </ListFilters>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {product.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(product.price)}
                  </TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(product)} className="mr-2">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
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
    </div>
  );
}