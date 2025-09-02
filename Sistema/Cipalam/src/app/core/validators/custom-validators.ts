import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MaskService } from '../services/mask.service';

export class CustomValidators {
  
  /**
   * Validador de CPF
   * @returns ValidatorFn
   */
  static cpfValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const maskService = new MaskService();
      const isValid = maskService.validateCpf(control.value);
      
      return isValid ? null : { cpfInvalido: true };
    };
  }

  /**
   * Validador de telefone brasileiro
   * @returns ValidatorFn
   */
  static phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const numericValue = control.value.replace(/\D/g, '');
      
      // Aceita telefone fixo (10 dígitos) ou celular (11 dígitos)
      if (numericValue.length !== 10 && numericValue.length !== 11) {
        return { phoneInvalido: true };
      }
      
      return null;
    };
  }

  /**
   * Validador de CEP
   * @returns ValidatorFn
   */
  static cepValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const numericValue = control.value.replace(/\D/g, '');
      
      if (numericValue.length !== 8) {
        return { cepInvalido: true };
      }
      
      return null;
    };
  }
}
