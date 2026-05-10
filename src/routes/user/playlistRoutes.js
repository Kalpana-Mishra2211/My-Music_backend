

import express from "express";
import multer from "multer";
import { createPlaylist, deletePlaylist, getPlaylistById, getPlaylistList, updatePlaylist } from "../../controller/user/playlistController.js";
import { authUser } from "../../middlewares/authMiddleware.js";

const routes = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });


routes.post(
  "/playlist",
  authUser,
  upload.single("image"),
  createPlaylist
);
routes.get(
  "/playlist",
  authUser,
  getPlaylistList
);

routes.get(
  "/playlist/:id",
  authUser,
  getPlaylistById
);

routes.put("/playlist/:id", authUser,
  upload.single("image"), updatePlaylist)

  routes.delete("/playlist/:id",authUser,deletePlaylist)




export default routes;