import mongoose from "mongoose";

const albumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, 
  },

  image: {
    type: String,
    default: "",
  },
  imageFileId:String,

  musics: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "music",
      required: true,
    },
  ],

 description: {
    type: String,
    default: "",
  },

  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true, 
  },
},{ timestamps: true });

const albumModel = mongoose.model("album", albumSchema);
export default albumModel;