import { Component, OnInit } from '@angular/core';

import { UserService } from '../core/services/canvas';
import { Course, PlannerItem } from '../core/schemas';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  // Holds all stream items (planner) by date.
  stream: {
    id: string
    items: PlannerItem[];
    completed: PlannerItem[];
  }[] = [];
  // Records what portion of the stream is loaded.
  streamState: { start: Date, end: Date };

  constructor(private userService: UserService) { }

  async ngOnInit(): Promise<void> {
    // Initialize streamstate with date, rounded to 12AM.
    let now = new Date();
    now = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    this.streamState = { start: now, end: now };

    // Load three "intervals" (up to 30 items or 3 days of content)
    this.getItems(3);
  }

  private getItems(intervals: number) {
    // Get new interval of items day-by-day
    const next = new Date(this.streamState.end.getTime() + 86400*1000);
    this.userService.getPlanner(this.streamState.end, next, items => {
      this.populateStream(items);

      // Record what part of the stream is loaded.
      const endDate = new Date(items[items.length-1].plannable_date);
      this.streamState.end = new Date(endDate.getTime() + 1);

      // If target not reached, do a recursion
      if (intervals > 0)
        this.getItems(intervals - 1);
    });
  }

  // Populates stream with events from API
  private populateStream(upcoming: PlannerItem[]): void {
    // Remove the previous 10 items.
    this.stream = this.stream.splice(this.stream.length - 11, 10);
    upcoming.forEach(item => {
      let date = this.formatDate(item.plannable_date);

      let complete = false;
      if (item.submissions.submitted ||
          item.submissions.graded ||
          item.planner_override?.dismissed ||
          item.planner_override?.marked_complete ||
          item.plannable?.workflow_state === "completed")
        complete = true;

      const index = this.stream?.findIndex(i => i.id == date);
      if (index == -1)
        if (complete)
          this.stream.push({ id: date, items: [], completed: [item] });
        else
          this.stream.push({ id: date, items: [item], completed: [] });
      else
        if (complete)
          this.stream[index].completed.push(item);
        else
          this.stream[index].items.push(item);
    });
  }

  // Formats a datestring into a human readable date.
  private formatDate(date: string): string {
    let f = new Date(date);
    let today = new Date();
    let tmmrw = new Date(today.getTime() + 86400*1000);
    let ystdy = new Date(today.getTime() - 86400*1000);

    if (f.toDateString() === today.toDateString())
      return "Today";
    else if (f.toDateString() === tmmrw.toDateString())
      return `Tomorrow (${f.toDateString()})`;
    else if (f.toDateString() === ystdy.toDateString())
      return `Yesterday (${f.toDateString()})`;
    else
      return f.toDateString();
  }

}
