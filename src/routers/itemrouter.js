import express from "express";
import {
  getAllAreas,
  getItem,
  getItemsByKeyword,
  getItemsByAddress,
  postItem,
  updateItem,
  removePlace,
} from "../../controllers/itemControllers";
import { uploadFiles } from "../middlewares";

const itemRouter = express.Router();

itemRouter.get("/address/:address", getItemsByAddress);
itemRouter.get("/search", getItemsByKeyword);
itemRouter.delete("/delete", removePlace);
itemRouter
  .route("/:id")
  .get(getItem)
  .patch(uploadFiles.single("image"), updateItem);
itemRouter.get("/", getAllAreas);
itemRouter.post("/", uploadFiles.single("image"), postItem);

export default itemRouter;
