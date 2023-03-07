import { IModify, Modify } from "interfaces/basic";
import { Document, model, Schema } from "mongoose";

/*********************TYPE & INTERFACE*****************************/

export type IColor = {
  _id?: string;
  name: string;
  code: string;
  created_at: string;
  created_by: string;
  modify: IModify[];
};

export type ColorTypeModel = IColor & Document;

/*******************************SCHEMA*****************************/

const colorSchema: Schema = new Schema({
  name: { type: String, require: true },
  code: { type: String, require: true },
  created_at: { type: String, require: true },
  created_by: { type: String, require: true },
  modify: { type: [Modify], require: true },
});

const Color = model<ColorTypeModel>("Color", colorSchema);

export default Color;
