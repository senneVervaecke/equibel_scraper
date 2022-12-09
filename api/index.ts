import moment from "moment";
import { Database } from "../database/database";
import express from 'express';
import dotenv from 'dotenv';
import { Discipline } from "../objects/enum";

dotenv.config();
const app = express();
const router = express.Router()

router.get('/', (req, res) => {
    res.send('Hello World!')
});

router.get('/competitions', async (req, res) => {
    let competitions = await Database.getCompetitions(moment(), moment().add(3, 'month'), Discipline.Eventing);
    res.send(competitions.map(c => c.toResponseObject()));
});

app.use('/api', router);

app.listen(process.env.PORT, () => {
    console.log(`Example app listening at http://localhost:${process.env.PORT}`)
});