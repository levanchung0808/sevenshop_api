import bcrypt from "bcrypt";
import { Request, Response } from "express";
import User from "models/user";
import { tokenGen } from "utils/token";

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(500).json({ message: "Missing email or password" });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (!user.password) {
    return res
      .status(500)
      .json({ message: "User inactive. Please active user!" });
  }

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) {
    return res.status(400).json({ message: "Password is invalid" });
  }
  const contentToken = { _id: user.id, role: user.role };
  const access_token = tokenGen(
    contentToken,
    parseInt(<string>process.env.EXPIRED_ACCESS_TOKEN)
  );
  const refresh_token = tokenGen(
    contentToken,
    parseInt(<string>process.env.EXPIRED_REFRESH_TOKEN)
  );
  user.access_token = access_token;
  user.refresh_token = refresh_token;
  await user.save();
  return res.status(200).json({
    message: "Login success",
    access_token,
    refresh_token,
  });
};

export default login;
