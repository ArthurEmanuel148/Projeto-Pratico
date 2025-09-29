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

  /**
   * Validador de data de nascimento no formato DD/MM/AAAA
   * @returns ValidatorFn
   */
  static birthDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const dateValue = control.value.toString().trim();
      
      // Verifica o formato DD/MM/AAAA
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const match = dateValue.match(dateRegex);
      
      if (!match) {
        return { dataFormatoInvalido: true };
      }
      
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const year = parseInt(match[3], 10);
      
      // Verifica se é uma data válida
      const date = new Date(year, month - 1, day);
      
      if (date.getDate() !== day || 
          date.getMonth() !== month - 1 || 
          date.getFullYear() !== year) {
        return { dataInvalida: true };
      }
      
      // Verifica se a data não é no futuro
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date > today) {
        return { dataNoFuturo: true };
      }
      
      // Verifica se a data não é muito antiga (mais de 120 anos)
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 120);
      
      if (date < minDate) {
        return { dataMuitoAntiga: true };
      }
      
      return null;
    };
  }

  /**
   * Validador de data de início que considera a data de nascimento
   * @param birthDateControlName Nome do controle da data de nascimento
   * @returns ValidatorFn
   */
  static startDateValidator(birthDateControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const dateValue = control.value.toString().trim();
      
      // Verifica o formato DD/MM/AAAA
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const match = dateValue.match(dateRegex);
      
      if (!match) {
        return { dataFormatoInvalido: true };
      }
      
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const year = parseInt(match[3], 10);
      
      // Verifica se é uma data válida
      const startDate = new Date(year, month - 1, day);
      
      if (startDate.getDate() !== day || 
          startDate.getMonth() !== month - 1 || 
          startDate.getFullYear() !== year) {
        return { dataInvalida: true };
      }
      
      // Verifica se a data não é no futuro
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate > today) {
        return { dataNoFuturo: true };
      }
      
      // Verifica comparação com data de nascimento apenas se ela existir e for válida
      const parentForm = control.parent;
      if (parentForm) {
        const birthDateControl = parentForm.get(birthDateControlName);
        if (birthDateControl && birthDateControl.value && birthDateControl.valid) {
          const birthDateValue = birthDateControl.value.toString().trim();
          const birthMatch = birthDateValue.match(dateRegex);
          
          if (birthMatch) {
            const birthDay = parseInt(birthMatch[1], 10);
            const birthMonth = parseInt(birthMatch[2], 10);
            const birthYear = parseInt(birthMatch[3], 10);
            const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
            
            // Só verifica se a data de nascimento é válida
            if (birthDate.getDate() === birthDay && 
                birthDate.getMonth() === birthMonth - 1 && 
                birthDate.getFullYear() === birthYear) {
              
              // Verifica se a data de início não é anterior à data de nascimento
              if (startDate < birthDate) {
                return { dataAnteriorNascimento: true };
              }
            }
          }
        }
      }
      
      return null;
    };
  }
}
