import mongoose from "mongoose";
import Coupon from "../../models/adminModels/coupon.model.js";

export const addCoupon = async (req, res) => {
  try {
    const { code, discountPercent, startDate, endDate, description } = req.body;

    if (!code || !discountPercent || !startDate || !endDate) {
      return res
        .status(400)
        .json({ success: false, message: "All required fields are missing" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be greater than end date",
      });
    }

    await Coupon.create({
      code,
      discountPercent,
      startDate: start,
      endDate: end,
      description,
    });

    res.status(200).json({ success: true, message: "Coupon Added" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "internal server error" });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.query;

    await Coupon.findByIdAndDelete(new mongoose.Types.ObjectId(id));
    res.status(200).json({ success: true, message: "coupon deleted !" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "internal server error" });
  }
};

export const editCoupon = async (req, res) => {
  try {
    const { id, code, discountPercent, startDate, endDate, description } =
      req.body;

    const _id = new mongoose.Types.ObjectId(id);

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be greater than end date",
      });
    }

    await Coupon.findByIdAndUpdate(_id, {
      code,
      discountPercent,
      startDate: start,
      endDate: end,
      description,
    });

    res.status(200).json({ success: true, message: "coupon updated !" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "internal server error" });
  }
};

export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().select(
      "code discountPercent startDate endDate description"
    );

    // agar tu mapping chaahe to yahan kar sakta hai, filhaal simple hi bhej rahe
    const newCoupons = coupons.map((c) => ({
      code: c.code,
      discountPercent: c.discountPercent,
      startDate: c.startDate,
      endDate: c.endDate,
      description: c.description,
      _id: c._id,
    }));

    res.status(200).json({ success: true, coupons: newCoupons });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "internal server error" });
  }
};
