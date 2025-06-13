import User from "../../models/user.model.js";
import UserSubscription from "../../models/userSubscription.model.js";
import { getActiveUsersByMonth } from "../../services/userDetails.service.js";

export const getTotalUsersData = async (req, res) => {
  try {
    if (!req.admin || !req.admin.id)
      res.status(401).send("Unauthorized Access !");

    const totalUsers = await User.find();

    const totalSubcribedUsers = await UserSubscription.find();
    let activeUsers = 0;
    totalSubcribedUsers.forEach((user) => {
      user.status === "active" && activeUsers++;
    });
    const inActiveUsers = totalUsers.length - activeUsers;
    const totalAmount = totalSubcribedUsers.length * 3999;
    res.status(200).json({
      success: true,
      usersData: {
        totalUsers: totalUsers.length,
        totalAmount,
        activeUsers,
        inActiveUsers,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "internal server error" });
  }
};

export const getActiveUsersByMonths = async (req, res) => {
  try {
    if (!req.admin || !req.admin.id)
      res.status(401).send("Unauthorized Access !");
    const subscribedUsers = await UserSubscription.find();

    const acitveUsersByMonth = getActiveUsersByMonth(subscribedUsers);

    res.status(200).json({ success: true, acitveUsersByMonth });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "internal server error" });
  }
};
