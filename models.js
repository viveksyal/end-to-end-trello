const mongoose = require("mongoose")
const { array } = require("zod")

mongoose.connect(process.env.DB_STRING)

const Schema = mongoose.Schema

const UserSchema = new Schema({
    username: String,
    password: String,
})

const OrgSchema = new Schema({
    title: String,
    description: String,
    admin: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    boards: [{
        type: Schema.Types.ObjectId,
        ref: "board"
    }],
    members: [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }]
})

const BoardSchema = new Schema({
    organisation: {
        type: Schema.Types.ObjectId,
        ref: "organisation"
    },
    admin: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    title: String,
    description, String,
    members: [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }]
})

const userModel = mongoose.model("user", UserSchema);
const orgModel = mongoose.model("organisation", OrgSchema);
const boardModel = mongoose.model("board", BoardSchema);

module.exports = {
    userModel: userModel,
    orgModel: orgModel,
    boardModel: boardModel
}