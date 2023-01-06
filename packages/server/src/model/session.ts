import mongoose from 'mongoose';

interface ISession extends mongoose.Document {
    date: number,
    server: string,
}

const sessionSchema = new mongoose.Schema<ISession>({

    id: {
        type: String,
        require: [true, "we need this id silly!"],
    },
    date: {
        type: Number,
        require: [true, "we cant have a date without a date!"],
    },
    server: {
        type: String,
        require: [true, "we need this linked to a server"],
    },
});

sessionSchema.statics.findByDayId = async (day) => {
    const foundDay = Session.find({ id: day });
    return foundDay;
};


const Session = mongoose.model<ISession>("session", sessionSchema);
export default Session;