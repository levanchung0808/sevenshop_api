import { Request, Response } from "express";
import Size, { ISize } from "models/size";
import User from "models/user";
import { getNow, validateFields } from "utils/common";
import { getIdFromReq } from "utils/token";

const createSize = async (req: Request, res: Response) => {
  try {
    const { name, size }: ISize = req.body;
    const validateFieldsResult = validateFields({ name, size }, [
      { name: "name", type: "string", required: true },
      { name: "size", type: "string", required: true },
    ]);
    if (validateFieldsResult)
      return res.status(400).json({ message: validateFieldsResult });

    const user = await User.findById(getIdFromReq(req));
    if (!user) return res.sendStatus(403);

    const existingSize = await Size.findOne({ name });
    if (existingSize) {
      const message = `Size name '${name}' already exists`;
      return res.status(409).json({ message });
    }

    const newSize = new Size({
      name,
      size,
      created_at: getNow(),
      created_by: user.email,
      modify: [{ action: `Create by ${user?.email}`, date: getNow() }],
    });
    await newSize.save();
    return res.status(201).json({ id: newSize._id });
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default createSize;
