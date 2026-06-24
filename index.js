const express = require("express");
const app = express();
const JWT = require("jsonwebtoken");
const z = require("zod");
const bcrypt = require("bcrypt");
require("dotenv").config();
const { authMiddleware } = require("./middlewares")
const { userModel, orgModel, boardModel} = require("./models")

app.use(express.json());

const UserSchema = z.object({
    username: z.string().min(2).max(16),
    password: z.string().min(6)
})

app.post("/signup", async (req, res) => {
    try {
        const result = UserSchema.safeParse(req.body)

        if(!result.success){
            return res.status(403).json({
                message: "Invalid username or password format"
            })
        }

        const {username, password} = result.data;

        const userExists = await userModel.findOne({username})

        if(userExists){
            return res.status(409).json({
                message: "User with username already exists"
            })
        }
        
        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await userModel.create({
            username: username,
            password: hashedPassword
        })
        res.json({
            message: "You have signed up successfully",
            id: newUser._id
        })
    } catch (e) {
        console.error(e)
        res.status(500).json({
            message: "Internal server error"
        })
    }
})

app.post("/signin", async (req, res) => {
    try {
        const result = UserSchema.safeParse(req.body)

        if(!result.success){
            return res.status(403).json({
                message: "Invalid username or password format"
            })
        }

        const {username, password} = result.data;

        const userExists = await userModel.findOne({ username });
        
        if(!userExists){
            res.status(403).json({
                message: "Wrong credentials"
            })
            return;
        }

        const correctPassword = await bcrypt.compare(password, userExists.password)

        if(!correctPassword){
            return res.status(403).json({
                message: "Wrong credentials"
            })
        }

        const token = JWT.sign({
            userId: userExists._id
        }, process.env.JWT_SECRET);

        res.json({
            message: "You have signed in successfully",
            token
        })
    } catch (e) {
        console.error(e)
        res.status(500).json({
            message: "Internal server error"
        })
    }

})

app.post("/organisation", authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const newOrg = await orgModel.create({
            title: req.body.title,
            description: req.body.description,
            admin: userId,
            members: []
        })

        res.json({
            msg: "Organisation created",
            orgId: newOrg._id
        })
    } catch (e) {
        console.error(e)
        res.status(500).json({
            message: "Internal server error"
        })
    }

})

app.post("/add-member-to-organisation", authMiddleware, async(req, res) => {
    try {
        const userId = req.userId;

        const memberUserUsername = req.body.memberUserUsername;

        const organisation = await orgModel.findOne({
            admin: userId
        });

        if(!organisation){
            res.status(404).json({
                message: "Either this organsisation doesnot exists or you are not an admin of this organisation"
            })
            return;
        }

        const memberUser = await userModel.findOne({
            username: memberUserUsername
        })

        if(!memberUser){
            res.status(404).json({
                message: "member you want to add doesn't exists in our db"
            })
            return;
        }
        const newMember = await orgModel.findByIdAndUpdate(organisation._id,{
            $addToSet: {
                members: memberUser._id
            }
        }
        )
        res.json({
            message: "new member added"
        })

    } catch (e) {
        console.error(e)
        res.status(500).json({
            message: "Internal server error"
        })
    }
})

app.get("/organisation", authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
    
        const organisation = await orgModel.findOne({admin: userId})
            .populate('members', 'username')
            .populate('admin', 'username')
            .populate('boards', 'title');
        if(!organisation){
            res.status(411).json({
                message: "Either this organsisation doesnot exists or you are not an admin of this organisation"
            })
            return;
        }
        res.json({
            title: organisation.title,
            description: organisation.description,
            admin: organisation.admin,
            members: organisation.members,
            boards: organisation.boards
        })
    } catch (e) {
        console.error(e)
        res.status(500).json({
            message: "Internal server error"
        })
    }
})

app.post("/boards", authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const title = req.body.title;
        const description = req.body.description;

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
                boards: newBoard._id
            }
        })
        res.json({
            message: "New board created successfully",
            boardId: newBoard._id
        })        
    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: "Internal server error"
        })
    }

})

app.post("/add-member-to-board", authMiddleware, async(req, res) => {
    try {
        const userId = req.userId;
        const memberUserUsername = req.body.memberUserUsername;
        const boardId = req.body.boardId

        const memberUser = await userModel.findOne({
            username: memberUserUsername
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

})

app.get("/boards/:id", authMiddleware, async(req, res) => {
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
})

app.listen(3000);