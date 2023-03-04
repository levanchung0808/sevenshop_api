import { Request, Response } from "express";
import { accountVerifyPassword } from "middleware/verify";
import { IUser } from "models/user";

const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email, phone }: IUser = req.body;
    if (!email && !phone) {
      return res.status(500).json({ message: "Missing email or phone" });
    }
    if (email) {
      await accountVerifyPassword({ email, res });
    }
    if (phone) {
      await accountVerifyPassword({ phone, res });
    }
  } catch (err) {
    return res.status(500).json({ message: "Forgot Password Err" });
  }
};

export default forgotPassword;
