import Update from "../../models/adminModels/updates.model.js";

export const postUpdates = async (req, res) => {
  try {
    if (!req.admin || !req.admin.id) {
      res.status(401).send("Unauthorized Access !");
    }
    const { date, category, description } = req.body;

    await Update.create({ date, category, description });

    res.status(200).json({ success: true, message: "Update Posted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getUpdates = async (req, res) => {
  try {
    const updates = await Update.find();
    res.status(200).json({ success: true, updates });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
