import musicModel from "../../models/user/musicModel.js";
import albumModel from "../../models/user/albumModel.js";
import { deleteFile, uploadFile } from "../../services/storageService.js";
import userModel from "../../models/user/userModel.js";
import { parseBuffer } from "music-metadata";


export const createMusic = async (req, res) => {
  try {
    const { title, genre } = req.body;

    if (!title || !genre) {
      return res.status(400).json({
        message: "Title and Genre are required",
      });
    }

    if (!req.files || !req.files.music) {
      return res.status(400).json({
        message: "Music file is required",
      });
    }

    const artist = await userModel.findById(req.user.id);

    if (!artist || !artist.artistProfile.genre.includes(genre)) {
      return res.status(400).json({
        message: "Invalid genre for this artist",
      });
    }

    const musicFile = req.files.music[0];
    const imageFile = req.files?.image?.[0];

    let duration = 0;

    if (musicFile?.buffer) {
      const metadata = await parseBuffer(musicFile.buffer, musicFile.mimetype);
      duration = metadata?.format?.duration || 0;
    }

    const musicResult = await uploadFile(musicFile, "/music/audio");

    let imageResult = null;
    if (imageFile) {
      imageResult = await uploadFile(imageFile, "/music/images");
    }

    const music = await musicModel.create({
      uri: musicResult.url,
      audioFileId: musicResult.fileId,
      title,
      genre,
      image: imageResult ? imageResult.url : "",
      imageFileId: imageResult ? imageResult.fileId : "",
      artist: req.user.id,
      approvalStatus: "pending",
      duration,
    });

    const totalSongs = await musicModel.countDocuments({
      artist: req.user.id,
    });

    await userModel.findByIdAndUpdate(req.user.id, {
      $set: { "artistProfile.totalSongs": totalSongs },
    });

    return res.status(201).json({
      message: "Music Created Successfully",
      music: {
        id: music._id,
        uri: music.uri,
        title: music.title,
        genre: music.genre,
        artist: music.artist,
        image: music.image,
        duration: music.duration,
      },
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const createAlbum = async (req, res) => {
  try {
    const { title, musics, description } = req.body;

    const imageFile = req.file;

    let imageResult = null;
    if (imageFile) {
      imageResult = await uploadFile(imageFile, "/album/images");
    }

    const album = await albumModel.create({
      title,
      description,
      artist: req.user.id,
      musics,
      image: imageResult ? imageResult.url : "",
      imageFileId: imageResult ? imageResult.fileId : "",
    });

    const totalAlbums = await albumModel.countDocuments({
      artist: req.user.id,
    });

    await userModel.findByIdAndUpdate(req.user.id, {
      $set: { "artistProfile.totalAlbums": totalAlbums },
    });

    return res.status(201).json({
      message: "Album Created Successfully",
      album: {
        _id: album._id,
        title: album.title,
        description: album.description,
        musics: album.musics,
        artist: album.artist,
        image: album.image,
      },
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const getAllMusic = async (req, res) => {
  try {
    const { artistId } = req.query;
    const user = await userModel.findById(req.user.id);

    const filter = {
      ...(artistId && { artist: artistId }),
      approvalStatus: "approved",
    };

    const music = await musicModel
      .find(filter).select("-audioFileId -imageFileId -likes")
      .populate("artist", "artistProfile.stageName");

    const updatedMusic = music.map((music) => ({
      ...music._doc,
      isFavorite: user.favorites.some(
        (favId) => favId.toString() === music._id.toString()
      ),
      isLiked: user.likedSongs.some(
        (likedId) => likedId.toString() === music._id.toString()
      ),
    }));

    return res.status(200).json({
      message: artistId
        ? "Artist music fetched successfully"
        : "All music fetched successfully",
      data: updatedMusic,
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const getAllAlbum = async (req, res) => {
  try {
    const { artistId } = req.query;
    const filter = artistId ? { artist: artistId } : {};

    const album = await albumModel.find(filter)
    .select("-imageFileId");
    res.status(200).json({
      message: "Album fetched successfully",
      data: album,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMusicByAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(req.user.id);

    const album = await albumModel
      .findById(id).select("-imageFileId")
      .populate({
        path: "musics",
        select: "-imageFileId -audioFileId -likes -rejectionReason",
        populate: {
          path: "artist",
          select: "artistProfile.stageName",
        },
      })

    if (!album) {
      return res.status(404).json({
        message: "Album not found",
      });
    }

    return res.status(200).json({
      message: "Album music fetched successfully",
      data: album,
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const updateAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;

    const album = await albumModel.findById(albumId);

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    if (album.artist.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    let updatedData = { ...req.body };

    if (req.file) {
      if (album.imageFileId) {
        await deleteFile(album.imageFileId);
      }

      const uploaded = await uploadFile(req.file, "/album/images");

      updatedData.image = uploaded.url;
      updatedData.imageFileId = uploaded.fileId;
    }

    const updated = await albumModel.findByIdAndUpdate(
      albumId,
      updatedData,
      { new: true }
    );

    return res.status(200).json({
      message: "Album updated successfully",
      data: updated,
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const deleteMusic = async (req, res) => {
  try {
    const { musicId } = req.params;

    const music = await musicModel.findById(musicId);

    if (!music) {
      return res.status(404).json({ message: "Music not found" });
    }

    if (music.artist.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to delete this music",
      });
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

    const totalSongs = await musicModel.countDocuments({
      artist: music.artist,
      approvalStatus: "approved",
    });
    await userModel.findByIdAndUpdate(
      music.artist,
      {
        $set: {
          "artistProfile.totalSongs": totalSongs,
        },
      }
    );

    return res.status(200).json({
      message: "Music deleted successfully",
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const deleteAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;
    const album = await albumModel.findById(albumId);
    if (!albumId) {
      return res.status(404).json({ message: "Album not found" });
    }

    if (album.artist.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to delete this music",
      });
    }

    try {

      if (album.imageFileId) {
        await deleteFile(album.imageFileId);
      }
    } catch (err) {
      console.error("ImageKit delete error:", err.message);
    }


    await albumModel.findByIdAndDelete(albumId);

    const totalAlbums = await albumModel.countDocuments({
      artist: album.artist,
    });
    await userModel.findByIdAndUpdate(
      album.artist,
      {
        $set: {
          "artistProfile.totalAlbums": totalAlbums,
        },
      }
    );
    return res.status(200).json({
      message: "Album deleted successfully",
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const toggleLikeMusic = async (req, res) => {
  try {
    const { musicId } = req.body;

    const music = await musicModel.findById(musicId);

    if (!music) {
      return res.status(404).json({
        success: false,
        message: "Music not found",
      });
    }

    const user = await userModel.findById(req.user.id);

    const index = music.likes.findIndex(
      (id) => id.toString() === req.user.id
    );

    let message = "";

    if (index > -1) {
      music.likes.splice(index, 1);

      user.likedSongs = user.likedSongs.filter(
        (id) => id.toString() !== musicId
      );

      music.likesCount = Math.max(0, music.likesCount - 1);

      message = "Music unliked";
    } else {
      music.likes.push(req.user.id);

      user.likedSongs.push(musicId);

      music.likesCount += 1;

      message = "Music liked";
    }

    await Promise.all([
      music.save(),
      user.save(),
    ]);

    return res.status(200).json({
      success: true,
      message,
      data: {
        likesCount: music.likesCount,
        isLiked: index === -1,
      },
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getUserLikedSongs = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await userModel
            .findById(userId)
            .populate({
                path: "likedSongs",
                select:"-imageFileId -audioFileId -likes -likesCount -rejectionReason",
                populate: {
                    path: "artist",
                    select: "artistProfile.stageName",
                },
            });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            data: {
                totalLikedSongs: user.likedSongs.length,
                likedSongs: user.likedSongs,
            }
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
};



