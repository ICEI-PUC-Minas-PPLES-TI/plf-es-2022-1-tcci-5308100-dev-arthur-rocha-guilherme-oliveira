import { OperationsService } from './core/services/operations/operations.service';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { Type } from '@angular/core';

describe('AppComponent', () => {
  function getComponentInstance<T>(component: Type<T>): T {
    const fixture = TestBed.createComponent(component);
    return fixture.componentInstance;
  }
  function getServiceInstance<T>(component: Type<T>): T {
    const service = TestBed.inject(component);
    return service;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [OperationsService],
    }).compileComponents();
  });

  it('should create the app', () => {
    const app = getComponentInstance(AppComponent);
    expect(app).toBeTruthy();
  });

  it('should append number to the input value', () => {
    const component = getComponentInstance(AppComponent);
    component.appendNumber(0);
    expect(component.inputValue).toBe(0);

    component.appendNumber(0);
    expect(component.inputValue).toBe(0);

    component.appendNumber(4);
    expect(component.inputValue).toBe(4);

    component.appendNumber(0);
    expect(component.inputValue).toBe(40);
  });

  it('should clear the input', () => {
    const component = getComponentInstance(AppComponent);

    component.inputValue = 123;

    component.clear();

    expect(component.inputValue).toBe(0);
  });

  it('should delete the last inputted number', () => {
    const component = getComponentInstance(AppComponent);

    component.inputValue = 123;

    component.backspace();
    expect(component.inputValue).toBe(12);
    component.backspace();
    expect(component.inputValue).toBe(1);
    component.backspace();
    expect(component.inputValue).toBe(0);
    component.backspace();
    expect(component.inputValue).toBe(0);
  });

  it(`should select the operator`, () => {
    const component = getComponentInstance(AppComponent);

    component.inputValue = 8;

    expect(component.firstNumberInputted).toBeUndefined();
    expect(component.selectedOperator).toBeUndefined();

    component.setOperator('*');

    expect(component.inputValue).toBe(0);
    expect(component.firstNumberInputted).toBe(8);
    expect(component.selectedOperator).toBe('*');
  });

  it('should show the result', () => {
    const component = getComponentInstance(AppComponent);

    component.inputValue = 8;
    expect(component.firstNumberInputted).toBeUndefined();
    expect(component.selectedOperator).toBeUndefined();

    component.showResult();

    expect(component.inputValue).toBe(8);
    expect(component.firstNumberInputted).toBeUndefined();
    expect(component.selectedOperator).toBeUndefined();

    component.setOperator('*');
    component.inputValue = 4;

    component.showResult();

    expect(component.inputValue).toBe(32);
    expect(component.selectedOperator).toBeUndefined();
    expect(component.justResulted).toBeTrue();
  });

  it('should type a new number after show a result', () => {
    const component = getComponentInstance(AppComponent);

    component.inputValue = 8;
    component.setOperator('*');
    component.inputValue = 4;
    component.showResult();

    expect(component.inputValue).toBe(32);

    component.appendNumber(4);

    expect(component.inputValue).toBe(4);
  });

  it(`should calculate a sum`, () => {
    const component = getComponentInstance(AppComponent);
    const operationsService = getServiceInstance(OperationsService);

    const sumSpy = spyOn(operationsService, 'sum').and.returnValue(12);

    component.inputValue = 8;
    component.setOperator('+');
    component.inputValue = 4;

    const result = component.calculate();

    expect(sumSpy).toHaveBeenCalledOnceWith(8, 4);
    expect(result).toBe(12);
  });

  it(`should calculate a subtraction`, () => {
    const component = getComponentInstance(AppComponent);
    const operationsService = getServiceInstance(OperationsService);

    const subtractSpy = spyOn(operationsService, 'subtract').and.returnValue(4);

    component.inputValue = 8;
    component.setOperator('-');
    component.inputValue = 4;

    const result = component.calculate();

    expect(subtractSpy).toHaveBeenCalledOnceWith(8, 4);
    expect(result).toBe(4);
  });

  it(`should calculate a multiplication`, () => {
    const component = getComponentInstance(AppComponent);
    const operationsService = getServiceInstance(OperationsService);

    const multiplicateSpy = spyOn(
      operationsService,
      'multiplicate'
    ).and.returnValue(32);

    component.inputValue = 8;
    component.setOperator('*');
    component.inputValue = 4;

    const result = component.calculate();

    expect(multiplicateSpy).toHaveBeenCalledOnceWith(8, 4);
    expect(result).toBe(32);
  });

  it(`should calculate a division`, () => {
    const component = getComponentInstance(AppComponent);
    const operationsService = getServiceInstance(OperationsService);

    const diviseSpy = spyOn(operationsService, 'divise').and.returnValue(2);

    component.inputValue = 8;
    component.setOperator('/');
    component.inputValue = 4;

    const result = component.calculate();

    expect(diviseSpy).toHaveBeenCalledOnceWith(8, 4);
    expect(result).toBe(2);
  });
});
