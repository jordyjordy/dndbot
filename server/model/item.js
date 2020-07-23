const mongoose = require('mongoose')

const itemSchema = mongoose.Schema({
    name:  {
        type: String,
        require: [true, "We need a name to find this, silly!"]
    },
    name_lower: {
        type: String,
        require: [true, "Needed for searching!"]
    },
    type: {
        type: String
    },
    details: {
        type: String
    },
    edit: {
        type: String
    }
})
itemSchema.pre("save",async function(next) {
    console.log("lowercasing!")
    const item = this;
    item.name_lower = item.name.toLowerCase()
    next()
})
itemSchema.statics.findByName = async (name) => {
    const item = await Item.find({name_lower: { $regex:name.toLowerCase(), $options: 'i'}})
    return item;
}

const Item = mongoose.model("Item", itemSchema)
module.exports = Item