import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MaskService {

  constructor() { }

  /**
   * Aplica máscara de CPF (000.000.000-00)
   * @param value Valor a ser formatado
   * @returns Valor formatado
   */
  applyCpfMask(value: string): string {
    if (!value) return '';

    // Remove tudo que não é dígito
    const numericValue = value.replace(/\D/g, '');

    // Aplica a máscara
    return numericValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  }

  /**
   * Aplica máscara de telefone (00) 00000-0000
   * @param value Valor a ser formatado
   * @returns Valor formatado
   */
  applyPhoneMask(value: string): string {
    if (!value) return '';

    // Remove tudo que não é dígito
    const numericValue = value.replace(/\D/g, '');

    // Aplica a máscara
    if (numericValue.length <= 10) {
      // Telefone fixo: (00) 0000-0000
      return numericValue
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
    } else {
      // Celular: (00) 00000-0000
      return numericValue
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
    }
  }

  /**
   * Aplica máscara de data DD/MM/AAAA de forma inteligente
   * @param value Valor a ser formatado
   * @returns Valor formatado
   */
  applyDateMask(value: string): string {
    if (!value) return '';

    // Remove tudo que não é dígito
    const numericValue = value.replace(/\D/g, '');

    // Limita a 8 dígitos (DDMMAAAA)
    const limitedValue = numericValue.substring(0, 8);

    // Aplica a máscara de forma progressiva
    if (limitedValue.length <= 2) {
      return limitedValue;
    } else if (limitedValue.length <= 4) {
      return limitedValue.replace(/(\d{2})(\d+)/, '$1/$2');
    } else {
      return limitedValue.replace(/(\d{2})(\d{2})(\d+)/, '$1/$2/$3');
    }
  }

  /**
   * Aplica máscara de data inteligente para digitação contínua
   * Exemplo: 11920 se torna 11/9/20, 11092025 se torna 11/09/2025
   * @param value Valor a ser formatado
   * @returns Valor formatado
   */
  applySmartDateMask(value: string): string {
    if (!value) return '';

    // Remove tudo que não é dígito
    const numericValue = value.replace(/\D/g, '');

    // Limita a 8 dígitos
    const limitedValue = numericValue.substring(0, 8);

    if (limitedValue.length === 0) return '';
    if (limitedValue.length <= 2) return limitedValue;
    if (limitedValue.length <= 4) return limitedValue.replace(/(\d{2})(\d+)/, '$1/$2');

    // Para 5+ dígitos, aplicar formato DD/MM/AAAA
    return limitedValue.replace(/(\d{2})(\d{2})(\d+)/, '$1/$2/$3');
  }

  /**
   * Aplica máscara de CEP (00000-000)
   * @param value Valor a ser formatado
   * @returns Valor formatado
   */
  applyCepMask(value: string): string {
    if (!value) return '';

    // Remove tudo que não é dígito
    const numericValue = value.replace(/\D/g, '');

    // Aplica a máscara
    return numericValue
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  }

  /**
   * Remove todas as máscaras de um valor
   * @param value Valor com máscara
   * @returns Valor sem máscara
   */
  removeMask(value: string): string {
    if (!value) return '';
    return value.replace(/\D/g, '');
  }

  /**
   * Valida CPF
   * @param cpf CPF a ser validado (com ou sem máscara)
   * @returns true se válido, false se inválido
   */
  validateCpf(cpf: string): boolean {
    if (!cpf) return false;

    // Remove máscara
    const numericCpf = this.removeMask(cpf);

    // Verifica se tem 11 dígitos
    if (numericCpf.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(numericCpf)) return false;

    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numericCpf.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numericCpf.charAt(9))) return false;

    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numericCpf.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numericCpf.charAt(10))) return false;

    return true;
  }
}
