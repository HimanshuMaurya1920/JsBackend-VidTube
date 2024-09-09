import express from "express";
import cors from "cors";
import helthCheckRoute from "./routes/helthCheck.routes.js";
import cookieParser from "cookie-parser";
//importing user routes
import userRouter from "./routes/user.routes.js"
import { errorHandler } from "./middlewares/error.middlewares.js";

const app = express();
//midleware (pre-cooked)
app.use(
  cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
  })
)
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true , limit:"16kb"}))
app.use(express.static("public"));
app.use(cookieParser());

// Routes
app.use("/api/v1/helthcheck",helthCheckRoute);
//route for user
app.use("/api/v1/users",userRouter);


app.use(errorHandler);
export { app }