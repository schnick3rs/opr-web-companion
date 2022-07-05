import { nanoid } from 'nanoid';
import jsonwebtoken from 'jsonwebtoken';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}
const { JWT_SECRET } = process.env;

const jwtVerifyOptions = {};

export const sign = (userUuid, jwtPayload) => {
  const jwtOptions = {

    // expiresIn: '1h',

    // Identifies the recipients that the JWT is intended for.
    // audience: '',

    // Identifies principal that issued the JWT.
    // issuer: JWT_ISSUER,

    // Case sensitive unique identifier of the token even among different issuers.
    jwtid: nanoid(),

    // Identifies the subject of the JWT.
    subject: `${userUuid}`,

  };

  const token = jsonwebtoken.sign(jwtPayload, JWT_SECRET, jwtOptions);

  return token;
};

export const verify = (token) => {
  const decoded = jsonwebtoken.verify(token, JWT_SECRET, jwtVerifyOptions);

  return {
    ...decoded,
    token,
  };
};

export const verifyRequest = (request) => {
  let cookie;
  const cookieString = request.headers.cookie;
  if (cookieString) {
    const cookieList = cookieString.split(';').map(c => c.trim());
    cookie = cookieList.find(c => c.startsWith('auth._token.local'));
  }
  if (cookie) {
    const cookieValue = cookie.split('=')[1];
    const token = decodeURIComponent(cookieValue).split('Bearer ')[1];

    const decoded = jsonwebtoken.verify(token, JWT_SECRET, jwtVerifyOptions);

    return {
      ...decoded,
      token,
    };
  }
  return {};
};
