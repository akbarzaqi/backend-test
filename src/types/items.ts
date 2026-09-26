import { Decimal } from '@prisma/client/runtime/library';

export interface Item {
  id?: number;
  userId: number;
  name: string;
  description?: string | null; 
  stock: number;
  price: number | Decimal;
  createdAt?: Date;
  updatedAt?: Date;
}