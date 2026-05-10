import { json } from "express";
import musicModel from "../../models/user/musicModel.js";
import userModel from "../../models/user/userModel.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { sendArtistApprovalEmail, sendArtistRejectionEmail } from "../../utils/emaildata.js";
import { deleteFile } from "../../services/storageService.js";

export const getPendingArtists = async (req, res) => {
  try {
    const artists = await userModel.find({
      role: "artist",
    }).select("-password -likedSongs -favorites -following -artistProfile.profileImageFileId ");

    res.status(200).json({
      count: artists.length,
      artists,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const approveArtist = async (req, res) => {
  try {
    const { id } = req.params;

    const artist = await userModel.findById(id);

    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    const isFirstApproval = artist.userType !== "existing";

    const pending = artist.artistProfilePending;
    const current = artist.artistProfile;

    if (pending && artist.userType === "existing") {

      const oldFileId = current?.profileImageFileId;
      const newFileId = pending?.profileImageFileId;

      if (newFileId && oldFileId && oldFileId !== newFileId) {
        try {
          await deleteFile(oldFileId);
          console.log("Old profile image deleted");
        } catch (err) {
          console.log("Image delete failed:", err.message);
        }
      }

      artist.artistProfile = artist.artistProfilePending;
      artist.artistProfilePending = undefined;

      artist.profileUpdateStatus = "approved";
      artist.approvedAt = new Date();
    } else {

      artist.artistStatus = "approved";
      artist.approvedAt = new Date();
    }


    await artist.save();

    await sendArtistApprovalEmail(
      artist,
      isFirstApproval ? "initial" : "update"
    );

    return res.status(200).json({
      message: "Artist approved successfully",
      artist,
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const rejectArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === "") {
      return res.status(400).json({
        message: "Rejection reason is required",
      });
    }

    const artist = await userModel.findById(id);

    if (!artist) {
      return res.status(404).json({
        message: "Artist not found",
      });
    }

    const isFirstApproval = artist.userType !== "existing";

    if (artist.artistProfilePending && artist.userType == "existing") {
      const pending = artist.artistProfilePending;

      if (pending?.profileImageFileId) {
        try {
          await deleteFile(pending.profileImageFileId);
        } catch (err) {
          console.log("ImageKit delete failed:", err.message);
        }
      }

      artist.artistProfilePending = undefined;
      artist.profileUpdateStatus = "rejected";
    }


    else {
      artist.artistStatus = "rejected";
      artist.rejectionReason = reason;
    }

    await artist.save();

    await sendArtistRejectionEmail(
      artist,
      isFirstApproval ? "initial" : "update",
      reason
    );

    return res.status(200).json({
      message: "Artist rejected successfully",
      artist,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getPendingMusic = async (req, res) => {
  try {
    const music = await musicModel.find({
    }).select("-audioFileId -imageFileId -likes").populate("artist", "artistProfile.stageName");

    res.status(200).json({
      music,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const approveMusic = async (req, res) => {
  try {
    const { id } = req.params;

    const music = await musicModel.findById(id);
    if (!music) {
      return res.status(404).json({
        message: "Music not found"
      })
    }
    music.approvalStatus = "approved";

    await music.save();
    res.status(200).json({
      message: "Music approved successfully",
      music,
    });

  }
  catch (err) {
    res.status(500), json({ message: err.message })
  }
}

export const rejectMusic = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const music = await musicModel.findById(id);
    if (!music) {
      return res.status(404).json({
        message: "Music not found"
      })
    }
    music.approvalStatus = "rejected";
    music.rejectionReason = reason;

    await music.save();
    res.status(200).json({
      message: "Music approved successfully",
      music,
    });

  }
  catch (err) {
    res.status(500), json({ message: err.message })
  }
}

export const getProfileUpdateRequests = async (req, res) => {
  try {
    const users = await userModel
      .find({
        profileUpdateStatus: { $in: ["pending"] }
      })
      .select(
        "-password -favorites -likedSongs -following -artistProfile.profileImageFileId -artistProfilePending.profileImageFileId -artistProfile.followers -artistProfilePending.followers "
      )
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};