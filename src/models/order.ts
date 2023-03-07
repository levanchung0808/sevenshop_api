import { PAYMENT_TYPE, STATUS_ORDER } from "constants/order";
import { IModify, Modify } from "interfaces/basic";
import { IProductOrder, ProductOrder } from "interfaces/order";
import { Document, model, Schema } from "mongoose";

/*********************TYPE & INTERFACE*****************************/

export type IOrder = {
  user_id: string;
  products: IProductOrder;
  payment_type: PAYMENT_TYPE;
  status: STATUS_ORDER;
  vouchers: string[];
  created_at: string;
  created_by: string;
  modify: IModify[];
};

export type OrderTypeModel = IOrder & Document;

/*******************************SCHEMA*****************************/

const orderSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  products: { type: [ProductOrder], required: true },
  payment_type: { type: String, required: true },
  status: { type: String, required: true },
  vouchers: { type: [String], required: true },
  created_at: { type: String, require: true },
  created_by: { type: String, require: true },
  modify: { type: [Modify], require: true },
});

const Order = model<OrderTypeModel>("Order", orderSchema);
export default Order;
