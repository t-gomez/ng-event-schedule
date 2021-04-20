import { Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { defaultConfig } from './config/default.config';
import ICalendarCell from './interfaces/calendar-cell.interface';
import CalendarColumnBreakpoints from './interfaces/calendar-column-breakpoints.interface';
import ICalendarColumn from './interfaces/calendar-column.interface';
import ICalendarItem from './interfaces/calendar-item.interface';

@Component({
  selector: 'ng-event-schedule[columns][startHour][endHour]',
  templateUrl: 'ng-event-schedule.component.html',
  styles: [
  ]
})
export class NgEventScheduleComponent implements OnChanges {
  @Input() columns!: ICalendarColumn[];
  @Input() startHour!: number;
  @Input() endHour!: number;
  @Input() cellHeight: string = defaultConfig.cellHeight;
  @Input() gridGap: string = defaultConfig.gridGap;
  @Input() columnBreakpoints: CalendarColumnBreakpoints = defaultConfig.columnBreakpoints;
  @Output() selectItem = new EventEmitter<ICalendarItem>();
  @Output() selectCell = new EventEmitter<ICalendarCell>();

  itemsPerHour: number = defaultConfig.itemsPerHour;
  loading = true;  
  rows: moment.Moment[] = [];
  timeRows: number[] = [];
  maxColumnsPerPage = 0;
  currentPage = 0;
  multiLineThreshold = 3;

  constructor() { }

  ngOnChanges(): void {
    this.initializeCalendar();
  }

  @HostListener('window:resize', ['$event']) 
  onResize() {
    this.calculateMaxColumns();
  }

  calculateMaxColumns(): void {
    const currentWidth = window.outerWidth;

    let currentBp: number = 0;

    for (const bp in this.columnBreakpoints) {
      if (currentWidth < +bp) {
        if (!currentBp) {
          currentBp = +bp;
        }

        break;
      }

      currentBp = +bp;
    }

    if (this.maxColumnsPerPage !== this.columnBreakpoints[currentBp]) {
      this.currentPage = 0;
      this.maxColumnsPerPage = this.columnBreakpoints[currentBp];
    }
  }

  get totalPages(): number {
    return Math.ceil(this.columns.length / this.maxColumnsPerPage - 1);
  }
  
  get cellheightStyle() {
    return {
      'height': this.cellHeight
    };
  }
  
  get gridLayout() {
    return {
      'grid-template-rows': `repeat(${this.rows.length}, 1fr)`,
      'grid-template-columns': `repeat(${this.maxColumnsPerPage}, minmax(150px, 1fr))`,
      'gap': this.gridGap
    };
  }
  
  get gridRowHelperLayout() {
    return {
      'grid-template-rows': `repeat(${this.rows.length + 1}, 1fr)`,
      'gap': this.gridGap
    };
  }
  
  get gridColumnHelperLayout() {
    return {
      'grid-template-columns': `repeat(${this.maxColumnsPerPage}, 1fr)`,
      'gap': this.gridGap
    };
  }

  get gridOverlayLayout() {
    return {
      'grid-template-rows': `repeat(${this.rows.length * this.itemsPerHour}, calc(${this.cellHeight} / ${this.itemsPerHour})`,
      'grid-template-columns': `repeat(${this.maxColumnsPerPage}, minmax(150px, 1fr))`,
      'row-gap': `calc(${this.gridGap} / ${this.itemsPerHour})`,
      'column-gap': this.gridGap
    };
  }

  get currentColumns(): ICalendarColumn[] {
    return this.columns.slice(this.maxColumnsPerPage * this.currentPage, this.maxColumnsPerPage * (this.currentPage + 1));
  }

  get showPrevPageButton(): boolean {
    return this.totalPages > 0 && this.currentPage > 0;
  }

  get showNextPageButton(): boolean {
    return this.totalPages > 0 && this.currentPage < this.totalPages;
  }
  
  getItemLayout(index: number, item: ICalendarItem) {
    const startDate = moment(item.start);
    const endDate = moment(item.end);

    const startIndex = this.getGridIndex(startDate);
    const endIndex = this.getGridIndex(endDate);

    if (startIndex === 0 || endIndex === 0) {
      console.error(`'${item.title}' could not be placed on the grid.`)

      return {
        'display': 'none'
      };
    }
    
    return {
      'grid-row': `${startIndex} / ${endIndex}`,
      'grid-column': `${index} / ${index + 1}`
    };
  }
  
  getItemPaddingClass(item: ICalendarItem) {
    return this.isMultiLine(item) || this.itemsPerHour <= 2 ? 'p-3' : 'px-3';
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }
  
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  cellClicked(index: number): void {
    const columnIndex = index % this.maxColumnsPerPage;
    const rowIndex = Math.floor(index / this.maxColumnsPerPage);
    
    if (columnIndex > this.currentColumns.length - 1) {
      return;
    }
    
    const column = this.currentColumns[columnIndex];
    const hours = this.timeRows.filter(x => x > 0)[rowIndex];

    this.selectCell.emit({ column: columnIndex, columnTitle: column.title, hours });
  }

  isMultiLine(item: ICalendarItem): boolean {
    const startDate = moment(item.start);
    const endDate = moment(item.end);

    const startIndex = this.getGridIndex(startDate);
    const endIndex = this.getGridIndex(endDate);

    return endIndex - startIndex > this.multiLineThreshold;
  }

  formatRowHelper(row: moment.Moment): string {
    return row.format('H:mm');
  }

  formatItemTime(item: ICalendarItem): string {
    const startDate = moment(item.start);
    const endDate = moment(item.end);

    return `${startDate.format('HH:mm')} - ${endDate.format('HH:mm')}`;
  }

  private getGridIndex(date: moment.Moment): number {
    let t = date.get('hours');
    const m = date.get('minutes')
    if (m > 0) {
      t += m / 60;
    }
    
    return this.timeRows.indexOf(t) + 1;
  }

  private initializeCalendar(): void {
    if (this.startHour === undefined || this.endHour === undefined) {
      return;
    }

    if (!this.validateCalendarHours()) {
      return;
    }

    this.resetCalendar();

    this.calculateMaxColumns();
    
    const startTime = moment().startOf('day').set('hours', this.startHour);
    const endTime = moment().startOf('day').set('hours', this.endHour);
    
    this.addOffsetTimeRows();

    this.timeRows.push(startTime.get('hours'));

    for (const d = moment(startTime); d.isSameOrBefore(endTime); d.add(1, 'hour')) {
      const _d = moment(d);
      this.rows.push(_d);

      if (d.isBefore(endTime)) {
        const t = _d.get('hours');
        const p = 100 / this.itemsPerHour;
  
        for (let i = 1; i <= this.itemsPerHour; i++) {
          const _t = t + (p * i / 100);
          this.timeRows.push(_t);
        }
      }
    }

    this.loading = false;
  }

  private validateCalendarHours(): boolean {
    if (this.startHour < 0 || this.startHour > 23) {
      console.error('Invalid start hour');
      return false;
    }

    if (this.endHour < 1 || this.endHour > 24) {
      console.error('Invalid end hour');
      return false;
    }

    if (this.startHour > this.endHour) {
      console.error('Start hour cannot be higher than end hour');
      return false;
    }

    return true;
  }

  private resetCalendar(): void {
    this.currentPage = 0;
    this.rows = [];
    this.timeRows = [];
  }

  private addOffsetTimeRows(): void {
    for (let i = 1; i <= this.itemsPerHour; i++) {
      this.timeRows.push(0);
    }
  }
}
