import { Config } from '../interfaces/config';

export default () => {
  return {
    auth: {
      jwtSecret: process.env.JWT_SECRET,
      jwtExpiration: process.env.JWT_EXPIRATION_TIME,
      username: process.env.USER_NAME,
      password: process.env.PASSWORD,
    },
    app: {
      port: Number(process.env.PORT) || 3000,
    },
    database: {
      url: process.env.DB_HOST_URL,
      name: process.env.DB_NAME,
      flights: process.env.DB_FLIGHTS,
    },
  } as Config;
};
