import mongoose from 'mongoose';
import {
	ValidSchemas,
	IGuildSchema,
	GuildSchema,
	IMuteSchema,
	MuteSchema,
	LogEvent,
} from './database.schema';

export { LogEvent };

export const connect = async (): Promise<typeof mongoose> =>
	mongoose.connect(process.env.RIN_MONGODB_HOST || 'mongodb://localhost:27017/rin', {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Database connection established.');
});

export async function createEntry(
	schema: mongoose.Schema<ValidSchemas>,
	data: object
): Promise<void> {
	if (!Object.values(ValidSchemas).includes(schema.toString()))
		throw new Error(`${schema} is not a valid schema.`);

	let GenericModel: mongoose.Model<mongoose.Document>;

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

export async function updateEntry(
	schema: mongoose.Schema<ValidSchemas>,
	query: any,
	data: object
): Promise<void> {
	if (!Object.values(ValidSchemas).includes(schema.toString()))
		throw new Error(`${schema} is not a valid schema.`);

	let GenericModel: mongoose.Model<any, {}>;

	try {
		GenericModel = mongoose.model(ValidSchemas.toString());
	} catch {
		GenericModel = mongoose.model(ValidSchemas.toString(), schema);
	}

	try {
		const entry = await GenericModel.findOne(query);

		entry.update({}, data);
		entry.save();
	} catch (e) {
		throw new Error(e);
	}
}

export async function deleteEntry(
	schema: mongoose.Schema<ValidSchemas>,
	query: any
): Promise<void> {
	if (!Object.values(ValidSchemas).includes(schema.toString()))
		throw new Error(`${schema} is not a valid schema.`);

	let GenericModel: mongoose.Model<any, {}>;

	try {
		GenericModel = mongoose.model(ValidSchemas.toString());
	} catch {
		GenericModel = mongoose.model(ValidSchemas.toString(), schema);
	}

	try {
		const entry = await GenericModel.findOne(query);

		entry.remove({ _id: entry._id });
	} catch (e) {
		throw new Error(e);
	}
}

export const Guild = mongoose.model<IGuildSchema>('Guild', GuildSchema);

export const Mute = mongoose.model<IMuteSchema>('Mute', MuteSchema);
