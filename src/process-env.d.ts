declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      NODE_ENV: string;
      DIALECT:
        | "mysql"
        | "postgres"
        | "sqlite"
        | "mariadb"
        | "mssql"
        | "db2"
        | "snowflake"
        | "ibmi"
        | undefined;
      STORAGE: string;
      ORIGIN: string;
      SECRET_TOKEN: string;
    }
  }
}
export {};
