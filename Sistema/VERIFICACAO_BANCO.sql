-- ===================================================================
-- SCRIPT DE VERIFICAÇÃO - EXECUTE APÓS O BANCO PRINCIPAL
-- Verifica se todas as estruturas foram criadas corretamente
-- ===================================================================

USE Cipalam;

-- Verificação 1: Tabelas principais criadas
SELECT 'VERIFICAÇÃO 1 - TABELAS PRINCIPAIS' as status;

SELECT table_name as 'Tabela', table_rows as 'Registros'
FROM information_schema.tables
WHERE
    table_schema = 'Cipalam'
    AND table_name IN (
        'tbInteresseMatricula',
        'tbTipoDocumento',
        'tbConfiguracaoDocumentosCota',
        'tbPessoa',
        'tblogin'
    )
ORDER BY table_name;

-- Verificação 2: Declarações de interesse
SELECT 'VERIFICAÇÃO 2 - DECLARAÇÕES DE INTERESSE' as status;

SELECT
    protocolo,
    nomeResponsavel,
    nomeAluno,
    tipoCota,
    status,
    DATE(dataEnvio) as dataEnvio
FROM tbInteresseMatricula
ORDER BY dataEnvio DESC;

-- Verificação 3: Tipos de documento por cota
SELECT 'VERIFICAÇÃO 3 - DOCUMENTOS POR COTA' as status;

SELECT tipoCota, COUNT(*) as total_documentos
FROM tbTipoDocumento
GROUP BY
    tipoCota
UNION ALL
SELECT 'TODOS' as tipoCota, COUNT(*) as total_documentos
FROM tbTipoDocumento
WHERE
    tipoCota IS NULL;

-- Verificação 4: Configuração de documentos por cota
SELECT 'VERIFICAÇÃO 4 - CONFIGURAÇÃO DOCUMENTOS' as status;

SELECT
    tipoCota,
    JSON_LENGTH(documentosObrigatorios) as qtd_documentos_obrigatorios,
    dataAtualizacao
FROM tbConfiguracaoDocumentosCota;

-- Verificação 5: Usuários do sistema
SELECT 'VERIFICAÇÃO 5 - USUÁRIOS DO SISTEMA' as status;

SELECT
    p.NmPessoa as nome,
    l.usuario,
    CASE
        WHEN d.tbPessoa_idPessoa IS NOT NULL THEN 'Diretor'
        WHEN pr.tbPessoa_idPessoa IS NOT NULL THEN 'Professor'
        WHEN e.tbPessoa_idPessoa IS NOT NULL THEN 'Estagiário'
        ELSE 'Responsável'
    END as tipo_usuario,
    l.ativo
FROM
    tbPessoa p
    LEFT JOIN tblogin l ON p.idPessoa = l.tbPessoa_idPessoa
    LEFT JOIN tbDiretor d ON p.idPessoa = d.tbPessoa_idPessoa
    LEFT JOIN tbProfessor pr ON p.idPessoa = pr.tbPessoa_idPessoa
    LEFT JOIN tbEstagiario e ON p.idPessoa = e.tbPessoa_idPessoa
WHERE
    l.usuario IS NOT NULL
ORDER BY p.idPessoa;

-- Verificação 6: Funcionalidades e permissões
SELECT 'VERIFICAÇÃO 6 - FUNCIONALIDADES' as status;

SELECT f.chave, f.nomeAmigavel, f.pai, COUNT(p.idPermissao) as usuarios_com_permissao
FROM
    tbFuncionalidade f
    LEFT JOIN tbPermissao p ON f.idFuncionalidade = p.tbFuncionalidade_idFuncionalidade
    AND p.temPermissao = TRUE
GROUP BY
    f.idFuncionalidade,
    f.chave,
    f.nomeAmigavel,
    f.pai
ORDER BY f.ordemExibicao;

-- Verificação 7: Views criadas
SELECT 'VERIFICAÇÃO 7 - VIEWS DISPONÍVEIS' as status;

SELECT
    table_name as view_name,
    view_definition as definicao
FROM information_schema.views
WHERE
    table_schema = 'Cipalam';

-- Verificação 8: Teste da view de declarações
SELECT 'VERIFICAÇÃO 8 - TESTE VIEW DECLARAÇÕES' as status;

SELECT
    protocolo,
    nomeResponsavel,
    nomeAluno,
    tipoVagaFormatado,
    statusFormatado
FROM vw_declaracoes_completas
LIMIT 5;

-- ===================================================================
-- RESULTADO ESPERADO:
-- - 3 declarações de interesse
-- - 13 tipos de documento
-- - 3 configurações de cota
-- - 3 usuários (admin, professor, responsável)
-- - 10 funcionalidades principais
-- - 2 views funcionando
-- ===================================================================

SELECT 'VERIFICAÇÃO CONCLUÍDA - VERIFIQUE OS RESULTADOS ACIMA' as status;