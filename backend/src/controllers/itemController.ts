import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { BadRequestError } from "../errors/badRequest-error";
import { Item } from "../models/itemsModel";

const createItem = asyncHandler(async (req: Request, res: Response) => {
    console.log(req.body)
    const {
        itemSKU,
        itemName,
        itemDescription,
        itemCategory,
        costPrice,
        unitPrice,
        quantity,
        style,
        storeCode,
        size,
        vendor,
        eglId,
        location,
        customText1,
        customText3,
        metal,
        department,
        itemCode,
        vendorStyle,
        agsId,
        giaId,
        customText2,
        customFloat,
        sold,
        soldDate,
        soldPrice
    } = req.body;


    const execistingItem = await Item.findOne({ itemSKU });

    if (execistingItem) {
        throw new BadRequestError("Item already exists with this SKU");
    }

    const item = Item.build({
        itemSKU,
        itemName,
        itemDescription,
        itemCategory,
        costPrice,
        unitPrice,
        quantity,
        style,
        storeCode,
        size,
        vendor,
        eglId,
        location,
        customText1,
        customText3,
        metal,
        department,
        itemCode,
        vendorStyle,
        agsId,
        giaId,
        customText2,
        customFloat,
        sold,
        soldDate,
        soldPrice
    });

    await item.save();

    res.status(201).send(item);
});

const getItems = asyncHandler(async (req: Request, res: Response) => {
    const items = await Item.find({})
        .populate('itemCategory', 'name')
        .sort({ itemName: 1 });

    if (!items || items.length === 0) {
        throw new BadRequestError("No items found");
    } else {
        res.status(200).send(items);
    }

});

const updateItem = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const {
        itemSKU,
        itemName,
        itemDescription,
        itemCategory,
        costPrice,
        unitPrice,
        quantity,
        style,
        storeCode,
        size,
        vendor,
        eglId,
        location,
        customText1,
        customText3,
        metal,
        department,
        itemCode,
        vendorStyle,
        agsId,
        giaId,
        customText2,
        customFloat,
        sold,
        soldDate,
        soldPrice
    } = req.body;

    // Check for duplicate itemSKU (excluding the current item)
    const existingItemWithSKU = await Item.findOne({ itemSKU, _id: { $ne: id } });
    if (existingItemWithSKU) {
        throw new BadRequestError("Another item already exists with this SKU");
    }

    const item = await Item.findByIdAndUpdate(id, {

        itemName,
        itemDescription,
        itemCategory,
        costPrice,
        unitPrice,
        quantity,
        style,
        storeCode,
        size,
        vendor,
        eglId,
        location,
        customText1,
        customText3,
        metal,
        department,
        itemCode,
        vendorStyle,
        agsId,
        giaId,
        customText2,
        customFloat,
        sold,
        soldDate,
        soldPrice
    }, { new: true, runValidators: true });

    if (!item) {
        throw new BadRequestError("Item not found");
    }

    res.status(200).send(item);
});

/**
 * Deletes an item by its ID.
 * @param req - Express request object, expects 'id' parameter in the URL.
 * @param res - Express response object.
 */
const deleteItem = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const item = await Item.findByIdAndDelete(id);
    if (!item) {
        throw new BadRequestError("Item not found");
    }

    res.status(204).end();
});


export { createItem, getItems, updateItem, deleteItem };