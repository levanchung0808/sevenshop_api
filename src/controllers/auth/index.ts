import bcrypt from "bcrypt";
import { STATUS_USER } from "constants/user";
import { Request, Response } from "express";
import Log from "libraries/log";
import { accountVerify, accountVerifyPassword } from "middleware/verify";
import User, { IUser } from "models/user";
import { getIdFromReq, parseJwt, tokenGen } from "utils/token";

export const register = async (req: Request, res: Response) => {
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

export const checkOTP = async (req: Request, res: Response) => {
  const { id, otp } = req.body;
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (user.otp.code === otp) {
    if (user.otp.expired > new Date()) {
      user.otp = {
        code: "",
        expired: new Date(),
      };
      const access_token = tokenGen(
        { _id: id, role_type: user.role },
        parseInt(<string>process.env.EXPIRED_ACCESS_TOKEN)
      );

      const refresh_token = access_token;
      user.access_token = access_token;
      user.refresh_token = refresh_token;
      user.modify = [
        ...user.modify,
        { action: "Check OTP", date: new Date().toString() },
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

export const setPassword = async (req: Request, res: Response) => {
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
  const access_token = tokenGen(
    { _id: id, role_type: user.role },
    parseInt(<string>process.env.EXPIRED_ACCESS_TOKEN)
  );
  const refresh_token = tokenGen(
    { _id: id, role_type: user.role },
    parseInt(<string>process.env.EXPIRED_REFRESH_TOKEN)
  );
  user.password = hashPassword;
  user.otp = {
    code: "",
    expired: new Date(),
  };
  user.access_token = access_token;
  user.refresh_token = refresh_token;
  user.status = STATUS_USER.active;
  user.modify = [
    ...user.modify,
    { action: "Set Password", date: new Date().toString() },
  ];
  await user.save();
  return res.status(200).json({
    message: "Set password success",
    access_token,
    refresh_token,
  });
};

export const login = async (req: Request, res: Response) => {
  try {
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
    Log.info("Login success with email: " + user.email);
    return res.status(200).json({
      message: "Login success",
      access_token,
      refresh_token,
    });
  } catch (err) {
    Log.error(err);
    return res.status(500).json({ message: err });
  }
};

export const getMe = async (req: Request, res: Response) => {
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

export const refreshToken = async (req: Request, res: Response) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(500).json({ message: "Missing token" });
  }
  const parToken = parseJwt(refresh_token);
  const { _id, exp } = parToken;
  // check expired token
  if (exp < new Date().getTime() / 1000) {
    Log.error("Token expired");
    return res.status(500).json({ message: "Refresh token expired" });
  }
  const user = await User.findOne({ _id, refresh_token });
  if (!user) {
    return res.status(500).json({ message: "Refresh token fail" });
  }
  //log id
  Log.info(`Refresh token success with id: ${user._id}`);
  const access_token = tokenGen(
    { _id: user.id, role_type: user.role },
    parseInt(<string>process.env.EXPIRED_ACCESS_TOKEN)
  );
  user.access_token = access_token;
  await user.save();
  Log.success(`Refresh token success with email: ${user.email}`);
  return res.status(200).json({
    message: "Refresh token success",
    access_token,
  });
};

export const logout = async (req: Request, res: Response) => {
  const id = getIdFromReq(req);
  const user = await User.findById(id);
  if (!user) {
    return res.status(500).json({ message: "Logout fail" });
  }
  // clear token
  user.access_token = "";
  user.refresh_token = "";
  await user.save();
  return res.status(200).json({ message: "Logout success" });
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const _id = getIdFromReq(req);

    const { password, password_new } = req.body;
    const user = await User.findById({ _id });

    if (user) {
      const compare = await bcrypt.compare(password, user.password);
      if (compare) {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password_new, salt);
        const accessToken = tokenGen(
          { _id: user._id.toString(), role: user.role },
          parseInt(<string>process.env.EXPIRED_ACCESS_TOKEN)
        );
        const refreshToken = tokenGen(
          { _id: user._id.toString() },
          parseInt(<string>process.env.EXPIRED_REFRESH_TOKEN)
        );
        user.password = hashPassword;
        user.access_token = accessToken;
        user.refresh_token = refreshToken;
        user.modify = [
          ...user.modify,
          { action: "Change Password", date: new Date().toString() },
        ];
        await user.save();
        return res.status(200).json({
          message: "Change password successfully",
          accessToken,
          refreshToken,
        });
      } else {
        return res.status(500).json({ message: "Password incorrect" });
      }
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
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
