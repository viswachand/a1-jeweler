import mongoose from "mongoose";
// import { Password } from "../services/password";

export interface UserAttrs {
    name: string;
    userID: number;
    password: number;
    admin: boolean;
}


interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc;
}

interface UserDoc extends mongoose.Document {
    name: string;
    userID: number;
    password: number;
    admin: boolean;
}

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        userID: {
            type: Number,
            required: true,
            unique: true
        },
        password: {
            type: Number,
            required: true
        },
        admin: {
            type: Boolean,
            default: false
        }
    },
    {
        toJSON: {
            virtuals: true,
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                delete ret.password;
            }
        }
    }
);

// userSchema.pre('save', async function (done) {
//     if (this.isModified('password')) {
//         const hashed = await Password.toHash(this.get('password'));
//         this.set('password', hashed);
//     }
//     done();
// });

userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
