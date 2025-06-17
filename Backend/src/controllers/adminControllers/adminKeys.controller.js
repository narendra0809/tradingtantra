import PaymentKey from "../../models/adminModels/paymentKeys.model.js";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import DataApi from "../../models/adminModels/dataApi.model.js";
export const getAdminPaymentKeys = async (req, res) => {
  try {
    if (!req.admin?.id) {
      res.status(401).send("Unauthorized Access !");
    }
    const [keys] = await PaymentKey.find();
    if (!keys) {
      res
        .status(400)
        .json({ success: false, message: "No Payment Keys Found !" });
    }

    res.status(200).json({
      success: true,
      paymentKeys: {
        key_id: keys.key_id,
        key_secret: keys.key_secret,
        webhook: keys.webhook,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "internal server error" });
  }
};

export const getAdminDataApiKeys = async (req, res) => {
  try {
    if (!req.admin?.id) {
      res.status(401).send("Unauthorized Access !");
    }

    const [dataKeys] = await DataApi.find();

    res.status(200).json({
      success: true,
      dataKeys: {
        token: dataKeys.token,
        clientId: dataKeys.clientId,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const updatePaymentKeys = async (req, res) => {
  try {
    if (!req.admin?.id) {
      res.status(401).send("Unauthorized Access !");
    }
    const { key_id, key_secret, webhook } = req.body;
    if (!key_id || !key_secret) {
      return res.status(400).json({
        success: false,
        message: "Bad Request: key_id and key_secret are required",
      });
    }
    const updatedData = {
      key_id,
      key_secret,
      ...(webhook && { webhook }),
    };

    const envUpdates = {
      RAZORPAY_KEY_ID: key_id,
      RAZORPAY_KEY_SECRET: key_secret,
      ...(webhook && { WEBHOOK_SECRET: webhook }),
    };

    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    await PaymentKey.findOneAndUpdate({}, updatedData, options);
    const envUpdated = updateEnvFile(envUpdates);
    if (!envUpdated) {
      console.warn("Database updated but .env file update failed");
    }
    return res.json({
      success: true,
      message: "Payment credentials updated",
    });
  } catch (error) {
    console.error("Payment key update error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
};

const updateEnvFile = (updates) => {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    let envContents = "";

    if (fs.existsSync(envPath)) {
      envContents = fs.readFileSync(envPath, "utf8");
    }

    const envConfig = dotenv.parse(envContents);

    for (const [key, value] of Object.entries(updates)) {
      envConfig[key] = value;
      process.env[key] = value;
    }

    const updatedContent = Object.entries(envConfig)
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");

    fs.writeFileSync(envPath, updatedContent);

    return true;
  } catch (error) {
    console.error("Error updating .env file:", error);
    return false;
  }
};

export const updateDataApiKeys = async (req, res) => {
  try {
    if (!req.admin?.id) {
      res.status(401).send("Unauthorized Access !");
    }
    const { token, clientId } = req.body;
    if (!token || !clientId) {
      return res.status(400).json({
        success: false,
        message: "Both token and clientId are required fields",
      });
    }
    await DataApi.findOneAndUpdate({}, { token, clientId });
    const envUpdates = {
      DHAN_ACCESS_TOKEN: token,
      DHAN_CLIENT_ID: clientId,
    };
    const envUpdateResult = updateEnvFile(envUpdates);
    if (!envUpdateResult) {
      console.warn(".env file not updated for DHAN");
    }
    return res.status(200).json({
      success: true,
      message: "Data API credentials updated successfully",
    });
  } catch (error) {
    console.log(error);
  }
};
