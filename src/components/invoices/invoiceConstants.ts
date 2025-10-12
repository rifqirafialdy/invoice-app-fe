export const SORT_OPTIONS = [
  { value: 'invoiceNumber', label: 'Invoice Number' },
  { value: 'issueDate', label: 'Issue Date' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'total', label: 'Total Amount' },
  { value: 'createdAt', label: 'Date Created' },
];

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'PAID': return 'bg-green-100 text-green-800';
    case 'SENT': return 'bg-blue-100 text-blue-800';
    case 'DUE': return 'bg-yellow-100 text-yellow-800';
    case 'OVERDUE': return 'bg-red-100 text-red-800';
    case 'DRAFT': return 'bg-gray-100 text-gray-800';
    case 'CANCELLED': return 'bg-slate-100 text-slate-800';
    case 'CANCELLATION_REQUESTED': return 'bg-orange-100 text-orange-800';
    case 'PAYMENT_PENDING': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const isReadyToGenerate = (nextDateString?: string) => {
  if (!nextDateString) return false;
  const nextDate = new Date(nextDateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate <= today;
};

export const needsApproval = (status: string) => {
  return status === 'CANCELLATION_REQUESTED' || status === 'PAYMENT_PENDING';
};