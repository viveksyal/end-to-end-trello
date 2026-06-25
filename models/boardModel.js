const mongoose = require("mongoose")

const Schema = mongoose.Schema


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
    description: String,
    members: [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }]
})


const boardModel = mongoose.model("board", BoardSchema);

module.exports = {
    boardModel: boardModel
}