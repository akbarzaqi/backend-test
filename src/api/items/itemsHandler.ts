import autoBind from "auto-bind";

import type { Request, Response } from "express";

class ItemsHandler {
    private _itemService: any;
    private _createItemValidator: any;
    
    constructor(itemService: any, createItemValidator: any) {
        this._itemService = itemService;
        this._createItemValidator = createItemValidator;
        autoBind(this);
    }

    async postItemHandler(req: Request, res: Response) {
        try {
            this._createItemValidator.validateItemPayload(req.body);
            const { userId, name, description, stock, price } = req.body;
            console.log("Request body:", req.body);
            const newItem = await this._itemService.createItem({ userId, name, description, stock, price });
            
            return res.status(201).json({
                status: "success",
                message: "Item created successfully",
                data: {
                    item: newItem,
                },
            });
        } catch (error: any) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unknown error";

            return res.status(400).json({
                status: "fail", 
                message: `Failed to create item: ${message}`,
            });
        }  
    }

    async getItemByNameHandler(req: Request, res: Response) {
        try {
            const { search } = req.query;

            console.log("Search query parameter:", search);
              
            if (typeof search !== 'string') {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Search query parameter is required and must be a string',
                });
            }

            const item = await this._itemService.getItemByName(search);

            if (!item) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'Item not found',
                });
            }

            return res.status(200).json({
                status: 'success',
                data: {
                    item,
                },
            });
        }catch (error: any) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unknown error";

            return res.status(400).json({
                status: "fail", 
                message: `Failed to retrieve item: ${message}`,
            });
        }
    }

    async putItemHandler(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { userId, name, description, stock, price } = req.body;

            console.log("Item ID for update:", id);
            console.log("Request body for update:", req.body);

            this._createItemValidator.validateItemPayload(req.body);

            const updatedItem = await this._itemService.updateItem(Number(id), { userId, name, description, stock, price });

            return res.status(200).json({
                status: "success",
                message: "Item updated successfully",
                data: {
                    item: updatedItem,
                },
            });


        }catch (error: any) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unknown error";

            return res.status(400).json({
                status: "fail", 
                message: `Failed to update item: ${message}`,
            });
        }
    }

    async deleteItemHandler(req: Request, res: Response) {
        try {
            const { id } = req.params;

            console.log("Item ID for deletion:", id);

            const deletedItem = await this._itemService.deleteItem(Number(id));

            return res.status(200).json({
                status: "success",
                message: "Item deleted successfully",
            });

        }catch (error: any) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unknown error";

            return res.status(400).json({
                status: "fail", 
                message: `Failed to delete item: ${message}`,
            });
        }
    }

}

export { ItemsHandler };