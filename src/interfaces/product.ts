import { Schema } from "mongoose";

export type IStock = {
  size_id: string;
  color_id: string;
  quantity: number;
};

export const Stock = {
  size_id: { type: Schema.Types.ObjectId, ref: "Size" },
  color_id: { type: Schema.Types.ObjectId, ref: "Color" },
  quantity: Number,
};
