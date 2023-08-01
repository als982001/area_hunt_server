import aws from "aws-sdk";

export const getBucketUrl = async (req, res) => {
  aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: "ap-northeast-2",
    signatureVersion: "v4",
  });

  const s3 = new aws.S3();

  const url = await s3.createPresignedPost({
    Bucket: process.env.AWS_BUCKET,
    Fields: { key: req.query.file },
    Expires: 60, // seconds
    Conditions: [
      ["content-length-range", 0, 5242880], //파일용량 5MB 까지 제한
    ],
  });

  res.status(200).json(url);
};
