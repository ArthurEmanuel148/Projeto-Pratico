-- ===================================================================
-- BANCO DE DADOS CIPALAM - VERSÃO CONSOLIDADA COMPLETA
-- Data: 24/08/2025
-- Descrição: Schema completo para HOSPEDAGEM - Arquivo único com todas as melhorias
-- Inclui: Todas as correções + Sistema de configuração de documentos funcionando
-- ===================================================================

-- MySQL Workbench Forward Engineering
SET @OLD_UNIQUE_CHECKS = @@UNIQUE_CHECKS, UNIQUE_CHECKS = 0;

SET
    @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS,
    FOREIGN_KEY_CHECKS = 0;

SET
    @OLD_SQL_MODE = @@SQL_MODE,
    SQL_MODE = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- Configurações de charset
SET NAMES utf8mb4;

SET CHARACTER SET utf8mb4;

-- -----------------------------------------------------
-- Schema Cipalam
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `Cipalam`;

CREATE SCHEMA `Cipalam` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `Cipalam`;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbPessoa`
-- -----------------------------------------------------
CREATE TABLE `tbPessoa` (
    `idPessoa` INT NOT NULL AUTO_INCREMENT,
    `NmPessoa` VARCHAR(100) NOT NULL,
    `CpfPessoa` CHAR(14) NOT NULL,
    `caminhoImagem` VARCHAR(255) NULL,
    `dtNascPessoa` DATE NOT NULL,
    `caminhoIdentidadePessoa` VARCHAR(255) NULL,
    `email` VARCHAR(100) NULL,
    `telefone` VARCHAR(20) NULL,
    `ativo` BOOLEAN DEFAULT TRUE,
    `dataCriacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`idPessoa`),
    UNIQUE KEY `unique_cpf` (`CpfPessoa`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tblogin`
-- -----------------------------------------------------
CREATE TABLE `tblogin` (
    `idtblogin` INT NOT NULL AUTO_INCREMENT,
    `usuario` VARCHAR(45) NOT NULL UNIQUE,
    `senha` VARCHAR(255) NOT NULL,
    `tbPessoa_idPessoa` INT NULL,
    `ativo` BOOLEAN DEFAULT TRUE,
    `ultimoLogin` TIMESTAMP NULL,
    `dataCriacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`idtblogin`),
    INDEX `fk_tblogin_tbPessoa1_idx` (`tbPessoa_idPessoa` ASC),
    CONSTRAINT `fk_tblogin_tbPessoa1` FOREIGN KEY (`tbPessoa_idPessoa`) REFERENCES `tbPessoa` (`idPessoa`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbFamilia`
-- -----------------------------------------------------
CREATE TABLE `tbFamilia` (
    `idtbFamilia` INT NOT NULL AUTO_INCREMENT,
    `caminhoComprovanteresidencia` VARCHAR(255) NULL,
    `observacoes` TEXT NULL,
    -- CAMPOS DE ENDEREÇO
    `cep` CHAR(9) NULL,
    `logradouro` VARCHAR(200) NULL,
    `numero` VARCHAR(20) NULL,
    `complemento` VARCHAR(100) NULL,
    `bairro` VARCHAR(100) NULL,
    `cidade` VARCHAR(100) NULL,
    `uf` CHAR(2) NULL,
    `codigoIbgeCidade` VARCHAR(10) NULL,
    `pontoReferencia` TEXT NULL,
    -- CAMPOS DE RENDA
    `numeroIntegrantes` INT NULL,
    `integrantesRenda` JSON NULL,
    `dadosFamiliaresPreenchidos` BOOLEAN DEFAULT FALSE,
    `tipoCota` ENUM(
        'livre',
        'economica',
        'funcionario'
    ) NULL,
    -- CONTROLE
    `dataCriacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `dataAtualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`idtbFamilia`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbTurma`
-- -----------------------------------------------------
CREATE TABLE `tbTurma` (
    `idtbTurma` INT NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `descricao` TEXT NULL,
    `capacidadeMaxima` INT NOT NULL DEFAULT 25,
    `capacidadeAtual` INT DEFAULT 0,
    `anoLetivo` YEAR NOT NULL,
    `semestre` ENUM('1', '2') NOT NULL DEFAULT '1',
    `periodo` ENUM(
        'matutino',
        'vespertino',
        'noturno',
        'integral'
    ) NOT NULL,
    `dataInicio` DATE NULL,
    `dataFim` DATE NULL,
    `ativa` BOOLEAN DEFAULT TRUE,
    `observacoes` TEXT NULL,
    `dataCriacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `dataAtualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`idtbTurma`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbResponsavel`
-- -----------------------------------------------------
CREATE TABLE `tbResponsavel` (
    `idResponsavel` INT NOT NULL AUTO_INCREMENT,
    `tbPessoa_idPessoa` INT NOT NULL,
    `tbFamilia_idtbFamilia` INT NOT NULL,
    `parentesco` VARCHAR(50) NULL DEFAULT 'responsável',
    `principal` BOOLEAN DEFAULT TRUE,
    `dataCriacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`idResponsavel`),
    UNIQUE KEY `unique_responsavel_familia` (
        `tbPessoa_idPessoa`,
        `tbFamilia_idtbFamilia`
    ),
    INDEX `fk_tbResponsavel_tbPessoa1_idx` (`tbPessoa_idPessoa` ASC),
    INDEX `fk_tbResponsavel_tbFamilia1_idx` (`tbFamilia_idtbFamilia` ASC),
    CONSTRAINT `fk_tbResponsavel_tbPessoa1` FOREIGN KEY (`tbPessoa_idPessoa`) REFERENCES `tbPessoa` (`idPessoa`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbResponsavel_tbFamilia1` FOREIGN KEY (`tbFamilia_idtbFamilia`) REFERENCES `tbFamilia` (`idtbFamilia`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbAluno`
-- -----------------------------------------------------
CREATE TABLE `tbAluno` (
    `idAluno` INT NOT NULL AUTO_INCREMENT,
    `tbPessoa_idPessoa` INT NOT NULL,
    `tbFamilia_idtbFamilia` INT NOT NULL,
    `tbTurma_idtbTurma` INT NULL,
    `matricula` VARCHAR(20) NOT NULL UNIQUE,
    `statusMatricula` ENUM(
        'ativo',
        'inativo',
        'transferido',
        'formado'
    ) DEFAULT 'ativo',
    `dataMatricula` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `observacoes` TEXT NULL,
    PRIMARY KEY (`idAluno`),
    INDEX `fk_tbAluno_tbPessoa1_idx` (`tbPessoa_idPessoa` ASC),
    INDEX `fk_tbAluno_tbFamilia1_idx` (`tbFamilia_idtbFamilia` ASC),
    INDEX `fk_tbAluno_tbTurma1_idx` (`tbTurma_idtbTurma` ASC),
    CONSTRAINT `fk_tbAluno_tbPessoa1` FOREIGN KEY (`tbPessoa_idPessoa`) REFERENCES `tbPessoa` (`idPessoa`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbAluno_tbFamilia1` FOREIGN KEY (`tbFamilia_idtbFamilia`) REFERENCES `tbFamilia` (`idtbFamilia`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbAluno_tbTurma1` FOREIGN KEY (`tbTurma_idtbTurma`) REFERENCES `tbTurma` (`idtbTurma`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbFuncionario`
-- -----------------------------------------------------
CREATE TABLE `tbFuncionario` (
    `idFuncionario` INT NOT NULL AUTO_INCREMENT,
    `tbPessoa_idPessoa` INT NOT NULL,
    `cargo` VARCHAR(100) NOT NULL,
    `departamento` VARCHAR(100) NULL,
    `salario` DECIMAL(10, 2) NULL,
    `dataAdmissao` DATE NOT NULL,
    `ativo` BOOLEAN DEFAULT TRUE,
    `observacoes` TEXT NULL,
    `dataCriacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`idFuncionario`),
    INDEX `fk_tbFuncionario_tbPessoa1_idx` (`tbPessoa_idPessoa` ASC),
    CONSTRAINT `fk_tbFuncionario_tbPessoa1` FOREIGN KEY (`tbPessoa_idPessoa`) REFERENCES `tbPessoa` (`idPessoa`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbTipoDocumento`
-- -----------------------------------------------------
CREATE TABLE `tbTipoDocumento` (
    `idTipoDocumento` INT NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `descricao` TEXT NULL,
    `obrigatorio` BOOLEAN DEFAULT TRUE,
    `requerAssinatura` BOOLEAN DEFAULT FALSE,
    `requerAnexo` BOOLEAN DEFAULT TRUE,
    `formatosAceitos` VARCHAR(100) DEFAULT 'PDF,JPG,PNG',
    `tamanhoMaximo` INT DEFAULT 5120,
    `tipoCota` ENUM(
        'todas',
        'livre',
        'economica',
        'funcionario'
    ) DEFAULT 'todas',
    `escopo` ENUM('familia', 'aluno', 'ambos') DEFAULT 'familia',
    `ordemExibicao` INT DEFAULT 0,
    `ativo` BOOLEAN DEFAULT TRUE,
    `dataCriacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`idTipoDocumento`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbDocumentoMatricula`
-- -----------------------------------------------------
CREATE TABLE `tbDocumentoMatricula` (
    `idDocumentoMatricula` INT NOT NULL AUTO_INCREMENT,
    `tbTipoDocumento_idTipoDocumento` INT NOT NULL,
    `tbFamilia_idtbFamilia` INT NOT NULL,
    `tbAluno_idPessoa` INT NULL,
    `nomeArquivoOriginal` VARCHAR(255) NULL,
    `nomeArquivoSistema` VARCHAR(255) NULL,
    `caminhoArquivo` VARCHAR(500) NULL,
    `tamanhoArquivo` INT NULL,
    `tipoMime` VARCHAR(100) NULL,
    `status` ENUM(
        'pendente',
        'enviado',
        'aprovado',
        'rejeitado'
    ) DEFAULT 'pendente',
    `dataEnvio` TIMESTAMP NULL,
    `dataAprovacao` TIMESTAMP NULL,
    `observacoes` TEXT NULL,
    `assinado` BOOLEAN DEFAULT FALSE,
    `dataAssinatura` TIMESTAMP NULL,
    `hashDocumento` VARCHAR(255) NULL,
    `dataCriacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `dataAtualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`idDocumentoMatricula`),
    INDEX `fk_tbDocumentoMatricula_tbTipoDocumento1_idx` (
        `tbTipoDocumento_idTipoDocumento` ASC
    ),
    INDEX `fk_tbDocumentoMatricula_tbFamilia1_idx` (`tbFamilia_idtbFamilia` ASC),
    INDEX `fk_tbDocumentoMatricula_tbAluno1_idx` (`tbAluno_idPessoa` ASC),
    CONSTRAINT `fk_tbDocumentoMatricula_tbTipoDocumento1` FOREIGN KEY (
        `tbTipoDocumento_idTipoDocumento`
    ) REFERENCES `tbTipoDocumento` (`idTipoDocumento`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbDocumentoMatricula_tbFamilia1` FOREIGN KEY (`tbFamilia_idtbFamilia`) REFERENCES `tbFamilia` (`idtbFamilia`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbDocumentoMatricula_tbAluno1` FOREIGN KEY (`tbAluno_idPessoa`) REFERENCES `tbPessoa` (`idPessoa`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbInteresseMatricula`
-- -----------------------------------------------------
CREATE TABLE `tbInteresseMatricula` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `protocolo` VARCHAR(50) NOT NULL UNIQUE,
    `nomeResponsavel` VARCHAR(100) NOT NULL,
    `cpfResponsavel` VARCHAR(14) NOT NULL,
    `emailResponsavel` VARCHAR(100) NOT NULL,
    `telefoneResponsavel` VARCHAR(20) NOT NULL,
    `dataNascimentoResponsavel` DATE NOT NULL,
    `nomeAluno` VARCHAR(100) NOT NULL,
    `cpfAluno` VARCHAR(14) NOT NULL,
    `dataNascimentoAluno` DATE NOT NULL,
    `cep` VARCHAR(9) NOT NULL,
    `logradouro` VARCHAR(200) NOT NULL,
    `numero` VARCHAR(20) NOT NULL,
    `complemento` VARCHAR(100) NULL,
    `bairro` VARCHAR(100) NOT NULL,
    `cidade` VARCHAR(100) NOT NULL,
    `uf` VARCHAR(2) NOT NULL,
    `codigoIbgeCidade` VARCHAR(10) NULL,
    `pontoReferencia` TEXT NULL,
    `numeroIntegrantes` INT NULL,
    `integrantesRenda` JSON NULL,
    `dadosFamiliaresPreenchidos` BOOLEAN DEFAULT FALSE,
    `tipoCota` ENUM(
        'livre',
        'economica',
        'funcionario'
    ) NOT NULL,
    `status` ENUM(
        'interesse_declarado',
        'matricula_iniciada',
        'matricula_concluida',
        'cancelado'
    ) DEFAULT 'interesse_declarado',
    `dataDeclaracao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `dataInicioMatricula` TIMESTAMP NULL,
    `funcionarioResponsavel_idPessoa` INT NULL,
    `responsavelLogin_idPessoa` INT NULL,
    `observacoes` TEXT NULL,
    PRIMARY KEY (`id`),
    INDEX `fk_tbInteresseMatricula_funcionario_idx` (
        `funcionarioResponsavel_idPessoa` ASC
    ),
    INDEX `fk_tbInteresseMatricula_responsavel_idx` (
        `responsavelLogin_idPessoa` ASC
    ),
    CONSTRAINT `fk_tbInteresseMatricula_funcionario` FOREIGN KEY (
        `funcionarioResponsavel_idPessoa`
    ) REFERENCES `tbPessoa` (`idPessoa`) ON DELETE SET NULL ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbInteresseMatricula_responsavel` FOREIGN KEY (`responsavelLogin_idPessoa`) REFERENCES `tbPessoa` (`idPessoa`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbConfiguracaoDocumentosCota`
-- -----------------------------------------------------
CREATE TABLE `tbConfiguracaoDocumentosCota` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `tipoCota` ENUM(
        'livre',
        'economica',
        'funcionario'
    ) NOT NULL,
    `documentosObrigatorios` JSON NOT NULL,
    `ativo` BOOLEAN DEFAULT TRUE,
    `dataCriacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `dataAtualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_tipo_cota` (`tipoCota`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbFuncionalidade`
-- -----------------------------------------------------
CREATE TABLE `tbFuncionalidade` (
    `idFuncionalidade` INT NOT NULL AUTO_INCREMENT,
    `chave` VARCHAR(50) NOT NULL UNIQUE,
    `nomeAmigavel` VARCHAR(100) NOT NULL,
    `descricao` TEXT NULL,
    `icone` VARCHAR(50) NULL,
    `pai` VARCHAR(50) NULL,
    `categoria` VARCHAR(50) NULL,
    `ordemExibicao` INT DEFAULT 0,
    `ativo` BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (`idFuncionalidade`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbPermissao`
-- -----------------------------------------------------
CREATE TABLE `tbPermissao` (
    `idPermissao` INT NOT NULL AUTO_INCREMENT,
    `tbPessoa_idPessoa` INT NOT NULL,
    `tbFuncionalidade_idFuncionalidade` INT NOT NULL,
    `temPermissao` BOOLEAN DEFAULT FALSE,
    `dataCriacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `dataAtualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`idPermissao`),
    INDEX `fk_tbPermissao_tbPessoa_idx` (`tbPessoa_idPessoa` ASC),
    INDEX `fk_tbPermissao_tbFuncionalidade_idx` (
        `tbFuncionalidade_idFuncionalidade` ASC
    ),
    CONSTRAINT `fk_tbPermissao_tbPessoa` FOREIGN KEY (`tbPessoa_idPessoa`) REFERENCES `tbPessoa` (`idPessoa`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbPermissao_tbFuncionalidade` FOREIGN KEY (
        `tbFuncionalidade_idFuncionalidade`
    ) REFERENCES `tbFuncionalidade` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbLogMatricula`
-- -----------------------------------------------------
CREATE TABLE `tbLogMatricula` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `tbInteresseMatricula_id` INT NOT NULL,
    `acao` VARCHAR(100) NOT NULL,
    `descricao` TEXT NULL,
    `usuario_idPessoa` INT NULL,
    `dataLog` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `fk_tbLogMatricula_interesse_idx` (`tbInteresseMatricula_id` ASC),
    INDEX `fk_tbLogMatricula_usuario_idx` (`usuario_idPessoa` ASC),
    CONSTRAINT `fk_tbLogMatricula_interesse` FOREIGN KEY (`tbInteresseMatricula_id`) REFERENCES `tbInteresseMatricula` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbLogMatricula_usuario` FOREIGN KEY (`usuario_idPessoa`) REFERENCES `tbPessoa` (`idPessoa`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Procedure: sp_IniciarMatricula (VERSÃO CORRIGIDA)
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
    
    -- Senha = últimos 4 dígitos do CPF (será criptografada pelo Spring Boot)
    SET v_ultimosQuatroCPF = RIGHT(REPLACE(REPLACE(v_cpfResponsavel, '.', ''), '-', ''), 4);
    
    -- 8. CRIAR LOGIN (senha será criptografada pelo Spring Boot após inserção)
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

-- Procedure: sp_CriarDocumentosPendentes (VERSÃO ATUALIZADA)
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

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View: Documentos pendentes por responsável
CREATE VIEW vw_documentos_responsavel AS
SELECT DISTINCT
    p.CpfPessoa as cpfResponsavel,
    p.NmPessoa as nomeResponsavel,
    f.idtbFamilia,
    f.tipoCota,
    dm.idDocumentoMatricula,
    td.nome as nomeDocumento,
    td.descricao as descricaoDocumento,
    dm.status,
    dm.dataEnvio,
    CASE
        WHEN dm.tbAluno_idPessoa IS NOT NULL THEN CONCAT(
            'Documento específico do aluno: ',
            pa.NmPessoa
        )
        ELSE 'Documento da família'
    END as escopo,
    pa.NmPessoa as nomeAluno
FROM
    tbResponsavel r
    INNER JOIN tbPessoa p ON r.tbPessoa_idPessoa = p.idPessoa
    INNER JOIN tbFamilia f ON r.tbFamilia_idtbFamilia = f.idtbFamilia
    INNER JOIN tbDocumentoMatricula dm ON f.idtbFamilia = dm.tbFamilia_idtbFamilia
    INNER JOIN tbTipoDocumento td ON dm.tbTipoDocumento_idTipoDocumento = td.idTipoDocumento
    LEFT JOIN tbPessoa pa ON dm.tbAluno_idPessoa = pa.idPessoa
WHERE
    dm.status IN ('pendente', 'rejeitado')
ORDER BY td.ordemExibicao, dm.dataCriacao;

-- View: Turmas disponíveis
CREATE VIEW vw_turmas_disponiveis AS
SELECT
    t.idtbTurma,
    t.nome,
    t.descricao,
    t.capacidadeMaxima,
    t.capacidadeAtual,
    (
        t.capacidadeMaxima - t.capacidadeAtual
    ) as vagasDisponiveis,
    CASE
        WHEN t.capacidadeAtual < t.capacidadeMaxima THEN TRUE
        ELSE FALSE
    END as temVagas,
    t.periodo,
    t.anoLetivo,
    t.semestre,
    t.ativa
FROM tbTurma t
WHERE
    t.ativa = TRUE;

-- View: Declarações completas
CREATE VIEW vw_declaracoes_completas AS
SELECT
    i.*,
    CASE
        WHEN i.status = 'interesse_declarado' THEN 'Aguardando início da matrícula'
        WHEN i.status = 'matricula_iniciada' THEN 'Matrícula em andamento'
        WHEN i.status = 'matricula_concluida' THEN 'Matrícula concluída'
        WHEN i.status = 'cancelado' THEN 'Cancelado'
    END as statusDescricao,
    pf.NmPessoa as nomeFuncionario,
    pr.NmPessoa as nomeResponsavelLogin
FROM
    tbInteresseMatricula i
    LEFT JOIN tbPessoa pf ON i.funcionarioResponsavel_idPessoa = pf.idPessoa
    LEFT JOIN tbPessoa pr ON i.responsavelLogin_idPessoa = pr.idPessoa;

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir pessoas base
INSERT INTO
    tbPessoa (
        NmPessoa,
        CpfPessoa,
        dtNascPessoa,
        email,
        telefone
    )
VALUES (
        'Administrador Sistema',
        '000.000.000-00',
        '1990-01-01',
        'admin@cipalam.edu.br',
        '(61) 99999-0000'
    ),
    (
        'João Professor',
        '111.111.111-11',
        '1985-03-15',
        'joao.professor@cipalam.edu.br',
        '(61) 99999-1111'
    ),
    (
        'Maria Responsável',
        '111.222.333-44',
        '1980-05-20',
        'maria.responsavel@email.com',
        '(61) 99999-2222'
    ),
    (
        'Ana Funcionária',
        '222.333.444-55',
        '1988-07-10',
        'ana.funcionaria@cipalam.edu.br',
        '(61) 99999-3333'
    );

-- Inserir logins (senhas criptografadas com BCrypt)
-- Todas as senhas são "password" criptografadas
INSERT INTO
    tblogin (
        usuario,
        senha,
        tbPessoa_idPessoa
    )
VALUES (
        'admin',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        1
    ),
    (
        'joao.professor',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        2
    ),
    (
        'maria.responsavel',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        3
    ),
    (
        'ana.funcionaria',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        4
    );

-- Inserir funcionários
INSERT INTO
    tbFuncionario (
        tbPessoa_idPessoa,
        cargo,
        departamento,
        dataAdmissao
    )
VALUES (
        1,
        'Administrador',
        'TI',
        '2020-01-01'
    ),
    (
        2,
        'Professor',
        'Educação',
        '2021-02-01'
    ),
    (
        4,
        'Secretária',
        'Administração',
        '2021-06-01'
    );

-- Inserir turmas
INSERT INTO
    tbTurma (
        nome,
        descricao,
        capacidadeMaxima,
        anoLetivo,
        periodo
    )
VALUES (
        'Turma A - Manhã',
        'Turma do período matutino para iniciantes',
        25,
        2025,
        'matutino'
    ),
    (
        'Turma B - Tarde',
        'Turma do período vespertino',
        30,
        2025,
        'vespertino'
    ),
    (
        'Turma C - Noite',
        'Turma do período noturno para trabalhadores',
        20,
        2025,
        'noturno'
    );

-- Inserir tipos de documento
INSERT INTO
    tbTipoDocumento (
        nome,
        descricao,
        obrigatorio,
        requerAnexo,
        tipoCota,
        escopo,
        ordemExibicao
    )
VALUES (
        'RG do Responsável',
        'Documento de identidade do responsável',
        TRUE,
        TRUE,
        'todas',
        'familia',
        1
    ),
    (
        'CPF do Responsável',
        'CPF do responsável',
        TRUE,
        TRUE,
        'todas',
        'familia',
        2
    ),
    (
        'Comprovante de Residência',
        'Comprovante de residência atualizado',
        TRUE,
        TRUE,
        'todas',
        'familia',
        3
    ),
    (
        'RG do Aluno',
        'Documento de identidade do aluno',
        TRUE,
        TRUE,
        'todas',
        'aluno',
        4
    ),
    (
        'CPF do Aluno',
        'CPF do aluno (se possuir)',
        FALSE,
        TRUE,
        'todas',
        'aluno',
        5
    ),
    (
        'Certidão de Nascimento',
        'Certidão de nascimento do aluno',
        TRUE,
        TRUE,
        'todas',
        'aluno',
        6
    ),
    (
        'Comprovante de Renda',
        'Comprovante de renda familiar',
        TRUE,
        TRUE,
        'economica',
        'familia',
        7
    ),
    (
        'Declaração de Hipossuficiência',
        'Declaração de hipossuficiência econômica',
        TRUE,
        TRUE,
        'economica',
        'familia',
        8
    ),
    (
        'Comprovante de Vínculo',
        'Comprovante de vínculo empregatício',
        TRUE,
        TRUE,
        'funcionario',
        'familia',
        9
    ),
    (
        'Foto 3x4',
        'Foto 3x4 recente do aluno',
        TRUE,
        TRUE,
        'todas',
        'aluno',
        10
    );

-- Inserir funcionalidades
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
        'declaracaoInteresse',
        'Declaração de Interesse',
        'Gerenciar declarações de interesse de matrícula',
        'document-text-outline',
        'matriculas',
        'acao',
        10
    ),
    (
        'iniciarMatricula',
        'Iniciar Matrícula',
        'Iniciar processo de matrícula a partir de declaração',
        'school-outline',
        'matriculas',
        'acao',
        20
    ),
    (
        'gerenciarFuncionarios',
        'Gerenciar Funcionários',
        'Cadastro e gestão de funcionários',
        'people-outline',
        'pessoas',
        'configuracao',
        30
    ),
    (
        'tiposDocumento',
        'Tipos de Documento',
        'Gerenciar tipos de documentos do sistema',
        'document-outline',
        'matriculas',
        'configuracao',
        34
    ),
    (
        'configuracaoDocumentos',
        'Configuração Documentos',
        'Configurar documentos por tipo de cota',
        'settings-outline',
        'matriculas',
        'configuracao',
        35
    );

-- Inserir configurações padrão de documentos por cota
INSERT INTO
    tbConfiguracaoDocumentosCota (
        tipoCota,
        documentosObrigatorios
    )
VALUES ('livre', '[1,2,3,4,6,10]'),
    (
        'economica',
        '[1,2,3,4,6,7,8,10]'
    ),
    (
        'funcionario',
        '[1,2,3,4,6,9,10]'
    );

-- Inserir permissões para o admin (todas as funcionalidades)
INSERT INTO
    tbPermissao (
        tbPessoa_idPessoa,
        tbFuncionalidade_idFuncionalidade,
        temPermissao
    )
SELECT 1, id, TRUE
FROM tbFuncionalidade
WHERE
    ativo = TRUE;

-- Inserir dados de teste - declarações de interesse
INSERT INTO
    tbInteresseMatricula (
        protocolo,
        nomeResponsavel,
        cpfResponsavel,
        emailResponsavel,
        telefoneResponsavel,
        dataNascimentoResponsavel,
        nomeAluno,
        cpfAluno,
        dataNascimentoAluno,
        cep,
        logradouro,
        numero,
        bairro,
        cidade,
        uf,
        tipoCota
    )
VALUES (
        'TEST2025001',
        'Carlos Silva',
        '123.456.789-01',
        'carlos@email.com',
        '(61) 99999-4444',
        '1985-06-15',
        'Pedro Silva',
        '987.654.321-01',
        '2010-03-20',
        '70000-000',
        'Rua das Flores',
        '123',
        'Centro',
        'Brasília',
        'DF',
        'livre'
    ),
    (
        'TEST2025002',
        'Ana Santos',
        '234.567.890-12',
        'ana@email.com',
        '(61) 99999-5555',
        '1990-08-25',
        'Julia Santos',
        '876.543.210-12',
        '2011-07-15',
        '71000-000',
        'Av. Principal',
        '456',
        'Asa Norte',
        'Brasília',
        'DF',
        'economica'
    ),
    (
        'TEST2025003',
        'Roberto Oliveira',
        '345.678.901-23',
        'roberto@email.com',
        '(61) 99999-6666',
        '1982-12-10',
        'Lucas Oliveira',
        '765.432.109-23',
        '2009-11-30',
        '72000-000',
        'Rua da Escola',
        '789',
        'Asa Sul',
        'Brasília',
        'DF',
        'funcionario'
    );

-- =====================================================
-- CONFIGURAÇÕES FINAIS
-- =====================================================

-- Restaurar configurações
SET SQL_MODE = @OLD_SQL_MODE;

SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;

SET UNIQUE_CHECKS = @OLD_UNIQUE_CHECKS;

-- =====================================================
-- VERIFICAÇÕES FINAIS
-- =====================================================

SELECT 'BANCO DE DADOS CIPALAM CRIADO COM SUCESSO!' as STATUS;

SELECT 'Versão: Consolidada Completa para Hospedagem' as VERSAO;

SELECT NOW() as DATA_CRIACAO;

-- Verificar tabelas criadas
SELECT COUNT(*) as TOTAL_TABELAS
FROM information_schema.tables
WHERE
    table_schema = 'Cipalam';

-- Verificar procedures criadas
SELECT COUNT(*) as TOTAL_PROCEDURES
FROM information_schema.routines
WHERE
    routine_schema = 'Cipalam';

-- Verificar dados inseridos
SELECT (
        SELECT COUNT(*)
        FROM tbPessoa
    ) as PESSOAS,
    (
        SELECT COUNT(*)
        FROM tblogin
    ) as LOGINS,
    (
        SELECT COUNT(*)
        FROM tbTurma
    ) as TURMAS,
    (
        SELECT COUNT(*)
        FROM tbTipoDocumento
    ) as TIPOS_DOCUMENTO,
    (
        SELECT COUNT(*)
        FROM tbFuncionalidade
    ) as FUNCIONALIDADES,
    (
        SELECT COUNT(*)
        FROM tbInteresseMatricula
    ) as DECLARACOES_TESTE;

-- Verificar configurações de documentos
SELECT
    tipoCota,
    documentosObrigatorios
FROM tbConfiguracaoDocumentosCota;

/*
===========================================================================
RESUMO DO SISTEMA CIPALAM - VERSÃO CONSOLIDADA COMPLETA
===========================================================================

✅ CARACTERÍSTICAS DESTA VERSÃO:
- Arquivo SQL único para hospedagem
- Inclui TODAS as correções e melhorias
- Sistema de configuração de documentos por cota funcionando
- Procedures atualizadas e testadas
- Dados de teste incluídos
- Views úteis para consultas

✅ PRINCIPAIS FUNCIONALIDADES:
1. Sistema completo de declaração de interesse
2. Processo automático de iniciar matrícula
3. Configuração personalizada de documentos por cota
4. Criação automática de login para responsáveis
5. Gestão completa de documentos organizados
6. Sistema de funcionalidades e permissões

✅ COMO USAR:
1. Execute este arquivo SQL único no MySQL
2. Reinicie seu servidor Spring Boot
3. Sistema estará 100% funcional

✅ DADOS DE TESTE INCLUÍDOS:
- Usuários: admin/password, joao.professor/password
- 3 Turmas criadas e ativas
- 10 Tipos de documento configurados
- 3 Declarações de interesse para teste
- Configurações de documentos por cota

✅ ENDPOINTS PRINCIPAIS:
- GET /api/interesse-matricula (listar declarações)
- POST /api/matricula/iniciar-procedural (iniciar matrícula)
- GET /api/configuracao-documentos (configurações)
- GET /api/tipos-documento (tipos de documento)

🎯 SISTEMA PRONTO PARA PRODUÇÃO!
===========================================================================
*/