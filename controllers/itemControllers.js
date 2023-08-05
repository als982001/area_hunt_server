import path from "path";
import Account from "../models/Account";
import Place from "../models/Place";
import Review from "../models/Review";
import { ObjectId } from "mongodb";

const codes = {
  ok: 200,
  noContent: 204,
  badRequest: 400,
  forbidden: 403,
  notFound: 404,
};

export const home = async (req, res) => {
  return res.status(codes.ok).end();
};

export const getAllAreas = async (req, res) => {
  const places = await Place.find();

  return res.status(codes.ok).json(places);
};

export const getItemsByAddress = async (req, res) => {
  const { address } = req.params;

  const places = await Place.find({ address: new RegExp(address, "i") });

  return res.status(codes.ok).json(places);
};

export const getItem = async (req, res) => {
  const { id } = req.params;

  try {
    const place = await Place.findById(id);

    if (place) {
      return res.status(codes.ok).json(place);
    } else {
      return res.status(codes.notFound).end();
    }
  } catch (error) {
    console.log(error);
    return res.status(codes.badRequest).end();
  }
};

export const updateItem = async (req, res) => {
  const { id } = req.params;
  const updatedPlace = req.body;

  const place = await Place.exists({ _id: updatedPlace._id });

  if (!place) {
    return res.status(codes.forbidden).send("데이터를 찾을 수 없습니다.");
  }

  await Place.findByIdAndUpdate(updatedPlace._id, updatedPlace);

  return res.status(200).end();
};

export const postItem = async (req, res) => {
  const place = new Place(req.body);

  try {
    const newPlace = await place.save();

    return res.status(codes.ok).end();
  } catch (error) {
    return res.status(400).send("Error");
  }
};

export const getVisitReviews = async (req, res) => {
  const { id } = req.params;

  const reviews = await Review.find({ placeId: new ObjectId(id) });

  if (reviews) {
    return res.status(codes.ok).json(reviews);
  } else {
    return res.status(codes.notFound).end();
  }
};

export const postVisitReviews = async (req, res) => {
  const { id } = req.params;

  try {
    const place = await Place.findById(id);

    if (place) {
      const newReview = await Review.create({
        placeId: new ObjectId(id),
        ...req.body,
      });

      place.reviews.push(newReview._id);
      place.save();

      return res.status(codes.ok).end();
    } else {
      return res
        .status(codes.notFound)
        .send("해당하는 장소를 찾을 수 없습니다.");
    }
  } catch (error) {
    return res.status(400).send("Error");
  }
};

export const getItemsByKeyword = async (req, res) => {
  const { keyword } = req.query;

  const result = await Place.find({
    name: {
      $regex: new RegExp(keyword, "i"),
    },
  });

  return res.status(codes.ok).json(result);
};

export const deleteReview = async (req, res) => {
  const { _id } = req.query;

  console.log(_id);

  try {
    const review = await Review.findById(_id);

    if (review === null) {
      return res.status(codes.noContent).json("id에 해당하는 댓글이 없습니다.");
    }

    const place = await Place.findById(review.placeId);

    // 먼저 리뷰를 삭제합니다.
    await Review.deleteOne({ _id: review._id });

    // 그 후에 이 리뷰의 참조를 해당 장소의 reviews 배열에서 제거합니다.
    await Place.updateOne(
      { _id: place._id },
      { $pull: { reviews: review._id } }
    );
  } catch (error) {
    return res.status(codes.forbidden).json("id 형식이 올바르지 않습니다.");
  }

  return res.status(codes.noContent).end();
};
