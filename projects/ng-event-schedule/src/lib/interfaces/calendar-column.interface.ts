import ICalendarItem from "./calendar-item.interface";

export default interface ICalendarColumn {
    title: string;
    items: ICalendarItem[];
}