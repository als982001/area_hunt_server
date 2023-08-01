import express from "express";
import { serverOn } from "../../controllers/rootControllers";

const rootRouter = express.Router();

rootRouter.get("/", serverOn);

export default rootRouter;
