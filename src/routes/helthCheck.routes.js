import { Router } from "express"
import { helthCheck } from "../controllers/helthCheck.controllers.js";
// import { registerUser } from "../controllers/user.controllers.js";

const router = Router();

router.route("/").get(helthCheck);

export default router ;
 
