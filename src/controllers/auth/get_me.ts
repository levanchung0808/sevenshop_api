import { Request, Response } from "express";
import User from "models/user";
import { getIdFromReq } from "utils/token";

const getMe = async (req: Request, res: Response) => {
  const id = getIdFromReq(req);
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.status(200).json({
    message: "Get user success",
    result: user,
  });
};

export default getMe;
