import mongoose from 'mongoose';

const itemSchema = mongoose.Schema({
    name: {
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
    },
    server: {
        type: String,
        require: [true," need a server linked!"]
    }
})
itemSchema.pre("save", async function (next) {
    const item = this;
    item.name_lower = item.name.toLowerCase()
    next()
})
itemSchema.statics.findByName = async (name,server) => {
    const item = await Item.find({ name_lower: { $regex: name.toLowerCase(), $options: 'i' }, server:server })
    return item;
}

const Item = mongoose.model("Item", itemSchema)
export default Item;