import express, { Response } from "express";
import http from "http";
import mongoose from "mongoose";
import userRouter from "routes/user";
import productRouter from "routes/product";
import authRouter from "routes/auth";
import categoryRouter from "routes/category";
import { config } from "dotenv";
import Log from "libraries/log";
import cors from "cors";
import bodyParser from "body-parser";
import helmet from "helmet";
import nocache from "nocache";
import morgan from "morgan";

const app = express();
config();

/** Connect to Mongo */
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_DB_URL || "", { retryWrites: true, w: "majority" })
  .then(() => {
    Log.success("Mongo connected successfully.");
  })
  .catch((error) => Log.error(error));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Body parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "X-Requested-With",
      "X-HTTP-Method-Override",
      "Accept",
      "Authorization",
    ],
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method == "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }

  next();
});

app.use(morgan("dev"));
app.use(helmet());
app.use(nocache());

/* Routes */
app.use("/users", userRouter);
app.use("/products", productRouter);
app.use("/categories", categoryRouter);
app.use("/auth", authRouter);

app.get("/ping", (req, res: Response) => {
  res.status(200).json({
    message: "pong",
  });
});

// catch 404 and forward to error handler
app.use((req, res) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);

  Log.error(error);

  res.status(404).json({
    message: error.message,
  });
});
http
  .createServer(app)
  .listen(process.env.PORT || 3000, () =>
    Log.success(`Server is running on port ${process.env.PORT}`)
  )
  .on("error", () => {
    Log.error("Port is already in use. Trying another port.");
    const port = parseInt(process.env.PORT as string) + 1;
    http
      .createServer(app)
      .listen(port, () => Log.success(`Server is running on port ${port}`));
  });
