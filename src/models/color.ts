import { Document, model, Schema } from "mongoose";

/*********************TYPE & INTERFACE*****************************/

export type IColor = {
  _id: string;
  name: string;
  code: string;
};

export type ColorTypeModel = IColor & Document;

/*******************************SCHEMA*****************************/

const colorSchema: Schema = new Schema({
  name: { type: String, require: true },
  code: { type: String, require: true },
});

const Color = model<ColorTypeModel>("Color", colorSchema);

export default Color;
