const mongoose = require('mongoose')

const sessionSchema = mongoose.Schema({

    id: {
        type: String,
        require: [true, "we need this id silly!"]
    },
    date: {
        type: Number,
        require: [true, "we cant have a date without a date!"]
    },
    server: {
        type: String,
        require: [true, "we need this linked to a server"],
    }
})

sessionSchema.statics.findByDayId = async (day) => {
    const foundDay = Session.find({ id: day })
    return foundDay;
}


const Session = mongoose.model("session", sessionSchema)
module.exports = Session