package com.cipalam.cipalam_sistema.converter;

// CONVERTER REMOVIDO - Campo periodo foi removido da entidade Turma
// Mantido apenas para evitar erros de compilação

/*
 * import com.cipalam.cipalam_sistema.model.Turma.PeriodoEnum;
 * import jakarta.persistence.AttributeConverter;
 * import jakarta.persistence.Converter;
 * 
 * @Converter(autoApply = true)
 * public class PeriodoEnumConverter implements AttributeConverter<PeriodoEnum,
 * String> {
 * 
 * @Override
 * public String convertToDatabaseColumn(PeriodoEnum periodo) {
 * if (periodo == null) {
 * return null;
 * }
 * return periodo.getValor();
 * }
 * 
 * @Override
 * public PeriodoEnum convertToEntityAttribute(String valor) {
 * if (valor == null || valor.trim().isEmpty()) {
 * return null;
 * }
 * return PeriodoEnum.fromValor(valor);
 * }
 * }
 */
