import Color, { IColor } from "models/color";
import { Request, Response } from "express";
import User from "models/user";
import { getNow, updateFieldIfNew } from "utils/common";
import { getIdFromReq } from "utils/token";

const updateColor = async (req: Request, res: Response) => {
  try {
    const id_user = getIdFromReq(req);
    const { id } = req.params;
    const user = await User.findById(id_user);
    const { name, code }: IColor = req.body;
    if (!name || !code) {
      return res.status(400).json({ message: "Missing name, code" });
    }
    const color = await Color.findById(id);
    if (!color) {
      return res.sendStatus(404);
    }
    if (!user) {
      return res.sendStatus(403);
    }
    if (color.name === name && color.code === code) {
      return res.sendStatus(304);
    }
    const newColor: IColor = {
      ...color,
    };
    updateFieldIfNew(newColor, "name", name);
    updateFieldIfNew(newColor, "code", code);
    newColor.modify.push({
      action: `Update by ${user.email}`,
      date: getNow(),
    });
    await Object.assign(color, newColor);
    await color.save();
    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default updateColor;
