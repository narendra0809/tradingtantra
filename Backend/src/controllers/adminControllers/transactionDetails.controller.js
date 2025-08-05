import Payment from "../../models/payment.model.js";
import User from "../../models/user.model.js";
import UserSubscription from "../../models/userSubscription.model.js";

// export const getTransactionDetails = async (req, res) => {
//   try {
//     if (!req.admin || !req.admin.id) {
//       res.status(401).send({ message: "Unauthorized Access" });
//     }
//     const usersSubs = await UserSubscription.find();
//     const transactions = [];

//     for (const sub of usersSubs) {
//       const user = await User.findById(sub.userId);
//       if (!user) continue;
//       const payment = await Payment.findById(sub.paymentId);
//       if (!payment) continue;

//       transactions.push({
//         name: user.displayName,
//         email: user.email,
//         expiryDate: sub.endDate,
//         subcriptionStatus: sub.status,
//         orderId: payment.orderId,
//         transactionId: payment.transactionId,
//         paymentDate: payment.paymentDate,
//         paymentStatus: "Paid",
//         amount: "INR 3,999",
//       });
//     }
//     res.json({ transactions });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };
export const getTransactionDetails = async (req, res) => {
  try {
    if (!req.admin || !req.admin.id) {
      res.status(401).send({ message: "Unauthorized Access" });
    }
    const users = await User.find();
    const transactions = [];

    for (const user of users) {
      const userSub = await UserSubscription.findOne({ userId: user._id });
      //! Unpaid User
      if (!userSub) {
        transactions.push({
          name: user.displayName,
          email: user.email,
          expiryDate: "N/A",
          subcriptionStatus: "N/A",
          orderId: "N/A",
          transactionId: "N/A",
          paymentDate: "N/A",
          paymentStatus: "Unpaid",
          amount: "N/A",
        });
        continue;
      }
      const payment = await Payment.findById(userSub?.paymentId);
      if (!payment) continue;
      //! Paid User
      transactions.push({
        name: user.displayName,
        email: user.email,
        expiryDate: userSub.endDate,
        subcriptionStatus: userSub.status,
        orderId: payment.orderId,
        transactionId: payment.transactionId,
        paymentDate: payment.paymentDate,
        paymentStatus: payment.status === "success" ? "Paid" : "Unpaid",
        amount: `${payment.currency} ${payment.amount}`,
      });
    }
    res.json({ transactions });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
