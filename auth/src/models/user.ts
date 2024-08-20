import mongoose from 'mongoose';

import { Password } from '../services/password';

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

userSchema.pre('save', async function (done) {
  // "this" is preserved only in regular functions, not arrow functions
  // Therefore, in this case this refers to the current user document
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }

  done();
});

// Enfore user typing
export const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

