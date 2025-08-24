-- ===================================================================
-- BANCO DE DADOS CIPALAM - VERSÃO COMPLETA ATUALIZADA
-- Data: 22/08/2025
-- Descrição: Schema completo com fluxo de INICIAR MATRÍCULA implementado
-- Inclui: Distribuição automática de dados + Login responsável + Documentos organizados
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
-- Table `Cipalam`.`tbFamilia` - ATUALIZADA COM DADOS DE ENDEREÇO
-- -----------------------------------------------------
CREATE TABLE `tbFamilia` (
    `idtbFamilia` INT NOT NULL AUTO_INCREMENT,
    `caminhoComprovanteresidencia` VARCHAR(255) NULL,
    `observacoes` TEXT NULL,
    -- CAMPOS DE ENDEREÇO (vindos da declaração de interesse)
    `cep` CHAR(9) NULL,
    `logradouro` VARCHAR(200) NULL,
    `numero` VARCHAR(20) NULL,
    `complemento` VARCHAR(100) NULL,
    `bairro` VARCHAR(100) NULL,
    `cidade` VARCHAR(100) NULL,
    `uf` CHAR(2) NULL,
    `codigoIbgeCidade` VARCHAR(10) NULL,
    `pontoReferencia` TEXT NULL,
    -- CAMPOS DE RENDA (para cota econômica)
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
-- Table `Cipalam`.`tbTurma` - ATUALIZADA COM MAIS INFORMAÇÕES
-- -----------------------------------------------------
CREATE TABLE `tbTurma` (
    `idtbTurma` INT NOT NULL AUTO_INCREMENT,
    `nomeTurma` VARCHAR(50) NOT NULL,
    `capacidadeMaxima` INT DEFAULT 20,
    `capacidadeAtual` INT DEFAULT 0,
    `anoLetivo` YEAR NOT NULL,
    `periodo` ENUM(
        'manha',
        'tarde',
        'integral',
        'noite'
    ) NOT NULL,
    `ativo` BOOLEAN DEFAULT TRUE,
    `observacoes` TEXT NULL,
    `dataCriacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`idtbTurma`),
    INDEX `idx_ativo` (`ativo`),
    INDEX `idx_ano_periodo` (`anoLetivo`, `periodo`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbResponsavel` - ATUALIZADA COM CHAVES PRIMÁRIAS
-- -----------------------------------------------------
CREATE TABLE `tbResponsavel` (
    `idResponsavel` INT NOT NULL AUTO_INCREMENT,
    `tbFamilia_idtbFamilia` INT NOT NULL,
    `tbPessoa_idPessoa` INT NOT NULL,
    `dataVinculo` DATE DEFAULT(CURRENT_DATE),
    `ativo` BOOLEAN DEFAULT TRUE,
    `observacoes` TEXT NULL,
    `dataCriacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`idResponsavel`),
    INDEX `fk_tbResponsavel_tbFamilia1_idx` (`tbFamilia_idtbFamilia` ASC),
    INDEX `fk_tbResponsavel_tbPessoa1_idx` (`tbPessoa_idPessoa` ASC),
    CONSTRAINT `fk_tbResponsavel_tbFamilia1` FOREIGN KEY (`tbFamilia_idtbFamilia`) REFERENCES `tbFamilia` (`idtbFamilia`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbResponsavel_tbPessoa1` FOREIGN KEY (`tbPessoa_idPessoa`) REFERENCES `tbPessoa` (`idPessoa`) ON DELETE CASCADE ON UPDATE NO ACTION,
    UNIQUE KEY `unique_pessoa_familia` (
        `tbPessoa_idPessoa`,
        `tbFamilia_idtbFamilia`
    )
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbAluno` - ATUALIZADA COM DADOS DA DECLARAÇÃO
-- -----------------------------------------------------
CREATE TABLE `tbAluno` (
    `tbPessoa_idPessoa` INT NOT NULL,
    `tbFamilia_idtbFamilia` INT NOT NULL,
    `tbTurma_idtbTurma` INT NULL,
    `matricula` VARCHAR(20) NULL UNIQUE,
    `dataMatricula` DATE NULL,
    `statusAluno` ENUM(
        'matriculado',
        'cursando',
        'concluido',
        'evadido',
        'transferido'
    ) DEFAULT 'matriculado',
    -- DADOS VINDOS DA DECLARAÇÃO DE INTERESSE
    `escolaAluno` VARCHAR(200) NULL,
    `codigoInepEscola` VARCHAR(20) NULL,
    `municipioEscola` VARCHAR(100) NULL,
    `ufEscola` CHAR(2) NULL,
    `horariosSelecionados` JSON NULL,
    `observacoesResponsavel` TEXT NULL,
    -- DADOS DO PROCESSO DE MATRÍCULA
    `protocoloDeclaracao` VARCHAR(50) NULL, -- Referência ao protocolo original
    `funcionarioMatricula_idPessoa` INT NULL, -- Funcionário que fez a matrícula
    `dataInicioMatricula` TIMESTAMP NULL,
    `dataFinalizacaoMatricula` TIMESTAMP NULL,
    -- CONTROLE
    `caminhoFichaInscricao` VARCHAR(255) NULL,
    `ativo` BOOLEAN DEFAULT TRUE,
    `dataCriacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `dataAtualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`tbPessoa_idPessoa`),
    INDEX `fk_tbAluno_tbFamilia1_idx` (`tbFamilia_idtbFamilia` ASC),
    INDEX `fk_tbAluno_tbTurma1_idx` (`tbTurma_idtbTurma` ASC),
    INDEX `fk_tbAluno_funcionario_idx` (
        `funcionarioMatricula_idPessoa` ASC
    ),
    INDEX `idx_matricula` (`matricula`),
    INDEX `idx_protocolo` (`protocoloDeclaracao`),
    INDEX `idx_status` (`statusAluno`),
    CONSTRAINT `fk_tbAluno_tbPessoa1` FOREIGN KEY (`tbPessoa_idPessoa`) REFERENCES `tbPessoa` (`idPessoa`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbAluno_tbFamilia1` FOREIGN KEY (`tbFamilia_idtbFamilia`) REFERENCES `tbFamilia` (`idtbFamilia`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbAluno_tbTurma1` FOREIGN KEY (`tbTurma_idtbTurma`) REFERENCES `tbTurma` (`idtbTurma`) ON DELETE SET NULL ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbAluno_funcionario` FOREIGN KEY (
        `funcionarioMatricula_idPessoa`
    ) REFERENCES `tbPessoa` (`idPessoa`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- ===================================================================
-- SISTEMA DE FUNCIONALIDADES E PERMISSÕES (ATUALIZADO - SEM ROTAS)
-- ===================================================================

-- -----------------------------------------------------
-- Table `Cipalam`.`tbFuncionalidade` (NOVA ESTRUTURA)
-- -----------------------------------------------------
CREATE TABLE `tbFuncionalidade` (
    `idFuncionalidade` INT NOT NULL AUTO_INCREMENT,
    `chave` VARCHAR(50) NOT NULL UNIQUE,
    `nomeAmigavel` VARCHAR(100) NOT NULL,
    `descricao` TEXT NULL,
    `icone` VARCHAR(50) NULL,
    `pai` VARCHAR(50) NULL,
    `categoria` ENUM(
        'menu',
        'acao',
        'configuracao'
    ) DEFAULT 'menu',
    `ativo` BOOLEAN DEFAULT TRUE,
    `ordemExibicao` INT DEFAULT 0,
    PRIMARY KEY (`idFuncionalidade`),
    INDEX `idx_chave` (`chave`),
    INDEX `idx_pai` (`pai`),
    INDEX `idx_ativo` (`ativo`),
    INDEX `idx_categoria` (`categoria`)
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
    INDEX `fk_tbPermissao_tbPessoa1_idx` (`tbPessoa_idPessoa`),
    INDEX `fk_tbPermissao_tbFuncionalidade1_idx` (
        `tbFuncionalidade_idFuncionalidade`
    ),
    CONSTRAINT `fk_tbPermissao_tbPessoa1` FOREIGN KEY (`tbPessoa_idPessoa`) REFERENCES `tbPessoa` (`idPessoa`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbPermissao_tbFuncionalidade1` FOREIGN KEY (
        `tbFuncionalidade_idFuncionalidade`
    ) REFERENCES `tbFuncionalidade` (`idFuncionalidade`) ON DELETE CASCADE ON UPDATE NO ACTION,
    UNIQUE KEY `unique_pessoa_funcionalidade` (
        `tbPessoa_idPessoa`,
        `tbFuncionalidade_idFuncionalidade`
    )
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbFuncionario`
-- -----------------------------------------------------
CREATE TABLE `tbFuncionario` (
    `idFuncionario` INT NOT NULL AUTO_INCREMENT,
    `tbPessoa_idPessoa` INT NOT NULL,
    `dataInicio` DATE NOT NULL,
    `dataFim` DATE NULL,
    `ativo` BOOLEAN DEFAULT TRUE,
    `observacoes` TEXT NULL,
    `dataCriacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `dataAtualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`idFuncionario`),
    INDEX `fk_tbFuncionario_tbPessoa_idx` (`tbPessoa_idPessoa`),
    CONSTRAINT `fk_tbFuncionario_tbPessoa` FOREIGN KEY (`tbPessoa_idPessoa`) REFERENCES `tbPessoa` (`idPessoa`) ON DELETE CASCADE ON UPDATE NO ACTION,
    UNIQUE KEY `unique_pessoa_funcionario` (`tbPessoa_idPessoa`)
) ENGINE = InnoDB;

-- ===================================================================
-- TABELAS PARA INTERESSE DE MATRÍCULA
-- ===================================================================

-- -----------------------------------------------------
-- Table `Cipalam`.`tbHorarioDisponivel` - Horários disponíveis do instituto
-- -----------------------------------------------------
CREATE TABLE `tbHorarioDisponivel` (
    `idHorario` INT NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(20) NOT NULL UNIQUE,
    `descricao` VARCHAR(100) NOT NULL,
    `horaInicio` TIME NOT NULL,
    `horaFim` TIME NOT NULL,
    `diasSemana` JSON NOT NULL, -- ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
    `ativo` BOOLEAN DEFAULT TRUE,
    `capacidadeMaxima` INT DEFAULT 20,
    `ordemExibicao` INT DEFAULT 0,
    PRIMARY KEY (`idHorario`),
    INDEX `idx_codigo` (`codigo`),
    INDEX `idx_ativo` (`ativo`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbInteresseMatricula` - ATUALIZADA COM NOVO FLUXO
-- -----------------------------------------------------
CREATE TABLE `tbInteresseMatricula` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `protocolo` VARCHAR(50) UNIQUE NOT NULL,

-- ETAPA DO PROCESSO
`etapaAtual` ENUM(
    'dados_responsavel',
    'verificacao_responsavel',
    'dados_aluno',
    'dados_familiares',
    'endereco_familia',
    'observacoes',
    'revisao',
    'finalizado'
) DEFAULT 'dados_responsavel',

-- DADOS DO RESPONSÁVEL
`nomeResponsavel` VARCHAR(100) NOT NULL,
`cpfResponsavel` VARCHAR(14) NOT NULL,
`dataNascimentoResponsavel` DATE NOT NULL,
`telefoneResponsavel` VARCHAR(20) NOT NULL,
`emailResponsavel` VARCHAR(100) NOT NULL,
`responsavelExistente` BOOLEAN DEFAULT FALSE,
`senhaTemporariaEnviada` BOOLEAN DEFAULT FALSE,
`responsavelAutenticado` BOOLEAN DEFAULT FALSE,

-- DADOS DO ALUNO
`nomeAluno` VARCHAR(100) NULL,
`dataNascimentoAluno` DATE NULL,
`cpfAluno` VARCHAR(14) NULL,
`escolaAluno` VARCHAR(200) NULL, -- Nome da escola (via API externa)
`codigoInepEscola` VARCHAR(20) NULL, -- Código INEP da escola (via API)
`municipioEscola` VARCHAR(100) NULL,
`ufEscola` CHAR(2) NULL,

-- ENDEREÇO DA FAMÍLIA (via API IBGE)
`cep` CHAR(9) NULL,
`logradouro` VARCHAR(200) NULL,
`numero` VARCHAR(20) NULL,
`complemento` VARCHAR(100) NULL,
`bairro` VARCHAR(100) NULL,
`cidade` VARCHAR(100) NULL,
`uf` CHAR(2) NULL,
`codigoIbgeCidade` VARCHAR(10) NULL,
`pontoReferencia` TEXT NULL,

-- TIPO DE VAGA
`tipoCota` ENUM(
    'livre',
    'economica',
    'funcionario'
) NULL,

-- INFORMAÇÕES FAMILIARES (para cota econômica)
`numeroIntegrantes` INT NULL,
`integrantesRenda` JSON NULL, -- Dados familiares completos com todas as rendas
`dadosFamiliaresPreenchidos` BOOLEAN DEFAULT FALSE,

-- HORÁRIOS E OBSERVAÇÕES
`horariosSelecionados` JSON NULL,
`observacoesResponsavel` TEXT NULL, -- Observações sobre o aluno

-- CONTROLE DE STATUS
`status` ENUM(
    'em_preenchimento',
    'interesse_declarado',
    'matricula_iniciada',
    'documentos_pendentes',
    'documentos_completos',
    'matricula_aprovada',
    'matricula_cancelada'
) DEFAULT 'em_preenchimento',

-- CONTROLE DE DATAS
`dataInicio` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
`dataEnvio` TIMESTAMP NULL,
`dataInicioMatricula` TIMESTAMP NULL,
`dataFinalizacao` TIMESTAMP NULL,
`ultimaAtualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

-- RESPONSÁVEIS PELO PROCESSO
`funcionarioResponsavel_idPessoa` INT NULL,
`responsavelLogin_idPessoa` INT NULL,

-- OBSERVAÇÕES INTERNAS


`observacoesInternas` TEXT NULL,
    `notasProcesso` TEXT NULL,
    
    PRIMARY KEY (`id`),
    INDEX `idx_protocolo` (`protocolo`),
    INDEX `idx_status` (`status`),
    INDEX `idx_etapa` (`etapaAtual`),
    INDEX `idx_tipoCota` (`tipoCota`),
    INDEX `idx_cpf_responsavel` (`cpfResponsavel`),
    INDEX `idx_dataEnvio` (`dataEnvio`),
    INDEX `fk_tbInteresseMatricula_funcionario_idx` (
        `funcionarioResponsavel_idPessoa` ASC
    ),
    INDEX `fk_tbInteresseMatricula_responsavel_idx` (
        `responsavelLogin_idPessoa` ASC
    ),
    CONSTRAINT `fk_tbInteresseMatricula_funcionario` FOREIGN KEY (
        `funcionarioResponsavel_idPessoa`
    ) REFERENCES `tbPessoa` (`idPessoa`) ON DELETE SET NULL ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbInteresseMatricula_responsavel` FOREIGN KEY (
        `responsavelLogin_idPessoa`
    ) REFERENCES `tbPessoa` (`idPessoa`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbHistoricoEtapaMatricula` - Histórico do processo
-- -----------------------------------------------------
CREATE TABLE `tbHistoricoEtapaMatricula` (
    `idHistorico` INT NOT NULL AUTO_INCREMENT,
    `tbInteresseMatricula_id` INT NOT NULL,
    `etapa` ENUM(
        'dados_responsavel',
        'verificacao_responsavel',
        'dados_aluno',
        'dados_familiares',
        'endereco_familia',
        'observacoes',
        'revisao',
        'finalizado'
    ) NOT NULL,
    `status` ENUM(
        'iniciada',
        'concluida',
        'erro',
        'cancelada'
    ) NOT NULL,
    `dadosPreenchidos` JSON NULL,
    `observacoes` TEXT NULL,
    `dataInicio` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `dataConclusao` TIMESTAMP NULL,
    `tempoGasto` INT NULL, -- em segundos
    PRIMARY KEY (`idHistorico`),
    INDEX `idx_interesse_etapa` (
        `tbInteresseMatricula_id`,
        `etapa`
    ),
    INDEX `idx_data_inicio` (`dataInicio`),
    CONSTRAINT `fk_tbHistoricoEtapa_interesse` FOREIGN KEY (`tbInteresseMatricula_id`) REFERENCES `tbInteresseMatricula` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbTipoDocumento` - ATUALIZADA COM ESCOPO
-- -----------------------------------------------------
CREATE TABLE `tbTipoDocumento` (
    `idTipoDocumento` INT NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `descricao` TEXT NULL,
    `obrigatorio` BOOLEAN DEFAULT TRUE,
    `requerAssinatura` BOOLEAN DEFAULT FALSE,
    `requerAnexo` BOOLEAN DEFAULT TRUE,
    `tipoCota` ENUM(
        'livre',
        'economica',
        'funcionario'
    ) NULL,
    -- NOVO CAMPO: Define se o documento é da família ou do aluno
    `escopo` ENUM('familia', 'aluno', 'ambos') DEFAULT 'ambos',
    `ativo` BOOLEAN DEFAULT TRUE,
    `ordemExibicao` INT DEFAULT 0,
    `templateDocumento` TEXT NULL,
    PRIMARY KEY (`idTipoDocumento`),
    INDEX `idx_tipoCota` (`tipoCota`),
    INDEX `idx_escopo` (`escopo`),
    INDEX `idx_ativo` (`ativo`)
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
    `dataAtualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `funcionarioResponsavel_idPessoa` INT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_tipo_cota` (`tipoCota`),
    INDEX `fk_configuracao_funcionario_idx` (
        `funcionarioResponsavel_idPessoa`
    ),
    CONSTRAINT `fk_configuracao_funcionario` FOREIGN KEY (
        `funcionarioResponsavel_idPessoa`
    ) REFERENCES `tbPessoa` (`idPessoa`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbDocumentoMatricula` - ATUALIZADA PARA SUPORTAR FAMÍLIA/ALUNO
-- -----------------------------------------------------
CREATE TABLE `tbDocumentoMatricula` (
    `idDocumentoMatricula` INT NOT NULL AUTO_INCREMENT,
    `tbInteresseMatricula_id` INT NULL, -- NULL quando matrícula já foi iniciada
    `tbTipoDocumento_idTipoDocumento` INT NOT NULL,
    -- NOVOS CAMPOS: Para documentos específicos após matrícula iniciada
    `tbFamilia_idtbFamilia` INT NULL,
    `tbAluno_idPessoa` INT NULL, -- Para documentos específicos do aluno
    `status` ENUM(
        'pendente',
        'enviado',
        'aprovado',
        'rejeitado'
    ) DEFAULT 'pendente',
    `caminhoArquivo` VARCHAR(500) NULL,
    `nomeArquivoOriginal` VARCHAR(255) NULL,
    `tipoArquivo` VARCHAR(50) NULL,
    `tamanhoArquivo` BIGINT NULL,
    `assinaturaDigital` TEXT NULL,
    `dataEnvio` TIMESTAMP NULL,
    `dataAssinatura` TIMESTAMP NULL,
    `dataAprovacao` TIMESTAMP NULL,
    `observacoes` TEXT NULL,
    `motivoRejeicao` TEXT NULL,
    `funcionarioAprovador_idPessoa` INT NULL,
    `dataCriacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `dataAtualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`idDocumentoMatricula`),
    INDEX `idx_status` (`status`),
    INDEX `fk_tbDocumentoMatricula_interesse_idx` (`tbInteresseMatricula_id`),
    INDEX `fk_tbDocumentoMatricula_tipo_idx` (
        `tbTipoDocumento_idTipoDocumento`
    ),
    INDEX `fk_tbDocumentoMatricula_funcionario_idx` (
        `funcionarioAprovador_idPessoa`
    ),
    INDEX `fk_tbDocumentoMatricula_familia_idx` (`tbFamilia_idtbFamilia`),
    INDEX `fk_tbDocumentoMatricula_aluno_idx` (`tbAluno_idPessoa`),
    CONSTRAINT `fk_tbDocumentoMatricula_interesse` FOREIGN KEY (`tbInteresseMatricula_id`) REFERENCES `tbInteresseMatricula` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbDocumentoMatricula_tipo` FOREIGN KEY (
        `tbTipoDocumento_idTipoDocumento`
    ) REFERENCES `tbTipoDocumento` (`idTipoDocumento`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbDocumentoMatricula_funcionario` FOREIGN KEY (
        `funcionarioAprovador_idPessoa`
    ) REFERENCES `tbPessoa` (`idPessoa`) ON DELETE SET NULL ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbDocumentoMatricula_familia` FOREIGN KEY (`tbFamilia_idtbFamilia`) REFERENCES `tbFamilia` (`idtbFamilia`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbDocumentoMatricula_aluno` FOREIGN KEY (`tbAluno_idPessoa`) REFERENCES `tbAluno` (`tbPessoa_idPessoa`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbLogMatricula`
-- -----------------------------------------------------
CREATE TABLE `tbLogMatricula` (
    `idLogMatricula` INT NOT NULL AUTO_INCREMENT,
    `tbInteresseMatricula_id` INT NOT NULL,
    `acao` VARCHAR(100) NOT NULL,
    `descricao` TEXT NULL,
    `usuario_idPessoa` INT NULL,
    `dataAcao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `dadosAntes` JSON NULL,
    `dadosDepois` JSON NULL,
    `ipUsuario` VARCHAR(45) NULL,
    PRIMARY KEY (`idLogMatricula`),
    INDEX `idx_dataAcao` (`dataAcao`),
    INDEX `idx_acao` (`acao`),
    INDEX `fk_tbLogMatricula_interesse_idx` (`tbInteresseMatricula_id`),
    INDEX `fk_tbLogMatricula_usuario_idx` (`usuario_idPessoa`),
    CONSTRAINT `fk_tbLogMatricula_interesse` FOREIGN KEY (`tbInteresseMatricula_id`) REFERENCES `tbInteresseMatricula` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbLogMatricula_usuario` FOREIGN KEY (`usuario_idPessoa`) REFERENCES `tbPessoa` (`idPessoa`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- ===================================================================
-- PROCEDURES PARA AUTOMATIZAR FLUXO DE MATRÍCULA
-- ===================================================================

DELIMITER $$

-- -----------------------------------------------------
-- Procedure: sp_IniciarMatricula
-- Descrição: Automatiza o processo de iniciar matrícula
-- Parâmetros:
--   - p_idDeclaracao: ID da declaração de interesse
--   - p_idTurma: ID da turma escolhida pelo funcionário
--   - p_idFuncionario: ID do funcionário que está iniciando
-- -----------------------------------------------------
CREATE PROCEDURE `sp_IniciarMatricula`(
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
    
    -- 3. VINCULAR RESPONSÁVEL À FAMÍLIA
    INSERT INTO tbResponsavel (tbFamilia_idtbFamilia, tbPessoa_idPessoa)
    VALUES (v_idFamilia, v_idResponsavel);
    
    -- 4. CRIAR PESSOA ALUNO
    INSERT INTO tbPessoa (
        NmPessoa, CpfPessoa, dtNascPessoa
    )
    SELECT 
        nomeAluno, cpfAluno, dataNascimentoAluno
    FROM tbInteresseMatricula 
    WHERE id = p_idDeclaracao;
    
    SET v_idAluno = LAST_INSERT_ID();
    
    -- 5. GERAR MATRÍCULA AUTOMÁTICA
    SET v_proximaMatricula = CONCAT(
        YEAR(CURDATE()), 
        LPAD((
            SELECT COALESCE(MAX(CAST(SUBSTRING(matricula, 5) AS UNSIGNED)), 0) + 1
            FROM tbAluno 
            WHERE matricula LIKE CONCAT(YEAR(CURDATE()), '%')
        ), 4, '0')
    );
    
    -- 6. CRIAR ALUNO
    INSERT INTO tbAluno (
        tbPessoa_idPessoa, tbFamilia_idtbFamilia, tbTurma_idtbTurma,
        matricula, dataMatricula, escolaAluno, codigoInepEscola,
        municipioEscola, ufEscola, horariosSelecionados, observacoesResponsavel,
        protocoloDeclaracao, funcionarioMatricula_idPessoa, dataInicioMatricula
    )
    SELECT 
        v_idAluno, v_idFamilia, p_idTurma,
        v_proximaMatricula, CURDATE(), escolaAluno, codigoInepEscola,
        municipioEscola, ufEscola, horariosSelecionados, observacoesResponsavel,
        protocolo, p_idFuncionario, NOW()
    FROM tbInteresseMatricula 
    WHERE id = p_idDeclaracao;
    
    -- 7. CRIAR LOGIN PARA RESPONSÁVEL
    SELECT cpfResponsavel INTO v_cpfResponsavel 
    FROM tbInteresseMatricula 
    WHERE id = p_idDeclaracao;
    
    -- Usuario = CPF sem pontuação
    SET v_usuarioLogin = REPLACE(REPLACE(v_cpfResponsavel, '.', ''), '-', '');
    
    -- Senha = "password" (mesma hash BCrypt usada em todo o sistema)
    SET v_ultimosQuatroCPF = RIGHT(REPLACE(REPLACE(v_cpfResponsavel, '.', ''), '-', ''), 4);
    SET v_senhaLogin = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
    
    INSERT INTO tblogin (usuario, senha, tbPessoa_idPessoa)
    VALUES (v_usuarioLogin, v_senhaLogin, v_idResponsavel);
    
    -- 7.1. CRIAR INTEGRANTES DA FAMÍLIA (se existirem com CPF)
    -- Verificar se há integrantes no JSON integrantesRenda
    SET @integrantesJson = (SELECT integrantesRenda FROM tbInteresseMatricula WHERE id = p_idDeclaracao);
    
    IF @integrantesJson IS NOT NULL AND JSON_LENGTH(@integrantesJson) > 0 THEN
        -- Loop através dos integrantes no JSON
        SET @i = 0;
        SET @maxIntegrantes = JSON_LENGTH(@integrantesJson);
        
        WHILE @i < @maxIntegrantes DO
            SET @nomeIntegrante = JSON_UNQUOTE(JSON_EXTRACT(@integrantesJson, CONCAT('$[', @i, '].nome')));
            SET @cpfIntegrante = JSON_UNQUOTE(JSON_EXTRACT(@integrantesJson, CONCAT('$[', @i, '].cpf')));
            SET @dataNascIntegrante = JSON_UNQUOTE(JSON_EXTRACT(@integrantesJson, CONCAT('$[', @i, '].dataNascimento')));
            SET @parentescoIntegrante = JSON_UNQUOTE(JSON_EXTRACT(@integrantesJson, CONCAT('$[', @i, '].parentesco')));
            
            -- Só criar pessoa se tiver nome E CPF válidos
            IF @nomeIntegrante IS NOT NULL AND @nomeIntegrante != 'null' AND @nomeIntegrante != '' 
               AND @cpfIntegrante IS NOT NULL AND @cpfIntegrante != 'null' AND @cpfIntegrante != '' THEN
                -- Criar pessoa para o integrante
                INSERT INTO tbPessoa (NmPessoa, CpfPessoa, dtNascPessoa)
                VALUES (@nomeIntegrante, @cpfIntegrante, 
                        CASE WHEN @dataNascIntegrante IS NOT NULL AND @dataNascIntegrante != 'null' AND @dataNascIntegrante != ''
                             THEN STR_TO_DATE(@dataNascIntegrante, '%Y-%m-%d') 
                             ELSE CURDATE() END);
                
                SET @idIntegrante = LAST_INSERT_ID();
                
                -- Se for um responsável adicional, criar vínculo
                IF @parentescoIntegrante IN ('pai', 'mae', 'responsavel', 'tutor', 'conjuge') THEN
                    INSERT INTO tbResponsavel (tbFamilia_idtbFamilia, tbPessoa_idPessoa)
                    VALUES (v_idFamilia, @idIntegrante);
                END IF;
            END IF;
            
            SET @i = @i + 1;
        END WHILE;
    END IF;
    
    -- 8. CRIAR DOCUMENTOS PENDENTES baseados na cota
    CALL sp_CriarDocumentosPendentes(v_idFamilia, v_idAluno);
    
    -- 9. ATUALIZAR STATUS DA DECLARAÇÃO
    UPDATE tbInteresseMatricula 
    SET 
        status = 'matricula_iniciada',
        dataInicioMatricula = NOW(),
        funcionarioResponsavel_idPessoa = p_idFuncionario,
        responsavelLogin_idPessoa = v_idResponsavel
    WHERE id = p_idDeclaracao;
    
    -- 10. ATUALIZAR CAPACIDADE DA TURMA
    UPDATE tbTurma 
    SET capacidadeAtual = capacidadeAtual + 1 
    WHERE idtbTurma = p_idTurma;
    
    -- 11. LOG DA AÇÃO
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
        'password' as senhaTemporaria;
        
END$$

-- -----------------------------------------------------
-- Procedure: sp_CriarDocumentosPendentes
-- Descrição: Cria documentos pendentes baseados na configuração de cota
-- -----------------------------------------------------
CREATE PROCEDURE `sp_CriarDocumentosPendentes`(
    IN p_idFamilia INT,
    IN p_idAluno INT
)
BEGIN
    DECLARE v_tipoCota ENUM('livre', 'economica', 'funcionario');
    DECLARE v_documentosObrigatorios JSON;
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_documentoId INT;
    
    -- Cursor para percorrer os IDs dos documentos
    DECLARE cur_documentos CURSOR FOR 
        SELECT JSON_UNQUOTE(JSON_EXTRACT(v_documentosObrigatorios, CONCAT('$[', idx.n, ']'))) as doc_id
        FROM (
            SELECT 0 as n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL 
            SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL 
            SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL 
            SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15
        ) idx
        WHERE idx.n < JSON_LENGTH(v_documentosObrigatorios);
        
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;
    
    -- Obter tipo de cota da família
    SELECT tipoCota INTO v_tipoCota FROM tbFamilia WHERE idtbFamilia = p_idFamilia;
    
    -- Obter configuração de documentos para esta cota
    SELECT documentosObrigatorios INTO v_documentosObrigatorios 
    FROM tbConfiguracaoDocumentosCota 
    WHERE tipoCota = v_tipoCota;
    
    -- Se não há configuração específica, usar documentos padrão (todos ativos)
    IF v_documentosObrigatorios IS NULL THEN
        -- Criar documentos da FAMÍLIA (escopo 'familia' ou 'ambos')
        INSERT INTO tbDocumentoMatricula (
            tbFamilia_idtbFamilia, 
            tbTipoDocumento_idTipoDocumento, 
            status
        )
        SELECT 
            p_idFamilia,
            td.idTipoDocumento,
            'pendente'
        FROM tbTipoDocumento td
        WHERE td.ativo = TRUE 
        AND td.escopo IN ('familia', 'ambos');
        
        -- Criar documentos do ALUNO (escopo 'aluno' ou 'ambos')
        INSERT INTO tbDocumentoMatricula (
            tbAluno_idPessoa,
            tbTipoDocumento_idTipoDocumento, 
            status
        )
        SELECT 
            p_idAluno,
            td.idTipoDocumento,
            'pendente'
        FROM tbTipoDocumento td
        WHERE td.ativo = TRUE 
        AND td.escopo IN ('aluno', 'ambos');
    ELSE
        -- Usar configuração específica da cota
        OPEN cur_documentos;
        
        read_loop: LOOP
            FETCH cur_documentos INTO v_documentoId;
            IF v_done THEN
                LEAVE read_loop;
            END IF;
            
            -- Verificar se o documento existe e está ativo
            IF EXISTS (SELECT 1 FROM tbTipoDocumento WHERE idTipoDocumento = v_documentoId AND ativo = TRUE) THEN
                -- Inserir documento baseado no escopo
                INSERT INTO tbDocumentoMatricula (
                    tbFamilia_idtbFamilia,
                    tbAluno_idPessoa,
                    tbTipoDocumento_idTipoDocumento, 
                    status
                )
                SELECT 
                    CASE WHEN td.escopo IN ('familia', 'ambos') THEN p_idFamilia ELSE NULL END,
                    CASE WHEN td.escopo IN ('aluno', 'ambos') THEN p_idAluno ELSE NULL END,
                    td.idTipoDocumento,
                    'pendente'
                FROM tbTipoDocumento td
                WHERE td.idTipoDocumento = v_documentoId 
                AND td.ativo = TRUE;
            END IF;
        END LOOP;
        
        CLOSE cur_documentos;
    END IF;
    
END$$

DELIMITER;

-- ===================================================================
-- INSERÇÃO DE FUNCIONALIDADES (SEM ROTAS)
-- ===================================================================

INSERT INTO
    `tbFuncionalidade` (
        `chave`,
        `nomeAmigavel`,
        `descricao`,
        `icone`,
        `pai`,
        `categoria`,
        `ordemExibicao`
    )
VALUES
    -- Menus principais
    (
        'painel',
        'Painel Principal',
        'Painel principal do sistema',
        'home-outline',
        NULL,
        'menu',
        1
    ),
    (
        'funcionarios',
        'Funcionários',
        'Menu de funcionários',
        'people-outline',
        NULL,
        'menu',
        2
    ),
    (
        'matriculas',
        'Matrículas',
        'Menu de matrículas',
        'school-outline',
        NULL,
        'menu',
        3
    ),
    (
        'alunos',
        'Alunos',
        'Menu de alunos',
        'people-circle-outline',
        NULL,
        'menu',
        4
    ),
    (
        'administracao',
        'Administração',
        'Menu de administração',
        'cog-outline',
        NULL,
        'menu',
        9
    ),

-- Ações de funcionários
(
    'cadastroFuncionario',
    'Cadastro de Funcionário',
    'Cadastrar e editar funcionários',
    'person-add-outline',
    'funcionarios',
    'acao',
    21
),
(
    'gerenciamentoFuncionarios',
    'Lista de Funcionários',
    'Visualizar e gerenciar funcionários',
    'list-outline',
    'funcionarios',
    'acao',
    22
),

-- Ações de matrículas
(
    'declaracoesInteresse',
    'Declarações de Interesse',
    'Gerenciar declarações de interesse',
    'document-text-outline',
    'matriculas',
    'acao',
    31
),
(
    'declaracaoInteresse',
    'Nova Declaração',
    'Criar nova declaração de interesse',
    'add-circle-outline',
    'matriculas',
    'acao',
    33
),

-- Configurações
(
    'configurarDocumentosCota',
    'Configurar Documentos por Cota',
    'Configurar documentos por cota',
    'settings-outline',
    'matriculas',
    'configuracao',
    32
),
(
    'tiposDocumento',
    'Tipos de Documento',
    'Gerenciar tipos de documentos do sistema',
    'document-outline',
    'matriculas',
    'configuracao',
    34
);

-- ===================================================================
-- INSERÇÃO DE TIPOS DE DOCUMENTOS
-- ===================================================================

INSERT INTO
    `tbTipoDocumento` (
        `nome`,
        `descricao`,
        `obrigatorio`,
        `requerAssinatura`,
        `requerAnexo`,
        `tipoCota`,
        `escopo`,
        `ordemExibicao`
    )
VALUES
    -- Documentos da FAMÍLIA
    (
        'RG ou CNH do Responsável',
        'Documento de identidade com foto do responsável',
        TRUE,
        FALSE,
        TRUE,
        NULL,
        'familia',
        1
    ),
    (
        'CPF do Responsável',
        'CPF do responsável pela matrícula',
        TRUE,
        FALSE,
        TRUE,
        NULL,
        'familia',
        2
    ),
    (
        'Comprovante de Residência',
        'Comprovante de residência atualizado (máximo 3 meses)',
        TRUE,
        FALSE,
        TRUE,
        NULL,
        'familia',
        3
    ),

-- Documentos do ALUNO
(
    'Certidão de Nascimento do Aluno',
    'Certidão de nascimento do aluno',
    TRUE,
    FALSE,
    TRUE,
    NULL,
    'aluno',
    4
),
(
    'Foto 3x4 do Aluno',
    'Foto 3x4 recente do aluno',
    TRUE,
    FALSE,
    TRUE,
    NULL,
    'aluno',
    5
),

-- Documentos para cota econômica (FAMÍLIA)
(
    'Comprovante de Renda Familiar',
    'Comprovante de renda familiar (últimos 3 meses)',
    TRUE,
    FALSE,
    TRUE,
    'economica',
    'familia',
    10
),
(
    'Declaração de Dependentes',
    'Declaração de todos os dependentes da família',
    TRUE,
    FALSE,
    TRUE,
    'economica',
    'familia',
    11
),
(
    'Comprovante de Benefícios Sociais',
    'Comprovante de auxílios governamentais (se houver)',
    FALSE,
    FALSE,
    TRUE,
    'economica',
    'familia',
    12
),

-- Documentos para cota de funcionário (FAMÍLIA)
(
    'Comprovante de Vínculo Empregatício',
    'Comprovante de vínculo com a instituição',
    TRUE,
    FALSE,
    TRUE,
    'funcionario',
    'familia',
    20
),
(
    'Declaração de Parentesco',
    'Declaração de parentesco entre funcionário e aluno',
    TRUE,
    FALSE,
    TRUE,
    'funcionario',
    'familia',
    21
),
(
    'Contracheque',
    'Contracheque dos últimos 3 meses',
    TRUE,
    FALSE,
    TRUE,
    'funcionario',
    'familia',
    22
),

-- Documentos com assinatura (AMBOS)
(
    'Termo de Compromisso',
    'Termo de compromisso com as normas da instituição',
    TRUE,
    TRUE,
    FALSE,
    NULL,
    'ambos',
    50
),
(
    'Autorização de Uso de Imagem',
    'Autorização para uso de imagem do aluno',
    FALSE,
    TRUE,
    FALSE,
    NULL,
    'ambos',
    51
),
(
    'Declaração de Veracidade',
    'Declaração de veracidade das informações',
    TRUE,
    TRUE,
    FALSE,
    NULL,
    'ambos',
    52
);

-- ===================================================================
-- CONFIGURAÇÕES DE DOCUMENTOS POR COTA
-- ===================================================================

INSERT INTO
    `tbConfiguracaoDocumentosCota` (
        `tipoCota`,
        `documentosObrigatorios`
    )
VALUES (
        'livre',
        JSON_ARRAY(1, 2, 3, 4, 5, 11, 13)
    ),
    (
        'economica',
        JSON_ARRAY(1, 2, 3, 4, 5, 6, 7, 11, 13)
    ),
    (
        'funcionario',
        JSON_ARRAY(1, 2, 3, 4, 5, 9, 10, 11, 13)
    );

-- ===================================================================
-- INSERÇÃO DE DADOS PARA NOVAS TABELAS
-- ===================================================================

-- Horários Disponíveis do Instituto
INSERT INTO
    `tbHorarioDisponivel` (
        `codigo`,
        `descricao`,
        `horaInicio`,
        `horaFim`,
        `diasSemana`,
        `ordemExibicao`
    )
VALUES (
        'manha-8h-12h',
        'Manhã - 8h às 12h',
        '08:00:00',
        '12:00:00',
        JSON_ARRAY(
            'segunda',
            'terca',
            'quarta',
            'quinta',
            'sexta'
        ),
        1
    ),
    (
        'tarde-13h-17h',
        'Tarde - 13h às 17h',
        '13:00:00',
        '17:00:00',
        JSON_ARRAY(
            'segunda',
            'terca',
            'quarta',
            'quinta',
            'sexta'
        ),
        2
    ),
    (
        'integral-8h-17h',
        'Integral - 8h às 17h',
        '08:00:00',
        '17:00:00',
        JSON_ARRAY(
            'segunda',
            'terca',
            'quarta',
            'quinta',
            'sexta'
        ),
        3
    ),
    (
        'sabado-8h-12h',
        'Sábado - 8h às 12h',
        '08:00:00',
        '12:00:00',
        JSON_ARRAY('sabado'),
        4
    );

-- ===================================================================
-- INSERÇÃO DE DADOS BÁSICOS
-- ===================================================================

-- TURMAS DISPONÍVEIS
INSERT INTO
    `tbTurma` (
        `nomeTurma`,
        `capacidadeMaxima`,
        `capacidadeAtual`,
        `anoLetivo`,
        `periodo`,
        `ativo`,
        `observacoes`
    )
VALUES (
        'Turma A - Manhã',
        25,
        0,
        2025,
        'manha',
        TRUE,
        'Turma matutina - 8h às 12h'
    ),
    (
        'Turma B - Manhã',
        25,
        0,
        2025,
        'manha',
        TRUE,
        'Turma matutina - 8h às 12h'
    ),
    (
        'Turma A - Tarde',
        25,
        0,
        2025,
        'tarde',
        TRUE,
        'Turma vespertina - 13h às 17h'
    ),
    (
        'Turma B - Tarde',
        25,
        0,
        2025,
        'tarde',
        TRUE,
        'Turma vespertina - 13h às 17h'
    ),
    (
        'Turma Integral',
        20,
        0,
        2025,
        'integral',
        TRUE,
        'Turma integral - 8h às 17h'
    ),
    (
        'Turma Sábado',
        30,
        0,
        2025,
        'manha',
        TRUE,
        'Turma aos sábados - 8h às 12h'
    );

-- Administrador do Sistema
INSERT INTO
    `tbPessoa` (
        `NmPessoa`,
        `CpfPessoa`,
        `dtNascPessoa`,
        `email`,
        `telefone`
    )
VALUES (
        'Administrador do Sistema',
        '000.000.000-00',
        '1990-01-01',
        'admin@cipalam.com',
        '(11) 99999-0000'
    );

-- Login do administrador
INSERT INTO
    `tblogin` (
        `usuario`,
        `senha`,
        `tbPessoa_idPessoa`
    )
VALUES (
        'admin',
        '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        1
    );
-- senha: password

-- Registrar administrador como funcionário
INSERT INTO
    `tbFuncionario` (
        `tbPessoa_idPessoa`,
        `dataInicio`
    )
VALUES (1, '2023-01-01');

-- Dar todas as permissões para o administrador
INSERT INTO
    `tbPermissao` (
        `tbPessoa_idPessoa`,
        `tbFuncionalidade_idFuncionalidade`,
        `temPermissao`
    )
SELECT 1, `idFuncionalidade`, TRUE
FROM `tbFuncionalidade`;

-- ===================================================================
-- DADOS DE TESTE
-- ===================================================================

-- Professor João
INSERT INTO
    `tbPessoa` (
        `NmPessoa`,
        `CpfPessoa`,
        `dtNascPessoa`,
        `email`,
        `telefone`
    )
VALUES (
        'João Professor Silva',
        '111.111.111-11',
        '1985-05-15',
        'joao.professor@cipalam.com',
        '(11) 99999-1111'
    );

-- Maria Responsável
INSERT INTO
    `tbPessoa` (
        `NmPessoa`,
        `CpfPessoa`,
        `dtNascPessoa`,
        `email`,
        `telefone`
    )
VALUES (
        'Maria Responsável Santos',
        '222.222.222-22',
        '1980-03-20',
        'maria.santos@email.com',
        '(11) 99999-2222'
    );

-- Logins de teste
INSERT INTO
    `tblogin` (
        `usuario`,
        `senha`,
        `tbPessoa_idPessoa`
    )
VALUES (
        'joao.professor',
        '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        2
    ),
    (
        'maria.responsavel',
        '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        3
    );

-- João como funcionário
INSERT INTO
    `tbFuncionario` (
        `tbPessoa_idPessoa`,
        `dataInicio`
    )
VALUES (2, '2023-01-01');

-- Permissões para João
INSERT INTO
    `tbPermissao` (
        `tbPessoa_idPessoa`,
        `tbFuncionalidade_idFuncionalidade`,
        `temPermissao`
    )
VALUES (
        2,
        (
            SELECT idFuncionalidade
            FROM tbFuncionalidade
            WHERE
                chave = 'painel'
        ),
        TRUE
    ),
    (
        2,
        (
            SELECT idFuncionalidade
            FROM tbFuncionalidade
            WHERE
                chave = 'matriculas'
        ),
        TRUE
    ),
    (
        2,
        (
            SELECT idFuncionalidade
            FROM tbFuncionalidade
            WHERE
                chave = 'declaracoesInteresse'
        ),
        TRUE
    ),
    (
        2,
        (
            SELECT idFuncionalidade
            FROM tbFuncionalidade
            WHERE
                chave = 'declaracaoInteresse'
        ),
        TRUE
    );

-- Família para Maria
INSERT INTO
    `tbFamilia` (`observacoes`)
VALUES (
        'Família cadastrada para teste do sistema'
    );

-- Maria como responsável
INSERT INTO
    `tbResponsavel` (
        `tbFamilia_idtbFamilia`,
        `tbPessoa_idPessoa`
    )
VALUES (1, 3);

-- ===================================================================
-- DECLARAÇÕES DE INTERESSE DE TESTE
-- ===================================================================

INSERT INTO
    `tbInteresseMatricula` (
        `protocolo`,
        `etapaAtual`,
        `nomeResponsavel`,
        `cpfResponsavel`,
        `dataNascimentoResponsavel`,
        `telefoneResponsavel`,
        `emailResponsavel`,
        `responsavelExistente`,
        `responsavelAutenticado`,
        `nomeAluno`,
        `dataNascimentoAluno`,
        `cpfAluno`,
        `escolaAluno`,
        `codigoInepEscola`,
        `municipioEscola`,
        `ufEscola`,
        `cep`,
        `logradouro`,
        `numero`,
        `bairro`,
        `cidade`,
        `uf`,
        `codigoIbgeCidade`,
        `tipoCota`,
        `horariosSelecionados`,
        `observacoesResponsavel`,
        `status`,
        `dataEnvio`,
        `dadosFamiliaresPreenchidos`
    )
VALUES (
        'MAT-2025-001',
        'finalizado',
        'Ana Silva Santos',
        '444.444.444-44',
        '1985-06-15',
        '(11) 99999-4444',
        'ana.santos@email.com',
        FALSE,
        TRUE,
        'João Silva Santos',
        '2017-03-20',
        '111.222.333-44',
        'E.E. Professor João Silva',
        '23456789',
        'São Paulo',
        'SP',
        '01234-567',
        'Rua das Flores',
        '123',
        'Centro',
        'São Paulo',
        'SP',
        '3550308',
        'livre',
        JSON_ARRAY('manha-8h-12h'),
        'Criança muito ativa e interessada em aprender. Tem facilidade com matemática.',
        'interesse_declarado',
        NOW(),
        FALSE
    ),
    (
        'MAT-2025-002',
        'finalizado',
        'Carlos Oliveira',
        '555.555.555-55',
        '1982-08-10',
        '(11) 99999-5555',
        'carlos.oliveira@email.com',
        FALSE,
        TRUE,
        'Pedro Oliveira',
        '2018-01-15',
        '222.333.444-55',
        'E.M. Maria da Silva',
        '34567890',
        'São Paulo',
        'SP',
        '12345-678',
        'Avenida Brasil',
        '456',
        'Vila Nova',
        'São Paulo',
        'SP',
        '3550308',
        'economica',
        JSON_ARRAY('tarde-13h-17h'),
        'Pedro é uma criança calma e gosta muito de desenhar. Tem interesse em artes.',
        'interesse_declarado',
        NOW(),
        TRUE
    ),
    (
        'MAT-2025-003',
        'finalizado',
        'Fernanda Costa',
        '666.666.666-66',
        '1987-12-05',
        '(11) 99999-6666',
        'fernanda.costa@email.com',
        TRUE, -- Funcionária já tem cadastro
        TRUE,
        'Lucas Costa',
        '2016-11-30',
        '333.444.555-66',
        'Colégio Santa Cecília',
        '45678901',
        'São Paulo',
        'SP',
        '23456-789',
        'Rua da Esperança',
        '789',
        'Jardim América',
        'São Paulo',
        'SP',
        '3550308',
        'funcionario',
        JSON_ARRAY('manha-8h-12h'),
        'Lucas é filho de funcionária do instituto. Muito participativo e gosta de esportes.',
        'interesse_declarado',
        NOW(),
        TRUE
    ),
    (
        'MAT-2025-004',
        'dados_aluno',
        'Roberto Silva',
        '777.777.777-77',
        '1983-09-25',
        '(11) 99999-7777',
        'roberto.silva@email.com',
        FALSE,
        TRUE,
        NULL, -- Ainda não preencheu dados do aluno
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        'em_preenchimento',
        NULL,
        FALSE
    );

-- Inserir histórico de etapas para as declarações completas
INSERT INTO
    `tbHistoricoEtapaMatricula` (
        `tbInteresseMatricula_id`,
        `etapa`,
        `status`,
        `dataInicio`,
        `dataConclusao`,
        `tempoGasto`
    )
VALUES
    -- Histórico da MAT-2025-001 (Ana Silva Santos)
    (
        1,
        'dados_responsavel',
        'concluida',
        DATE_SUB(NOW(), INTERVAL 10 DAY),
        DATE_SUB(NOW(), INTERVAL 10 DAY),
        300
    ),
    (
        1,
        'verificacao_responsavel',
        'concluida',
        DATE_SUB(NOW(), INTERVAL 10 DAY),
        DATE_SUB(NOW(), INTERVAL 10 DAY),
        5
    ),
    (
        1,
        'dados_aluno',
        'concluida',
        DATE_SUB(NOW(), INTERVAL 10 DAY),
        DATE_SUB(NOW(), INTERVAL 10 DAY),
        240
    ),
    (
        1,
        'endereco_familia',
        'concluida',
        DATE_SUB(NOW(), INTERVAL 10 DAY),
        DATE_SUB(NOW(), INTERVAL 10 DAY),
        180
    ),
    (
        1,
        'observacoes',
        'concluida',
        DATE_SUB(NOW(), INTERVAL 10 DAY),
        DATE_SUB(NOW(), INTERVAL 10 DAY),
        120
    ),
    (
        1,
        'revisao',
        'concluida',
        DATE_SUB(NOW(), INTERVAL 10 DAY),
        DATE_SUB(NOW(), INTERVAL 10 DAY),
        60
    ),
    (
        1,
        'finalizado',
        'concluida',
        DATE_SUB(NOW(), INTERVAL 10 DAY),
        DATE_SUB(NOW(), INTERVAL 10 DAY),
        30
    ),

-- Histórico da MAT-2025-002 (Carlos Oliveira - cota econômica)
(
    2,
    'dados_responsavel',
    'concluida',
    DATE_SUB(NOW(), INTERVAL 8 DAY),
    DATE_SUB(NOW(), INTERVAL 8 DAY),
    280
),
(
    2,
    'verificacao_responsavel',
    'concluida',
    DATE_SUB(NOW(), INTERVAL 8 DAY),
    DATE_SUB(NOW(), INTERVAL 8 DAY),
    5
),
(
    2,
    'dados_aluno',
    'concluida',
    DATE_SUB(NOW(), INTERVAL 8 DAY),
    DATE_SUB(NOW(), INTERVAL 8 DAY),
    200
),
(
    2,
    'dados_familiares',
    'concluida',
    DATE_SUB(NOW(), INTERVAL 8 DAY),
    DATE_SUB(NOW(), INTERVAL 8 DAY),
    450
),
(
    2,
    'endereco_familia',
    'concluida',
    DATE_SUB(NOW(), INTERVAL 8 DAY),
    DATE_SUB(NOW(), INTERVAL 8 DAY),
    150
),
(
    2,
    'observacoes',
    'concluida',
    DATE_SUB(NOW(), INTERVAL 8 DAY),
    DATE_SUB(NOW(), INTERVAL 8 DAY),
    90
),
(
    2,
    'revisao',
    'concluida',
    DATE_SUB(NOW(), INTERVAL 8 DAY),
    DATE_SUB(NOW(), INTERVAL 8 DAY),
    75
),
(
    2,
    'finalizado',
    'concluida',
    DATE_SUB(NOW(), INTERVAL 8 DAY),
    DATE_SUB(NOW(), INTERVAL 8 DAY),
    25
),

-- Histórico da MAT-2025-003 (Fernanda Costa - funcionário)
(
    3,
    'dados_responsavel',
    'concluida',
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    180
),
(
    3,
    'verificacao_responsavel',
    'concluida',
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    3
),
(
    3,
    'dados_aluno',
    'concluida',
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    160
),
(
    3,
    'endereco_familia',
    'concluida',
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    120
),
(
    3,
    'observacoes',
    'concluida',
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    80
),
(
    3,
    'revisao',
    'concluida',
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    45
),
(
    3,
    'finalizado',
    'concluida',
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    20
),

-- Histórico da MAT-2025-004 (Roberto Silva - em andamento)
(
    4,
    'dados_responsavel',
    'concluida',
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    350
),
(
    4,
    'verificacao_responsavel',
    'concluida',
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    8
),
(
    4,
    'dados_aluno',
    'iniciada',
    DATE_SUB(NOW(), INTERVAL 1 DAY),
    NULL,
    NULL
);

-- ===================================================================
-- VIEWS ÚTEIS - ATUALIZADAS PARA NOVO FLUXO
-- ===================================================================

-- View para documentos pendentes do responsável (por família)
CREATE VIEW vw_documentos_familia AS
SELECT
    dm.idDocumentoMatricula,
    dm.tbFamilia_idtbFamilia as idFamilia,
    td.idTipoDocumento,
    td.nome as nomeDocumento,
    td.descricao,
    td.obrigatorio,
    td.requerAssinatura,
    td.requerAnexo,
    td.tipoCota,
    td.escopo,
    dm.status,
    dm.caminhoArquivo,
    dm.dataEnvio,
    dm.dataAprovacao,
    dm.motivoRejeicao,
    dm.observacoes,
    -- Dados da família
    f.tipoCota as cotaFamilia,
    p.NmPessoa as nomeResponsavel,
    p.CpfPessoa as cpfResponsavel
FROM
    tbDocumentoMatricula dm
    INNER JOIN tbTipoDocumento td ON dm.tbTipoDocumento_idTipoDocumento = td.idTipoDocumento
    INNER JOIN tbFamilia f ON dm.tbFamilia_idtbFamilia = f.idtbFamilia
    INNER JOIN tbResponsavel r ON f.idtbFamilia = r.tbFamilia_idtbFamilia
    INNER JOIN tbPessoa p ON r.tbPessoa_idPessoa = p.idPessoa
WHERE
    dm.tbFamilia_idtbFamilia IS NOT NULL
ORDER BY td.ordemExibicao;

-- View para documentos pendentes do aluno (individuais)
CREATE VIEW vw_documentos_aluno AS
SELECT
    dm.idDocumentoMatricula,
    dm.tbAluno_idPessoa as idAluno,
    td.idTipoDocumento,
    td.nome as nomeDocumento,
    td.descricao,
    td.obrigatorio,
    td.requerAssinatura,
    td.requerAnexo,
    td.tipoCota,
    td.escopo,
    dm.status,
    dm.caminhoArquivo,
    dm.dataEnvio,
    dm.dataAprovacao,
    dm.motivoRejeicao,
    dm.observacoes,
    -- Dados do aluno
    pa.NmPessoa as nomeAluno,
    pa.CpfPessoa as cpfAluno,
    a.matricula,
    -- Dados da família
    f.tipoCota as cotaFamilia,
    pr.NmPessoa as nomeResponsavel,
    pr.CpfPessoa as cpfResponsavel
FROM
    tbDocumentoMatricula dm
    INNER JOIN tbTipoDocumento td ON dm.tbTipoDocumento_idTipoDocumento = td.idTipoDocumento
    INNER JOIN tbAluno a ON dm.tbAluno_idPessoa = a.tbPessoa_idPessoa
    INNER JOIN tbPessoa pa ON a.tbPessoa_idPessoa = pa.idPessoa
    INNER JOIN tbFamilia f ON a.tbFamilia_idtbFamilia = f.idtbFamilia
    INNER JOIN tbResponsavel r ON f.idtbFamilia = r.tbFamilia_idtbFamilia
    INNER JOIN tbPessoa pr ON r.tbPessoa_idPessoa = pr.idPessoa
WHERE
    dm.tbAluno_idPessoa IS NOT NULL
ORDER BY td.ordemExibicao;

-- View consolidada: Todos os documentos por responsável
CREATE VIEW vw_documentos_responsavel AS
SELECT
    'familia' as tipoDocumento,
    dm.idDocumentoMatricula,
    dm.tbFamilia_idtbFamilia as idReferencia,
    NULL as idAluno,
    td.nome as nomeDocumento,
    td.descricao,
    td.escopo,
    dm.status,
    dm.dataEnvio,
    dm.dataAprovacao,
    pr.idPessoa as idResponsavel,
    pr.NmPessoa as nomeResponsavel,
    pr.CpfPessoa as cpfResponsavel,
    NULL as nomeAluno,
    f.tipoCota
FROM
    tbDocumentoMatricula dm
    INNER JOIN tbTipoDocumento td ON dm.tbTipoDocumento_idTipoDocumento = td.idTipoDocumento
    INNER JOIN tbFamilia f ON dm.tbFamilia_idtbFamilia = f.idtbFamilia
    INNER JOIN tbResponsavel r ON f.idtbFamilia = r.tbFamilia_idtbFamilia
    INNER JOIN tbPessoa pr ON r.tbPessoa_idPessoa = pr.idPessoa
WHERE
    dm.tbFamilia_idtbFamilia IS NOT NULL
UNION ALL
SELECT
    'aluno' as tipoDocumento,
    dm.idDocumentoMatricula,
    dm.tbAluno_idPessoa as idReferencia,
    a.tbPessoa_idPessoa as idAluno,
    td.nome as nomeDocumento,
    td.descricao,
    td.escopo,
    dm.status,
    dm.dataEnvio,
    dm.dataAprovacao,
    pr.idPessoa as idResponsavel,
    pr.NmPessoa as nomeResponsavel,
    pr.CpfPessoa as cpfResponsavel,
    pa.NmPessoa as nomeAluno,
    f.tipoCota
FROM
    tbDocumentoMatricula dm
    INNER JOIN tbTipoDocumento td ON dm.tbTipoDocumento_idTipoDocumento = td.idTipoDocumento
    INNER JOIN tbAluno a ON dm.tbAluno_idPessoa = a.tbPessoa_idPessoa
    INNER JOIN tbPessoa pa ON a.tbPessoa_idPessoa = pa.idPessoa
    INNER JOIN tbFamilia f ON a.tbFamilia_idtbFamilia = f.idtbFamilia
    INNER JOIN tbResponsavel r ON f.idtbFamilia = r.tbFamilia_idtbFamilia
    INNER JOIN tbPessoa pr ON r.tbPessoa_idPessoa = pr.idPessoa
WHERE
    dm.tbAluno_idPessoa IS NOT NULL
ORDER BY
    idResponsavel,
    tipoDocumento,
    nomeDocumento;

-- View para turmas disponíveis
CREATE VIEW vw_turmas_disponiveis AS
SELECT
    t.idtbTurma,
    t.nomeTurma,
    t.capacidadeMaxima,
    t.capacidadeAtual,
    (
        t.capacidadeMaxima - t.capacidadeAtual
    ) as vagasDisponiveis,
    t.anoLetivo,
    t.periodo,
    CASE
        WHEN t.periodo = 'manha' THEN 'Manhã'
        WHEN t.periodo = 'tarde' THEN 'Tarde'
        WHEN t.periodo = 'integral' THEN 'Integral'
        WHEN t.periodo = 'noite' THEN 'Noite'
        ELSE t.periodo
    END as periodoFormatado,
    t.ativo,
    t.observacoes,
    CASE
        WHEN (
            t.capacidadeMaxima - t.capacidadeAtual
        ) > 0 THEN TRUE
        ELSE FALSE
    END as temVagas
FROM tbTurma t
WHERE
    t.ativo = TRUE
ORDER BY t.periodo, t.nomeTurma;

-- View para declarações completas
CREATE VIEW vw_declaracoes_completas AS
SELECT
    i.id,
    i.protocolo,
    i.etapaAtual,
    i.nomeResponsavel,
    i.cpfResponsavel,
    i.emailResponsavel,
    i.telefoneResponsavel,
    i.responsavelExistente,
    i.responsavelAutenticado,
    i.nomeAluno,
    i.dataNascimentoAluno,
    i.cpfAluno,
    i.escolaAluno,
    i.municipioEscola,
    i.ufEscola,
    CONCAT(
        COALESCE(i.logradouro, ''),
        ', ',
        COALESCE(i.numero, ''),
        ' - ',
        COALESCE(i.bairro, ''),
        ', ',
        COALESCE(i.cidade, ''),
        '/',
        COALESCE(i.uf, ''),
        ' - ',
        COALESCE(i.cep, '')
    ) as enderecoCompleto,
    i.tipoCota,
    i.status,
    i.dataInicio,
    i.dataEnvio,
    i.dataInicioMatricula,
    i.ultimaAtualizacao,
    i.observacoesResponsavel,
    i.dadosFamiliaresPreenchidos,
    CASE
        WHEN i.etapaAtual = 'dados_responsavel' THEN 'Dados do Responsável'
        WHEN i.etapaAtual = 'verificacao_responsavel' THEN 'Verificação do Responsável'
        WHEN i.etapaAtual = 'dados_aluno' THEN 'Dados do Aluno'
        WHEN i.etapaAtual = 'dados_familiares' THEN 'Dados Familiares'
        WHEN i.etapaAtual = 'endereco_familia' THEN 'Endereço da Família'
        WHEN i.etapaAtual = 'observacoes' THEN 'Observações'
        WHEN i.etapaAtual = 'revisao' THEN 'Revisão'
        WHEN i.etapaAtual = 'finalizado' THEN 'Finalizado'
        ELSE i.etapaAtual
    END as etapaFormatada,
    CASE
        WHEN i.tipoCota = 'livre' THEN 'Vaga Livre'
        WHEN i.tipoCota = 'economica' THEN 'Cota Econômica'
        WHEN i.tipoCota = 'funcionario' THEN 'Cota Funcionário'
        ELSE COALESCE(i.tipoCota, 'Não definido')
    END as tipoVagaFormatado,
    CASE
        WHEN i.status = 'em_preenchimento' THEN 'Em Preenchimento'
        WHEN i.status = 'interesse_declarado' THEN 'Interesse Declarado'
        WHEN i.status = 'matricula_iniciada' THEN 'Matrícula Iniciada'
        WHEN i.status = 'documentos_pendentes' THEN 'Documentos Pendentes'
        WHEN i.status = 'documentos_completos' THEN 'Documentos Completos'
        WHEN i.status = 'matricula_aprovada' THEN 'Matrícula Aprovada'
        WHEN i.status = 'matricula_cancelada' THEN 'Matrícula Cancelada'
        ELSE i.status
    END as statusFormatado,
    p.NmPessoa as funcionarioResponsavel,
    -- Calcular progresso baseado na etapa atual
    CASE
        WHEN i.etapaAtual = 'dados_responsavel' THEN 10
        WHEN i.etapaAtual = 'verificacao_responsavel' THEN 20
        WHEN i.etapaAtual = 'dados_aluno' THEN 30
        WHEN i.etapaAtual = 'dados_familiares' THEN 50
        WHEN i.etapaAtual = 'endereco_familia' THEN 70
        WHEN i.etapaAtual = 'observacoes' THEN 85
        WHEN i.etapaAtual = 'revisao' THEN 95
        WHEN i.etapaAtual = 'finalizado' THEN 100
        ELSE 0
    END as progressoPercentual
FROM
    tbInteresseMatricula i
    LEFT JOIN tbPessoa p ON i.funcionarioResponsavel_idPessoa = p.idPessoa;

-- View para configuração de documentos
CREATE VIEW vw_configuracao_documentos AS
SELECT c.tipoCota, c.documentosObrigatorios, c.dataAtualizacao, p.NmPessoa as funcionarioResponsavel
FROM
    tbConfiguracaoDocumentosCota c
    LEFT JOIN tbPessoa p ON c.funcionarioResponsavel_idPessoa = p.idPessoa;

-- ===================================================================
-- VIEW PARA IDENTIFICAÇÃO DE USUÁRIOS NO LOGIN
-- ===================================================================

CREATE VIEW vw_usuarios_sistema AS
SELECT
    l.idtblogin,
    l.usuario,
    l.senha,
    l.ativo as loginAtivo,
    p.idPessoa,
    p.NmPessoa,
    p.CpfPessoa,
    p.email,
    p.telefone,
    p.ativo as pessoaAtiva,
    CASE
        WHEN f.idFuncionario IS NOT NULL
        AND f.ativo = TRUE THEN 'funcionario'
        WHEN r.tbPessoa_idPessoa IS NOT NULL THEN 'responsavel'
        WHEN a.tbPessoa_idPessoa IS NOT NULL THEN 'aluno'
        ELSE 'indefinido'
    END as tipoUsuario,
    f.idFuncionario,
    f.dataInicio as dataInicioFuncionario,
    f.ativo as funcionarioAtivo,
    r.tbFamilia_idtbFamilia as idFamilia,
    a.matricula as matriculaAluno,
    a.statusAluno
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
-- CONFIGURAÇÕES FINAIS
-- ===================================================================

SET SQL_MODE = @OLD_SQL_MODE;

SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;

SET UNIQUE_CHECKS = @OLD_UNIQUE_CHECKS;

-- ===================================================================
-- VERIFICAÇÕES DE INTEGRIDADE
-- ===================================================================

-- Verificar funcionalidades
SELECT
    'Funcionalidades criadas' as item,
    COUNT(*) as quantidade,
    GROUP_CONCAT(categoria SEPARATOR ', ') as categorias
FROM tbFuncionalidade;

-- Verificar usuários criados
SELECT 'Usuários criados' as item, COUNT(*) as quantidade
FROM vw_usuarios_sistema;

-- Verificar permissões do administrador
SELECT 'Permissões do admin' as item, COUNT(*) as quantidade
FROM tbPermissao
WHERE
    tbPessoa_idPessoa = 1
    AND temPermissao = TRUE;

-- Mostrar estrutura final
SELECT
    'BANCO CIPALAM CRIADO COM SUCESSO!' as status,
    NOW() as data_criacao,
    'Versão com FLUXO DE INICIAR MATRÍCULA implementado' as observacao;

-- ===================================================================
-- INSTRUÇÕES DE USO - ATUALIZADO PARA INICIAR MATRÍCULA
-- ===================================================================

/*
🎉 BANCO DE DADOS CIPALAM ATUALIZADO COM SUCESSO!

🆕 NOVO FLUXO IMPLEMENTADO - INICIAR MATRÍCULA:
✅ Procedure sp_IniciarMatricula() - Automatiza todo o processo
✅ Distribuição automática de dados da declaração para tabelas finais
✅ Criação automática de login para responsável (CPF/últimos 4 dígitos)
✅ Sistema de documentos organizados por família e aluno
✅ Views especializadas para documentos pendentes
✅ Seleção de turma durante o processo

📋 FUNCIONALIDADES JÁ EXISTENTES:
✅ Sistema de declaração de interesse (NÃO ALTERADO)
✅ Sistema de funcionalidades e permissões
✅ Documentos organizados por cota
✅ Dados de teste incluídos

🔄 COMO FUNCIONA O FLUXO DE INICIAR MATRÍCULA:

1. **FUNCIONÁRIO** vê lista de declarações com status 'interesse_declarado'
2. **FUNCIONÁRIO** clica em "Iniciar Matrícula" e escolhe a TURMA
3. **SISTEMA** executa sp_IniciarMatricula(idDeclaracao, idTurma, idFuncionario)
4. **AUTOMATICAMENTE**:
- Cria família com dados da declaração
- Cria pessoa responsável  
- Cria pessoa aluno
- Vincula responsável à família
- Matricula aluno na turma escolhida
- Cria login: usuário=CPF, senha=últimos4CPF
- Cria documentos pendentes baseados na cota
- Atualiza status para 'matricula_iniciada'

5. **RESPONSÁVEL** faz login e vê:
- Documentos da FAMÍLIA (compartilhados)
- Documentos de CADA ALUNO (individuais)

👤 TIPOS DE LOGIN:
- **admin** / password (Administrador)
- **joao.professor** / password (Funcionário)
- **maria.responsavel** / password (Responsável teste)
- **11122233344** / 3344 (Login automático de responsável)

� PRINCIPAIS TABELAS ATUALIZADAS:
- tbFamilia: Agora inclui dados de endereço e renda
- tbTurma: Controle de capacidade e informações detalhadas
- tbResponsavel: Chave primária e controle de vínculos
- tbAluno: Dados completos da declaração + matrícula
- tbDocumentoMatricula: Suporte para família/aluno separadamente
- tbTipoDocumento: Campo 'escopo' (familia/aluno/ambos)

🔍 VIEWS ÚTEIS PARA CONSULTAS:
- vw_documentos_familia: Documentos pendentes por família
- vw_documentos_aluno: Documentos pendentes por aluno
- vw_documentos_responsavel: Visão consolidada do responsável
- vw_turmas_disponiveis: Turmas com vagas disponíveis
- vw_declaracoes_completas: Declarações formatadas
- vw_usuarios_sistema: Para autenticação

⚡ EXEMPLOS DE USO:

-- Iniciar matrícula (funcionário escolhe turma 1)
CALL sp_IniciarMatricula(1, 1, 2);

-- Ver documentos pendentes de um responsável
SELECT * FROM vw_documentos_responsavel WHERE cpfResponsavel = '111.222.333-44';

-- Ver turmas disponíveis
SELECT * FROM vw_turmas_disponiveis WHERE temVagas = TRUE;

-- Ver declarações prontas para iniciar matrícula
SELECT * FROM vw_declaracoes_completas WHERE status = 'interesse_declarado';

� PRÓXIMOS PASSOS:
1. Executar este SQL no banco
2. Testar procedure sp_IniciarMatricula
3. Implementar no backend as APIs para:
- Listar turmas disponíveis
- Executar iniciar matrícula
- Documentos do responsável
4. Implementar no frontend:
- Seleção de turma
- Área do responsável
- Upload de documentos organizados

✨ SISTEMA PRONTO PARA DESENVOLVIMENTO COMPLETO!
*/