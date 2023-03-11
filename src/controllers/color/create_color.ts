import { Request, Response } from "express";
import Color, { IColor } from "models/color";
import User from "models/user";
import { getNow, validateFields } from "utils/common";
import { getIdFromReq } from "utils/token";

const createColor = async (req: Request, res: Response) => {
  try {
    const id_user = getIdFromReq(req);
    const user = await User.findById(id_user);
    const { name, code }: IColor = req.body;
    const validateFieldsResult = validateFields({ name, code }, [
      { name: "name", type: "string" },
      { name: "code", type: "string" },
    ]);
    if (validateFieldsResult) {
      return res.status(400).json({ message: validateFieldsResult });
    }
    const existingColor = await Color.findOne({ $or: [{ name }, { code }] });
    if (existingColor) {
      let message = "Color";
      if (existingColor.name === name) {
        message += ` name '${name}' already exists`;
      }
      if (existingColor.code === code) {
        message += ` code '${code}' already exists`;
      }
      return res.status(409).json({ message });
    }
    const newColor: IColor = {
      name: name,
      code: code,
      created_at: getNow(),
      created_by: `${user?.email}`,
      modify: [{ action: `Create by ${user?.email}`, date: getNow() }],
    };
    const color = new Color(newColor);
    await color.save();
    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default createColor;
