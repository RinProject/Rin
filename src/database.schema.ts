import mongoose from "mongoose";


export const GuildSchema = new mongoose.Schema({
    id: {
        required: true,
        type: String
    },
    disabledCommands: [{
        type: String
    }],
    prefixes: [{
        type: String
    }],
    prompts:[{
        user: {
            type: String,
            required: true
        },
        channel: {
            type: String,
            required: true
        },
        id: {
            type: String,
            required: true
        }
    }]
});


export interface IPromptSchema {
    user: string;
    channe: string;
    id: string;
}

export interface IGuildSchema extends mongoose.Document {
    id: string,
    disabledCommands: Array<string>;
    prefixes: Array<string>;
    prompts: Array<IPromptSchema>;
}

/**
 * Valid schemas for  use in the database. 
 */
export enum ValidSchemas {
    IPromptSchema
}