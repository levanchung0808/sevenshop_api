import { Request, Response } from "express";
import Size, { ISize } from "models/size";
import User from "models/user";
import { getNow, updateFieldIfNew } from "utils/common";
import { getIdFromReq } from "utils/token";

const updateSize = async (req: Request, res: Response) => {
  try {
    const id_user = getIdFromReq(req);
    const { id } = req.params;
    const user = await User.findById(id_user);
    const { name, size }: ISize = req.body;
    if (!name || !size) {
      return res.status(400).json({ message: "Missing name, size" });
    }
    const size_old = await Size.findById(id);
    if (!size_old) {
      return res.sendStatus(404);
    }
    if (!user) {
      return res.sendStatus(403);
    }
    if (size_old.name === name && size_old.size === size) {
      return res.sendStatus(304);
    }
    const newSize: ISize = {
      ...size_old,
    };
    updateFieldIfNew(newSize, "name", name);
    updateFieldIfNew(newSize, "size", size);
    newSize.modify.push({
      action: `Update by ${user.email}`,
      date: getNow(),
    });
    await Object.assign(size_old, newSize);
    await size_old.save();
    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default updateSize;
