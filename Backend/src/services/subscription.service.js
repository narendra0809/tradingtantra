import UserSubscription from "../models/userSubscription.model.js";

/**
 * Check if a user has an active subscription
 * @param {string} userId - The user ID to check
 * @returns {Promise<Object|null>} - The active subscription or null
 */
export const checkUserSubscription = async (userId) => {
  try {
    const subscription = await UserSubscription.findOne({
      userId,
      status: "active",
      endDate: { $gt: new Date() },
    });

    return subscription;
  } catch (error) {
    throw new Error(`Error checking subscription: ${error.message}`);
  }
};

/**
 * Check if user is subscribed (returns boolean)
 * @param {string} userId - The user ID to check
 * @returns {Promise<boolean>} - True if subscribed, false otherwise
 */
export const isUserSubscribed = async (userId) => {
  const subscription = await checkUserSubscription(userId);
  return !!subscription;
};

