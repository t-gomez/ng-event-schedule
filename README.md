# NgEventSchedule [![npm version](https://img.shields.io/npm/v/ng-event-schedule.svg?style=flat-square)](https://www.npmjs.com/package/ng-event-schedule) 

NgEventSchedule is a fully responsive Angular component that displays an event calendar for the day.

[![Demo Screenshot][preview-screenshot]](https://ng-event-schedule-demo.vercel.app/)

[preview-screenshot]: images/demo.png

Built with Tailwind CSS and moment.js

[Live Demo](https://ng-event-schedule-demo.vercel.app/)

## Installation

```shell
npm install --save ng-event-schedule
```

## Link assets

In `angular.json`
```json
"architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            ...
            "assets": [
              "src/favicon.ico",
              "src/assets",
              {
                "glob": "**/*",
                "input": "./node_modules/ng-event-schedule/assets/",
                "output": "./assets/"
              }
            ],
            ...
```

## Getting Started

Import `NgEventScheduleModule` in your root application module:

```typescript
import { NgModule } from '@angular/core';
import { NgEventScheduleModule } from 'ng-event-schedule';

@NgModule({
    imports: [
        // ...
        NgEventScheduleModule
    ],
})
export class AppModule { }
```

Insert `ng-event-schedule` component in your template:

```html
<ng-event-schedule
    [columns]="columns"
    [startHour]="startHour"
    [endHour]="endHour">
</ng-event-schedule>
```

Note: Tailwind CSS must be set up on your app for styles to display correctly.


## Options

| Option | Required | Default | Description |
| ---- | ---- | ---- | ---- |
| columns | Required | null | An array of `ICalendarColumn` objects, these are the columns that will be displayed with its corresponding items|
| startHour | Required | null | The start hour of the calendar. |
| endHour | Required | null | The end hour of the calendar. |
| cellHeight | Optional | '5rem' | The height of each calendar cell, supports any format supported on CSS syntax. (px, rem, em, vh, etc.) |
| gridGap | Optional | '0.125rem' | The gap between each calendar cell, supports any format supported on CSS syntax. (px, rem, em, vh, etc.) |
| columnBreakpoints | Optional | Detailed below | An object of type `{ [number]: number }` where the key is the breakpoint (px) and the value is the amount of columns shown for that particular breakpoint

### Default column count breakpoints
```typescript
{
    400: 1,
    640: 1,
    768: 2,
    1024: 2,
    1280: 3,
    1440: 4,
    1535: 4,
    1780: 5,
    2080: 6
}
```

## Events

| Event | Description | Output |
| ---- | ---- | ---- |
| selectItem | Triggered when one of the items is clicked | ICalendarItem |
| selectCell | Triggered when a calendar cell is clicked | ICalendarCell |

`ICalendarItem`
```typescript
{
    title: string,
    description?: string,
    start: moment.Moment | string,
    end: moment.Moment | string
}
```

`ICalendarCell`
```typescript
{
    column: number,
    columnTitle: string,
    hours: number
}
```
