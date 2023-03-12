import { IModify, Modify } from "interfaces/basic";
import { Document, model, Schema } from "mongoose";

/*********************TYPE & INTERFACE*****************************/

export type ISize = {
  _id?: string;
  name: string;
  size: string;
  created_at: string;
  created_by: string;
  modify: IModify[];
};

export type SizeTypeModel = ISize & Document;

/*******************************SCHEMA*****************************/

const sizeSchema: Schema = new Schema({
  name: { type: String, require: true },
  size: { type: String, require: true },
  created_at: { type: String, require: true },
  created_by: { type: String, require: true },
  modify: { type: [Modify], require: true },
});

const Size = model<SizeTypeModel>("Size", sizeSchema);

export default Size;
