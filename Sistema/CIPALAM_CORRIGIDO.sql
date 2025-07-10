-- ===================================================================
-- BANCO DE DADOS CIPALAM - ARQUIVO ÚNICO E COMPLETO
-- Este é o arquivo DEFINITIVO para criar/atualizar todo o banco
-- Estrutura 100% compatível com as telas desenvolvidas
--
-- INSTRUÇÕES DE EXECUÇÃO:
-- 1. Abra phpMyAdmin ou MySQL Workbench
-- 2. Execute este arquivo SQL completo
-- 3. Pronto! Sistema funcionando com dados de teste
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
CREATE SCHEMA IF NOT EXISTS `Cipalam` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `Cipalam`;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbPessoa`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbPessoa`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbPessoa` (
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
DROP TABLE IF EXISTS `Cipalam`.`tblogin`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tblogin` (
    `idtblogin` INT NOT NULL AUTO_INCREMENT,
    `usuario` VARCHAR(45) NOT NULL UNIQUE,
    `senha` VARCHAR(255) NOT NULL,
    `tbPessoa_idPessoa` INT NULL,
    `ativo` BOOLEAN DEFAULT TRUE,
    `ultimoLogin` TIMESTAMP NULL,
    `dataCriacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`idtblogin`),
    INDEX `fk_tblogin_tbPessoa1_idx` (`tbPessoa_idPessoa` ASC),
    CONSTRAINT `fk_tblogin_tbPessoa1` FOREIGN KEY (`tbPessoa_idPessoa`) REFERENCES `Cipalam`.`tbPessoa` (`idPessoa`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbDiretor`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbDiretor`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbDiretor` (
    `tbPessoa_idPessoa` INT NOT NULL,
    PRIMARY KEY (`tbPessoa_idPessoa`),
    CONSTRAINT `fk_tbDiretor_tbPessoa1` FOREIGN KEY (`tbPessoa_idPessoa`) REFERENCES `Cipalam`.`tbPessoa` (`idPessoa`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbProfessor`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbProfessor`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbProfessor` (
    `tbPessoa_idPessoa` INT NOT NULL,
    PRIMARY KEY (`tbPessoa_idPessoa`),
    CONSTRAINT `fk_tbProfessor_tbPessoa1` FOREIGN KEY (`tbPessoa_idPessoa`) REFERENCES `Cipalam`.`tbPessoa` (`idPessoa`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbEstagiario`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbEstagiario`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbEstagiario` (
    `tbPessoa_idPessoa` INT NOT NULL,
    PRIMARY KEY (`tbPessoa_idPessoa`),
    CONSTRAINT `fk_tbEstagiario_tbPessoa1` FOREIGN KEY (`tbPessoa_idPessoa`) REFERENCES `Cipalam`.`tbPessoa` (`idPessoa`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- ===================================================================
-- TABELAS COMPLEMENTARES DO SISTEMA ORIGINAL (MANTIDAS)
-- ===================================================================

-- -----------------------------------------------------
-- Table `Cipalam`.`tbFamilia`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbFamilia`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbFamilia` (
    `idtbFamilia` INT NOT NULL AUTO_INCREMENT,
    `rendaFamiliar` DECIMAL(10, 2) NULL,
    `rendaPerCapita` DECIMAL(10, 2) NULL,
    `caminhoComprovanteresidencia` VARCHAR(255) NULL,
    `caminhoFichaInscricao` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`idtbFamilia`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbResponsavel`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbResponsavel`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbResponsavel` (
    `tbFamilia_idtbFamilia` INT NULL,
    `tbPessoa_idPessoa` INT NULL,
    INDEX `fk_tbResponsavel_tbFamilia1_idx` (`tbFamilia_idtbFamilia` ASC),
    INDEX `fk_tbResponsavel_tbPessoa1_idx` (`tbPessoa_idPessoa` ASC),
    CONSTRAINT `fk_tbResponsavel_tbFamilia1` FOREIGN KEY (`tbFamilia_idtbFamilia`) REFERENCES `Cipalam`.`tbFamilia` (`idtbFamilia`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbResponsavel_tbPessoa1` FOREIGN KEY (`tbPessoa_idPessoa`) REFERENCES `Cipalam`.`tbPessoa` (`idPessoa`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbTurma`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbTurma`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbTurma` (
    `idtbTurma` INT NOT NULL AUTO_INCREMENT,
    `nomeTurma` VARCHAR(50) NULL,
    `anoLetivo` YEAR NULL,
    `capacidadeMaxima` INT DEFAULT 25,
    PRIMARY KEY (`idtbTurma`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbAluno`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbAluno`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbAluno` (
    `tbPessoa_idPessoa` INT NOT NULL,
    `tbFamilia_idtbFamilia` INT NULL,
    `tbTurma_idtbTurma` INT NULL,
    `matricula` VARCHAR(20) NULL,
    `dataMatricula` DATE NULL,
    `statusAluno` ENUM(
        'ativo',
        'inativo',
        'transferido',
        'formado'
    ) DEFAULT 'ativo',
    PRIMARY KEY (`tbPessoa_idPessoa`),
    INDEX `fk_tbAluno_tbFamilia1_idx` (`tbFamilia_idtbFamilia` ASC),
    INDEX `fk_tbAluno_tbTurma1_idx` (`tbTurma_idtbTurma` ASC),
    CONSTRAINT `fk_tbAluno_tbPessoa1` FOREIGN KEY (`tbPessoa_idPessoa`) REFERENCES `Cipalam`.`tbPessoa` (`idPessoa`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbAluno_tbFamilia1` FOREIGN KEY (`tbFamilia_idtbFamilia`) REFERENCES `Cipalam`.`tbFamilia` (`idtbFamilia`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbAluno_tbTurma1` FOREIGN KEY (`tbTurma_idtbTurma`) REFERENCES `Cipalam`.`tbTurma` (`idtbTurma`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbLivro`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbLivro`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbLivro` (
    `idtbLivro` INT NOT NULL AUTO_INCREMENT,
    `nmLivro` VARCHAR(100) NOT NULL,
    `codigoBarras` VARCHAR(45) NOT NULL,
    `caminhoImagem` VARCHAR(255) NULL,
    `numPaginas` INT NOT NULL,
    `autor` VARCHAR(100) NULL,
    `editora` VARCHAR(50) NULL,
    `anoPublicacao` YEAR NULL,
    `disponivel` BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (`idtbLivro`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbEmprestimoLivros`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbEmprestimoLivros`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbEmprestimoLivros` (
    `idtbEmprestimoLivros` INT NOT NULL AUTO_INCREMENT,
    `dtEmprestimo` DATE NOT NULL,
    `dtDevolucaoPrevista` DATE NOT NULL,
    `dtDevolucao` DATE NULL,
    `tbAluno_tbPessoa_idPessoa` INT NOT NULL,
    `tbLivro_idtbLivro` INT NOT NULL,
    `pagInicial` INT NULL,
    `pagFinal` INT NULL,
    `status` ENUM(
        'emprestado',
        'devolvido',
        'atrasado'
    ) DEFAULT 'emprestado',
    PRIMARY KEY (`idtbEmprestimoLivros`),
    INDEX `fk_tbEmprestimoLivros_tbAluno1_idx` (
        `tbAluno_tbPessoa_idPessoa` ASC
    ),
    INDEX `fk_tbEmprestimoLivros_tbLivro1_idx` (`tbLivro_idtbLivro` ASC),
    CONSTRAINT `fk_tbEmprestimoLivros_tbAluno1` FOREIGN KEY (`tbAluno_tbPessoa_idPessoa`) REFERENCES `Cipalam`.`tbAluno` (`tbPessoa_idPessoa`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbEmprestimoLivros_tbLivro1` FOREIGN KEY (`tbLivro_idtbLivro`) REFERENCES `Cipalam`.`tbLivro` (`idtbLivro`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbPeca`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbPeca`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbPeca` (
    `idtbVestimenta` INT NOT NULL AUTO_INCREMENT,
    `tipoVestimenta` VARCHAR(45) NOT NULL,
    `tamanho` VARCHAR(10) NULL,
    `cor` VARCHAR(20) NULL,
    `disponivel` BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (`idtbVestimenta`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbTipoRoupa`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbTipoRoupa`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbTipoRoupa` (
    `idTipoRoupa` INT NOT NULL AUTO_INCREMENT,
    `nmTipoRoupa` VARCHAR(30) NOT NULL,
    `descricao` VARCHAR(100) NULL,
    PRIMARY KEY (`idTipoRoupa`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbRoupa`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbRoupa`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbRoupa` (
    `tbVestimenta_idtbVestimenta` INT NOT NULL,
    `tamRoupa` VARCHAR(5) NOT NULL,
    `tbTipoRoupa_idTipoRoupa` INT NOT NULL,
    PRIMARY KEY (`tbVestimenta_idtbVestimenta`),
    INDEX `fk_tbUniforme_tbVestimenta1_idx` (
        `tbVestimenta_idtbVestimenta` ASC
    ),
    INDEX `fk_tbRoupa_tbTipoRoupa1_idx` (`tbTipoRoupa_idTipoRoupa` ASC),
    CONSTRAINT `fk_tbUniforme_tbVestimenta1` FOREIGN KEY (`tbVestimenta_idtbVestimenta`) REFERENCES `Cipalam`.`tbPeca` (`idtbVestimenta`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbRoupa_tbTipoRoupa1` FOREIGN KEY (`tbTipoRoupa_idTipoRoupa`) REFERENCES `Cipalam`.`tbTipoRoupa` (`idTipoRoupa`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbFaixa`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbFaixa`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbFaixa` (
    `tbPeca_idtbVestimenta` INT NOT NULL,
    `corFaixa` VARCHAR(15) NOT NULL,
    `graduacao` VARCHAR(20) NULL,
    PRIMARY KEY (`tbPeca_idtbVestimenta`),
    CONSTRAINT `fk_tbFaixa_tbPeca1` FOREIGN KEY (`tbPeca_idtbVestimenta`) REFERENCES `Cipalam`.`tbPeca` (`idtbVestimenta`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbEmprestimoVestimentas`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbEmprestimoVestimentas`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbEmprestimoVestimentas` (
    `idtbEmprestimoVestimentas` INT NOT NULL AUTO_INCREMENT,
    `dtEmprestimo` DATE NOT NULL,
    `dtDevolucaoPrevista` DATE NOT NULL,
    `dtDevolucao` DATE NULL,
    `tbAluno_tbPessoa_idPessoa` INT NOT NULL,
    `status` ENUM(
        'emprestado',
        'devolvido',
        'atrasado'
    ) DEFAULT 'emprestado',
    PRIMARY KEY (`idtbEmprestimoVestimentas`),
    INDEX `fk_tbEmprestimoVestimentas_tbAluno1_idx` (
        `tbAluno_tbPessoa_idPessoa` ASC
    ),
    CONSTRAINT `fk_tbEmprestimoVestimentas_tbAluno1` FOREIGN KEY (`tbAluno_tbPessoa_idPessoa`) REFERENCES `Cipalam`.`tbAluno` (`tbPessoa_idPessoa`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbEmprestimoVestimentas_has_tbPeca`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbEmprestimoVestimentas_has_tbPeca`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbEmprestimoVestimentas_has_tbPeca` (
    `tbEmprestimoVestimentas_idtbEmprestimoVestimentas` INT NOT NULL,
    `tbPeca_idtbVestimenta` INT NOT NULL,
    `quantidade` INT DEFAULT 1,
    PRIMARY KEY (
        `tbEmprestimoVestimentas_idtbEmprestimoVestimentas`,
        `tbPeca_idtbVestimenta`
    ),
    INDEX `fk_tbEmprestimoVestimentas_has_tbPeca_tbPeca1_idx` (`tbPeca_idtbVestimenta` ASC),
    INDEX `fk_tbEmprestimoVestimentas_has_tbPeca_tbEmprestimoVestiment_idx` (
        `tbEmprestimoVestimentas_idtbEmprestimoVestimentas` ASC
    ),
    CONSTRAINT `fk_tbEmprestimoVestimentas_has_tbPeca_tbEmprestimoVestimentas1` FOREIGN KEY (
        `tbEmprestimoVestimentas_idtbEmprestimoVestimentas`
    ) REFERENCES `Cipalam`.`tbEmprestimoVestimentas` (`idtbEmprestimoVestimentas`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbEmprestimoVestimentas_has_tbPeca_tbPeca1` FOREIGN KEY (`tbPeca_idtbVestimenta`) REFERENCES `Cipalam`.`tbPeca` (`idtbVestimenta`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbAula`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbAula`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbAula` (
    `idtbAula` INT NOT NULL AUTO_INCREMENT,
    `atvAula` TEXT(150) NOT NULL,
    `dataAula` DATE NULL,
    `horaInicio` TIME NULL,
    `horaFim` TIME NULL,
    PRIMARY KEY (`idtbAula`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbAula_has_tbTurma`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbAula_has_tbTurma`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbAula_has_tbTurma` (
    `tbAula_idtbAula` INT NOT NULL,
    `tbTurma_idtbTurma` INT NOT NULL,
    PRIMARY KEY (
        `tbAula_idtbAula`,
        `tbTurma_idtbTurma`
    ),
    INDEX `fk_tbAula_has_tbTurma_tbTurma1_idx` (`tbTurma_idtbTurma` ASC),
    INDEX `fk_tbAula_has_tbTurma_tbAula1_idx` (`tbAula_idtbAula` ASC),
    CONSTRAINT `fk_tbAula_has_tbTurma_tbAula1` FOREIGN KEY (`tbAula_idtbAula`) REFERENCES `Cipalam`.`tbAula` (`idtbAula`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbAula_has_tbTurma_tbTurma1` FOREIGN KEY (`tbTurma_idtbTurma`) REFERENCES `Cipalam`.`tbTurma` (`idtbTurma`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbMotivoAdvertencia`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbMotivoAdvertencia`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbMotivoAdvertencia` (
    `idtbMotivoAdvertencia` INT NOT NULL AUTO_INCREMENT,
    `motivo` VARCHAR(100) NOT NULL,
    `descricao` TEXT NULL,
    `gravidade` ENUM('leve', 'moderada', 'grave') DEFAULT 'leve',
    PRIMARY KEY (`idtbMotivoAdvertencia`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbAdvertenciaGeral`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbAdvertenciaGeral`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbAdvertenciaGeral` (
    `idadvertenciaGeral` INT NOT NULL AUTO_INCREMENT,
    `caminhoAdvertenciaAssinada` VARCHAR(255) NULL,
    `dataAdvertencia` DATE NOT NULL,
    `observacoes` TEXT NULL,
    `tbAluno_tbPessoa_idPessoa` INT NOT NULL,
    `tbMotivoAdvertencia_idtbMotivoAdvertencia` INT NOT NULL,
    `funcionario_idPessoa` INT NULL,
    PRIMARY KEY (`idadvertenciaGeral`),
    INDEX `fk_advertenciaGeral_tbAluno1_idx` (
        `tbAluno_tbPessoa_idPessoa` ASC
    ),
    INDEX `fk_advertenciaGeral_tbMotivoAdvertencia1_idx` (
        `tbMotivoAdvertencia_idtbMotivoAdvertencia` ASC
    ),
    INDEX `fk_advertenciaGeral_funcionario_idx` (`funcionario_idPessoa` ASC),
    CONSTRAINT `fk_advertenciaGeral_tbAluno1` FOREIGN KEY (`tbAluno_tbPessoa_idPessoa`) REFERENCES `Cipalam`.`tbAluno` (`tbPessoa_idPessoa`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `fk_advertenciaGeral_tbMotivoAdvertencia1` FOREIGN KEY (
        `tbMotivoAdvertencia_idtbMotivoAdvertencia`
    ) REFERENCES `Cipalam`.`tbMotivoAdvertencia` (`idtbMotivoAdvertencia`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `fk_advertenciaGeral_funcionario` FOREIGN KEY (`funcionario_idPessoa`) REFERENCES `Cipalam`.`tbPessoa` (`idPessoa`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbAdvertenciaRodaLeitura`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbAdvertenciaRodaLeitura`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbAdvertenciaRodaLeitura` (
    `idtbAdvertenciaRodaLeitura` INT NOT NULL AUTO_INCREMENT,
    `caminhoAdvertenciaAssinada` VARCHAR(255) NULL,
    `motivoAdvertencia` VARCHAR(60) NOT NULL,
    `dataAdvertencia` DATE NOT NULL,
    `observacoes` TEXT NULL,
    `tbAluno_tbPessoa_idPessoa` INT NOT NULL,
    `tbMotivoAdvertencia_idtbMotivoAdvertencia` INT NOT NULL,
    `funcionario_idPessoa` INT NULL,
    PRIMARY KEY (`idtbAdvertenciaRodaLeitura`),
    INDEX `fk_tbAdvertenciaRodaLeitura_tbAluno1_idx` (
        `tbAluno_tbPessoa_idPessoa` ASC
    ),
    INDEX `fk_tbAdvertenciaRodaLeitura_tbMotivoAdvertencia1_idx` (
        `tbMotivoAdvertencia_idtbMotivoAdvertencia` ASC
    ),
    INDEX `fk_tbAdvertenciaRodaLeitura_funcionario_idx` (`funcionario_idPessoa` ASC),
    CONSTRAINT `fk_tbAdvertenciaRodaLeitura_tbAluno1` FOREIGN KEY (`tbAluno_tbPessoa_idPessoa`) REFERENCES `Cipalam`.`tbAluno` (`tbPessoa_idPessoa`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbAdvertenciaRodaLeitura_tbMotivoAdvertencia1` FOREIGN KEY (
        `tbMotivoAdvertencia_idtbMotivoAdvertencia`
    ) REFERENCES `Cipalam`.`tbMotivoAdvertencia` (`idtbMotivoAdvertencia`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbAdvertenciaRodaLeitura_funcionario` FOREIGN KEY (`funcionario_idPessoa`) REFERENCES `Cipalam`.`tbPessoa` (`idPessoa`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- ===================================================================
-- TABELAS ESPECÍFICAS PARA INTERESSE DE MATRÍCULA (CORRIGIDAS)
-- ===================================================================

-- -----------------------------------------------------
-- Table `Cipalam`.`tbInteresseMatricula` (ESTRUTURA CORRIGIDA)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbInteresseMatricula`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbInteresseMatricula` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `protocolo` VARCHAR(50) UNIQUE NOT NULL,

-- DADOS DO RESPONSÁVEL (conforme as telas)
`nomeResponsavel` VARCHAR(100) NOT NULL,
`cpfResponsavel` VARCHAR(14) NOT NULL,
`dataNascimentoResponsavel` DATE NOT NULL,
`telefoneResponsavel` VARCHAR(20) NOT NULL,
`emailResponsavel` VARCHAR(100) NOT NULL,

-- DADOS DO ALUNO (conforme as telas)
`nomeAluno` VARCHAR(100) NOT NULL,
`dataNascimentoAluno` DATE NOT NULL,
`cpfAluno` VARCHAR(14) NULL,

-- TIPO DE VAGA (conforme as telas)
`tipoCota` ENUM( 'livre', 'economica', 'funcionario' ) NOT NULL,

-- INFORMAÇÕES DE RENDA (para cota econômica)
`rendaFamiliar` DECIMAL(10, 2) NULL,
`rendaPerCapita` DECIMAL(10, 2) NULL,
`numeroIntegrantes` INT NULL,
`enderecoCompleto` TEXT NULL,
`integrantesRenda` JSON NULL, -- Para armazenar os dados dos integrantes

-- HORÁRIOS SELECIONADOS
`horariosSelecionados` JSON NULL, -- Array de horários

-- MENSAGEM ADICIONAL
`mensagemAdicional` TEXT NULL,

-- CONTROLE DE STATUS
`status` ENUM(
    'interesse_declarado',
    'matricula_iniciada',
    'documentos_pendentes',
    'documentos_completos',
    'matricula_aprovada',
    'matricula_cancelada'
) DEFAULT 'interesse_declarado',

-- CONTROLE DE DATAS
`dataEnvio` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
`dataInicioMatricula` TIMESTAMP NULL,
`dataFinalizacao` TIMESTAMP NULL,

-- RESPONSÁVEIS PELO PROCESSO
`funcionarioResponsavel_idPessoa` INT NULL,
`responsavelLogin_idPessoa` INT NULL,

-- OBSERVAÇÕES
`observacoes` TEXT NULL,
    `observacoesInternas` TEXT NULL,
    
    PRIMARY KEY (`id`),
    INDEX `idx_protocolo` (`protocolo`),
    INDEX `idx_status` (`status`),
    INDEX `idx_tipoCota` (`tipoCota`),
    INDEX `idx_dataEnvio` (`dataEnvio`),
    INDEX `fk_tbInteresseMatricula_funcionario_idx` (`funcionarioResponsavel_idPessoa` ASC),
    INDEX `fk_tbInteresseMatricula_responsavel_idx` (`responsavelLogin_idPessoa` ASC),
    
    CONSTRAINT `fk_tbInteresseMatricula_funcionario` FOREIGN KEY (`funcionarioResponsavel_idPessoa`) 
        REFERENCES `Cipalam`.`tbPessoa` (`idPessoa`) ON DELETE SET NULL ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbInteresseMatricula_responsavel` FOREIGN KEY (`responsavelLogin_idPessoa`) 
        REFERENCES `Cipalam`.`tbPessoa` (`idPessoa`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbTipoDocumento`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbTipoDocumento`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbTipoDocumento` (
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
    ) NULL, -- NULL = todos
    `ativo` BOOLEAN DEFAULT TRUE,
    `ordemExibicao` INT DEFAULT 0,
    `templateDocumento` TEXT NULL,
    PRIMARY KEY (`idTipoDocumento`),
    INDEX `idx_tipoCota` (`tipoCota`),
    INDEX `idx_ativo` (`ativo`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbConfiguracaoDocumentosCota`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbConfiguracaoDocumentosCota`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbConfiguracaoDocumentosCota` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `tipoCota` ENUM(
        'livre',
        'economica',
        'funcionario'
    ) NOT NULL,
    `documentosObrigatorios` JSON NOT NULL, -- Array de IDs dos documentos
    `dataAtualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `funcionarioResponsavel_idPessoa` INT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_tipo_cota` (`tipoCota`),
    INDEX `fk_configuracao_funcionario_idx` (
        `funcionarioResponsavel_idPessoa`
    ),
    CONSTRAINT `fk_configuracao_funcionario` FOREIGN KEY (
        `funcionarioResponsavel_idPessoa`
    ) REFERENCES `Cipalam`.`tbPessoa` (`idPessoa`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbDocumentoMatricula`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbDocumentoMatricula`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbDocumentoMatricula` (
    `idDocumentoMatricula` INT NOT NULL AUTO_INCREMENT,
    `tbInteresseMatricula_id` INT NOT NULL,
    `tbTipoDocumento_idTipoDocumento` INT NOT NULL,
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
    PRIMARY KEY (`idDocumentoMatricula`),
    INDEX `idx_status` (`status`),
    INDEX `fk_tbDocumentoMatricula_interesse_idx` (`tbInteresseMatricula_id`),
    INDEX `fk_tbDocumentoMatricula_tipo_idx` (
        `tbTipoDocumento_idTipoDocumento`
    ),
    INDEX `fk_tbDocumentoMatricula_funcionario_idx` (
        `funcionarioAprovador_idPessoa`
    ),
    CONSTRAINT `fk_tbDocumentoMatricula_interesse` FOREIGN KEY (`tbInteresseMatricula_id`) REFERENCES `Cipalam`.`tbInteresseMatricula` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbDocumentoMatricula_tipo` FOREIGN KEY (
        `tbTipoDocumento_idTipoDocumento`
    ) REFERENCES `Cipalam`.`tbTipoDocumento` (`idTipoDocumento`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbDocumentoMatricula_funcionario` FOREIGN KEY (
        `funcionarioAprovador_idPessoa`
    ) REFERENCES `Cipalam`.`tbPessoa` (`idPessoa`) ON DELETE SET NULL ON UPDATE NO ACTION,
    UNIQUE KEY `unique_documento_matricula` (
        `tbInteresseMatricula_id`,
        `tbTipoDocumento_idTipoDocumento`
    )
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbLogMatricula`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbLogMatricula`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbLogMatricula` (
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
    CONSTRAINT `fk_tbLogMatricula_interesse` FOREIGN KEY (`tbInteresseMatricula_id`) REFERENCES `Cipalam`.`tbInteresseMatricula` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbLogMatricula_usuario` FOREIGN KEY (`usuario_idPessoa`) REFERENCES `Cipalam`.`tbPessoa` (`idPessoa`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- ===================================================================
-- SISTEMA DE FUNCIONALIDADES E PERMISSÕES
-- ===================================================================

-- -----------------------------------------------------
-- Table `Cipalam`.`tbFuncionalidade`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbFuncionalidade`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbFuncionalidade` (
    `idFuncionalidade` INT NOT NULL AUTO_INCREMENT,
    `chave` VARCHAR(50) NOT NULL UNIQUE,
    `nomeAmigavel` VARCHAR(100) NOT NULL,
    `descricao` TEXT NULL,
    `rota` VARCHAR(200) NULL,
    `icone` VARCHAR(50) NULL,
    `pai` VARCHAR(50) NULL,
    `ativo` BOOLEAN DEFAULT TRUE,
    `ordemExibicao` INT DEFAULT 0,
    PRIMARY KEY (`idFuncionalidade`),
    INDEX `idx_chave` (`chave`),
    INDEX `idx_pai` (`pai`),
    INDEX `idx_ativo` (`ativo`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbPermissao`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbPermissao`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbPermissao` (
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
    CONSTRAINT `fk_tbPermissao_tbPessoa1` FOREIGN KEY (`tbPessoa_idPessoa`) REFERENCES `Cipalam`.`tbPessoa` (`idPessoa`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbPermissao_tbFuncionalidade1` FOREIGN KEY (
        `tbFuncionalidade_idFuncionalidade`
    ) REFERENCES `Cipalam`.`tbFuncionalidade` (`idFuncionalidade`) ON DELETE CASCADE ON UPDATE NO ACTION,
    UNIQUE KEY `unique_pessoa_funcionalidade` (
        `tbPessoa_idPessoa`,
        `tbFuncionalidade_idFuncionalidade`
    )
) ENGINE = InnoDB;

-- ===================================================================
-- INSERÇÃO DOS DADOS BÁSICOS
-- ===================================================================

-- Inserindo funcionalidades do sistema
INSERT INTO
    `tbFuncionalidade` (
        `chave`,
        `nomeAmigavel`,
        `descricao`,
        `rota`,
        `icone`,
        `pai`,
        `ordemExibicao`
    )
VALUES (
        'painel',
        'Painel Principal',
        'Painel principal do sistema',
        '/paineis/painel',
        'home-outline',
        NULL,
        1
    ),
    (
        'funcionarios',
        'Funcionários',
        'Menu de funcionários',
        '',
        'people-outline',
        NULL,
        2
    ),
    (
        'cadastroFuncionario',
        'Cadastro de Funcionário',
        'Cadastrar e editar funcionários',
        '/paineis/gerenciamento-funcionarios/cadastro-funcionario',
        'person-add-outline',
        'funcionarios',
        21
    ),
    (
        'gerenciamentoFuncionarios',
        'Lista de Funcionários',
        'Visualizar e gerenciar funcionários',
        '/paineis/gerenciamento-funcionarios',
        'list-outline',
        'funcionarios',
        22
    ),
    (
        'matriculas',
        'Matrículas',
        'Menu de matrículas',
        '',
        'school-outline',
        NULL,
        3
    ),
    (
        'declaracoesInteresse',
        'Declarações de Interesse',
        'Gerenciar declarações de interesse',
        '/paineis/interesse-matricula/lista-declaracoes',
        'document-text-outline',
        'matriculas',
        31
    ),
    (
        'configurarDocumentosCota',
        'Configurar Documentos por Cota',
        'Configurar documentos por cota',
        '/paineis/interesse-matricula/configuracao-documentos',
        'settings-outline',
        'matriculas',
        32
    ),
    (
        'declaracaoInteresse',
        'Nova Declaração',
        'Criar nova declaração de interesse',
        '/paineis/interesse-matricula/declaracao-interesse',
        'add-circle-outline',
        'matriculas',
        33
    ),
    (
        'alunos',
        'Alunos',
        'Menu de alunos',
        '',
        'people-circle-outline',
        NULL,
        4
    ),
    (
        'administracao',
        'Administração',
        'Menu de administração',
        '',
        'cog-outline',
        NULL,
        9
    );

-- Inserindo usuário administrador
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

-- Inserindo login do administrador
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

-- Inserindo o administrador como diretor
INSERT INTO `tbDiretor` (`tbPessoa_idPessoa`) VALUES (1);

-- Dando todas as permissões para o administrador
INSERT INTO
    `tbPermissao` (
        `tbPessoa_idPessoa`,
        `tbFuncionalidade_idFuncionalidade`,
        `temPermissao`
    )
SELECT 1, `idFuncionalidade`, TRUE
FROM `tbFuncionalidade`;

-- ===================================================================
-- INSERÇÃO DOS TIPOS DE DOCUMENTOS (CORRETOS CONFORME SISTEMA)
-- ===================================================================

INSERT INTO
    `tbTipoDocumento` (
        `nome`,
        `descricao`,
        `obrigatorio`,
        `requerAssinatura`,
        `requerAnexo`,
        `tipoCota`,
        `ordemExibicao`
    )
VALUES
    -- Documentos gerais (todas as cotas)
    (
        'RG ou CNH',
        'Documento de identidade com foto do responsável',
        TRUE,
        FALSE,
        TRUE,
        NULL,
        1
    ),
    (
        'CPF do Responsável',
        'CPF do responsável pela matrícula',
        TRUE,
        FALSE,
        TRUE,
        NULL,
        2
    ),
    (
        'Comprovante de Residência',
        'Comprovante de residência atualizado (máximo 3 meses)',
        TRUE,
        FALSE,
        TRUE,
        NULL,
        3
    ),
    (
        'Certidão de Nascimento do Aluno',
        'Certidão de nascimento do aluno',
        TRUE,
        FALSE,
        TRUE,
        NULL,
        4
    ),
    (
        'Foto 3x4',
        'Foto 3x4 recente do aluno',
        TRUE,
        FALSE,
        TRUE,
        NULL,
        5
    ),

-- Documentos específicos para cota econômica
(
    'Comprovante de Renda',
    'Comprovante de renda familiar (últimos 3 meses)',
    TRUE,
    FALSE,
    TRUE,
    'economica',
    10
),
(
    'Declaração de Dependentes',
    'Declaração de todos os dependentes da família',
    TRUE,
    FALSE,
    TRUE,
    'economica',
    11
),
(
    'Comprovante de Benefícios Sociais',
    'Comprovante de auxílios governamentais (se houver)',
    FALSE,
    FALSE,
    TRUE,
    'economica',
    12
),

-- Documentos específicos para cota de funcionário
(
    'Comprovante de Vínculo Empregatício',
    'Comprovante de vínculo com a instituição',
    TRUE,
    FALSE,
    TRUE,
    'funcionario',
    20
),
(
    'Declaração de Parentesco',
    'Declaração de parentesco entre funcionário e aluno',
    TRUE,
    FALSE,
    TRUE,
    'funcionario',
    21
),
(
    'Contracheque',
    'Contracheque dos últimos 3 meses',
    TRUE,
    FALSE,
    TRUE,
    'funcionario',
    22
),

-- Documentos com assinatura digital
(
    'Termo de Compromisso',
    'Termo de compromisso com as normas da instituição',
    TRUE,
    TRUE,
    FALSE,
    NULL,
    50
),
(
    'Autorização de Uso de Imagem',
    'Autorização para uso de imagem do aluno',
    FALSE,
    TRUE,
    FALSE,
    NULL,
    51
),
(
    'Declaração de Veracidade',
    'Declaração de veracidade das informações',
    TRUE,
    TRUE,
    FALSE,
    NULL,
    52
);

-- ===================================================================
-- INSERÇÃO DE CONFIGURAÇÕES PADRÃO DE DOCUMENTOS POR COTA
-- ===================================================================

-- Configuração para cota livre (documentos básicos)
INSERT INTO
    `tbConfiguracaoDocumentosCota` (
        `tipoCota`,
        `documentosObrigatorios`
    )
VALUES (
        'livre',
        JSON_ARRAY(1, 2, 3, 4, 5, 11, 13)
    );
-- RG, CPF, Comprovante residência, Certidão, Foto, Termo, Declaração veracidade

-- Configuração para cota econômica (documentos básicos + renda)
INSERT INTO
    `tbConfiguracaoDocumentosCota` (
        `tipoCota`,
        `documentosObrigatorios`
    )
VALUES (
        'economica',
        JSON_ARRAY(1, 2, 3, 4, 5, 6, 7, 11, 13)
    );
-- Básicos + Comprovante renda, Declaração dependentes

-- Configuração para cota funcionário (documentos básicos + vínculo)
INSERT INTO
    `tbConfiguracaoDocumentosCota` (
        `tipoCota`,
        `documentosObrigatorios`
    )
VALUES (
        'funcionario',
        JSON_ARRAY(
            1,
            2,
            3,
            4,
            5,
            9,
            10,
            11,
            11,
            13
        )
    );
-- Básicos + Vínculo empregatício, Parentesco, Contracheque

-- ===================================================================
-- INSERÇÃO DE DADOS DE TESTE (COMPATÍVEIS COM AS TELAS)
-- ===================================================================

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
    ),
    (
        'Maria Responsável Santos',
        '222.222.222-22',
        '1980-03-20',
        'maria.santos@email.com',
        '(11) 99999-2222'
    );

-- Logins para usuários de teste
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

-- Professor
INSERT INTO `tbProfessor` (`tbPessoa_idPessoa`) VALUES (2);

-- Permissões para o professor
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
                chave = 'configurarDocumentosCota'
        ),
        TRUE
    );

-- ===================================================================
-- INSERÇÃO DE DECLARAÇÕES DE INTERESSE DE TESTE
-- ===================================================================

INSERT INTO
    `tbInteresseMatricula` (
        `protocolo`,
        `nomeResponsavel`,
        `cpfResponsavel`,
        `dataNascimentoResponsavel`,
        `telefoneResponsavel`,
        `emailResponsavel`,
        `nomeAluno`,
        `dataNascimentoAluno`,
        `cpfAluno`,
        `tipoCota`,
        `horariosSelecionados`,
        `status`
    )
VALUES (
        'MAT-2025-001',
        'Ana Silva Santos',
        '444.444.444-44',
        '1985-06-15',
        '(11) 99999-4444',
        'ana.santos@email.com',
        'João Silva Santos',
        '2017-03-20',
        '111.222.333-44',
        'livre',
        JSON_ARRAY('manha-8h-12h'),
        'interesse_declarado'
    ),
    (
        'MAT-2025-002',
        'Carlos Oliveira Lima',
        '555.555.555-55',
        '1982-09-10',
        '(11) 99999-5555',
        'carlos.lima@email.com',
        'Maria Oliveira Lima',
        '2016-11-05',
        '222.333.444-55',
        'economica',
        JSON_ARRAY('tarde-13h-17h'),
        'interesse_declarado'
    ),
    (
        'MAT-2025-003',
        'Beatriz Costa Ferreira',
        '666.666.666-66',
        '1980-12-25',
        '(11) 99999-6666',
        'beatriz.ferreira@email.com',
        'Pedro Costa Ferreira',
        '2018-01-15',
        NULL,
        'funcionario',
        JSON_ARRAY('manha-8h-12h'),
        'interesse_declarado'
    );

-- ===================================================================
-- CONFIGURAÇÕES FINAIS
-- ===================================================================

SET SQL_MODE = @OLD_SQL_MODE;

SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;

SET UNIQUE_CHECKS = @OLD_UNIQUE_CHECKS;

-- ===================================================================
-- VIEWS ÚTEIS PARA O SISTEMA
-- ===================================================================

-- View para listar declarações com informações completas
CREATE OR REPLACE VIEW vw_declaracoes_completas AS
SELECT
    i.id,
    i.protocolo,
    i.nomeResponsavel,
    i.nomeAluno,
    i.tipoCota,
    i.status,
    i.dataEnvio,
    i.dataInicioMatricula,
    CASE
        WHEN i.tipoCota = 'livre' THEN 'Vaga Livre'
        WHEN i.tipoCota = 'economica' THEN 'Cota Econômica'
        WHEN i.tipoCota = 'funcionario' THEN 'Cota Funcionário'
        ELSE i.tipoCota
    END as tipoVagaFormatado,
    CASE
        WHEN i.status = 'interesse_declarado' THEN 'Nova'
        WHEN i.status = 'matricula_iniciada' THEN 'Em Andamento'
        WHEN i.status = 'documentos_pendentes' THEN 'Documentos Pendentes'
        WHEN i.status = 'documentos_completos' THEN 'Documentos Completos'
        WHEN i.status = 'matricula_aprovada' THEN 'Aprovada'
        WHEN i.status = 'matricula_cancelada' THEN 'Cancelada'
        ELSE i.status
    END as statusFormatado,
    p.NmPessoa as funcionarioResponsavel
FROM
    tbInteresseMatricula i
    LEFT JOIN tbPessoa p ON i.funcionarioResponsavel_idPessoa = p.idPessoa;

-- View para configuração de documentos
CREATE OR REPLACE VIEW vw_configuracao_documentos AS
SELECT c.tipoCota, c.documentosObrigatorios, c.dataAtualizacao, p.NmPessoa as funcionarioResponsavel
FROM
    tbConfiguracaoDocumentosCota c
    LEFT JOIN tbPessoa p ON c.funcionarioResponsavel_idPessoa = p.idPessoa;

-- ===================================================================
-- SCRIPT DE VERIFICAÇÃO INCLUÍDO - EXECUTE APÓS O BANCO PRINCIPAL
-- ===================================================================

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

-- Verificação 3: Usuários do sistema
SELECT 'VERIFICAÇÃO 3 - USUÁRIOS DO SISTEMA' as status;

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

-- Verificação 4: Teste da view de declarações
SELECT 'VERIFICAÇÃO 4 - TESTE VIEW DECLARAÇÕES' as status;

SELECT
    protocolo,
    nomeResponsavel,
    nomeAluno,
    tipoVagaFormatado,
    statusFormatado
FROM vw_declaracoes_completas
LIMIT 5;

-- ===================================================================
-- RESULTADO ESPERADO APÓS EXECUÇÃO:
-- - 3 declarações de interesse cadastradas
-- - 14 tipos de documento configurados
-- - 3 configurações de cota definidas
-- - 3 usuários criados (admin, professor, responsável)
-- - 10 funcionalidades do sistema
-- - 2 views funcionando
--
-- USUÁRIOS DE TESTE:
-- - admin / password (Diretor - acesso total)
-- - joao.professor / password (Professor - acesso matrículas)
-- - maria.responsavel / password (Responsável)
--
-- PRÓXIMOS PASSOS:
-- 1. Faça login no sistema com o usuário admin
-- 2. Acesse "Declarações de Interesse" - verá 3 declarações
-- 3. Acesse "Configurar Documentos por Cota" - funcionando
-- 4. Teste criar nova declaração de interesse
-- ===================================================================

SELECT 'BANCO CIPALAM CRIADO COM SUCESSO!' as status;

SELECT 'Execute as consultas de verificação acima para confirmar.' as instrucao;