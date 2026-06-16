const express = require("express");
const app = express();
const JWT = require("jsonwebtoken");
require("dotenv").config();
const { authMiddleware } = require("./middleswares")

app.use(express.json());

let USER_ID = 1;
let ORGANISATION_ID = 1;
let BOARD_ID = 1;
let ISSUES_ID = 1;

const USER = [];
const ORGANISATION = [];
const BOARD = [];
const ISSUES = [];

app.post("/signup", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const userExists = USER.find(u => u.username === username);
    if(userExists){
        res.status(411).json({
            message: "User with username already exists"
        })
        return;
    }

    USER.push({
        username,
        password,
        id: USER_ID++
    })
    res.json({
        message: "You have signed up successfully"
    })
})

app.post("/signin", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const userExists = USER.find(u => u.username === username && u.password === password);
    if(!userExists){
        res.status(403).json({
            message: "Wrong crudentials"
        })
        return;
    }
    const token = JWT.sign({
        userId: userExists.id
    }, process.env.JWT_SECRET);

    res.json({
        message: "You have signed in successfully",
        token
    })

})

app.post("/organisation", authMiddleware, (req, res) => {
    const userId = req.userId;
    ORGANISATION.push({
        id: ORGANISATION_ID++,
        title: req.body.title,
        description: req.body.description,
        admin: userId,
        members: []
    })

    res.json({
        msg: "Organisation created",
        id: ORGANISATION_ID - 1
    })

})

app.post("/add-member-to-organisation", authMiddleware, (req, res) => {
    const userId = req.userId;

    const organisationId = parseInt(req.body.organisationId);
    const memberUserUsername = req.body.memberUserUsername;

    const organisation = ORGANISATION.find(orgs => orgs.id === organisationId);

    if(!organisation || organisation.admin !== userId){
        res.status(411).json({
            message: "Either this organsisation doesnot exists or you are not an admin of this organisation"
        })
        return;
    }

    const memberUser = USER.find(u => u.username === memberUserUsername)

    if(!memberUser){
        res.status(411).json({
            message: "member you want to add doesn't exists in our db"
        })
        return;
    }
    organisation.members.push(memberUser.id);

    res.json({
        message: "new member added"
    })

})

app.get("/organisation", authMiddleware, (req, res) => {
    const userId = req.userId;
    const organisationId = parseInt(req.query.organisationId);
    
    const organisation = ORGANISATION.find(orgs => orgs.id === organisationId);
    if(!organisation || organisation.admin !== userId){
        res.status(411).json({
            message: "Either this organsisation doesnot exists or you are not an admin of this organisation"
        })
        return;
    }
    res.json({
        ...organisation,
        members: organisation.members.map(memberId => {
            const user = USER.find(user => user.id === memberId);
            return {
                id: user.id,
                username: user.username
            }
        })
    })
})

app.listen(3000);
