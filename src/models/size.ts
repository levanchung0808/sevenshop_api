import { Document, model, Schema } from "mongoose";

/*********************TYPE & INTERFACE*****************************/

export type ISize = {
  _id: string;
  name: string;
  size: string;
};

export type SizeTypeModel = ISize & Document;

/*******************************SCHEMA*****************************/

const sizeSchema: Schema = new Schema({
  name: { type: String, require: true },
  code: { type: String, require: true },
});

const Size = model<SizeTypeModel>("Size", sizeSchema);

export default Size;
