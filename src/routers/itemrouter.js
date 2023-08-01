import express from "express";
import {
  getAllAreas,
  getItem,
  getItemsByKeyword,
  getItemsByAddress,
  postItem,
  updateItem,
} from "../../controllers/itemControllers";
import { uploadFiles } from "../middlewares";

const itemRouter = express.Router();

itemRouter.get("/address/:address", getItemsByAddress);
itemRouter.get("/search", getItemsByKeyword);
itemRouter
  .route("/:id")
  .get(getItem)
  .patch(uploadFiles.single("image"), updateItem);
itemRouter.get("/", getAllAreas);
itemRouter.post("/", uploadFiles.single("image"), postItem);

export default itemRouter;
