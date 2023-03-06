import { getNow } from "utils/common";
import bcrypt from "bcrypt";
import { STATUS_USER } from "constants/user";
import { Request, Response } from "express";
import User from "models/user";
import { getIdFromReq, tokenGen } from "utils/token";

const setPassword = async (req: Request, res: Response) => {
  const id = getIdFromReq(req);
  const { password } = req.body;
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (user.status === STATUS_USER.active) {
    return res.status(500).json({ message: "User already set password" });
  }
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);
  const contentToken = { _id: id, role: user.role };
  const access_token = tokenGen(
    contentToken,
    parseInt(<string>process.env.EXPIRED_ACCESS_TOKEN)
  );
  const refresh_token = tokenGen(
    contentToken,
    parseInt(<string>process.env.EXPIRED_REFRESH_TOKEN)
  );
  user.password = hashPassword;
  user.otp = {
    code: undefined,
    exp: getNow(),
  };
  user.access_token = access_token;
  user.refresh_token = refresh_token;
  user.status = STATUS_USER.active;
  user.modify = [...user.modify, { action: "Set Password", date: getNow() }];
  await user.save();
  return res.status(200).json({
    message: "Set password success",
    access_token,
    refresh_token,
  });
};

export default setPassword;
