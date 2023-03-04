import mongoose from "mongoose";
/*********************TYPE & INTERFACE*****************************/

export enum STATUS {
  CART = 1,
  DELIVERY = 2,
  SUCCESSFULLY = 3,
  CANCEL = 4,
}

export enum PaymentType {
  CASH = 1,
  MOMO = 2,
  BANKING = 3,
}

export type ProductType = {
  product_id: mongoose.Types.ObjectId;
  name?: string;
  price?: number;
  color_id: mongoose.Types.ObjectId;
  size_id: mongoose.Types.ObjectId;
  quantity: number;
  image: string;
};

export interface IOrder extends mongoose.Document {
  code: string;
  total: number;
  user_id: mongoose.Types.ObjectId;
  products: ProductType[];
  order_type: STATUS;
  payment_type: string;
  voucher_type?: string;
  created_at: string;
  created_by: string;
  modify_at: string;
  modify_by: string;
}

/*******************************SCHEMA*****************************/

const orderSchema = new mongoose.Schema({
  code: { type: String },
  total: { type: Number },
  user_id: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  products: {
    type: [
      {
        product_id: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
        },
        name: { type: String },
        price: { type: Number },
        color_id: { type: mongoose.Types.ObjectId, ref: "MetaDataDetail" },
        size_id: { type: mongoose.Types.ObjectId, ref: "MetaDataDetail" },
        quantity: { type: Number },
        image: { type: String },
      },
    ],
  },
  order_type: {
    type: Number,
    enum: STATUS,
  },
  payment_type: {
    type: Number,
    enum: PaymentType,
  },
  voucher_type: { type: Number },
  created_at: { type: String },
  created_by: { type: String },
  modify_at: { type: String },
  modify_by: { type: String },
});

const Order = mongoose.model<IOrder>("Order", orderSchema);
export default Order;
