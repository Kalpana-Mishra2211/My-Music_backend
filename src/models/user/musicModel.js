import mongoose from "mongoose";

const musicSchema = new mongoose.Schema({
  uri: {
    type: String,
    required: true,
  },
  audioFileId: String,

  title: {
    type: String,
    required: true,
  },

  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },

  image: {
    type: String,
    default: "",
  },
  imageFileId: String,

  genre: {
    type: String,
  },

  duration: {
    type: Number,
    default: 0,
  },

  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  rejectionReason: {
    type: String,
    default: "",
  },

  likes: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  
],
    likesCount: {
      type: Number,
      default: 0,
    },
}, { timestamps: true });

const musicModel = mongoose.model("music", musicSchema);
export default musicModel;