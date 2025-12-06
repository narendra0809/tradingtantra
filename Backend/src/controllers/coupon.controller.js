import Coupon from "../../src/models/adminModels/coupon.model.js";

export const verifyCoupon = async (req, res) => {
  try {
    let { code } = req.query; // GET /verify-coupon?code=WELCOME10
    code = (code || "").trim().toUpperCase();

    if (!code) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon code is required" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // find coupon by code + date validity
    const coupon = await Coupon.findOne({
      code,
      startDate: { $lte: today },
      endDate: { $gte: today },
    }).select("code discountPercent startDate endDate description");

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired coupon",
      });
    }

    return res.status(200).json({
      success: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
        description: coupon.description,
      },
    });
  } catch (error) {
    console.log("verifyCoupon error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
