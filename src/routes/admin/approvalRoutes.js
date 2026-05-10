import express from "express"
import { approveArtist, approveMusic, getPendingArtists, getPendingMusic, getProfileUpdateRequests, rejectArtist, rejectMusic } from "../../controller/admin/approvalController.js";
import { adminAuth } from "../../middlewares/adminAuth.js";
const routes = express.Router();

routes.get("/artist-Approval",adminAuth, getPendingArtists)
routes.post("/artist-Approval/approval/:id", adminAuth,approveArtist)
routes.post("/artist-Approval/rejected/:id", rejectArtist)

routes.get("/music-Approval", adminAuth,getPendingMusic)
routes.post("/music-Approval/approval/:id",adminAuth, approveMusic)
routes.post("/music-Approval/rejected/:id",adminAuth, rejectMusic)

routes.get("/approval-profile",adminAuth, getProfileUpdateRequests);


export default routes;