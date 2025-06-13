import UserSubscription from "../models/userSubscription.model.js";

export const getSubcriptionValidity = async (req, res) => {
  try {
    const { userId } = req.query;

    const userSub = await UserSubscription.findOne({
      userId,
    });

    const userData = {
      startDate: userSub.startDate,
      endDate: userSub.endDate,
      status: userSub.status,
    };
    res.status(200).json(userData);
  } catch (error) {
    console.log("Error in getting subcription end date : ", error);
  }
};
