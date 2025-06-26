import mongoose from 'mongoose';

interface ItemAttrs {
    itemSKU: string;
    itemName: string;
    itemDescription: string;
    itemCategory: string;
    costPrice: number;
    unitPrice: number;
    quantity: number;

    style?: string;
    storeCode?: string;
    size?: string;
    vendor?: string;
    eglId?: string;
    location?: string;
    customText1?: string;
    customText3?: string;

    metal?: string;
    department?: string;
    itemCode?: string;
    vendorStyle?: string;
    agsId?: string;
    giaId?: string;
    customText2?: string;
    customFloat?: number;

    sold?: boolean;
    soldDate?: Date;
    soldPrice?: number;
}

interface ItemDoc extends mongoose.Document, ItemAttrs { }

interface ItemModel extends mongoose.Model<ItemDoc> {
    build(attrs: ItemAttrs): ItemDoc;
}

const itemSchema = new mongoose.Schema(
    {
        itemSKU: { type: String, required: true },
        itemName: { type: String, required: true },
        itemDescription: { type: String, required: true },
        itemCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },
        costPrice: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        quantity: { type: Number, required: true },

        style: { type: String },
        storeCode: { type: String },
        size: { type: String },
        vendor: { type: String },
        eglId: { type: String },
        location: { type: String },
        customText1: { type: String },
        customText3: { type: String },

        metal: { type: String },
        department: { type: String },
        itemCode: { type: String },
        vendorStyle: { type: String },
        agsId: { type: String },
        giaId: { type: String },
        customText2: { type: String },
        customFloat: { type: Number, default: 0 },
        sold: { type: Boolean, default: false },
        soldDate: { type: Date },
        soldPrice: { type: Number, default: 0 }
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            },
        },
    }
);

itemSchema.statics.build = (attrs: ItemAttrs) => {
    return new Item(attrs);
};

const Item = mongoose.model<ItemDoc, ItemModel>('Item', itemSchema);

export { Item };
