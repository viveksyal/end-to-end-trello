const express = require("express");
const app = express();
require("dotenv").config();
const { authMiddleware } = require("./middlewares/authMiddleware")

mongoose.connect(process.env.DB_STRING)

const { orgModel } = require("./models/orgModel")
const { boardModel } = require("./models/boardModel")

const {signup, signin} = require("./controllers/userController");
const { organisation, addOrganisation, getOrganisation } = require("./controllers/orgController");
const { board, addBoard, getBoard } = require("./controllers/boardController");
const { default: mongoose } = require("mongoose");

app.use(express.json());


app.post("/signup", signup)

app.post("/signin", signin)

app.post("/organisation", authMiddleware, organisation)

app.post("/add-member-to-organisation", authMiddleware, addOrganisation)

app.get("/organisation", authMiddleware, getOrganisation)

app.post("/board", authMiddleware, board)

app.post("/add-member-to-board/:id", authMiddleware, addBoard)

app.get("/board/:id", authMiddleware, getBoard)

app.listen(3000);