const express = require("express");
const app = express();
const JWT = require("jsonwebtoken");
require("dotenv").config();
const { authMiddleware } = require("./middlewares")
const { userModel, orgModel} = require("./models")

app.use(express.json());

app.post("/signup", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const userExists = await userModel.findOne({
        username: username
    })

    if(userExists){
        res.status(411).json({
            message: "User with username already exists"
        })
        return;
    }

    const newUser = await userModel.create({
        username: username,
        password: password
    })
    res.json({
        message: "You have signed up successfully",
        id: newUser._id
    })
})

app.post("/signin", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const userExists = await userModel.findOne({
        username: username,
        password: password});

    if(!userExists){
        res.status(403).json({
            message: "Wrong credentials"
        })
        return;
    }
    const token = JWT.sign({
        userId: userExists._id
    }, process.env.JWT_SECRET);

    res.json({
        message: "You have signed in successfully",
        token
    })

})

app.post("/organisation", authMiddleware, async (req, res) => {
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

})

app.post("/add-member-to-organisation", authMiddleware, async(req, res) => {
    const userId = req.userId;

    const memberUserUsername = req.body.memberUserUsername;

    const organisation = await orgModel.findOne({
        admin: userId
    });

    if(!organisation){
        res.status(411).json({
            message: "Either this organsisation doesnot exists or you are not an admin of this organisation"
        })
        return;
    }

    const memberUser = await userModel.findOne({
        username: memberUserUsername
    })

    if(!memberUser){
        res.status(411).json({
            message: "member you want to add doesn't exists in our db"
        })
        return;
    }
    const newMember = await orgModel.findByIdAndUpdate(organisation._id,{
        $push: {
            members: { userId: memberUser._id}
        }
    }
    )
    res.json({
        message: "new member added"
    })

})

app.get("/organisation", authMiddleware, async (req, res) => {
    const userId = req.userId;
    
    const organisation = await orgModel.findOne({
        admin: userId
    }).populate("members", "username");

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
        members: organisation.members
    })
})

app.listen(3000);
