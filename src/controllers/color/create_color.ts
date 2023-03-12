import { Request, Response } from "express";
import Color, { IColor } from "models/color";
import User from "models/user";
import { getNow, validateFields } from "utils/common";
import { getIdFromReq } from "utils/token";

const createColor = async (req: Request, res: Response) => {
  try {
    const { name, code }: IColor = req.body;
    const validateFieldsResult = validateFields({ name, code }, [
      { name: "name", type: "string", required: true },
      { name: "code", type: "string", required: true },
    ]);
    if (validateFieldsResult)
      return res.status(400).json({ message: validateFieldsResult });

    const user = await User.findById(getIdFromReq(req));
    if (!user) return res.sendStatus(403);

    const existingColor = await Color.findOne({ $or: [{ name }, { code }] });
    if (existingColor) {
      const message = `Color ${
        existingColor.name === name ? `name '${name}'` : ""
      } ${existingColor.code === code ? `code '${code}'` : ""} already exists`;
      return res.status(409).json({ message });
    }

    const color = new Color({
      name,
      code,
      created_at: getNow(),
      created_by: user.email,
      modify: [{ action: `Create by ${user?.email}`, date: getNow() }],
    });
    await color.save();
    return res.status(201).json({ id: color._id });
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default createColor;
