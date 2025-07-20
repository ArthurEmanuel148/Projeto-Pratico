-- ===================================================================
-- QUERIES DE VERIFICAÇÃO - TIPOS DE USUÁRIO CIPALAM
-- ===================================================================

-- 1. VERIFICAR TODOS OS USUÁRIOS E SEUS TIPOS
SELECT
    l.usuario,
    p.NmPessoa,
    CASE
        WHEN p.NmPessoa = 'Administrador do Sistema'
        OR l.usuario = 'admin' THEN 'admin'
        WHEN f.idFuncionario IS NOT NULL THEN 'funcionario'
        WHEN r.tbPessoa_idPessoa IS NOT NULL THEN 'responsavel'
        WHEN a.tbPessoa_idPessoa IS NOT NULL THEN 'aluno'
        ELSE 'indefinido'
    END as tipoUsuario,
    CASE
        WHEN f.idFuncionario IS NOT NULL THEN '🏢 Painel Administrativo'
        WHEN r.tbPessoa_idPessoa IS NOT NULL THEN '👨‍👩‍👧‍👦 Dashboard Responsável'
        WHEN p.NmPessoa = 'Administrador do Sistema' THEN '⚙️ Painel Admin'
        ELSE '❓ Sem Redirecionamento Definido'
    END as TelaDestino
FROM
    tblogin l
    INNER JOIN tbPessoa p ON l.tbPessoa_idPessoa = p.idPessoa
    LEFT JOIN tbFuncionario f ON p.idPessoa = f.tbPessoa_idPessoa
    LEFT JOIN tbResponsavel r ON p.idPessoa = r.tbPessoa_idPessoa
    LEFT JOIN tbAluno a ON p.idPessoa = a.tbPessoa_idPessoa
WHERE
    l.ativo = TRUE
    AND p.ativo = TRUE;

-- ===================================================================

-- 2. VERIFICAR PESSOAS COM LOGIN MAS SEM TIPO DEFINIDO
SELECT p.idPessoa, p.NmPessoa, p.email, l.usuario, 'PRECISA SER CATEGORIZADO!' as Problema
FROM
    tblogin l
    INNER JOIN tbPessoa p ON l.tbPessoa_idPessoa = p.idPessoa
    LEFT JOIN tbFuncionario f ON p.idPessoa = f.tbPessoa_idPessoa
    LEFT JOIN tbResponsavel r ON p.idPessoa = r.tbPessoa_idPessoa
    LEFT JOIN tbAluno a ON p.idPessoa = a.tbPessoa_idPessoa
WHERE
    l.ativo = TRUE
    AND p.ativo = TRUE
    AND p.NmPessoa != 'Administrador do Sistema'
    AND f.idFuncionario IS NULL
    AND r.tbPessoa_idPessoa IS NULL
    AND a.tbPessoa_idPessoa IS NULL;

-- ===================================================================

-- 3. VERIFICAR FUNCIONÁRIOS CADASTRADOS
SELECT
    f.idFuncionario,
    p.NmPessoa,
    p.email,
    f.dataInicio,
    f.ativo as funcionarioAtivo,
    l.usuario,
    COUNT(perm.idPermissao) as qtdPermissoes
FROM
    tbFuncionario f
    INNER JOIN tbPessoa p ON f.tbPessoa_idPessoa = p.idPessoa
    LEFT JOIN tblogin l ON p.idPessoa = l.tbPessoa_idPessoa
    LEFT JOIN tbPermissao perm ON p.idPessoa = perm.tbPessoa_idPessoa
    AND perm.temPermissao = TRUE
WHERE
    f.ativo = TRUE
GROUP BY
    f.idFuncionario;

-- ===================================================================

-- 4. VERIFICAR RESPONSÁVEIS CADASTRADOS
SELECT r.tbFamilia_idtbFamilia as idFamilia, p.NmPessoa, p.email, l.usuario, fam.rendaFamiliar, fam.rendaPerCapita
FROM
    tbResponsavel r
    INNER JOIN tbPessoa p ON r.tbPessoa_idPessoa = p.idPessoa
    LEFT JOIN tblogin l ON p.idPessoa = l.tbPessoa_idPessoa
    LEFT JOIN tbFamilia fam ON r.tbFamilia_idtbFamilia = fam.idtbFamilia;

-- ===================================================================

-- 5. RESUMO GERAL DO SISTEMA
SELECT 'TOTAL USUÁRIOS COM LOGIN' as Categoria, COUNT(*) as Quantidade
FROM tblogin l
WHERE
    l.ativo = TRUE
UNION ALL
SELECT 'ADMINISTRADORES' as Categoria, COUNT(*) as Quantidade
FROM tblogin l
    INNER JOIN tbPessoa p ON l.tbPessoa_idPessoa = p.idPessoa
WHERE (
        p.NmPessoa = 'Administrador do Sistema'
        OR l.usuario = 'admin'
    )
    AND l.ativo = TRUE
UNION ALL
SELECT 'FUNCIONÁRIOS' as Categoria, COUNT(*) as Quantidade
FROM tbFuncionario f
WHERE
    f.ativo = TRUE
UNION ALL
SELECT 'RESPONSÁVEIS' as Categoria, COUNT(*) as Quantidade
FROM tbResponsavel r
UNION ALL
SELECT 'ALUNOS' as Categoria, COUNT(*) as Quantidade
FROM tbAluno a
WHERE
    a.statusAluno = 'ativo';

-- ===================================================================
-- INSTRUÇÕES DE USO:
--
-- 1. Execute o arquivo CIPALAM_CORRIGIDO.sql no seu MySQL
-- 2. Execute estas queries para verificar se está tudo correto
-- 3. A Query 1 deve mostrar:
--    - admin: Administrador do Sistema
--    - funcionario: João Professor Silva
--    - responsavel: Maria Responsável Santos
--
-- 4. Se a Query 2 retornar resultados, há pessoas que precisam
--    ser categorizadas como funcionário, responsável ou aluno
-- ===================================================================