import DataApi from "../models/adminModels/dataApi.model.js";

export const getDhanTokens = async () => {
  try {
    const [tokens] = await DataApi.find();
    if (!tokens) return null;
    return { DHAN_ACCESS_TOKEN: tokens.token, DHAN_CLIENT_ID: tokens.clientId };
  } catch (error) {
    console.error("Error fetching dhan tokens :", error);
    return null;
  }
};
