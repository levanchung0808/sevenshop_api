import { Schema } from "mongoose";

export type IProductCart = {
  product_id: string;
  quantity: number;
  size_id: string;
  color_id: string;
};

export const ProductCart = {
  product_id: { type: Schema.Types.ObjectId, ref: "Product" },
  quantity: Number,
  size_id: { type: Schema.Types.ObjectId, ref: "Size" },
  color_id: { type: Schema.Types.ObjectId, ref: "Color" },
};
