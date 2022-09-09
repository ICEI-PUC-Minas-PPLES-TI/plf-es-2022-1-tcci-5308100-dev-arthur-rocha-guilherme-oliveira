import { OperationsService } from './core/services/operations/operations.service';
import { Component } from '@angular/core';

type Operator = '-' | '+' | '*' | '/';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public readonly numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  public readonly operators: Operator[] = ['-', '+', '*', '/'];

  public inputValue = 0;
  public firstNumberInputted?: number;
  public selectedOperator?: Operator;

  public justResulted = false;

  constructor(private operationsService: OperationsService) {}

  public appendNumber(value: number) {
    if (this.justResulted) {
      this.inputValue = value;
      this.justResulted = false;
      return;
    }

    let inputAsString = String(this.inputValue);

    while (inputAsString.startsWith('0')) {
      inputAsString = inputAsString.split('0', 1)[0];
    }

    this.inputValue = parseFloat(inputAsString.concat(value.toString()));
  }

  public clear() {
    this.inputValue = 0;
    this.justResulted = false;
  }

  public backspace() {
    if (this.inputValue !== 0) {
      const inputAsString = String(this.inputValue);
      const strLength = inputAsString.length;
      const newValue =
        strLength > 1 ? inputAsString.substring(0, strLength - 1) : '0';

      this.inputValue = parseFloat(newValue);
    }
  }

  public setOperator(operator: Operator) {
    this.firstNumberInputted = this.inputValue;
    this.inputValue = 0;
    this.selectedOperator = operator;
  }

  public showResult() {
    const calculatedValue = this.calculate();

    if (calculatedValue !== undefined) {
      this.inputValue = calculatedValue;
      this.selectedOperator = undefined;
      this.justResulted = true;
    }
  }

  public calculate(): number | undefined {
    if (
      this.selectedOperator &&
      (this.firstNumberInputted || this.firstNumberInputted === 0)
    ) {
      let result = 0;

      switch (this.selectedOperator) {
        case '+':
          result = this.operationsService.sum(
            this.firstNumberInputted,
            this.inputValue
          );
          break;
        case '-':
          result = this.operationsService.subtract(
            this.firstNumberInputted,
            this.inputValue
          );
          break;
        case '*':
          result = this.operationsService.multiplicate(
            this.firstNumberInputted,
            this.inputValue
          );
          break;
        case '/':
          result = this.operationsService.divise(
            this.firstNumberInputted,
            this.inputValue
          );
          break;
      }

      return result;
    } else {
      return undefined;
    }
  }
}
