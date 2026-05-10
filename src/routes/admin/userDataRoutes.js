import express from "express";
import { deleteAlbumByAdmin, deleteArtistByAdmin, deleteMusicByAdmin, deleteUserByAdmin, getAlbumList, getArtistList,getMusicList, getUserList } from "../../controller/admin/userDataController.js";
import { adminAuth } from "../../middlewares/adminAuth.js";
import { deleteAlbum } from "../../controller/user/musicController.js";

const routes = express.Router()

routes.get("/user", adminAuth, getUserList)
routes.get("/artist", adminAuth, getArtistList)
routes.get("/musicList", adminAuth, getMusicList)
routes.get("/albumList", adminAuth, getAlbumList)
routes.delete("/music/:musicId", adminAuth, deleteMusicByAdmin)
routes.delete("/album/:albumId", adminAuth, deleteAlbumByAdmin)
routes.delete("/user/:userId", adminAuth, deleteUserByAdmin)
routes.delete("/artist/:id", adminAuth, deleteArtistByAdmin)





export default routes