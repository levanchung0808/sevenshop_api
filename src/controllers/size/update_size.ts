import { Request, Response } from "express";
import Size, { ISize } from "models/size";
import User from "models/user";
import { getNow } from "utils/common";
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
    const newSize: ISize = {
      ...size_old,
      name: name ?? size_old.name,
      size: size ?? size_old.size,
      modify: [
        ...size_old.modify,
        { action: `Update by ${user.email}`, date: getNow() },
      ],
    };
    if (JSON.stringify(newSize) === JSON.stringify(size_old))
      return res.sendStatus(304);
    await Object.assign(size_old, newSize);
    await size_old.save();
    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default updateSize;
