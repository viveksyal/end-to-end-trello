const z = require("zod");


const UserSchema = z.object({
    username: z.string().min(2).max(16),
    password: z.string().min(6)
})
const OrgSchema = z.object({
    title: z.string().max(26),
    description: z.string().max(255),
})
const AddMemberSchema = z.object({
    memberUsername: z.string().max(26)
})
const BoardSchema = z.object({
    title: z.string().min(3).max(26),
    description: z.string().max(255)
})

module.exports = {
    UserSchema,
    OrgSchema,
    AddMemberSchema,
    BoardSchema
}