import { Request, Response } from "express";
import Size from "models/size";

const deleteSize = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const size = await Size.findById(id);

    if (!size) return res.sendStatus(404);

    await Size.findByIdAndDelete(id);
    return res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default deleteSize;
