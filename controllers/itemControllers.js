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
  try {
    const places = await Place.find();

    return res.status(codes.ok).json(places);
  } catch (error) {
    return res.status(400).json("나중에 다시 시도해주세요.");
  }
};

export const getPlacesFromIndex = async (req, res) => {
  const { startIndex } = req.params;

  const count = await Place.countDocuments();

  if (startIndex >= count) {
    return res.status(codes.noContent).json([]);
  }

  const places = await Place.find().skip(startIndex).limit(8);

  return res.status(codes.ok).json(places);
};

export const getPlacesByAddress = async (req, res) => {
  const { address } = req.params;

  try {
    const places = await Place.find({ address: new RegExp(address, "i") });

    return res.status(codes.ok).json(places);
  } catch (error) {
    return res.status(400).json("나중에 다시 시도해주세요.");
  }
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
    return res.status(codes.badRequest).json("나중에 다시 시도해주세요.");
  }
};

export const getPlacesByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await Account.findById(userId);

    if (user === null) {
      return res
        .status(codes.badRequest)
        .json("해당하는 유저 정보가 없습니다.");
    }

    const places = await Place.find({
      _id: { $in: user.places },
    });

    return res.status(codes.ok).json(places);
  } catch (error) {
    return res.status(codes.badRequest).json("나중에 다시 시도해주세요.");
  }
};

export const updatePlace = async (req, res) => {
  const { id } = req.params;
  const { updatedPlace, userId } = req.body;

  const place = await Place.findOne({ _id: updatedPlace._id });

  if (!place) {
    return res.status(codes.forbidden).send("데이터를 찾을 수 없습니다.");
  }

  if (userId !== place.publisherId.toString()) {
    return res.status(codes.forbidden).send("수정할 수 없습니다.");
  }

  await Place.findByIdAndUpdate(updatedPlace._id, updatedPlace);

  return res.status(200).json("업데이트가 성공적으로 완료되었습니다.");
};

export const postPlace = async (req, res) => {
  let { place, publisherId } = req.body;

  try {
    const publisher = await Account.findOne({ _id: publisherId });

    if (!publisher) {
      return res.status(codes.forbidden).json("해당 계정이 존재하지 않습니다.");
    }

    const newPlace = await Place.create({
      publisherId: new ObjectId(publisherId),
      ...place,
    });

    publisher.places.push(newPlace._id);
    publisher.save();

    return res.status(codes.ok).json("등록이 성공적으로 완료되었습니다.");
  } catch (error) {
    return res.status(400).json("나중에 다시 시도해주세요.");
  }
};

export const deletePlace = async (req, res) => {
  const { id, userId } = req.query;

  try {
    const place = await Place.findById(id);

    if (!place) {
      return res.status(codes.badRequest).json("해당 장소를 찾을 수 없습니다.");
    }

    // const publisher = await Account.findOne({ _id: place.publisherId });
    const publisher = await Account.findById(place.publisherId);

    const requester = await Account.findById(userId);

    if (requester.role === "admin" || publisher._id.toString() === userId) {
      await Account.updateOne(
        { _id: publisher._id },
        { $pull: { places: place._id } }
      );

      await Place.deleteOne({ _id: place._id });

      return res.status(codes.ok).json("삭제가 성공적으로 완료되었습니다.");
    } else {
      return res.status(codes.forbidden).json("삭제할 수 없습니다.");
    }
  } catch (error) {
    return res.status(codes.badRequest).json("나중에 다시 시도해주세요.");
  }
};

export const getReviews = async (req, res) => {
  const { id } = req.params;

  try {
    const reviews = await Review.find({ placeId: new ObjectId(id) });

    if (reviews) {
      return res.status(codes.ok).json(reviews);
    } else {
      return res.status(codes.notFound).json("장소의 후기를 찾을 수 없습니다.");
    }
  } catch (error) {
    return res.status(400).json("나중에 다시 시도해주세요.");
  }
};

export const getReviewsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await Account.findById(userId);

    if (!user) {
      return res.status(codes.badRequest).json("해당 유저를 찾을 수 없습니다.");
    }

    const reviews = await Review.find({
      _id: { $in: user.reviews },
    });

    return res.status(codes.ok).json(reviews);
  } catch (error) {
    return res.status(codes.badRequest).json("나중에 다시 시도해주세요.");
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

    return res.status(codes.ok).json("등록이 성공적으로 완료되었습니다.");
  } catch (error) {
    return res.status(400).send("나중에 다시 시도해주세요.");
  }
};

export const getPlacesByKeyword = async (req, res) => {
  const { keyword } = req.params;

  try {
    const result = await Place.find({
      name: {
        $regex: new RegExp(keyword, "i"),
      },
    });

    return res.status(codes.ok).json(result);
  } catch (error) {
    return res.status(400).json("나중에 다시 시도해주세요.");
  }
};

export const updateReview = async (req, res) => {
  const { id } = req.params;
  const { updatedReview, userId } = req.body;

  const review = await Review.findOne({ _id: id });

  if (!review) {
    return res.status(codes.badRequest).json("데이터를 찾을 수 없습니다.");
  }

  if (review.reviewerId.toString() !== userId) {
    return res.status(codes.forbidden).json("변경할 수 없습니다.");
  }

  await Review.findByIdAndUpdate(id, updatedReview);

  return res.status(codes.ok).json("수정이 성공적으로 완료되었습니다.");
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
    return res.status(codes.forbidden).json("나중에 다시 시도해주세요.");
  }

  return res.status(codes.noContent).json("삭제가 성공적으로 완료되었습니다.");
};
