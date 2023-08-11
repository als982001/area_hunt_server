import express from "express";
import multer from "multer";
import {
  deleteReview,
  getReviewsByUser,
  getReviews,
  postReviews,
  updateReview,
} from "../../controllers/itemControllers";
import { uploadFiles } from "../middlewares";

const reviewRouter = express.Router();

reviewRouter.delete("/delete", deleteReview);
reviewRouter.get("/user/:userId", getReviewsByUser);
reviewRouter.get("/:id", getReviews);
reviewRouter.patch("/:id", updateReview);
reviewRouter.post("/", uploadFiles.single("image"), postReviews);

export default reviewRouter;
