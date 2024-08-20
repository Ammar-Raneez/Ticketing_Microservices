import mongoose from 'mongoose';

// User properties
interface UserAttrs {
  email: string;
  password: string;
}

// User Document properties (MongoDB adds createdAt, updatedAt etc)
interface UserDoc extends mongoose.Document, UserAttrs {}

// User Model properties
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true }
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
}

// Enfore user typing
export const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

