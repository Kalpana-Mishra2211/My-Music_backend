import express from "express"
import multer from "multer"
import { authArtist, authUser } from "../../middlewares/authMiddleware.js";
import { createMusic, createAlbum, getAllMusic, getAllAlbum, getMusicByAlbum, deleteMusic, deleteAlbum,updateAlbum, toggleLikeMusic, getUserLikedSongs } from "../../controller/user/musicController.js";
const upload = multer({
    storage: multer.memoryStorage()
})
const routes = express.Router();

routes.post(
    "/music",
    authArtist,
    upload.fields([
        { name: "music", maxCount: 1 },
        { name: "image", maxCount: 1 },
    ]),
    createMusic
);
routes.post(
  "/album",
  authArtist,
  upload.single("image"),
  createAlbum
);
routes.get("/music", authUser, getAllMusic)
routes.get("/album", authUser, getAllAlbum)
routes.get("/album/:id/music", authUser, getMusicByAlbum)
routes.delete("/music/:musicId",authUser,deleteMusic)
routes.delete("/album/:albumId",authUser,deleteAlbum)
routes.put(
  "/album/:albumId",
  authUser,
  upload.single("image"),   
  updateAlbum
);
routes.post("/like", authUser, toggleLikeMusic);
routes.get("/like", authUser, getUserLikedSongs);






export default routes;