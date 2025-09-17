import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { getmessages, getusersForSidebar, sendMessages } from "../controllers/messageController.js";

const router = express.Router();

router.get("/users", protectRoute, getusersForSidebar);

router.get("/:id", protectRoute, getmessages);

router.post("/send/:id", protectRoute, sendMessages);


export default router;