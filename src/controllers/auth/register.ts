import { Request, Response } from "express";
import { accountVerify } from "middleware/verify";
import { IUser } from "models/user";

const register = async (req: Request, res: Response) => {
  const { email, phone }: IUser = req.body;
  if (!email && !phone) {
    return res.status(500).json({ message: "Missing email or phone" });
  }
  if (email) {
    await accountVerify({ email, res });
  }
  if (phone) {
    await accountVerify({ phone, res });
  }
};

export default register;
