import { Request, Response } from "express";
import Color, { IColor } from "models/color";
import Size, { ISize } from "models/size";
import User from "models/user";
import { getNow, validateFields } from "utils/common";
import { getIdFromReq } from "utils/token";

const updateSize = async (req: Request, res: Response) => {
  try {
    const id_user = getIdFromReq(req);
    const { id } = req.params;
    const user = await User.findById(id_user);
    const { name, size }: ISize = req.body;
    const currentSize = await Size.findById(id);

    if (!currentSize) return res.sendStatus(404);
    if (!user) return res.sendStatus(403);

    const validateFieldsResult = validateFields({ name, size }, [
      { name: "name", type: "string", required: true },
      { name: "size", type: "string", required: true },
    ]);
    if (validateFieldsResult)
      return res.status(400).json({ message: validateFieldsResult });

    const existingSize = await Size.findOne({
      $and: [{ _id: { $ne: currentSize._id } }, { $or: [{ name }, { size }] }],
    });
    if (existingSize) {
      return res
        .status(409)
        .json({ message: "Size name or size already exists" });
    }

    const fieldsEdited = [];
    if (name !== currentSize.name) fieldsEdited.push("name");
    if (size !== currentSize.size) fieldsEdited.push("size");

    if (!fieldsEdited.length) return res.sendStatus(304);

    const newSize: ISize = {
      ...currentSize.toObject(),
      name: name ?? currentSize.name,
      size: size ?? currentSize.size,
      modify: [
        ...currentSize.modify,
        {
          action: `Update fields: ${fieldsEdited.join(", ")} by ${user.email}`,
          date: getNow(),
        },
      ],
    };

    await currentSize.updateOne(newSize);
    return res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default updateSize;
