import dotenv from "dotenv";
import ImageKit from "imagekit";

dotenv.config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// convert file → base64
const bufferToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
};

// upload single file
const uploadFile = async (file, folder) => {
  try {
    const result = await imagekit.upload({
      file: bufferToBase64(file),
      fileName: `${folder}_${Date.now()}`,
      folder,
    });

    return result;
  } catch (error) {
    console.error("Upload Error:", error);
    throw error;
  }
};

// upload music + image
const uploadMusicWithImage = async (musicFile, imageFile) => {
  try {
    const musicUpload = await uploadFile(musicFile, "/music/audio");

    const imageUpload = await uploadFile(imageFile, "/music/images");

    return {
      music: musicUpload,
      image: imageUpload,
    };
  } catch (error) {
    console.error("Multi Upload Error:", error);
    throw error;
  }
};

const uploadAlbumImage = async (imageFile) => {
  try {
    if (!imageFile) return null;

    const result = await uploadFile(
      imageFile,
      "/album/images"
    );

    return result;
  } catch (error) {
    console.error("Album Image Upload Error:", error);
    throw error;
  }
};
const deleteFile = async (fileId) => {
  try {
    return await imagekit.deleteFile(fileId);
  } catch (error) {
    console.error("Delete Error:", error);
    throw error;
  }
};

export { uploadFile, uploadMusicWithImage ,uploadAlbumImage,deleteFile};