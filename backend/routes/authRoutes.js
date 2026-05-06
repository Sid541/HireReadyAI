import express from "express";
import {register, login, logout, getUser} from "../controllers/authController.js"
import {isAuthenticated} from "../middlewares/authMiddleware.js"
const router= express.Router();

router.post("/register",register);
router.post("/login", login);
router.get("/logout",logout);
router.get("/getuser",isAuthenticated,getUser);

export default router;