import { STATUS_PRODUCT } from "constants/product";
import { IModify, Modify } from "interfaces/basic";
import { IStock, Stock } from "interfaces/product";
import { Document, model, Schema } from "mongoose";

/*********************TYPE & INTERFACE*****************************/

export type IProduct = {
  name: string;
  price: number;
  price_sale: number;
  description: string;
  images: string[];
  stock: IStock[];
  status: STATUS_PRODUCT;
  categories: [];
  created_at: Date;
  created_by: string;
  modify: IModify[];
};

export type ProductTypeModel = IProduct & Document;

/*******************************SCHEMA*****************************/

const productSchema: Schema = new Schema({
  name: { type: String, require: true },
  price: { type: Number, require: true },
  price_sale: { type: Number, require: true },
  description: { type: String, require: true },
  images: { type: Array, require: true },
  stock: { type: [Stock], require: true },
  status: { type: String, enum: STATUS_PRODUCT, default: "inactive" },
  categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
  created_at: { type: String, require: true },
  created_by: { type: String, require: true },
  modify: { type: [Modify], require: true },
});

const Product = model<ProductTypeModel>("Product", productSchema);

export default Product;
