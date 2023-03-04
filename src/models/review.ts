import { Schema, model, Document } from "mongoose";
import User from "models/user";
import Product from "models/product";

/*********************TYPE & INTERFACE*****************************/

export type ReviewType = {
  id: string;
  content: string;
  rating: number;
  user_id: string;
  product_id: string;
  created_at: Date;
  created_by: string;
  modify_at: Date;
  modify_by: string;
};

export type ReviewTypeModel = {} & ReviewType & Document;

/*******************************SCHEMA*****************************/

const reviewSchema = new Schema({
  content: { type: String, require: true },
  rating: { type: Number, require: true },
  user_id: { type: Schema.Types.ObjectId, ref: User },
  product_id: { type: Schema.Types.ObjectId, ref: Product },
  created_at: { type: Date, require: true },
  created_by: { type: String, require: true },
  modify_at: { type: Date, require: true },
  modify_by: { type: String, require: true },
});

const Review = model<ReviewTypeModel>("Review", reviewSchema);

export default Review;
