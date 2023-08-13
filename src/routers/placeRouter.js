import express from "express";
import {
  getPlace,
  getPlacesByKeyword,
  getPlacesByAddress,
  postPlace,
  updatePlace,
  deletePlace,
  getPlacesByUser,
  getAllPlaces,
  getPlacesFromIndex,
} from "../../controllers/itemControllers";
import { uploadFiles } from "../middlewares";
import { get } from "mongoose";

const placeRouter = express.Router();

placeRouter.get("/address/:address", getPlacesByAddress);
placeRouter.get("/search/:keyword", getPlacesByKeyword);
placeRouter.get("/user/:userId", getPlacesByUser);
placeRouter.get("/startIndex/:startIndex", getPlacesFromIndex);
placeRouter.delete("/delete", deletePlace);
placeRouter
  .route("/:id")
  .get(getPlace)
  .patch(uploadFiles.single("image"), updatePlace);
placeRouter
  .route("/")
  .get(getAllPlaces)
  .post(uploadFiles.single("image"), postPlace);

export default placeRouter;
