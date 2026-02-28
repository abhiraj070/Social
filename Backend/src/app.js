import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(
  cors({
    //cors is used when we need to control that form what places our server can be accessed.
    origin: "http://localhost:3000", //this is the frontend URL
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" })); //this middleware controlls that our server is accepting json files but with a maximum size of 16kb
app.use(express.urlencoded({ extended: true, limit: "16kb" }));// sometimes the data comes in the form of html <form> which express cannot access bydefault so this middleware simplifies it and push them into req.body
app.use(express.static("public")); //middleware used to store img,pdf etc in a folder which we receive from the client.
app.use(cookieParser()); //used to parse (resolve) raw cookies to simpler ones

//route import
import userRouter from "./routes/user.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/likes.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import tweetRouter from "./routes/tweets.routes.js";
import videoRouter from "./routes/video.routes.js";
import SubscriptionRouter from "./routes/subscription.routes.js";

//route decleration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/tweet", tweetRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/subscription", SubscriptionRouter);

export { app }; //exports like these are generally used to export multiple things.
