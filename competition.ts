import puppeteer from 'puppeteer';
import moment from "moment";

export namespace Competition {
    const baseUrl = "https://app.equibel.be/prg/events/"
    export type Competition = {
        name: string,
        detailUrl: string,
        status: string,
        closingDate?: moment.Moment | null,
        startDate?: moment.Moment,
        endDate?: moment.Moment
    }
    export function createEmptyCompetition(){
        return {
            name: '',
            detailUrl: '',
            status: ''
        }
    }
    export async function scrapeCompetitions(): Promise<Array<Competition>>{
        const browser = await puppeteer.launch({});
        const page = await browser.newPage();

        await page.goto('https://app.equibel.be/prg/events/search.php?dfd=30&dfm=11&dfy=2022&dtd=30&dtm=8&dty=2023&ename=&discipline=CC&level=&grp=&fed=&btnSearch=Zoek');
        let table = await page.waitForSelector("table.listtable");
        let competitionsRaw = await table?.$$('tr[onmouseover]');
        if(!competitionsRaw) throw new Error('no competitions found');

        let competitions: Array<Competition> = [];
        for(let competitionRaw of competitionsRaw){
            let competition: Competition = createEmptyCompetition();
            // get place & level
            let fullName = (await (await competitionRaw.$(':nth-child(4)'))?.evaluate(el => el.textContent))?.trim();
            if(!fullName) throw new Error('Couldn\'t extract the full name of the competition');
            competition.name = fullName;

            // get start and end date
            let dateRange = await (await competitionRaw.$(':nth-child(1)'))?.evaluate(el => el.textContent);
            if(!dateRange) throw new Error('Couldn\'t extract the date range of the competition');
            competition.endDate = moment(dateRange.split('-')[1].trim(), 'DD/MM/YYYY');
            competition.startDate = moment(`${dateRange.split('-')[0].trim()}/${competition.endDate.year()}`, 'DD/MM/YYYY');

            //get status
            let status = await (await competitionRaw.$(':nth-child(6)'))?.evaluate(el => el.textContent?.trim());
            if(status === 'Afgelast') competition.status = 'Canceled';
            else {
                if(moment().add(1, 'day').isAfter(competition.endDate)) competition.status = 'Finished';
                else if (moment().isAfter(competition.startDate)) competition.status = 'Active';
                else competition.status = 'Upcoming'
            }

            // get detail url
            let detailUrl = await (await competitionRaw.$(':nth-child(1)'))?.evaluate(el => el.getAttribute('onclick'));
            if(!detailUrl) throw new Error('Couldn\'t extract the detail url of the competition');
            competition.detailUrl = `${baseUrl}${detailUrl.substring(detailUrl.indexOf('=\'') + 2, detailUrl.length - 2)}`;

            competitions.push(competition);
        }
        browser.close();
        return competitions;
    }
}