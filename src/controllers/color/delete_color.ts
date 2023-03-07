import { Request, Response } from "express";
import Color from "models/color";

const deleteColor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const color = Color.findById(id);
    if (!color) {
      return res.sendStatus(404);
    }
    await color.remove();
    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default deleteColor;
