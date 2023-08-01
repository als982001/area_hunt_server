import axios from "axios";
require("dotenv").config();

export const serverOn = async (req, res) => {
  return res.status(200).end();
};
