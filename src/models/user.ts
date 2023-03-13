import { GENDER, ROLE, STATUS_USER } from "constants/user";
import { IModify, IOTP, Modify, OTP } from "interfaces/basic";
import { Address, IAddress, IMembership, Membership } from "interfaces/user";
import Product from "models/product";
import { Schema, model, Document } from "mongoose";

/*********************TYPE & INTERFACE*****************************/

export type IUser = {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  avatar: string;
  cover_image: string;
  gender: GENDER;
  birthday: string;
  addresses: IAddress[];
  status: STATUS_USER;
  product_favorites: [];
  recent_products: [];
  otp: IOTP;
  access_token: string;
  refresh_token: string;
  role: ROLE;
  membership: IMembership;
  cart_id: string;
  orders: string[];
  history_search: string[];
  created_at: string;
  created_by: string;
  modify: IModify[];
};

export type UserTypeModel = IUser & Document;

/*******************************SCHEMA*****************************/

export const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String },
  full_name: { type: String },
  phone: { type: String },
  avatar: { type: String },
  cover_image: { type: String },
  gender: { type: String, enum: GENDER },
  birthday: { type: String },
  addresses: [Address],
  status: { type: String, enum: STATUS_USER, default: STATUS_USER.pending },
  product_favorites: [{ type: Schema.Types.ObjectId, ref: Product }],
  recent_products: [{ type: Schema.Types.ObjectId, ref: Product }],
  otp: { type: OTP, default: {} },
  access_token: { type: String },
  refresh_token: { type: String },
  role: { type: String, default: "user" },
  membership: { type: Membership, default: {} },
  cart_id: { type: Schema.Types.ObjectId, ref: "Cart" },
  orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
  history_search: [{ type: String }],
  created_at: { type: String },
  created_by: { type: String },
  modify: [Modify],
});

const User = model<UserTypeModel>("User", userSchema);

export default User;
