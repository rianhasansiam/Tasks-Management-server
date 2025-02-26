import express from 'express';
import {createOrUpdateUser} from "../controllers/UserController.js";
const router = express.Router();

router.post('/', createOrUpdateUser);

export default router;
