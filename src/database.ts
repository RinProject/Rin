import mongoose from "mongoose";
import { ValidSchemas } from "./database.schema";

const connectDB = async () => mongoose.connect(process.env.RIN_MONGODB_HOST ||
    "mongodb://localhost:27017", { useNewUrlParser: true });


export async function createEntry(schema: mongoose.Schema<ValidSchemas>, data: object) {
    if (!Object.values(ValidSchemas).includes(schema.toString()))
       throw new Error(`${schema} is not a valid schema.`);

    let GenericModel: any;

    try {
        GenericModel = mongoose.model(ValidSchemas.toString());
    } catch {
        GenericModel = mongoose.model(ValidSchemas.toString(), schema);
    }

    const Entry = new GenericModel(data);

    try {
        await Entry.save();
    } catch (e) {
        throw new Error(e);
    }
}

export async function updateEntry(schema: mongoose.Schema<ValidSchemas>, term: any, data: object) {
    if (!Object.values(ValidSchemas).includes(schema.toString()))
       throw new Error(`${schema} is not a valid schema.`);

    let GenericModel: mongoose.Model<any, {}>;

    try {
        GenericModel = mongoose.model(ValidSchemas.toString());
    } catch {
        GenericModel = mongoose.model(ValidSchemas.toString(), schema);
    }

    try {
        const entry = await GenericModel.findOne(term);

        entry.update({}, data);
        entry.save();
    } catch (e) {
        throw new Error(e);
    }
}

export async function deleteEntry(schema: mongoose.Schema<ValidSchemas>, term: any) {
    if (!Object.values(ValidSchemas).includes(schema.toString()))
       throw new Error(`${schema} is not a valid schema.`);

    let GenericModel: mongoose.Model<any, {}>;

    try {
        GenericModel = mongoose.model(ValidSchemas.toString());
    } catch {
        GenericModel = mongoose.model(ValidSchemas.toString(), schema);
    }

    try {
        const entry = await GenericModel.findOne(term);

        entry.remove({_id: entry._id});
    } catch (e) {
        throw new Error(e);
    }
}