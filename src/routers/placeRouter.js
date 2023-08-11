import express from "express";
import {
  getPlace,
  getPlacesByKeyword,
  getPlacesByAddress,
  postPlace,
  updatePlace,
  deletePlace,
  getPlacesByUser,
} from "../../controllers/itemControllers";
import { uploadFiles } from "../middlewares";

const placeRouter = express.Router();

placeRouter.get("/address/:address", getPlacesByAddress);
placeRouter.get("/search/:keyword", getPlacesByKeyword);
placeRouter.get("/user/:userId", getPlacesByUser);
placeRouter.delete("/delete", deletePlace);
placeRouter
  .route("/:id")
  .get(getPlace)
  .patch(uploadFiles.single("image"), updatePlace);
placeRouter.post("/", uploadFiles.single("image"), postPlace);

export default placeRouter;
