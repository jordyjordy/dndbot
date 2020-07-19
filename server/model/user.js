const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userSchema = mongoose.Schema({
    name: {
        type: String,
        require: [true, "You need a name, silly!"]
    },
    email: {
        type: String,
        required: [true, "You need an email, silly!"]
    },
    password: {
        type: String,
        required: [true, "You need a password, silly!"]
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
})

userSchema.pre("save", async function(next) {
    const user = this;
    if(user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign(
        {
            _id: user._id, name: user.name, email: user.email
            
        }, process.env.SECRET
    )
    user.tokens = user.tokens.concat({token})
    await user.save();
    return token
}

userSchema.methods.clearAuthToken = async function(token) {
    const user = this
}

userSchema.statics.verify = async (token) => {
    const res = jwt.verify(token)
    return res
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email});
    if(!user) {
        throw new Error({ error: "Invalid login"})
    }
    try{
        const isPasswordMatch = await bcrypt.compare(password,user.password)
        if(!isPasswordMatch) {
            throw new Error( {error: "Invalid login"})
        }
        return user
    } catch(error) {
        console.log(error)
        return null
    }
}

userSchema.statics.removeToken = async(email,token) => {
    const user = await User.findOne({email})
    if(!user) {
        throw new Error({error: "cannot logout nonexisting user"})
    }
    try{
        const index = user.tokens.findIndex(x => x.token == token)
        if (index > -1) {
            user.tokens.splice(index,1)
        }
    } catch(err) {
        //the token was probably already cleared so its fine
        //lol
    }
    await user.save();
    return {result:"success"}
}

const User = mongoose.model("User", userSchema)
module.exports = User