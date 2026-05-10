import express from "express";
import { adminAuth } from "../../middlewares/adminAuth.js";
import { getRecentUser, getStats, getTopMusics } from "../../controller/admin/dashboardController.js";

const routes = express.Router()

routes.get("/stats", adminAuth, getStats)
routes.get("/top-music", adminAuth, getTopMusics)
routes.get("/recent-user", adminAuth, getRecentUser)





export default routes