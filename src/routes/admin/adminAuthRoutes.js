import { adminLogin } from "../../controller/admin/adminLoginController.js";
import express from "express";

const routes = express.Router();

routes.post("/login", adminLogin);

export default routes;