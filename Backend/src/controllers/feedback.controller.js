import Feedback from "../models/feedback.model.js";

const feedback = async (req, res) => {
  try {
    const { name, number, message, category, image } = req.body;

    if (!feedback) {
      return res
        .status(400)
        .json({ success: false, message: "Feedback is required" });
    }

    const userId = req.user._id;

    const newFeedback = await Feedback.create({
      userId,
      name,
      number,
      message,
      category,
      image,
    });
    res
      .status(200)
      .json({ success: true, message: "Feedback added successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default feedback;
