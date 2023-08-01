import multer from "multer";

export const localMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.loggedInUser = req.session.user || {};

  next();
};

export const uploadFiles = multer({ dest: "uploads/" });

export const testPrint = (req, res, next) => {
  next();
};
