import Admin from "../../models/adminModels/admin.model.js";

export const getAdminDetails = async (req, res) => {
  try {
    if (!req.admin || !req.admin.id)
      res.status(401).send("Unauthorized Access !");

    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      res.status(404).json({ success: false, message: "Admin not found !" });
    }
    res.status(200).json({
      success: true,
      data: {
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
      },
    });
  } catch (error) {
    console.log("Error while fetching admin detials  :", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error !" });
  }
};

export const updateAdminDetails = async (req, res) => {
  try {
    if (!req.admin || !req.admin.id)
      res.status(401).send("Unauthorized Access !");
    const updatedAdmin = await Admin.findByIdAndUpdate(req.admin.id, req.body, {
      new: true,
    });
    if (!updatedAdmin) {
      res.status(404).json({ success: false, message: "Admin not found !" });
    }
    res.status(200).json({
      success: true,
      updatedAdmin,
    });
  } catch (error) {
    console.log("Error while fetching admin detials  :", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error !" });
  }
};
