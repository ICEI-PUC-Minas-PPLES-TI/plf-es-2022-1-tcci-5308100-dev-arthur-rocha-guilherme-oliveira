import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OperationsService {
  public sum(a: number, b: number) {
    return a + b;
  }

  public subtract(a: number, b: number) {
    return a - b;
  }

  public multiplicate(a: number, b: number) {
    return a * b;
  }

  public divise(a: number, b: number) {
    return a / b;
  }
}
