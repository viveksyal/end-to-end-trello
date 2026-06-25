const mongoose = require("mongoose")

const Schema = mongoose.Schema

const UserSchema = new Schema({
    username: String,
    password: String,
})

const userModel = mongoose.model("user", UserSchema);

module.exports = {
    userModel: userModel
}