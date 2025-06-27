import mongoose from "mongoose";

export interface PolicyAttrs {
    title: string;
    description: string;
}

export interface PolicyDoc extends mongoose.Document {
    title: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

interface PolicyModel extends mongoose.Model<PolicyDoc> {
    build(attrs: PolicyAttrs): PolicyDoc;
}

// 4. Define schema
const policySchema = new mongoose.Schema<PolicyDoc>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            },
        },
    }
);

policySchema.statics.build = (attrs: PolicyAttrs) => {
    return new Policy(attrs);
};

const Policy = mongoose.model<PolicyDoc, PolicyModel>("Policy", policySchema);

export { Policy };
