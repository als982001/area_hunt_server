import express from "express";
import {
  checkUserInfo,
  login,
  join,
  logout,
} from "../../controllers/userControllers";
import { uploadFiles } from "../middlewares";

const userRouter = express.Router();

userRouter.post("/login", login);
userRouter.post("/logout", logout);
userRouter.post("/join", uploadFiles.single("image"), join);
userRouter.get("/userInfo", checkUserInfo);

export default userRouter;
