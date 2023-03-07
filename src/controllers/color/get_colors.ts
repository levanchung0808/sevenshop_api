import { Request, Response } from "express";
import Color, { IColor } from "models/color";

const getColors = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = (req.query.sort as string) || "name";
    const startIndex = (page - 1) * limit;
    const total = await Color.countDocuments();

    const colors: IColor[] = await Color.find()
      .sort(sort)
      .limit(limit)
      .skip(startIndex);

    const results = {
      total: total,
      page: page,
      limit: limit,
      results: colors,
    };

    return res.json(results);
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default getColors;
