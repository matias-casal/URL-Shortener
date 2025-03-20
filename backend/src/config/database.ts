import { DataSource } from "typeorm";
import { Url } from "../entities/Url";
import { User } from "../entities/User";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "postgres",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "url_shortener",
  synchronize: true,
  logging: process.env.NODE_ENV === "development",
  entities: [Url, User],
  subscribers: [],
  migrations: [],
});
