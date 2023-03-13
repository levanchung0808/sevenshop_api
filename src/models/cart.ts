import { IModify, Modify } from "interfaces/basic";
import { IProductCart, ProductCart } from "interfaces/cart";
import { Document, model, Schema } from "mongoose";

/*********************TYPE & INTERFACE*****************************/

export type ICart = {
  user_id: string;
  products: IProductCart[];
  created_at: string;
  created_by: string;
  modify: IModify[];
};

export type CartTypeModel = ICart & Document;

/*******************************SCHEMA*****************************/

const cartSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  products: { type: [ProductCart], required: true },
  created_at: { type: String, require: true },
  created_by: { type: String, require: true },
  modify: { type: [Modify], require: true },
});

const Cart = model<CartTypeModel>("Cart", cartSchema);
export default Cart;
