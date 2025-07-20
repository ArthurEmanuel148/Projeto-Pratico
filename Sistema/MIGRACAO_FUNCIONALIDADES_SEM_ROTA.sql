-- ===================================================================
-- MIGRAÇÃO: REMOÇÃO DAS ROTAS DA TABELA tbFuncionalidade
-- Data: 19/07/2025
-- Descrição: Remove a coluna 'rota' e adiciona 'categoria' na tbFuncionalidade
-- ===================================================================

USE `Cipalam`;

-- Backup dos dados atuais (para segurança)
CREATE TABLE IF NOT EXISTS `tbFuncionalidade_backup_20250719` AS
SELECT *
FROM `tbFuncionalidade`;

-- Adicionar nova coluna 'categoria' se não existir
ALTER TABLE `tbFuncionalidade`
ADD COLUMN IF NOT EXISTS `categoria` ENUM(
    'menu',
    'acao',
    'configuracao'
) DEFAULT 'menu' AFTER `pai`;

-- Atualizar categorias baseadas nas funcionalidades existentes
UPDATE `tbFuncionalidade`
SET
    `categoria` = 'menu'
WHERE
    `chave` IN (
        'painel',
        'funcionarios',
        'matriculas',
        'alunos',
        'administracao'
    );

UPDATE `tbFuncionalidade`
SET
    `categoria` = 'acao'
WHERE
    `chave` IN (
        'cadastroFuncionario',
        'gerenciamentoFuncionarios',
        'declaracoesInteresse',
        'declaracaoInteresse'
    );

UPDATE `tbFuncionalidade`
SET
    `categoria` = 'configuracao'
WHERE
    `chave` IN ('configurarDocumentosCota');

-- Remover a coluna 'rota' (cuidadosamente)
-- Primeiro verificar se a coluna existe
SET
    @column_exists = (
        SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE
            TABLE_SCHEMA = 'Cipalam'
            AND TABLE_NAME = 'tbFuncionalidade'
            AND COLUMN_NAME = 'rota'
    );

-- Se a coluna existir, removê-la
SET
    @sql = IF(
        @column_exists > 0,
        'ALTER TABLE `tbFuncionalidade` DROP COLUMN `rota`',
        'SELECT "Coluna rota não existe, continuando..." as status'
    );

PREPARE stmt FROM @sql;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

-- Verificar o resultado
SELECT 'Migração de funcionalidades concluída com sucesso!' as status;

-- Mostrar estrutura atual da tabela
DESCRIBE `tbFuncionalidade`;

-- Exibir dados atualizados
SELECT
    `chave`,
    `nomeAmigavel`,
    `categoria`,
    `pai`,
    `ordemExibicao`,
    `ativo`
FROM `tbFuncionalidade`
ORDER BY `ordemExibicao`;

-- ===================================================================
-- DOCUMENTAÇÃO DA MUDANÇA
-- ===================================================================

INSERT INTO
    `tbLogMatricula` (
        `tbInteresseMatricula_id`,
        `acao`,
        `descricao`,
        `usuario_idPessoa`,
        `dadosAntes`,
        `dadosDepois`
    )
VALUES (
        1, -- ID fictício para log
        'MIGRACAO_SISTEMA',
        'Migração: Remoção de rotas da tabela tbFuncionalidade e adição de categorias',
        1, -- Admin
        JSON_OBJECT(
            'estrutura_anterior',
            'tbFuncionalidade com coluna rota'
        ),
        JSON_OBJECT(
            'estrutura_nova',
            'tbFuncionalidade sem rota, com categoria'
        )
    )
ON DUPLICATE KEY UPDATE
    `descricao` = VALUES(`descricao`);

-- ===================================================================
-- VERIFICAÇÃO DE INTEGRIDADE
-- ===================================================================

-- Verificar se todas as funcionalidades têm categoria definida
SELECT
    COUNT(*) as total_funcionalidades,
    COUNT(
        CASE
            WHEN categoria IS NOT NULL THEN 1
        END
    ) as com_categoria,
    COUNT(
        CASE
            WHEN categoria IS NULL THEN 1
        END
    ) as sem_categoria
FROM `tbFuncionalidade`;

-- Listar funcionalidades sem categoria (se houver)
SELECT
    `chave`,
    `nomeAmigavel`,
    `categoria`
FROM `tbFuncionalidade`
WHERE
    `categoria` IS NULL;

-- Verificar hierarquia do menu
SELECT
    f1.chave as pai_chave,
    f1.nomeAmigavel as pai_nome,
    f1.categoria as pai_categoria,
    f2.chave as filho_chave,
    f2.nomeAmigavel as filho_nome,
    f2.categoria as filho_categoria
FROM
    `tbFuncionalidade` f1
    LEFT JOIN `tbFuncionalidade` f2 ON f1.chave = f2.pai
ORDER BY f1.ordemExibicao, f2.ordemExibicao;

-- ===================================================================
-- NOTAS IMPORTANTES
-- ===================================================================

/*
APÓS EXECUTAR ESTA MIGRAÇÃO:

1. FRONTEND: 
- As rotas agora são gerenciadas pelo RotasConfigService
- FuncionalidadesSistemaService não retorna mais 'rota'
- MenuNavigationService mapeia funcionalidades para rotas

2. BACKEND: 
- Atualizar modelos/DTOs para remover campo 'rota'
- Adicionar campo 'categoria' nos endpoints
- Funcionalidades retornadas sem rota

3. TESTES:
- Verificar se todas as funcionalidades têm categoria
- Testar navegação usando RotasConfigService
- Validar permissões funcionam corretamente

4. ROLLBACK (se necessário):
- Restaurar de tbFuncionalidade_backup_20250719
- Reverter mudanças no frontend
*/