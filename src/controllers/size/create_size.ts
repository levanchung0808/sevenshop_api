import { Request, Response } from "express";
import Size, { ISize } from "models/size";
import User from "models/user";
import { getNow } from "utils/common";
import { getIdFromReq } from "utils/token";

const createSize = async (req: Request, res: Response) => {
  try {
    const id_user = getIdFromReq(req);
    const user = await User.findById(id_user);
    const { name, size }: ISize = req.body;
    if (!name || !size) {
      return res.status(400).json({ message: "Missing name, size" });
    }
    if (!user) {
      return res.sendStatus(403);
    }
    const newSize: ISize = {
      name: name,
      size: size,
      created_at: getNow(),
      created_by: `${user?.email}`,
      modify: [],
    };
    newSize.modify.push({
      action: `Create by ${user.email}`,
      date: getNow(),
    });
    const size_save = new Size(newSize);
    await size_save.save();
    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default createSize;
