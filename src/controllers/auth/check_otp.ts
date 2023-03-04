import { convertDate } from "utils/common";
import { Request, Response } from "express";
import User from "models/user";
import { getDateNow } from "utils/common";
import { tokenGen } from "utils/token";

const checkOTP = async (req: Request, res: Response) => {
  const { id, otp } = req.body;
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (user.otp.code === otp) {
    if (convertDate(user.otp.exp) > getDateNow()) {
      user.otp = {
        code: undefined,
        exp: getDateNow(),
      };
      const token = tokenGen(
        { _id: id },
        parseInt(<string>process.env.EXPIRED_ACCESS_TOKEN)
      );
      const access_token = token;
      const refresh_token = token;
      user.access_token = access_token;
      user.refresh_token = refresh_token;
      user.modify = [
        ...user.modify,
        { action: "Check OTP", date: getDateNow() },
      ];
      await user.save();
      return res.status(200).json({
        message: "OTP is valid",
        access_token,
        refresh_token,
      });
    }
  }
  return res.status(500).json({ message: "OTP is invalid" });
};

export default checkOTP;
