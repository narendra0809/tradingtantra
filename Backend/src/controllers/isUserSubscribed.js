import { checkUserSubscription } from "../services/subscription.service.js";

const isSubscribed = async (req, res) => {
  try {
    const userId = req.user._id;
    const subscription = await checkUserSubscription(userId);

    res.status(200).json({
      success: true,
      isSubscribed: !!subscription,
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
