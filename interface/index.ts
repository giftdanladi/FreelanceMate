import { Timestamp } from "firebase/firestore";

export interface IInvoice {
  id?: string;
  userId: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  amount: string;
  tax: string;
  total: string;
  dueDate: string | Timestamp | Date;
  note: string;
  items: string;
  status: "paid" | "pending" | "overdue";
  createdAt?: Date | Timestamp;
}

export interface IExpense {
  id?: string;
  userId: string;
  amount: string;
  description: string;
  category: string;
  date: string;
}

export interface IUser {
  id?: string;
  fullname: string;
  email: string;
  business: string;
  contactPhone: string;
  contactAddress: string;
  password: string;
  createdAt?: string;
}

export interface IConversation {
  id?: string;
  userId: string;
  prompt: string;
  response: string;
  createdAt?: string;
}