import express from "express";
import cors from "cors"

import cookieParser from "cookie-parser";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials : true
}))


app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(cookieParser())

app.use("/uploads", express.static("uploads"));

//routes

import userRouter from "./routes/user.routes.js"


app.use("/api", userRouter)


import NotificationRouter from "./routes/notification.routes.js"

app.use("/api", NotificationRouter)

import Transition from "./routes/transction.routes.js"


app.use("/api", Transition)


export {app}
