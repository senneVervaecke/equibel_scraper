import puppeteer from "puppeteer";
import moment from "moment";

export namespace CompetitionDetailScraper {
    export async function scrapeClosingDate(detailUrl: string): Promise<moment.Moment | null>{
        const browser = await puppeteer.launch({});
        const page = await browser.newPage();

        await page.goto(detailUrl);
        let tds = await page.$$(`#infodata td[align="right"]`);
        if(!tds || tds.length !== 2) throw new Error(`Couldn\'t extract the closing date for ${detailUrl}`);
        let closingDate = await tds[1].evaluate(el => el.textContent?.trim());
        if(!closingDate) throw new Error(`The element's textContent for the closing date is null for ${detailUrl}`);

        browser.close();
        if(closingDate === '00/00/0000') return null;
        return moment(closingDate, 'DD/MM/YYYY');
    }
}