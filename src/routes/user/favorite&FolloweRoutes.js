import express from "express"
import { authUser } from "../../middlewares/authMiddleware.js";
import { getFavoriteMusicList, getFollowers, getFollowing, toggleFavorite, toggleFollowArtist } from "../../controller/user/favorite&followerController.js";

const routes = express.Router();

routes.post("/favorite",authUser,toggleFavorite);
routes.get("/favorite",authUser,getFavoriteMusicList)
routes.post("/artist/:artistId/follow-toggle", authUser, toggleFollowArtist);
routes.get("/followers", authUser, getFollowers);
routes.get("/following", authUser, getFollowing);



export default routes
