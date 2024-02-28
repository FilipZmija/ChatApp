declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      NODE_ENV: string;
      DIALECT: "sqlite";
      STORAGE: string;
      ORIGIN: string;
      SECRET_TOKEN: string;
      CLIENT_URI: string;
    }
  }
}
export {};
