import express from 'express';
import { checkauth, login, logout, signup, updateProfile } from '../controllers/authcontroller.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkauth);// to check if the user is authenticated or not, without this also user can access this route but req.user will be undefined

export default router;