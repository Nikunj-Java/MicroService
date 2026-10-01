import { Component, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-holding-summary',
  styleUrl: './holding-summary.css',
  templateUrl: './holding-summary.html',
})
export class HoldingSummary {
  holdings=signal(10);
  addHoldings(){
    return this.holdings.update(n => n + 1);
  }
  removeHoldings(){
    return this.holdings.update(n => n - 1);
  }
}
