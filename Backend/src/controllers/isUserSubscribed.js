import UserSubscription from "../models/userSubscription.model.js";

const isSubscribed = async (req, res) => {
  try {
    const userId = req.user._id;

    const isSubscribed = await UserSubscription.findOne({
      userId,
      status: "active",
      endDate: { $gt: Date.now() },
    });

    // console.log('isSubscribed',isSubscribed)
    res.status(200).json({
      success: true,
      isSubscribed: isSubscribed ? true : false,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default isSubscribed;
