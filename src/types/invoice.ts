export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE',
  DUE = 'DUE',
  CANCELLATION_REQUESTED = 'CANCELLATION_REQUESTED', 
  PAYMENT_PENDING = 'PAYMENT_PENDING' 
}

export interface InvoiceItem {
  id?: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice?: number;
  total?: number;
}

export interface InvoiceRequest {
  clientId: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: {
    productId: string;
    quantity: number;
  }[];
  taxRate: number;
  notes?: string;
  isRecurring?: boolean;
  recurringFrequency?: string;             
}

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  displayStatus: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  isRecurring?: boolean;                    
  recurringFrequency?: string;              
  nextGenerationDate?: string;              
  createdAt: string;
  updatedAt: string;
}

export interface InvoicesResponse {
  content: Invoice[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
export interface PublicInvoiceResponse {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: string;
  displayStatus: string;
  companyName: string;
  companyEmail: string;
  companyPhone?: string;
  companyAddress?: string;
  companyLogoUrl?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  items: PublicInvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
}

export interface PublicInvoiceItem {
  productName: string;
  productDescription?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}