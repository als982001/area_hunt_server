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

export const getAllPlaces = async (req, res) => {
  const places = await Place.find();

  return res.status(codes.ok).json(places);
};

export const getPlacesByAddress = async (req, res) => {
  const { address } = req.params;

  console.log(address);

  const places = await Place.find({ address: new RegExp(address, "i") });

  return res.status(codes.ok).json(places);
};

export const getPlace = async (req, res) => {
  const { id } = req.params;

  try {
    const place = await Place.findById(id);

    if (place === null) {
      return res.status(codes.notFound).json("장소를 찾을 수 없습니다.");
    }

    return res.status(codes.ok).json(place);
  } catch (error) {
    return res.status(codes.badRequest).end();
  }
};

export const getPlacesByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await Account.findById(userId);

    if (user === null) {
      return res.status(codes.badRequest).json("잘못된 요청");
    }

    const places = await Place.find({
      _id: { $in: user.places },
    });

    return res.status(codes.ok).json(places);
  } catch (error) {
    return res.status(codes.badRequest).json("잘못된 요청");
  }
};

export const updatePlace = async (req, res) => {
  const { id } = req.params;
  const { updatedPlace, userId } = req.body;

  const place = await Place.exists({ _id: updatedPlace._id });

  if (!place) {
    return res.status(codes.forbidden).send("데이터를 찾을 수 없습니다.");
  }

  if (userId !== place.publisherId) {
    return res.status(codes.forbidden).send("수정할 수 없습니다.");
  }

  await Place.findByIdAndUpdate(updatedPlace._id, updatedPlace);

  return res.status(200).end();
};

export const postPlace = async (req, res) => {
  let { place, publisherId } = req.body;

  publisherId = mongoose.Types.ObjectId(publisherId);
  place.publisherId = publisherId;

  place = new Place(place);

  try {
    const publisher = await Account.findOne({ _id: publisherId });

    if (!publisher) {
      return res.status(codes.forbidden).json("등록자 계정이 잘못되었습니다.");
    }

    const newPlace = await place.save();

    publisher.places.push(newPlace._id);
    publisher.save();

    return res.status(codes.ok).end();
  } catch (error) {
    return res.status(400).send("Error");
  }
};

export const deletePlace = async (req, res) => {
  const { id, userId } = req.query;

  try {
    const place = await Place.findById(id);

    if (!place) {
      return res.status(codes.badRequest).json("해당 장소를 찾을 수 없습니다.");
    }

    const publisher = await Account.findOne({ userId: place.publisherId });

    if (publisher._id.toString() !== userId) {
      return res.status(codes.forbidden).json("삭제할 수 없습니다.");
    }

    await Account.updateOne(
      { _id: publisher._id },
      { $pull: { places: place._id } }
    );

    await Place.deleteOne({ _id: place._id });

    return res.status(codes.ok).json("삭제 완료");
  } catch (error) {
    return res.status(codes.badRequest).json("Error");
  }
};

export const getReviews = async (req, res) => {
  const { id } = req.params;

  const reviews = await Review.find({ placeId: new ObjectId(id) });

  if (reviews) {
    return res.status(codes.ok).json(reviews);
  } else {
    return res.status(codes.notFound).end();
  }
};

export const getReviewsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await Account.findById(userId);

    if (!user) {
      return res.status(codes.badRequest).json("잘못된 요청");
    }

    const reviews = await Review.find({
      _id: { $in: user.reviews },
    });

    return res.status(codes.ok).json(reviews);
  } catch (error) {
    console.log(error);

    return res.status(codes.badRequest).json("잘못된 요청");
  }
};

export const postReviews = async (req, res) => {
  const { placeId, userId } = req.query;

  try {
    const place = await Place.findById(placeId);
    const user = await Account.findById(userId);

    if (place === null) {
      return res
        .status(codes.notFound)
        .send("해당하는 장소를 찾을 수 없습니다.");
    }

    if (user === null) {
      return res
        .status(codes.notFound)
        .send("해당하는 유저를 찾을 수 없습니다.");
    }

    const newReview = await Review.create({
      placeId: new ObjectId(placeId),
      reviewerId: new ObjectId(userId),
      ...req.body,
    });

    place.reviews.push(newReview._id);
    place.save();

    user.reviews.push(newReview._id);
    user.save();

    return res.status(codes.ok).end();
  } catch (error) {
    return res.status(400).send("Error");
  }
};

export const getPlacesByKeyword = async (req, res) => {
  const { keyword } = req.params;

  const result = await Place.find({
    name: {
      $regex: new RegExp(keyword, "i"),
    },
  });

  return res.status(codes.ok).json(result);
};

export const updateReview = async (req, res) => {
  const { id } = req.params;
  const { updatedReview, userId } = req.body;

  const review = await Review.exists({ _id: id });

  if (!review) {
    return res.status(codes.badRequest).json("데이터를 찾을 수 없습니다.");
  }

  if (review.reviewerId.toString() !== userId) {
    return res.status(codes.forbidden).json("변경할 수 없습니다.");
  }

  await Review.findByIdAndUpdate(id, updatedReview);

  return res.status(codes.ok).json("수정 완료");
};

export const deleteReview = async (req, res) => {
  const { id, userId } = req.query;

  try {
    const review = await Review.findById(id);

    if (review === null) {
      return res.status(codes.noContent).json("id에 해당하는 댓글이 없습니다.");
    }

    if (review.reviewerId.toString() !== userId) {
      return res.status(codes.forbidden).json("삭제할 수 없습니다.");
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
