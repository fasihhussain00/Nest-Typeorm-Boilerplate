export interface EnvProps {
  APP_BASE_URL: string;
  APP_PORT: number;
  CORS_ORIGINS: string;
  DB_URI: string;
  PASS_SALT: number;
}

export const env: EnvProps = {
  APP_BASE_URL: process.env.APP_BASE_URL,
  APP_PORT: +process.env.APP_PORT,
  CORS_ORIGINS: process.env.CORS_ORIGINS,
  DB_URI: process.env.DB_URI,
  PASS_SALT: +process.env.PASS_SALT,
};
