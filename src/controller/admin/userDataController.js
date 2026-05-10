import Admin from "../../models/admin/adminLoginModel.js";
import albumModel from "../../models/user/albumModel.js";
import musicModel from "../../models/user/musicModel.js";
import userModel from "../../models/user/userModel.js";
import { deleteFile } from "../../services/storageService.js";


export const getUserList = async (req, res) => {
  try {
    const users = await userModel
      .find({ role: "user" })
      .select("userName email favorites createdAt updatedAt")
      .populate({
        path: "favorites",
        select: "-audioFileId -imageFileId -likes -rejectionReason -approvalStatus",
        populate: {
          path: "artist",
          select: "artistProfile.stageName artistProfile.profileImage",
        },
      }
      );
    return res.status(200).json({
      success: true,
      users
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const getArtistList = async (req, res) => {
  try {
    const artist = await userModel
      .find({ role: "artist", artistStatus: "approved" })
      .select("-password -likedSongs -artistProfile.profileImageFileId");
    return res.status(200).json({
      success: true,
      artist
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const getMusicList = async (req, res) => {
  try {
    const filter = {
      approvalStatus: "approved",
    };

    const music = await musicModel
      .find(filter).select("-audioFileId -imageFileId -likes -rejectionReason")
      .populate("artist", "artistProfile.stageName");

    return res.status(200).json({
      success: true,
      message: "All music fetched successfully",
      data: music,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getAlbumList = async (req, res) => {
  try {

const album = await albumModel
  .find()
  .select("-imageFileId")
  .populate({
    path: "musics",
    select: "-audioFileId -imageFileId -likes -rejectionReason",
    populate: {
      path: "artist",
      select: "artistProfile.stageName artistProfile.profileImage userName",
    },
  });
    return res.status(200).json({
      success: true,
      message: "Album fetched successfully",
      data: album,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const deleteMusicByAdmin = async (req, res) => {
  try {
    const { musicId } = req.params;

    const music = await musicModel.findById(musicId);

    if (!music) {
      return res.status(404).json({ message: "Music not found" });
    }
    try {
      if (music.audioFileId) {
        await deleteFile(music.audioFileId);
      }

      if (music.imageFileId) {
        await deleteFile(music.imageFileId);
      }
    } catch (err) {
      console.error("ImageKit delete error:", err.message);
    }

    await musicModel.findByIdAndDelete(musicId);

    await userModel.updateMany(
      { favorites: musicId },
      { $pull: { favorites: musicId } }
    );

    await albumModel.updateMany(
      { musics: musicId },
      { $pull: { musics: musicId } }
    );

    return res.status(200).json({
      success: true,
      message: "Music deleted successfully",
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteAlbumByAdmin = async (req, res) => {
  try {
    const { albumId } = req.params;
    const album = await albumModel.findById(albumId);
    if (!albumId) {
      return res.status(404).json({ message: "Album not found" });
    }
    try {

      if (album.imageFileId) {
        await deleteFile(album.imageFileId);
      }
    } catch (err) {
      console.error("ImageKit delete error:", err.message);
    }
    await albumModel.findByIdAndDelete(albumId);
    return res.status(200).json({
      success: true,
      message: "Album deleted successfully",
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteUserByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await userModel.findByIdAndDelete(userId);

    const likedSongs = await musicModel.find({
      likes: userId,
    });

    for (const song of likedSongs) {

      song.likes.pull(userId);

      song.likesCount = Math.max(
        0,
        song.likesCount - 1
      );

      await song.save();
    }


    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteArtistByAdmin = async (req, res) => {
  try {

    const { id } = req.params;

    const artist = await userModel.findById(id);

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: "Artist not found",
      });
    }

    if (artist.role !== "artist") {
      return res.status(400).json({
        success: false,
        message: "User is not an artist",
      });
    }

    const artistSongs = await musicModel.find({
      artist: id,
    });

    const songIds = artistSongs.map(
      (song) => song._id
    );

    const artistAlbums = await albumModel.find({
      artist: id,
    });

    const likedSongs = await musicModel.find({
      likes: id,
    });

    for (const song of likedSongs) {
      song.likes.pull(id);
      song.likesCount = Math.max(
        0,
        song.likesCount - 1
      );
      await song.save();
    }

    await userModel.updateMany(
      {},
      {
        $pull: {
          favorites: { $in: songIds },

          likedSongs: { $in: songIds },
        },
      }
    );

    await albumModel.updateMany(
      {},
      {
        $pull: {
          songs: { $in: songIds },
        },
      }
    );

    await musicModel.deleteMany({
      artist: id,
    });

    await albumModel.deleteMany({
      artist: id,
    });

    try {
      if (artist.artistProfile.profileImageFileId) {
        await deleteFile(artist.artistProfile.profileImageFileId);
      }
    } catch (err) {
      console.error("ImageKit delete error:", err.message);
    }


    await userModel.findByIdAndDelete(id);


    return res.status(200).json({
      success: true,
      message: "Artist deleted successfully",

      deletedSongs: artistSongs.length,

      deletedAlbums: artistAlbums.length,
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

