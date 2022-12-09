import moment from "moment";
import { Discipline, CompetitionStatus } from "./enum";

export class Competition {
    name: string;
    detailUrl: string;
    status: CompetitionStatus;
    code: string;
    discipline: Discipline;
    closingDate?: moment.Moment | null;
    startDate?: moment.Moment;
    endDate?: moment.Moment;

    constructor(name: string, detailUrl: string, status: CompetitionStatus, code: string, discipline: Discipline, startDate?: moment.Moment, endDate?: moment.Moment, closingDate?: moment.Moment | null) {
        this.name = name;
        this.detailUrl = detailUrl;
        this.status = status;
        this.code = code;
        this.discipline = discipline;
        this.startDate = startDate;
        this.endDate = endDate;
        this.closingDate = closingDate;
    }

    toDbObject(): any {
        return {
            name: this.name,
            detailUrl: this.detailUrl,
            status: this.status,
            code: this.code,
            discipline: this.discipline,
            startDate: this.startDate?.valueOf(),
            endDate: this.endDate?.valueOf(),
            closingDate: this.closingDate?.valueOf() ?? null
        }
    }

    toResponseObject(): any {
        return {
            name: this.name,
            status: this.status,
            discipline: this.discipline,
            startDate: this.startDate?.format('DD/MM/YYYY'),
            endDate: this.endDate?.format('DD/MM/YYYY'),
            closingDate: this.closingDate?.format('DD/MM/YYYY') ?? null
        }
    }

    static fromDbObject(dbObject: any): Competition {
        return new Competition(
            dbObject.name,
            dbObject.detailUrl,
            CompetitionStatus[dbObject.status as keyof typeof CompetitionStatus],
            dbObject.code,
            Discipline[dbObject.discipline as keyof typeof Discipline],
            moment(dbObject.startDate),
            moment(dbObject.endDate),
            dbObject.closingDate ? moment(dbObject.closingDate) : null
        );
    }

    static createEmpty(): Competition {
        return new Competition('', '', CompetitionStatus.Unknown, '', Discipline.Unknown);
    }
}