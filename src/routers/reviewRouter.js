import express from "express";
import multer from "multer";
import {
  deleteReview,
  getVisitReviews,
  postVisitReviews,
} from "../../controllers/itemControllers";
import { uploadFiles } from "../middlewares";

const reviewRouter = express.Router();

reviewRouter.get("/:id", getVisitReviews);
reviewRouter.post("/:id", uploadFiles.single("image"), postVisitReviews);
reviewRouter.delete("/delete", deleteReview);

export default reviewRouter;
