import express from "express";
import multer from "multer";
import {
  deleteReview,
  getReviewsByUser,
  getVisitReviews,
  postVisitReviews,
  updateReview,
} from "../../controllers/itemControllers";
import { uploadFiles } from "../middlewares";

const reviewRouter = express.Router();

reviewRouter.delete("/delete/:_id", deleteReview);
reviewRouter.get("/user/:userId", getReviewsByUser);
reviewRouter.get("/:id", getVisitReviews);
reviewRouter.patch("/:id", updateReview);
reviewRouter.post("/", uploadFiles.single("image"), postVisitReviews);

export default reviewRouter;
