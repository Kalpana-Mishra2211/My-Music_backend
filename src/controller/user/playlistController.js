
import playlistModel from "../../models/user/playlistModel.js";
import { deleteFile, uploadFile } from "../../services/storageService.js";

export const createPlaylist = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      title,
      description,
      musics = [],
    } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Playlist title is required",
      });
    }

    let image = "";
    let imageFileId = "";

    if (req.file) {
      console.log("file", req.file)
      try {
        const uploadResult = await uploadFile(
          req.file,
          "/playlist/images"
        );

        image = uploadResult.url;
        imageFileId = uploadResult.fileId;

      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: "Image upload failed",
          error: uploadError.message,
        });
      }
    }

    const playlist = await playlistModel.create({
      title,
      description,
      musics,
      user: userId,
      image,
      imageFileId,
    });

    return res.status(201).json({
      message: "Playlist created successfully",
      data: playlist,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getPlaylistList = async (req, res) => {
  try {
    const user = req.user.id
    const playlists = await playlistModel
      .find({ user })
     .populate({
        path: "musics",
        select: "_id image duration",
      });
    return res.status(200).json({
      success: true,
      data: playlists,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPlaylistById = async (req, res) => {
  try {
    const { id } = req.params;

    const playlist = await playlistModel
      .findById(id)
      .populate({
        path: "musics",
        select:"-audioFileId -imageFileId -rejectionReason -likes",
        populate: {
          path: "artist",
          select: "artistProfile.stageName",
        },
      });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: playlist,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePlaylist = async (req, res) => {
  try {
    const { id } = req.params;

    const playlist = await playlistModel.findById(id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }
    let updatedData = { ...req.body };
    if (req.file) {
      try {
        if (playlist.imageFileId) {

          await deleteFile(playlist.imageFileId);
          console.log("deleteFile");

        }
        const update = await uploadFile(req.file, "/playlist/images")
        console.log("uploadFile");

        updatedData.image = update.url
        updatedData.imageFileId = update.fileId

      }
      catch (err) {
        console.error("ImageKit error:", err.message);
      }
    }
    const updated = await playlistModel.findByIdAndUpdate(id, updatedData,   {
    returnDocument: "after",
    runValidators: true,
  });
    return res.status(200).json({
      message: "Playlist updated successfully",
      data: updated,
    });


  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePlaylist = async (req, res) => {
  try {
    const { id } = req.params;

    const playlist = await playlistModel.findById(id);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }
    try {
      if (playlist.imageFileId) {
        await deleteFile(playlist.imageFileId);
      }
    }
    catch (err) {
      console.error("ImageKit delete error:", err.message);

    }
    await playlistModel.findByIdAndDelete(id);
    return res.status(200).json({
      message: "PlayList deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};