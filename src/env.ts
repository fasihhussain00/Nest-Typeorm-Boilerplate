export interface EnvProps {
  APP_BASE_URL: string;
  APP_PORT: number;
  CORS_ORIGINS: string;
  DB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  INITIAL_ADMIN_NAME: string;
  INITIAL_ADMIN_PASS: string;
  INITIAL_ADMIN_EMAIL: string;
  SCOPE_DETECTION_PYTHON: string;
}

export const env: EnvProps = {
  APP_BASE_URL: process.env.APP_BASE_URL,
  APP_PORT: +process.env.APP_PORT,
  CORS_ORIGINS: process.env.CORS_ORIGINS,
  DB_URI: process.env.DB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  INITIAL_ADMIN_NAME: process.env.INITIAL_ADMIN_NAME,
  INITIAL_ADMIN_PASS: process.env.INITIAL_ADMIN_PASS,
  INITIAL_ADMIN_EMAIL: process.env.INITIAL_ADMIN_EMAIL,
  SCOPE_DETECTION_PYTHON: process.env.SCOPE_DETECTION_PYTHON,
};
