import { Request, Response } from "express";
import Size from "models/size";

const deleteSize = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const size = Size.findById(id);
    if (!size) {
      return res.sendStatus(404);
    }
    await size.remove();
    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default deleteSize;
