import moment from "moment";
import { CompetitionScraper } from "./competitionScraper";
import {CompetitionDetailScraper} from "./competitionDetailScraper";
import { Database } from "../database/database";
import { Discipline } from "../objects/enum";

(async ()=> {
    await Database.removeCompetitions();
    let competitions = await CompetitionScraper.scrapeCompetitions(moment(), moment().add(3, 'month'), Discipline.Eventing);
    for(let competition of competitions){
        competition.closingDate = await CompetitionDetailScraper.scrapeClosingDate(competition.detailUrl);
    }
    await Database.updateOrCreateCompetitions(competitions);
    console.log(competitions);
})();
