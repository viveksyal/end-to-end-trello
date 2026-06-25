const {userModel, orgModel, boardModel} = require("../models/models")

const bcrypt = require("bcrypt")

const {AddMemberSchema, BoardSchema} = require("../schemas/schemas")

async function board(req, res){
    try {
        const userId = req.userId
        const result = BoardSchema.safeParse(req.body)

        if(!result.success){
            return res.status(403).json({
                message: "Invalid username or password format"
            })
        }

        const {title, description} = result.data;

        const organisation = await orgModel.findOne({
            admin: userId
        })

        if(!organisation){
            res.status(404).json({
                message: "Either this organsisation doesnot exists or you are not an admin of this organisation"
            })
            return;
        }

        const newBoard = await boardModel.create({
            organisation: organisation._id,
            title,
            description,
            admin: userId,
        })
        await orgModel.findByIdAndUpdate(organisation._id,{
            $addToSet: {
                board: newBoard._id
            }
        })
        res.json({
            message: "New board created successfully",
            boardId: newBoard._id
        })
    } catch (e) {
        console.error(e)
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

async function addBoard(req, res){
    try {
        const userId = req.userId;
        const boardId = req.params.id
        const result = AddMemberSchema.safeParse(req.body);

        if(!result.success){
            return res.status(403).json({
                message: "Invalid username or password format"
            })
        }

        const {memberUsername} = result.data;

        const memberUser = await userModel.findOne({
            username: memberUsername
        })

        if(!memberUser){
            return res.status(404).json({
                message: "member you want to add doesn't exists in our db"
            })
        }

        const board = await boardModel.findOne({
            admin: userId,
            _id: boardId
        });

        if(!board){
            return res.status(404).json({
                message: "Either this board doesnot exists or you are not an admin of this organisation"
            })
        }

        const newMember = await boardModel.findByIdAndUpdate(board._id,{
            $addToSet: {
                members: memberUser._id
            }
        }
        )
        res.json({
            message: "new member added"
        })
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: "Internal server error"
        })
    }

}

async function getBoard(req, res){
    try {
        const userId = req.userId;
        const boardId = req.params.id;

        const board = await boardModel.findOne({admin: userId, _id: boardId})
            .populate('members', 'username')
            .populate('admin', 'username')
        if(!board){
            res.status(404).json({
                message: "Either this board doesnot exists or you are not an admin of this board"
            })
            return;
        }
        return res.json({
            title: board.title,
            description: board.description,
            admin: board.admin,
            members: board.members,
        })
    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

module.exports = {
    board: board,
    addBoard: addBoard,
    getBoard: getBoard
}