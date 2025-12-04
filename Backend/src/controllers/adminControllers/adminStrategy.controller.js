import mongoose from "mongoose";
import OurStrategy from "../../models/adminModels/ourStrategy.model.js";
import { getImagePath } from "../../utils/utils.js";

export const postStrategy = async (req, res) => {
  try {
    if (!req.admin || !req.admin.id) {
      res.status(401).send("Unauthorized Access !");
    }
    const { title, description, name } = req.body;
    const videoFile = req.files?.videoFile?.[0].filename;
    const thumbFile = req.files?.thumbnailFile?.[0].filename;

    const videoUrl = videoFile
      ? getImagePath(videoFile, "videos")
      : req.body.videoUrl;
    const thumbnailUrl = thumbFile
      ? getImagePath(thumbFile, "thumbnails")
      : req.body.thumbnailUrl;

    const video = await OurStrategy.create({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      name,
    });
    res.status(201).json({ success: true, video });
  } catch (error) {
    console.log(error);
    res.status(500).send("internal server error ");
  }
};

export const editStrategy = async (req, res) => {
  try {
    if (!req.admin?.id) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized Access!" });
    }

    const { title, description, videoUrl, thumbnailUrl, _id, name } = req.body;

    if (!_id) {
      return res.status(400).json({
        success: false,
        message: "ID is required",
        receivedData: req.body,
      });
    }

    const idStr = String(_id).trim();

    if (!mongoose.isValidObjectId(idStr)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
        receivedId: _id,
        expectedFormat: "24-character hex string",
        exampleId: "507f1f77bcf86cd799439011",
      });
    }

    const updatedVideo = await OurStrategy.findByIdAndUpdate(
      idStr,
      { title, description, videoUrl, thumbnailUrl, name },
      { new: true, runValidators: true }
    );

    if (!updatedVideo) {
      return res.status(404).json({
        success: false,
        message: "Strategy not found with the provided ID",
        searchedId: idStr,
      });
    }

    return res.status(201).json({ success: true, updatedVideo });
  } catch (error) {
    console.error("Error in editStrategy:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteStrategy = async (req, res) => {
  try {
    if (!req.admin || !req.admin.id) {
      res.status(401).send("Unauthorized Access !");
    }
    const { id } = req.query;

    await OurStrategy.findByIdAndDelete(new mongoose.Types.ObjectId(id));
    res.status(200).json({ success: true, message: "Video Deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).send("internal server error ");
  }
};

export const getStrategy = async (req, res) => {
  try {
    const videos = await OurStrategy.find();
    res.status(200).json({ success: true, videos });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "internal server error" });
  }
};
