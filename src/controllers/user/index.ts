import { Request, Response } from "express";
import { IAddress } from "interfaces/user";
import User, { IUser } from "models/user";
import { getIdFromReq } from "utils/token";

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

export const updateUser = async (req: Request, res: Response) => {
  try {
    const _id = getIdFromReq(req);
    const { full_name, phone, gender, birthday, address, avatar }: IUser =
      req.body;

    const user = await User.findById({ _id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (full_name) user.full_name = full_name;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;

    if (req.file) {
      user.avatar = avatar;
    }

    // if (birthday) {
    //   if (!isValidDateBirthday(birthday)) {
    //     return res
    //       .status(500)
    //       .json({ message: "Birthday not valid (YYYY-MM-DD)" });
    //   }
    //   user.birthday = moment(birthday).toDate();
    // }
    if (address) user.address = address;

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

export const insertAddress = async (req: Request, res: Response) => {
  try {
    const _id = getIdFromReq(req);
    const { full_name, address, phone, default_address }: IAddress = req.body;
    const user = await User.findById({
      _id,
    });

    if (!user) {
      return res.status(500).json({ message: "User not found" });
    }
    const newAddress: IAddress = {
      full_name,
      address,
      phone,
      default_address,
    };

    if (default_address) {
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
    const {
      full_name,
      address,
      phone,
      default_address,
      _id: address_id,
    }: IAddress = req.body;

    const user = await User.findOne({
      _id,
    });

    if (!user) {
      return res.status(500).json({ message: "User Not Found" });
    }

    // find address
    const addressIndex = user.address.findIndex(
      (address) => address._id == address_id
    );

    if (addressIndex === -1) {
      return res.status(500).json({ message: "Address Not Found" });
    }

    // update address
    user.address[addressIndex].full_name = full_name;
    user.address[addressIndex].address = address;
    user.address[addressIndex].phone = phone;
    user.address[addressIndex].default_address = default_address;

    // update default address
    if (default_address) {
      for (let i = 0; i < user.address.length; i++) {
        if (user.address[i].default_address === true) {
          user.address[i].default_address = false;
        }
      }
    }

    // save
    const result = await user.save();
    if (result) {
      return res.status(200).json({ message: "Update Address Successfully" });
    } else {
      return res.status(500).json({ message: "Update Address Failed" });
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
    const result = await user.save();

    if (result) {
      return res.status(200).json({ message: "Delete Address Successfully" });
    } else {
      return res.status(500).json({ message: "Delete Address Failed" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Err Delete Address" });
  }
};
