import puppeteer, { Page } from 'puppeteer';
import moment from "moment";
import { Competition } from '../objects/competition';
import { Discipline, CompetitionStatus } from "../objects/enum";


export namespace CompetitionScraper {
    const baseUrl = "https://app.equibel.be/prg/events/"

    export function disciplineToCode(discipline: Discipline): string {
        switch (discipline) {
            case Discipline.Eventing: return 'CC';
            case Discipline.Dressage: return 'CD';
            case Discipline.Jumping: return 'CS';
            default: return '';
        }
    }

    export function constructUrl(from: moment.Moment, to: moment.Moment ,discipline: Discipline, page: number): string {
        return `${baseUrl}search.php?dfd=${from.date()}&dfm=${from.month() + 1}&dfy=${from.year()}&dtd=${to.date()}&dtm=${to.month() + 1}&dty=${to.year()}&ename=&discipline=${disciplineToCode(discipline)}&level=&grp=&fed=&btnSearch=Zoek&page=${page}`;
    }

    export async function scrapeCompetitions(from: moment.Moment, to: moment.Moment ,discipline: Discipline): Promise<Array<Competition>>{
        const browser = await puppeteer.launch({});
        const page = await browser.newPage();
        let pageCounter = 1;
        let competitions: Array<Competition> = [];
        let newCompetitions: Array<Competition> = [];
        do {
            let url = constructUrl(from, to, discipline, pageCounter++);
            newCompetitions = await scrapeCompetitionPage(page, url);
            competitions.push(...newCompetitions);

        } while (newCompetitions.length > 0);
        competitions.forEach(competition => competition.discipline = discipline);
        browser.close();
        return competitions;    
    }

    export async function scrapeCompetitionPage(page: Page, url: string): Promise<Array<Competition>> {
        await page.goto(url);
        // check if there are any competitions
        let noRecords = await page.$('img[src="/images/icons/error.png"]');
        if(noRecords) return [];

        let table = await page.waitForSelector("table.listtable");
        let competitionsRaw = await table?.$$('tr[onmouseover]');
        if(!competitionsRaw) throw new Error('no competitions found');

        let competitions: Array<Competition> = [];
        for(let competitionRaw of competitionsRaw){
            let competition = Competition.createEmpty();
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
            if(status === 'Afgelast') competition.status = CompetitionStatus.Canceled;
            else {
                if(moment().add(1, 'day').isAfter(competition.endDate)) competition.status = CompetitionStatus.Finished;
                else if (moment().isAfter(competition.startDate)) competition.status = CompetitionStatus.Ongoing;
                else competition.status = CompetitionStatus.Upcoming;
            }

            // get code
            let code = await (await competitionRaw.$(':nth-child(2)'))?.evaluate(el => el.textContent?.trim());
            if(!code) throw new Error('Couldn\'t extract the code of the competition');
            competition.code = code;

            // get detail url
            let detailUrl = await (await competitionRaw.$(':nth-child(1)'))?.evaluate(el => el.getAttribute('onclick'));
            if(!detailUrl) throw new Error('Couldn\'t extract the detail url of the competition');
            competition.detailUrl = `${baseUrl}${detailUrl.substring(detailUrl.indexOf('=\'') + 2, detailUrl.length - 2)}`;

            competitions.push(competition);
        }
        return competitions;
    }
}