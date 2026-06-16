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
        ref: "user",
        require: true
    },
    members: [{
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true
    }]
})

const userModel = mongoose.model("user", UserSchema);
const orgModel = mongoose.model("organisation", OrgSchema);

module.exports = {
    userModel: userModel,
    orgModel: orgModel
}