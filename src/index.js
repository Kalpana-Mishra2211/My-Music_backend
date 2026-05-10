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
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

//user
app.use("/api/auth",authRoutes)
app.use("/api",musicRoutes)
app.use("/api",favAndFollowRoutes)
app.use("/api",artistRoutes)
app.use("/api",playlistRoutes)

//admin
app.use("/api/admin/auth",adminAuthRoutes)
app.use("/api/admin",approvalRoutes)
app.use("/api/admin",userDataRoutes)
app.use("/api/admin",dashboardRoutes)




export {app}