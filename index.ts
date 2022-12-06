import {Competition} from "./competition";
import {CompetitionDetail} from "./competitionDetail";

(async ()=> {
    let competitions = await Competition.scrapeCompetitions();
    for(let competition of competitions){
        competition.closingDate = await CompetitionDetail.scrapeClosingDate(competition.detailUrl);
    }
    console.log(competitions);
})();
