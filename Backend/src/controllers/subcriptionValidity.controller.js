import { UserSubscription } from "../models/userSubscription.model.js";

export const getSubcriptionValidity = async (req, res) => {
  try {
    const { userId } = req.query;

    const userSub = await UserSubscription.findOne({
      userId,
    });

    if (!userSub) {
      return res.status(200).json({
        success: true,
        isSubscribed: false,
        message: "User not subscribed!",
      });
    }

    // Check if subscription is active (endDate in future AND status active)
    const isCurrentlySubscribed =
      userSub.status === "active" && new Date(userSub.endDate) > new Date();

    const userData = {
      success: true,
      isSubscribed: isCurrentlySubscribed,
      startDate: userSub.startDate,
      endDate: userSub.endDate,
      status: userSub.status,
    };

    res.status(200).json(userData);
  } catch (error) {
    console.error("Error in getting subscription end date:", error);
    res.status(500).json({
      success: false,
      isSubscribed: false,
      message: "Server error",
    });
  }
};
