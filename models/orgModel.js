const mongoose = require("mongoose")

const Schema = mongoose.Schema

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

const orgModel = mongoose.model("organisation", OrgSchema);

module.exports = {
    orgModel: orgModel
}