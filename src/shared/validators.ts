// Добавим в файл с компонентом или вынесем в отдельный файл
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  /**
   * Валидатор для телефона с поддержкой разных форматов
   */
  public static phoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value: string = control.value.toString();
      // Разрешаем + в начале, цифры, пробелы, скобки, дефисы
      const phoneRegex: RegExp = /^[+\s()\d-]{10,20}$/;
      // Проверяем, что есть хотя бы 10 цифр
      const digitCount: number = (value.match(/\d/g) || []).length;

      if (!phoneRegex.test(value)) {
        return { invalidPhoneFormat: true };
      }

      if (digitCount < 10) {
        return { insufficientDigits: { required: 10, actual: digitCount } };
      }

      if (digitCount > 15) {
        return { excessiveDigits: { required: 15, actual: digitCount } };
      }

      return null;
    };
  }

  /**
   * Валидатор для email с улучшенной проверкой
   */
  public static email(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(control.value) ? null : { invalidEmail: true };
    };
  }

  /**
   * Валидатор для даты (не будущая дата)
   */
  public static pastDate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const selectedDate: Date = new Date(control.value);
      const today: Date  = new Date();

      if (selectedDate > today) {
        return { futureDate: true };
      }

      return null;
    };
  }

  /**
   * Валидатор для российского автомобильного номера
   */
  public static carNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value: string = control.value.toString().toUpperCase();

      // Паттерн: буква + 3 цифры + 2 буквы + 2-3 цифры региона (А222АА77 или А222АА777)
      const carNumberRegex: RegExp = /^[АВЕКМНОРСТУХABEKMHOPCTYX]{1}\d{3}[АВЕКМНОРСТУХABEKMHOPCTYX]{2}\d{2,3}$/i;

      if (!carNumberRegex.test(value)) {
        return { invalidCarNumber: true };
      }

      // Дополнительная проверка региона (от 1 до 999)
      const regionPart: RegExpMatchArray | null = value.match(/\d{2,3}$/);
      if (regionPart) {
        const region: number = parseInt(regionPart[0], 10);
        if (region < 1 || region > 999) {
          return { invalidRegion: true };
        }
      }

      return null;
    };
  }
}
