const {userModel, orgModel} = require("../models/models")

const bcrypt = require("bcrypt")

const {OrgSchema, AddMemberSchema} = require("../schemas/schemas")


async function organisation(req, res){
    try {
        const result = OrgSchema.safeParse(req.body)

        if(!result.success){
            return res.status(403).json({
                message: "Invalid username or password format"
            })
        }

        const {title, description} = result.data;

        const newOrg = await orgModel.create({
            title,
            description,
            admin: req.userId
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

}

async function addOrganisation(req, res){
    try {
        const userId = req.userId;

        const result = AddMemberSchema.safeParse(req.body);

        if(!result.success){
            return res.status(403).json({
                message: "Invalid username or password format"
            })
        }

        const {memberUsername} = result.data;

        const organisation = await orgModel.findOne({
            admin: req.userId
        });

        if(!organisation){
            res.status(404).json({
                message: "Either this organsisation doesnot exists or you are not an admin of this organisation"
            })
            return;
        }

        const memberUser = await userModel.findOne({
            username: memberUsername
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
}

async function getOrganisation(req, res){
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
}

module.exports = {
    organisation: organisation,
    addOrganisation: addOrganisation,
    getOrganisation: getOrganisation
}