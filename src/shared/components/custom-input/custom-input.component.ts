import { Component, Input, forwardRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormsModule
} from '@angular/forms';

/**
 * Кастомный компонент input с поддержкой ControlValueAccessor
 */
@Component({
  selector: 'app-custom-input',
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss'],
  imports: [CommonModule, FormsModule],
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomInputComponent),
      multi: true
    }
  ]
})
export class CustomInputComponent implements ControlValueAccessor {
  @Input() public label: string = '';
  @Input() public type: string = 'text';
  @Input() public placeholder: string = '';
  @Input() public disabled: boolean = false;
  @Input() public required: boolean = false;
  @Output() public blurEvent: EventEmitter<void> = new EventEmitter<void>();

  public value: string = '';
  public touched: boolean = false;

  /**
   * Устанавливает значение поля из внешнего источника
   *
   * @param value - значение для установки
   */
  public writeValue(value: string): void {
    this.value = value || '';
  }

  /**
   * Регистрирует callback функцию для уведомления об изменении значения
   *
   * @param fn - функция обратного вызова
   */
  public registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  /**
   * Регистрирует callback функцию для уведомления о касании поля
   *
   * @param fn - функция обратного вызова
   */
  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Устанавливает состояние disabled для поля
   *
   * @param isDisabled - флаг отключения поля
   */
  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /**
   * Обработчик события input
   *
   * @param event - событие input
   */
  public onInput(event: Event): void {
    const value: string = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
  }

  /**
   * Обработчик события blur
   */
  public onInputBlur(): void {
    this.touched = true;
    this.onTouched();
    this.blurEvent.emit();
  }

  /** Callback функция для уведомления об изменении значения */
  private onChange: (value: string) => void = (): void => {
  };

  /** Callback функция для уведомления о касании поля */
  private onTouched: () => void = (): void => {
  };
}
