import { Request, Response } from "express";
import User from "models/user";
import { getNow } from "utils/common";
import { tokenGen } from "utils/token";

const checkOTP = async (req: Request, res: Response) => {
  try {
    const { id, otp } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.otp.code === Number(otp)) {
      if (user.otp.exp > getNow()) {
        user.otp = {
          code: undefined,
          exp: getNow(),
        };
        const token = tokenGen(
          { _id: id },
          parseInt(<string>process.env.EXPIRED_ACCESS_TOKEN)
        );
        const access_token = token;
        const refresh_token = token;
        user.access_token = access_token;
        user.refresh_token = refresh_token;
        user.modify.push({ action: "Check OTP", date: getNow() });
        await user.save();
        return res.status(200).json({
          message: "OTP is valid",
          access_token,
          refresh_token,
        });
      }
      return res.status(400).json({ message: "OTP is expired" });
    }
    return res.status(400).json({ message: "OTP is invalid" });
  } catch (error) {
    return res.sendStatus(500);
  }
};
  
export default checkOTP;
