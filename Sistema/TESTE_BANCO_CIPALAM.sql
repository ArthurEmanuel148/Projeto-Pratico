-- ===================================================================
-- SCRIPT DE TESTE PARA VALIDAR O BANCO CIPALAM
-- Execute este script APÓS executar o CIPALAM_COMPLETO_FINAL.sql
-- ===================================================================

USE Cipalam;

-- 1. Verificar se as tabelas principais foram criadas
SELECT 'Tabelas principais criadas:' as teste;

SELECT
    table_name as tabela,
    table_rows as registros_aproximados
FROM information_schema.tables
WHERE
    table_schema = 'Cipalam'
ORDER BY table_name;

-- 2. Verificar views criadas
SELECT 'Views criadas:' as teste;

SELECT table_name as view_name
FROM information_schema.views
WHERE
    table_schema = 'Cipalam'
ORDER BY table_name;

-- 3. Verificar procedures criadas
SELECT 'Procedures criadas:' as teste;

SELECT routine_name as procedure_name
FROM information_schema.routines
WHERE
    routine_schema = 'Cipalam'
    AND routine_type = 'PROCEDURE'
ORDER BY routine_name;

-- 4. Verificar functions criadas
SELECT 'Functions criadas:' as teste;

SELECT routine_name as function_name
FROM information_schema.routines
WHERE
    routine_schema = 'Cipalam'
    AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 5. Testar views principais
SELECT 'Teste view turmas disponíveis:' as teste;

SELECT * FROM vw_turmas_para_selecao LIMIT 3;

SELECT 'Teste view declarações para matrícula:' as teste;

SELECT
    id,
    protocolo,
    nomeResponsavel,
    tipoCotaDescricao
FROM vw_declaracoes_para_matricula
LIMIT 3;

-- 6. Testar function de validação
SELECT 'Teste function de validação:' as teste;

SELECT fn_ValidarIniciarMatricula (1, 1) as resultado_validacao;

-- 7. Verificar dados de teste
SELECT 'Usuários de teste criados:' as teste;

SELECT l.usuario, p.NmPessoa, f.ativo as eh_funcionario
FROM
    tblogin l
    JOIN tbPessoa p ON l.tbPessoa_idPessoa = p.idPessoa
    LEFT JOIN tbFuncionario f ON p.idPessoa = f.tbPessoa_idPessoa
WHERE
    l.ativo = TRUE;

SELECT 'Turmas criadas:' as teste;

SELECT
    nomeTurma,
    periodo,
    capacidadeMaxima,
    vagasDisponiveis
FROM vw_turmas_para_selecao;

-- 8. Verificar configuração de documentos
SELECT 'Configuração documentos por cota:' as teste;

SELECT tipoCota, JSON_LENGTH(documentosObrigatorios) as total_documentos
FROM tbConfiguracaoDocumentosCota;

-- 9. Status final
SELECT
    'BANCO CIPALAM VALIDADO COM SUCESSO!' as status,
    NOW() as data_teste,
    'Pronto para uso em desenvolvimento' as observacao;