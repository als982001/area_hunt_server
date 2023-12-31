import axios from "axios";
import Account from "../models/Account";
import { generateToken, verifyToken } from "./helper/tokenFunctions";
import bcrypt from "bcrypt";
require("dotenv").config();

const ACCESS = "access";
const REFRESH = "refresh";

const codes = {
  ok: 200,
  resetContent: 205,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
};

const cookieOption = {
  path: "/",
  httpOnly: true,
  sameSite: "none",
  secure: true,
};

const refreshCookieOption = {
  path: "/",
  httpOnly: true,
  sameSite: "none",
  secure: true,
  expires: new Date(Date.now() + 24 * 3600 * 1000 * 7),
};

export const login = async (req, res) => {
  let { userId, password } = req.body;

  console.log(`userId: ${userId}, password: ${password}`);

  const account = await Account.findOne({ userId });

  if (account) {
    const validPassword = await bcrypt.compare(password, account.password);

    if (validPassword === false) {
      return res.status(codes.badRequest).send("비밀번호가 일치하지 않습니다.");
    }

    const { accessToken, refreshToken } = generateToken(
      { id: account.userId, email: account.email },
      true
    );

    /*
    if (
      !(
        req.headers.origin === "http://localhost:3000" ||
        req.headers.origin ===
          "http://area-hunt.s3-website.ap-northeast-2.amazonaws.com"
      )
    ) {
      return res.status(codes.forbidden).json("잘못된 요청입니다.");
    }
    */

    res.cookie("refresh_jwt", refreshToken, refreshCookieOption);
    res.cookie("access_jwt", accessToken, cookieOption);

    res.redirect("userInfo");
  } else {
    return res.status(codes.notFound).json("ID에 해당하는 계정이 없습니다.");
  }
};

export const logout = (req, res) => {
  const { cookies } = req;
  const refreshToken = cookies.refresh_jwt;

  if (refreshToken) {
    res.clearCookie("refresh_jwt", cookieOption);
  }
  res.clearCookie("access_jwt", cookieOption);

  return res.status(205).send("로그아웃이 성공적으로 완료되었습니다.");
};

export const checkUserInfo = async (req, res) => {
  const { cookies } = req;

  if (cookies === null) {
    return res.status(codes.unauthorized).json("Not Authorized");
  }

  const accessToken = cookies.access_jwt;
  const refreshToken = cookies.refresh_jwt;
  const accessPayload = verifyToken(ACCESS, accessToken);

  if (accessPayload) {
    const { id } = accessPayload;

    const userInfo = await Account.findOne({ userId: id });

    if (userInfo) {
      const checkedUserInfo = { ...userInfo.toObject() };
      delete checkedUserInfo.password;

      return res.json(checkedUserInfo);
    } else {
      return res.status(401).send("Not Authorized");
    }
  } else if (refreshToken) {
    const refreshPayload = verifyToken(REFRESH, refreshToken);

    if (!refreshPayload) {
      return res.status(401).send("Not Authorized");
    }

    const { id } = refreshPayload;
    const userInfo = await Account.findOne({ userId: id });

    const { accessToken } = generateToken(userInfo);

    res.cookie("access_jwt", accessToken, cookieOption);

    const checkedUserInfo = { ...userInfo.toObject() };
    delete checkedUserInfo.password;

    return res.status(200).json(checkedUserInfo);
  }

  return res.status(401).send("Not Authorized");
};

export const join = async (req, res) => {
  const newAccount = req.body;

  const hash = await bcrypt.hash(newAccount.password, 10);
  newAccount.password = hash;

  newAccount.role = "user";

  const account = await Account.exists({
    $or: [{ userId: newAccount.userId }, { email: newAccount.email }],
  });

  if (account) {
    return res.status(codes.forbidden).json("이미 존재하는 게정입니다.");
  }

  await Account.create(newAccount);

  res.status(codes.ok).json("회원가입이 성공적으로 완료되었습니다.");
};

/*
export const kakaoLogin = async (req, res) => {
  const { KAKAO_CODE } = req.body;

  const result = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=authorization_code&client_id=${process.env.REST_API_KEY}&redirect_uri=${process.env.REDIRECT_URI}&code=${KAKAO_CODE}`,
  });

  const data = await result.json();

  const { access_token } = data;
  const headers = {
    Authorization: `Bearer ${access_token}`,
  };

  try {
    const userResponse = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers,
    });
    const kakaoUserData = userResponse.data;

    let userInfo = dummyAccounts.find(
      (account) =>
        account.kakao &&
        account.kakao.kakao_account.profile.nickname ===
          kakaoUserData.kakao_account.profile.nickname
    );

    if (userInfo === undefined) {
      // 해당 (카카오) 계정이 없는 계정일 경우
      // 회원가입을 한 후 진행한다.

      const newAccount = {
        id: dummyAccounts.length + "",
        userId: kakaoUserData.id + "",
        password: "",
        name: kakaoUserData.kakao_account.profile.nickname,
        callNumber: "",
        birthDate: kakaoUserData.kakao_account.birthday,
        email: kakaoUserData.kakao_account.email,
        seller: false,
        kakao: kakaoUserData,
      };

      dummyAccounts.push(newAccount);

      userInfo = newAccount;
    }
    const { accessToken, refreshToken } = generateToken(userInfo, true);

    res.cookie("refresh_jwt", refreshToken, refreshCookieOption);
    res.cookie("access_jwt", accessToken, cookieOption);

    res.redirect("userInfo");
  } catch (error) {
    return res.status(401).send("Not Authorized");
  }
};
*/
