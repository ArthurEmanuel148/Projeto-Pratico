-- ============================================================================
-- CIPALAM - SCRIPT CONSOLIDADO DE ATUALIZAÇÕES
-- Data: 24/08/2025
-- Descrição: Consolida todas as modificações feitas no sistema durante a sessão
-- ============================================================================

USE Cipalam;

-- ============================================================================
-- 1. INSERIR NOVA FUNCIONALIDADE: TIPOS DE DOCUMENTO
-- ============================================================================

INSERT INTO
    tbFuncionalidade (
        chave,
        nomeAmigavel,
        descricao,
        icone,
        categoria,
        tipo,
        ordemExibicao
    )
VALUES (
        'tiposDocumento',
        'Tipos de Documento',
        'Gerenciar tipos de documentos do sistema',
        'document-outline',
        'matriculas',
        'configuracao',
        34
    )
ON DUPLICATE KEY UPDATE
    nomeAmigavel = 'Tipos de Documento',
    descricao = 'Gerenciar tipos de documentos do sistema',
    icone = 'document-outline',
    categoria = 'matriculas',
    tipo = 'configuracao',
    ordemExibicao = 34;

-- ============================================================================
-- 2. ATUALIZAR STORED PROCEDURE: sp_IniciarMatricula
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_IniciarMatricula;

DELIMITER $$

CREATE PROCEDURE sp_IniciarMatricula(
    IN p_idDeclaracao INT,
    IN p_idTurma INT,
    IN p_idFuncionario INT
)
BEGIN
    DECLARE v_idFamilia INT;
    DECLARE v_idResponsavel INT;
    DECLARE v_idAluno INT;
    DECLARE v_usuarioLogin VARCHAR(45);
    DECLARE v_senhaLogin VARCHAR(255);
    DECLARE v_cpfResponsavel VARCHAR(14);
    DECLARE v_ultimosQuatroCPF VARCHAR(4);
    DECLARE v_proximaMatricula VARCHAR(20);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    
    -- 1. CRIAR FAMÍLIA com dados da declaração
    INSERT INTO tbFamilia (
        cep, logradouro, numero, complemento, bairro, cidade, uf, 
        codigoIbgeCidade, pontoReferencia, numeroIntegrantes, 
        integrantesRenda, dadosFamiliaresPreenchidos, tipoCota, observacoes
    )
    SELECT 
        cep, logradouro, numero, complemento, bairro, cidade, uf,
        codigoIbgeCidade, pontoReferencia, numeroIntegrantes,
        integrantesRenda, dadosFamiliaresPreenchidos, tipoCota,
        CONCAT('Família criada automaticamente da declaração: ', protocolo)
    FROM tbInteresseMatricula 
    WHERE id = p_idDeclaracao;
    
    SET v_idFamilia = LAST_INSERT_ID();
    
    -- 2. CRIAR PESSOA RESPONSÁVEL
    INSERT INTO tbPessoa (
        NmPessoa, CpfPessoa, dtNascPessoa, telefone, email
    )
    SELECT 
        nomeResponsavel, cpfResponsavel, dataNascimentoResponsavel, 
        telefoneResponsavel, emailResponsavel
    FROM tbInteresseMatricula 
    WHERE id = p_idDeclaracao;
    
    SET v_idResponsavel = LAST_INSERT_ID();
    
    -- 3. CRIAR RESPONSÁVEL
    INSERT INTO tbResponsavel (tbPessoa_idPessoa, tbFamilia_idtbFamilia)
    VALUES (v_idResponsavel, v_idFamilia);
    
    -- 4. CRIAR PESSOA ALUNO
    INSERT INTO tbPessoa (
        NmPessoa, CpfPessoa, dtNascPessoa
    )
    SELECT 
        nomeAluno, cpfAluno, dataNascimentoAluno
    FROM tbInteresseMatricula 
    WHERE id = p_idDeclaracao;
    
    SET v_idAluno = LAST_INSERT_ID();
    
    -- 5. GERAR PRÓXIMA MATRÍCULA
    SELECT IFNULL(MAX(CAST(matricula AS UNSIGNED)), 0) + 1 INTO v_proximaMatricula
    FROM tbAluno 
    WHERE matricula REGEXP '^[0-9]+$';
    
    -- 6. CRIAR ALUNO
    INSERT INTO tbAluno (
        tbPessoa_idPessoa, tbFamilia_idtbFamilia, tbTurma_idtbTurma, matricula
    ) VALUES (
        v_idAluno, v_idFamilia, p_idTurma, v_proximaMatricula
    );
    
    -- 7. PREPARAR DADOS DE LOGIN
    SELECT cpfResponsavel INTO v_cpfResponsavel 
    FROM tbInteresseMatricula 
    WHERE id = p_idDeclaracao;
    
    -- Usuario = CPF sem formatação
    SET v_usuarioLogin = REPLACE(REPLACE(v_cpfResponsavel, '.', ''), '-', '');
    
    -- Senha = últimos 4 dígitos do CPF (será hasheada pelo Spring Boot)
    SET v_ultimosQuatroCPF = RIGHT(REPLACE(REPLACE(v_cpfResponsavel, '.', ''), '-', ''), 4);
    
    -- 8. CRIAR LOGIN (senha em texto claro por enquanto)
    INSERT INTO tblogin (usuario, senha, tbPessoa_idPessoa)
    VALUES (v_usuarioLogin, v_ultimosQuatroCPF, v_idResponsavel);
    
    -- 9. CRIAR DOCUMENTOS PENDENTES
    CALL sp_CriarDocumentosPendentes(v_idFamilia, v_idAluno);
    
    -- 10. ATUALIZAR STATUS DA DECLARAÇÃO
    UPDATE tbInteresseMatricula 
    SET 
        status = 'matricula_iniciada',
        dataInicioMatricula = NOW(),
        funcionarioResponsavel_idPessoa = p_idFuncionario,
        responsavelLogin_idPessoa = v_idResponsavel
    WHERE id = p_idDeclaracao;
    
    -- 11. ATUALIZAR CAPACIDADE DA TURMA
    UPDATE tbTurma 
    SET capacidadeAtual = capacidadeAtual + 1 
    WHERE idtbTurma = p_idTurma;
    
    -- 12. LOG DA AÇÃO
    INSERT INTO tbLogMatricula (
        tbInteresseMatricula_id, acao, descricao, usuario_idPessoa
    ) VALUES (
        p_idDeclaracao, 
        'MATRICULA_INICIADA', 
        CONCAT('Matrícula iniciada - Aluno: ', v_proximaMatricula, ' - Turma: ', p_idTurma),
        p_idFuncionario
    );
    
    COMMIT;
    
    -- Retornar dados importantes
    SELECT 
        v_idFamilia as idFamilia,
        v_idResponsavel as idResponsavel, 
        v_idAluno as idAluno,
        v_proximaMatricula as matricula,
        v_usuarioLogin as loginResponsavel,
        v_ultimosQuatroCPF as senhaTemporaria;
        
END$$

DELIMITER;

-- ============================================================================
-- 3. ATUALIZAR STORED PROCEDURE: sp_CriarDocumentosPendentes
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_CriarDocumentosPendentes;

DELIMITER $$

CREATE PROCEDURE `sp_CriarDocumentosPendentes`(
    IN p_idFamilia INT,
    IN p_idAluno INT
)
BEGIN
    DECLARE v_tipoCota VARCHAR(50);
    DECLARE v_documentosObrigatorios TEXT;
    DECLARE v_finished INTEGER DEFAULT 0;
    DECLARE v_tipoDocumentoId INT;
    
    -- Cursor para iterar pelos documentos configurados
    DECLARE doc_cursor CURSOR FOR 
    SELECT CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(TRIM(BOTH '"' FROM REPLACE(v_documentosObrigatorios, '"', '')), ',', numbers.n), ',', -1) AS UNSIGNED) as documento_id
    FROM (
        SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 
        UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
        UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15
        UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20
    ) numbers 
    WHERE n <= (CHAR_LENGTH(v_documentosObrigatorios) - CHAR_LENGTH(REPLACE(v_documentosObrigatorios, ',', '')) + 1);
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_finished = 1;
    
    -- Obter o tipo de cota da família
    SELECT tipoCota INTO v_tipoCota FROM tbFamilia WHERE idtbFamilia = p_idFamilia;
    
    -- Buscar configuração de documentos para o tipo de cota
    SELECT documentosObrigatorios INTO v_documentosObrigatorios 
    FROM tbConfiguracaoDocumentosCota 
    WHERE tipoCota = v_tipoCota 
    LIMIT 1;
    
    -- Se existe configuração personalizada, usar os documentos configurados
    IF v_documentosObrigatorios IS NOT NULL AND v_documentosObrigatorios != '' THEN
        -- Limpar caracteres especiais do JSON
        SET v_documentosObrigatorios = REPLACE(REPLACE(REPLACE(v_documentosObrigatorios, '[', ''), ']', ''), '"', '');
        
        -- Abrir cursor e iterar pelos documentos configurados
        OPEN doc_cursor;
        
        read_loop: LOOP
            FETCH doc_cursor INTO v_tipoDocumentoId;
            
            IF v_finished = 1 THEN
                LEAVE read_loop;
            END IF;
            
            -- Verificar se o tipo de documento existe e está ativo
            IF EXISTS (SELECT 1 FROM tbTipoDocumento WHERE idTipoDocumento = v_tipoDocumentoId AND ativo = 1) THEN
                -- Inserir documento para a família
                INSERT INTO tbDocumentoMatricula (
                    tbTipoDocumento_idTipoDocumento, 
                    tbFamilia_idtbFamilia, 
                    status
                ) VALUES (
                    v_tipoDocumentoId, 
                    p_idFamilia, 
                    'pendente'
                );
                
                -- Se o documento requer anexo para aluno específico, inserir também para o aluno
                IF EXISTS (
                    SELECT 1 FROM tbTipoDocumento 
                    WHERE idTipoDocumento = v_tipoDocumentoId 
                    AND requerAnexo = 1 
                    AND (descricao LIKE '%aluno%' OR descricao LIKE '%estudante%')
                ) THEN
                    INSERT INTO tbDocumentoMatricula (
                        tbTipoDocumento_idTipoDocumento, 
                        tbFamilia_idtbFamilia,
                        tbAluno_idPessoa,
                        status
                    ) VALUES (
                        v_tipoDocumentoId, 
                        p_idFamilia,
                        p_idAluno,
                        'pendente'
                    );
                END IF;
            END IF;
        END LOOP;
        
        CLOSE doc_cursor;
        
    ELSE
        -- Fallback: usar comportamento anterior baseado em tipoCota da tbTipoDocumento
        INSERT INTO tbDocumentoMatricula (
            tbTipoDocumento_idTipoDocumento, 
            tbFamilia_idtbFamilia, 
            status
        )
        SELECT 
            td.idTipoDocumento,
            p_idFamilia,
            'pendente'
        FROM tbTipoDocumento td
        WHERE td.ativo = 1 
        AND (td.tipoCota = v_tipoCota OR td.tipoCota = 'todas');
        
        -- Inserir documentos específicos do aluno se necessário
        INSERT INTO tbDocumentoMatricula (
            tbTipoDocumento_idTipoDocumento, 
            tbFamilia_idtbFamilia,
            tbAluno_idPessoa,
            status
        )
        SELECT 
            td.idTipoDocumento,
            p_idFamilia,
            p_idAluno,
            'pendente'
        FROM tbTipoDocumento td
        WHERE td.ativo = 1 
        AND (td.tipoCota = v_tipoCota OR td.tipoCota = 'todas')
        AND td.requerAnexo = 1
        AND (td.descricao LIKE '%aluno%' OR td.descricao LIKE '%estudante%');
    END IF;
    
END$$

DELIMITER;

-- ============================================================================
-- 4. VERIFICAÇÃO E LIMPEZA
-- ============================================================================

-- Verificar se as procedures foram criadas corretamente
SELECT 'Verificando procedures criadas...' as Status;

SELECT
    ROUTINE_NAME as 'Procedure Name',
    ROUTINE_TYPE as 'Type',
    CREATED as 'Created',
    LAST_ALTERED as 'Last Modified'
FROM information_schema.ROUTINES
WHERE
    ROUTINE_SCHEMA = 'Cipalam'
    AND ROUTINE_NAME IN (
        'sp_IniciarMatricula',
        'sp_CriarDocumentosPendentes'
    );

-- Verificar se a funcionalidade foi inserida
SELECT 'Verificando funcionalidade inserida...' as Status;

SELECT
    chave,
    nomeAmigavel,
    descricao,
    categoria,
    tipo,
    ordemExibicao
FROM tbFuncionalidade
WHERE
    chave = 'tiposDocumento';

-- ============================================================================
-- 5. SCRIPTS DE TESTE (OPCIONAL)
-- ============================================================================

-- Descomente as linhas abaixo para testar as procedures:

/*
-- Teste da procedure sp_IniciarMatricula
CALL sp_IniciarMatricula(10, 1, 1);

-- Verificar documentos criados
SELECT 
dm.idDocumentoMatricula,
td.nome as tipoDocumento,
dm.status,
f.tipoCota
FROM tbDocumentoMatricula dm
INNER JOIN tbTipoDocumento td ON dm.tbTipoDocumento_idTipoDocumento = td.idTipoDocumento
INNER JOIN tbFamilia f ON dm.tbFamilia_idtbFamilia = f.idtbFamilia
WHERE f.idtbFamilia = (SELECT MAX(idtbFamilia) FROM tbFamilia)
ORDER BY td.ordemExibicao;
*/

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================

SELECT 'Script consolidado executado com sucesso!' as Status;

SELECT NOW() as 'Data/Hora Execução';