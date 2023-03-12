import { Request, Response } from "express";
import Color, { IColor } from "models/color";
import User from "models/user";
import { getNow, validateFields } from "utils/common";
import { getIdFromReq } from "utils/token";

const updateColor = async (req: Request, res: Response) => {
  try {
    const id_user = getIdFromReq(req);
    const { id } = req.params;
    const user = await User.findById(id_user);
    const { name, code }: IColor = req.body;
    const color = await Color.findById(id);

    if (!color) return res.sendStatus(404);
    if (!user) return res.sendStatus(403);

    const validateFieldsResult = validateFields({ name, code }, [
      { name: "name", type: "string", required: true },
      { name: "code", type: "string", required: true },
    ]);
    if (validateFieldsResult)
      return res.status(400).json({ message: validateFieldsResult });

    const existingColor = await Color.findOne({
      $and: [{ _id: { $ne: color._id } }, { $or: [{ name }, { code }] }],
    });
    if (existingColor) {
      const message = `Color ${
        existingColor.name === name ? `name '${name}'` : ""
      }${
        existingColor.code === code
          ? `${existingColor.name === name ? " and " : ""}code '${code}'`
          : ""
      } already exists`;
      return res.status(409).json({ message });
    }

    const fieldsEdited = [];
    if (name !== color.name) fieldsEdited.push("name");
    if (code !== color.code) fieldsEdited.push("code");

    if (!fieldsEdited.length) return res.sendStatus(304);

    const newColor: IColor = {
      ...color.toObject(),
      name: name ?? color.name,
      code: code ?? color.code,
      modify: [
        ...color.modify,
        {
          action: `Update fields: ${fieldsEdited.join(", ")} by ${user.email}`,
          date: getNow(),
        },
      ],
    };

    await color.updateOne(newColor);
    return res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default updateColor;
