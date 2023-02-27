import mongoose from "mongoose";
import moment from "moment";
import { Request, Response } from "express";
import User, { AddressType, STATUS, UserType } from "models/user";
import bcrypt from "bcrypt";
import { getIdFromReq, parseJwt, tokenGen } from "utils/token";
import { accountVerify, accountVerifyPassword } from "middleware/verify";
import Log from "libraries/log";

export const register = async (req: Request, res: Response) => {
  const { email, phone }: UserType = req.body;
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
        { _id: id, role_type: user.role_type },
        parseInt(<string>process.env.EXPIRED_ACCESS_TOKEN)
      );

      const refresh_token = access_token;
      user.access_token = access_token;
      user.refresh_token = refresh_token;
      user.modify_at = moment(new Date()).format("YYYY-MM-DD HH:mm");
      user.modify_by =
        user?.email +
        "_CHECK-OTP_" +
        moment(new Date()).format("YYYY-MM-DD HH:mm") +
        " | ";
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
  if (user.status === STATUS.active) {
    return res.status(500).json({ message: "User already set password" });
  }
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);
  const access_token = tokenGen(
    { _id: id, role_type: user.role_type },
    parseInt(<string>process.env.EXPIRED_ACCESS_TOKEN)
  );
  const refresh_token = tokenGen(
    { _id: id, role_type: user.role_type },
    parseInt(<string>process.env.EXPIRED_REFRESH_TOKEN)
  );
  user.password = hashPassword;
  user.otp = {
    code: "",
    expired: new Date(),
  };
  user.access_token = access_token;
  user.refresh_token = refresh_token;
  user.status = STATUS.active;
  user.modify_at = moment(new Date()).format("YYYY-MM-DD HH:mm");
  user.modify_by +=
    user?.email +
    "_SET-PASS_" +
    moment(new Date()).format("YYYY-MM-DD HH:mm") +
    " | ";
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

    const access_token = tokenGen(
      { _id: user.id, role_type: user.role_type },
      parseInt(<string>process.env.EXPIRED_ACCESS_TOKEN)
    );
    const refresh_token = tokenGen(
      { _id: user.id, role_type: user.role_type },
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
  Log.info("Get user success with email: " + user?.email);
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
    { _id: user.id, role_type: user.role_type },
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

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    return res
      .status(200)
      .json({ message: "Get Users Successfully", result: users });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export const getUserByID = async (req: Request, res: Response) => {
  try {
    const _id = req.params.id;
    const user = await User.findOne({ _id });
    if (user) {
      return res
        .status(200)
        .json({ message: "Get Users Successfully", result: user });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: err });
  }
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
          { _id: user._id.toString(), role: user.role_type },
          parseInt(<string>process.env.EXPIRED_ACCESS_TOKEN)
        );
        const refreshToken = tokenGen(
          { _id: user._id.toString() },
          parseInt(<string>process.env.EXPIRED_REFRESH_TOKEN)
        );
        user.password = hashPassword;
        user.access_token = accessToken;
        user.refresh_token = refreshToken;
        user.modify_at = moment(new Date()).format("YYYY-MM-DD HH:mm");
        user.modify_by +=
          user?.email +
          "_CHANGE-PASS_" +
          moment(new Date()).format("YYYY-MM-DD HH:mm") +
          " | ";
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

function isValidDateBirthday(dateString: string) {
  var regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regEx)) return false; // Invalid format
  var d = new Date(dateString);
  var dNum = d.getTime();
  if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
  return d.toISOString().slice(0, 10) === dateString;
}

export const updateUser = async (req: Request, res: Response) => {
  try {
    const _id = getIdFromReq(req);
    const userReq = await User.findById(_id);
    const {
      password,
      full_name,
      phone,
      gender,
      image,
      birthday,
      address,
      status,
      language,
      device_id,
      role_type,
      membership_type,
    }: UserType = req.body;

    const idUSer = req.params.id;
    const user = await User.findById({ _id: idUSer });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);
      user.password = hashPassword;
    }
    if (full_name) user.full_name = full_name;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;

    if (req.file) {
      user.image = req.file.path;
    }

    if (birthday) {
      if (!isValidDateBirthday(birthday)) {
        return res
          .status(500)
          .json({ message: "Birthday not valid (YYYY-MM-DD)" });
      }
      user.birthday = moment(birthday).format("YYYY-MM-DD");
    }
    if (address) user.address = address;
    if (status) user.status = status;
    if (language) user.language = language;
    if (device_id) user.device_id = device_id;
    if (role_type) user.role_type = role_type;
    if (membership_type) user.membership_type = membership_type;
    user.modify_at = moment(new Date()).format("YYYY-MM-DD HH:mm");
    user.modify_by +=
      userReq?.email +
      "_UPD_" +
      moment(new Date()).format("YYYY-MM-DD HH:mm") +
      " | ";
    await user.save();
    return res
      .status(200)
      .json({ message: "Update successfully", result: user });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const idUser = req.params.id;
    const user = await User.findOneAndDelete({ _id: idUser });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Delete successfully" });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email, phone }: UserType = req.body;
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

export const insertAddress = async (req: Request, res: Response) => {
  try {
    const _id = getIdFromReq(req);
    const { full_name, address, phone, default_address }: AddressType =
      req.body;

    const newAddress: AddressType = {
      _id: new mongoose.Types.ObjectId().toString(),
      full_name,
      address,
      phone,
      default_address,
    };

    if (default_address) {
      const user = await User.findById({
        _id,
      });

      if (!user) {
        return res.status(500).json({ message: "User not found" });
      }

      for (let i = 0; i < user.address.length; i++) {
        if (user.address[i].default_address === true) {
          user.address[i].default_address = false;
        }
      }

      user.address.push(newAddress);

      const result = await user.save();
      if (result) {
        return res.status(200).json({ message: "Add Addresss Successfully" });
      } else {
        return res.status(500).json({ message: "Add Addresss Failed" });
      }
    } else {
      //add new address
      const user = await User.findOneAndUpdate(
        { _id },
        {
          $push: {
            address: newAddress,
          },
        }
      );

      if (user) {
        return res
          .status(200)
          .json({ message: "Add New Addresss Successfully" });
      } else {
        return res.status(500).json({ message: "Add New Addresss Failed" });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Err Add Address" });
  }
};

export const updateAddress = async (req: Request, res: Response) => {
  try {
    const _id = getIdFromReq(req);
    const { full_name, address, phone, default_address }: AddressType =
      req.body;
    const address_id = req.params.id;

    const user = await User.findOne({
      _id,
    });

    if (!user) {
      return res.status(500).json({ message: "User Not Found" });
    }

    let count = 0;
    for (let i = 0; i < user.address.length; i++) {
      //set all address false
      if (user.address[i].default_address == true) {
        user.address[i].default_address = false;
      } else {
        count += 1;
      }

      //update address new
      if (user.address[i]._id == address_id) {
        user.address[i].full_name = full_name;
        user.address[i].address = address;
        user.address[i].phone = phone;
        user.address[i].default_address = default_address;
      }

      //all address default_address false. set index 0 default_address true
      if (count == user.address.length) {
        user.address[0].default_address = true;
      }
    }
    const updateUserAddress = await user.save();

    if (updateUserAddress) {
      return res.status(200).json({ message: "Update Addresss Successfully" });
    } else {
      return res.status(500).json({ message: "Update Addresss Failed" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Err Add Address" });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const _id = getIdFromReq(req);
    const address_id = req.params.id;

    const user = await User.findOneAndUpdate(
      { _id },
      {
        $pull: {
          address: {
            _id: address_id,
          },
        },
      },
      {
        new: true,
      }
    );

    if (!user) {
      return res.status(500).json({ message: "User not found" });
    }

    const _user = await User.find({ _id });
    if (!_user) {
      return res.status(500).json({ message: "User Not Found" });
    }

    let count = 0;
    for (let i = 0; i < user.address.length; i++) {
      //set all address false
      if (user.address[i].default_address == false) {
        count += 1;
      }

      //all address default_address false. set index 0 default_address true
      if (count == user.address.length) {
        user.address[0].default_address = true;
      }
    }
    const updateUserAddress = await user.save();

    if (user) {
      return res.status(200).json({ message: "Delete Addresss Successfully" });
    } else {
      return res.status(500).json({ message: "Delete Addresss Failed" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Err Delete Address" });
  }
};
