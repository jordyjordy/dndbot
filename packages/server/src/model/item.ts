import mongoose from 'mongoose';

interface IItem extends mongoose.Document {
    name: string,
    name_lower: string,
    email: string,
    type: string,
    details: string,
    edit: string,
    server: string,
}

interface IITemModel extends mongoose.Model<IItem> {
    findByName(name:string, server:string): Promise<IItem>,
}

const itemSchema = new mongoose.Schema<IItem>({
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
    this.name_lower = this.name.toLowerCase()
    next()
})
itemSchema.statics.findByName = async (name,server) => {
    const item = await Item.find({ name_lower: { $regex: name.toLowerCase(), $options: 'i' }, server:server })
    return item;
}

const Item = mongoose.model<IItem,IITemModel>("Item", itemSchema)
export default Item;