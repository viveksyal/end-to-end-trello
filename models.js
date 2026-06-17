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
        type: mongoose.Types.ObjectId,
        ref: "user"
    },
    members: [{
        type: mongoose.Types.ObjectId,
        ref: "user"
    }]
})

const userModel = mongoose.model("user", UserSchema);
const orgModel = mongoose.model("organisation", OrgSchema);

module.exports = {
    userModel: userModel,
    orgModel: orgModel
}