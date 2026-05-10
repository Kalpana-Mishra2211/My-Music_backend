// models/playlistModel.js

import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    musics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "music",
      },
    ],

    image: {
      type: String,
      default: "",
    },

    imageFileId: String,
  },
  {
    timestamps: true,
  }
);

const playlistModel = mongoose.model("playlist", playlistSchema);

export default playlistModel;