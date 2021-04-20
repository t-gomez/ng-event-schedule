import * as moment from "moment";

export default interface ICalendarItem {
    title: string;
    description?: string;
    start: moment.Moment | string;
    end: moment.Moment | string;
}