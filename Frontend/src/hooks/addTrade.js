import axios from "axios";

const addTrade = async (tradeData) => {
  const SERVER_URI = import.meta.env.VITE_SERVER_URI;
  try {
    const response = await axios.post(
      `${SERVER_URI}/auth/add-trade`,
      tradeData,
      { withCredentials: true }
    );

    console.log("Trade added successfully:", response.data);
  } catch (error) {
    console.error("Error adding trade:", error.response?.data || error.message);
  }
};

export default addTrade;
