import { Request, Response } from "express";
import Color, { IColor } from "models/color";
import User from "models/user";
import { getNow } from "utils/common";
import { getIdFromReq } from "utils/token";

const createColor = async (req: Request, res: Response) => {
  try {
    const id_user = getIdFromReq(req);
    const user = await User.findById(id_user);
    const { name, code }: IColor = req.body;
    if (!name || !code) {
      return res.status(400).json({ message: "Missing name, code" });
    }
    if (!user) {
      return res.sendStatus(403);
    }
    const newColor: IColor = {
      name: name,
      code: code,
      created_at: getNow(),
      created_by: `${user?.email}`,
      modify: [],
    };
    newColor.modify.push({
      action: `Create by ${user.email}`,
      date: getNow(),
    });
    const color = new Color (newColor);
    await color.save();
    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default createColor;
