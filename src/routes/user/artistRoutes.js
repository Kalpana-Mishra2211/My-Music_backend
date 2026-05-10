import express from "express";
import { getArtistDetails, getArtists, getGenresById, getMusicByArtist, getStats, getUserProfile, updateArtistProfile } from "../../controller/user/artistController.js";
import { authUser } from "../../middlewares/authMiddleware.js";
import multer from "multer";

const routes = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });


routes.get("/genres", authUser , getGenresById);
routes.put(
  "/profile",
  authUser,
  upload.single("profileImage"),
  updateArtistProfile
);
routes.get("/profile",authUser, getUserProfile);
routes.get("/stats",authUser,getStats);
routes.get("/artist",authUser,getArtists)
routes.get("/artist/details/:id",authUser,getArtistDetails)
routes.get("/artist/music/:id",authUser,getMusicByArtist)






export default routes;