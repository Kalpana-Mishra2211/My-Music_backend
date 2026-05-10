import express from "express";
import { registerUser, loginUser } from "../../controller/user/authController.js";
import multer from "multer";
import { authUser } from "../../middlewares/authMiddleware.js";

const routes = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

routes.post(
  "/register",
  upload.single("profileImage"),
  registerUser
);

routes.post("/login", loginUser);


export default routes;