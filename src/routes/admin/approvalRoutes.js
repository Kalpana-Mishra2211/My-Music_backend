import express from "express"
import { approveArtist, approveMusic, getPendingArtists, getPendingMusic, getProfileUpdateRequests, rejectArtist, rejectMusic } from "../../controller/admin/approvalController.js";
import { adminAuth } from "../../middlewares/adminAuth.js";
const routes = express.Router();

routes.get("/artist",adminAuth, getPendingArtists)
routes.post("/artist-approval/:id", adminAuth,approveArtist)
routes.post("/artist-rejected/:id", rejectArtist)

routes.get("/music", adminAuth,getPendingMusic)
routes.post("/music-approval/:id",adminAuth, approveMusic)
routes.post("/music-rejected/:id",adminAuth, rejectMusic)

routes.get("/profile",adminAuth, getProfileUpdateRequests);


export default routes;