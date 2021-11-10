const { v4 } = require('uuid');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const { JWT_SECRET } = process.env;

const authProvider = require('jsonwebtoken');

const jwtVerifyOptions = {};

module.exports = {
  sign: (userUuid, jwtPayload) => {
    const jwtOptions = {

      //expiresIn: '1h',

      // Identifies the recipients that the JWT is intended for.
      // audience: '',

      // Identifies principal that issued the JWT.
      // issuer: JWT_ISSUER,

      // Case sensitive unique identifier of the token even among different issuers.
      jwtid: v4(),

      // Identifies the subject of the JWT.
      subject: `${userUuid}`,

    };

    const token = authProvider.sign(jwtPayload, JWT_SECRET, jwtOptions);

    return token;
  },
  verify: (token) => {

    const decoded = authProvider.verify(token, JWT_SECRET, jwtVerifyOptions);

    return {
      ...decoded,
      token,
    };
  },
  verifyRequest: (request) => {
    let cookie = undefined;
    const cookieString = request.headers.cookie;
    if (cookieString) {
      const cookieList = cookieString.split(';').map((c) => c.trim());
      cookie = cookieList.find((c) => c.startsWith('auth._token.local'));
    }
    if (cookie) {
      const cookieValue = cookie.split('=')[1]
      const token = decodeURIComponent(cookieValue).split('Bearer ')[1];

      const decoded = authProvider.verify(token, JWT_SECRET, jwtVerifyOptions);

      return {
        ...decoded,
        token,
      };
    }
    return {};
  },
};
