import moment from "moment";
import { MongoClient, ServerApiVersion } from "mongodb";
import { Competition } from "../objects/competition";
import dotenv from "dotenv";
import { Discipline } from "../objects/enum";


export namespace Database {
    dotenv.config();
    const connectionString = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@senne.ziuqtvx.mongodb.net/?retryWrites=true&w=majority`;

    export async function updateOrCreateCompetition(competition: Competition): Promise<void> {
       const client = new MongoClient(connectionString);
       await client.db('Equibel').collection('Competitions').updateOne({code: competition.code}, {$set: competition.toDbObject()}, {upsert: true});
       client.close();
    }

    export async function updateOrCreateCompetitions(competitions: Array<Competition>): Promise<void> {
        for(let competition of competitions){
            await updateOrCreateCompetition(competition);
        }
    }

    export async function getCompetition(code:string) {
        const client = new MongoClient(connectionString);
        const competition = await client.db('Equibel').collection('Competitions').findOne({code: code});
        client.close();
    }

    export async function getCompetitions(startDate: moment.Moment, endDate: moment.Moment, discipline: Discipline): Promise<Array<Competition>> {
        const client = new MongoClient(connectionString);
        const competitions = await client.db('Equibel').collection('Competitions').find({startDate: {$gte: startDate.valueOf()}, endDate: {$lte: endDate.valueOf()}, discipline: {$eq: discipline}}).toArray();
        client.close();
        return competitions.map(competition => Competition.fromDbObject(competition));
    }

    export async function removeCompetitions() {
        const client = new MongoClient(connectionString);
        await client.db('Equibel').collection('Competitions').deleteMany({});
        client.close();
    }
}