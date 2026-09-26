import { PrismaClient } from '@prisma/client';
import { type Item } from '../types/items.ts';

const prisma = new PrismaClient();

class ItemService {
    constructor() {}

    async createItem(item: { userId: number; name: string; description?: string | null; stock: number; price: number }): Promise<Item> {
        const newItem = await prisma.item.create({
            data: {
                userId: item.userId,
                name: item.name,
                description: item.description,
                stock: item.stock,
                price: item.price,
            },
        });
        
        return newItem;
        
    }

    async getItemByName(name: string): Promise<Item | null> {
        const item = await prisma.item.findFirst({
            where: {
                name: name,
            },
        });
        console.log("Retrieved item:", item);
        return item;
    }

    async updateItem(id: number, updatedFields: Partial<Item>): Promise<Item> {
        const updatedItem = await prisma.item.update({
            where: { id },
            data: updatedFields,
        });
        return updatedItem;
    }

    async deleteItem(id: number): Promise<Item> {
        const deletedItem = await prisma.item.delete({
            where: { id },
        });
        return deletedItem;
    }

}

export { ItemService };