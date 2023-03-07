import { Schema, model, Document } from "mongoose";
import User from "models/user";
import { IModify, Modify } from "interfaces/basic";

/*********************TYPE & INTERFACE*****************************/

export type NotificationType = {
  id: string;
  title: string;
  body: string;
  image: string;
  from_user_id: string;
  to_user_id: string[];
  created_at: string;
  created_by: string;
  modify: IModify[];
};

export type NotificationTypeModel = NotificationType & Document;

/*******************************SCHEMA*****************************/

export const notificationSchema = new Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  image: { type: String, required: true },
  from_user_id: { type: Schema.Types.ObjectId, ref: User },
  to_user_id: [{ type: Schema.Types.ObjectId, ref: User }],
  created_at: { type: String, require: true },
  created_by: { type: String, require: true },
  modify: { type: [Modify], require: true },
});

const Notification = model<NotificationTypeModel>(
  "Notification",
  notificationSchema
);

export default Notification;
