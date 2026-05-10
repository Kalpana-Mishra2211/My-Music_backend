import express from "express"
import authRoutes from "./routes/user/authRoutes.js"
import musicRoutes from "./routes/user/musicRoutes.js"
import favAndFollowRoutes from "./routes/user/favorite&FolloweRoutes.js"
import artistRoutes from "./routes/user/artistRoutes.js"
import playlistRoutes from "./routes/user/playlistRoutes.js"

import approvalRoutes from "./routes/admin/approvalRoutes.js"
import adminAuthRoutes from "./routes/admin/adminAuthRoutes.js"
import userDataRoutes from "./routes/admin/userDataRoutes.js"
import dashboardRoutes from "./routes/admin/dashboardRoutes.js"

import cors from "cors"
import { adminAuth } from "./middlewares/adminAuth.js"
import playlistModel from "./models/user/playlistModel.js"
const app = express()
app.use(express.json());

app.use(cors({
    origin: true,
    credentials: true
}));

//user
app.use("/api/auth",authRoutes)
app.use("/api/music",musicRoutes)
app.use("/api/user",favAndFollowRoutes)
app.use("/api/artist",artistRoutes)
app.use("/api/playlist",playlistRoutes)

//admin
app.use("/api/admin/auth",adminAuthRoutes)
app.use("/api/admin/approval",approvalRoutes)
app.use("/api/admin/data",userDataRoutes)
app.use("/api/admin/dashboard",dashboardRoutes)




export {app}