import mongoose from "mongoose";
import dayjs from 'dayjs';

interface ClockingAttrs {
    employeeId: mongoose.Types.ObjectId;
    clockRecords: Array<{
        clockInTime: Date;
        clockOutTime: Date | null;
        totalHours: number;
    }>;
}

interface ClockingDoc extends mongoose.Document {
    employeeId: mongoose.Types.ObjectId;
    clockRecords: Array<{
        clockInTime: Date;
        clockOutTime: Date | null;
        totalHours: number;
    }>;
}

interface ClockingModel extends mongoose.Model<ClockingDoc> {
    build(attrs: ClockingAttrs): ClockingDoc;
}

const clockingSchema = new mongoose.Schema(
    {
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        clockRecords: {
            type: [{
                clockInTime: Date,
                clockOutTime: Date,
                totalHours: Number
            }],
            required: true,
            default: []
        }
    },
    {
        toJSON: {
            virtuals: true,
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            }
        }
    }
);

clockingSchema.statics.build = (attrs: ClockingAttrs) => {
    return new Clocking(attrs);
};

const Clocking = mongoose.model<ClockingDoc, ClockingModel>('Clocking', clockingSchema);

export { Clocking };
