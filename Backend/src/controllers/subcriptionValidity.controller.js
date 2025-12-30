import UserSubscription from "../models/userSubscription.model.js";

export const getSubcriptionValidity = async (req, res) => {
  try {
    // ✅ FIX: userId from verifyUser middleware
    const userId = req.user._id;

    const userSub = await UserSubscription.findOne({ userId });

    if (!userSub) {
      return res.status(200).json({
        success: true,
        isSubscribed: false,
        message: "User not subscribed!",
      });
    }

    const isCurrentlySubscribed =
      userSub.status === "active" &&
      new Date(userSub.endDate) > new Date();

    return res.status(200).json({
      success: true,
      isSubscribed: isCurrentlySubscribed,
      startDate: userSub.startDate,
      endDate: userSub.endDate,
      status: userSub.status,
    });
  } catch (error) {
    console.error("Error in getting subscription end date:", error);
    return res.status(500).json({
      success: false,
      isSubscribed: false,
      message: "Server error",
    });
  }
};
