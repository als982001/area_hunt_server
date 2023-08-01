import express from "express";
import { uploadFiles } from "../middlewares";
import { getBucketUrl } from "../../controllers/imageControllers";

const imageRouter = express.Router();

imageRouter.get("/", uploadFiles.single("image"), getBucketUrl);

export default imageRouter;
