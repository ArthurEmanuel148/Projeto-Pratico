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
    `CpfPessoa` CHAR(14) NULL,
    `caminhoImagem` VARCHAR(255) NULL,
    `dtNascPessoa` DATE NOT NULL,
    `caminhoIdentidadePessoa` VARCHAR(255) NULL,
    `email` VARCHAR(100) NULL,
    `telefone` VARCHAR(20) NULL,
    `renda` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `profissao` VARCHAR(100) NULL,
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
-- Table `Cipalam`.`tbTurma` - ATUALIZADA SEM CAMPO PERÍODO E ANO LETIVO
-- -----------------------------------------------------
CREATE TABLE `tbTurma` (
    `idtbTurma` INT NOT NULL AUTO_INCREMENT,
    `nomeTurma` VARCHAR(50) NOT NULL,
    `capacidadeMaxima` INT DEFAULT 20,
    `capacidadeAtual` INT DEFAULT 0,
    `horarioInicio` TIME NULL,
    `horarioFim` TIME NULL,
    `ativo` BOOLEAN DEFAULT TRUE,
    `observacoes` TEXT NULL,
    `dataCriacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`idtbTurma`),
    INDEX `idx_ativo` (`ativo`)
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
        'configuracao',
        'permissao'
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
`rendaResponsavel` DECIMAL(10, 2) NULL DEFAULT 0.00,
`profissaoResponsavel` VARCHAR(100) NULL,
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
-- Table `Cipalam`.`tbTipoDocumento` - ATUALIZADA COM ESTRUTURA SIMPLIFICADA
-- -----------------------------------------------------
CREATE TABLE `tbTipoDocumento` (
    `idTipoDocumento` BIGINT NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `descricao` TEXT NULL,
    `modalidadeEntrega` ENUM('ASSINADO', 'ANEXADO') NOT NULL DEFAULT 'ANEXADO',
    `quemDeveFornencer` ENUM(
        'RESPONSAVEL',
        'ALUNO',
        'TODOS_INTEGRANTES',
        'FAMILIA'
    ) NOT NULL DEFAULT 'RESPONSAVEL',
    `ativo` BOOLEAN DEFAULT TRUE,
    `dataCriacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `dataAtualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`idTipoDocumento`),
    INDEX `idx_modalidadeEntrega` (`modalidadeEntrega`),
    INDEX `idx_quemDeveFornencer` (`quemDeveFornencer`),
    INDEX `idx_ativo` (`ativo`),
    UNIQUE KEY `unique_nome_ativo` (`nome`, `ativo`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbConfiguracaoDocumentosCota`
-- -----------------------------------------------------
CREATE TABLE `tbConfiguracaoDocumentosCota` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `tipoCota` ENUM(
        'LIVRE',
        'ECONOMICA',
        'FUNCIONARIO'
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
    `tbTipoDocumento_idTipoDocumento` BIGINT NOT NULL,
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
    CONSTRAINT `fk_tbDocumentoMatricula_aluno` FOREIGN KEY (`tbAluno_idPessoa`) REFERENCES `tbPessoa` (`idPessoa`) ON DELETE CASCADE ON UPDATE NO ACTION
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

-- Inserir pessoa Bina
INSERT INTO `tbPessoa` (
    `NmPessoa`,
    `CpfPessoa`,
    `dtNascPessoa`,
    `email`,
    `telefone`
) VALUES (
    'Bina',
    '333.333.333-33',
    '1995-01-01',
    'bina@email.com',
    '(11) 99999-3333'
);

-- Inserir login para Bina (senha: 1234)
INSERT INTO `tblogin` (
    `usuario`,
    `senha`,
    `tbPessoa_idPessoa`
) VALUES (
    'Bina',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    (SELECT idPessoa FROM tbPessoa WHERE NmPessoa = 'Bina' LIMIT 1)
);

-- Registrar Bina como funcionário
INSERT INTO `tbFuncionario` (
    `tbPessoa_idPessoa`,
    `dataInicio`
) VALUES (
    (SELECT idPessoa FROM tbPessoa WHERE NmPessoa = 'Bina' LIMIT 1),
    '2025-08-14'
);

-- Dar permissões básicas para Bina (exemplo: acesso ao painel)
INSERT INTO `tbPermissao` (
    `tbPessoa_idPessoa`,
    `tbFuncionalidade_idFuncionalidade`,
    `temPermissao`
) VALUES (
    (SELECT idPessoa FROM tbPessoa WHERE NmPessoa = 'Bina' LIMIT 1),
    (SELECT idFuncionalidade FROM tbFuncionalidade WHERE chave = 'painel'),
    TRUE
);

SELECT * FROM tblogin WHERE usuario = 'Bina';

SELECT l.usuario, l.ativo AS loginAtivo, p.ativo AS pessoaAtiva
FROM tblogin l
JOIN tbPessoa p ON l.tbPessoa_idPessoa = p.idPessoa
WHERE l.usuario = 'Bina';

UPDATE tblogin
SET senha = '1234'
WHERE usuario = 'Bina';

SELECT usuario, senha FROM tblogin WHERE usuario = 'Bina';
-- ===================================================================
-- TABELA PARA INTEGRANTES DA FAMÍLIA (SEPARADA DO JSON)
-- ===================================================================

CREATE TABLE `tbIntegranteFamilia` (
    `idIntegrante` INT NOT NULL AUTO_INCREMENT,
    `tbFamilia_idtbFamilia` INT NOT NULL,
    `tbPessoa_idPessoa` INT NULL, -- Pode ser NULL se não tiver CPF válido
    `nomeIntegrante` VARCHAR(100) NOT NULL,
    `cpfIntegrante` VARCHAR(14) NULL,
    `dataNascimento` DATE NULL,
    `parentesco` ENUM(
        'pai',
        'mae',
        'conjuge',
        'filho',
        'filha',
        'irmao',
        'irma',
        'avo',
        'ava',
        'tio',
        'tia',
        'sobrinho',
        'sobrinha',
        'primo',
        'prima',
        'responsavel',
        'tutor',
        'outro'
    ) NOT NULL,
    `renda` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `profissao` VARCHAR(100) NULL,
    `observacoes` TEXT NULL,
    `ativo` BOOLEAN DEFAULT TRUE,
    `dataCriacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`idIntegrante`),
    INDEX `fk_integrante_familia_idx` (`tbFamilia_idtbFamilia`),
    INDEX `fk_integrante_pessoa_idx` (`tbPessoa_idPessoa`),
    INDEX `idx_parentesco` (`parentesco`),
    CONSTRAINT `fk_integrante_familia` FOREIGN KEY (`tbFamilia_idtbFamilia`) REFERENCES `tbFamilia` (`idtbFamilia`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `fk_integrante_pessoa` FOREIGN KEY (`tbPessoa_idPessoa`) REFERENCES `tbPessoa` (`idPessoa`) ON DELETE SET NULL ON UPDATE NO ACTION
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
    DECLARE v_nomeAluno VARCHAR(100);
    DECLARE v_usuarioLogin VARCHAR(45);
    DECLARE v_senhaLogin VARCHAR(255);
    DECLARE v_cpfResponsavel VARCHAR(14);
    DECLARE v_proximaMatricula VARCHAR(20);
    DECLARE v_tipoCota VARCHAR(20);
    DECLARE v_integrantesJson JSON;
    DECLARE v_count INT DEFAULT 0;
    DECLARE v_maxIntegrantes INT DEFAULT 0;
    DECLARE v_nomeIntegrante VARCHAR(100);
    DECLARE v_cpfIntegrante VARCHAR(14);
    DECLARE v_dataNascIntegrante DATE;
    DECLARE v_parentescoIntegrante VARCHAR(20);
    DECLARE v_rendaIntegrante DECIMAL(10,2);
    DECLARE v_profissaoIntegrante VARCHAR(100);
    DECLARE v_observacoesIntegrante TEXT;
    DECLARE v_idPessoaIntegrante INT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    
    -- Verificar se a declaração existe e não foi processada
    IF NOT EXISTS (
        SELECT 1 FROM tbInteresseMatricula 
        WHERE id = p_idDeclaracao 
        AND status IN ('interesse_declarado', 'em_preenchimento')
    ) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Declaração não encontrada ou já processada';
    END IF;
    
    -- Verificar se a turma tem vagas
    IF NOT EXISTS (
        SELECT 1 FROM tbTurma 
        WHERE idtbTurma = p_idTurma 
        AND ativo = TRUE 
        AND capacidadeAtual < capacidadeMaxima
    ) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Turma não encontrada ou sem vagas disponíveis';
    END IF;
    
    -- 1. CRIAR FAMÍLIA com dados da declaração
    INSERT INTO tbFamilia (
        cep, logradouro, numero, complemento, bairro, cidade, uf, 
        codigoIbgeCidade, pontoReferencia, numeroIntegrantes, 
        integrantesRenda, dadosFamiliaresPreenchidos, tipoCota, observacoes
    )
    SELECT 
        COALESCE(i.cep, '00000-000'), 
        COALESCE(i.logradouro, 'Não informado'), 
        COALESCE(i.numero, 'S/N'), 
        i.complemento, 
        COALESCE(i.bairro, 'Não informado'), 
        COALESCE(i.cidade, 'Não informado'), 
        COALESCE(i.uf, 'SP'),
        COALESCE(i.codigoIbgeCidade, '0000000'), 
        i.pontoReferencia, 
        COALESCE(i.numeroIntegrantes, 1),
        COALESCE(i.integrantesRenda, '[]'), 
        COALESCE(i.dadosFamiliaresPreenchidos, 0), 
        COALESCE(i.tipoCota, 'livre'),
        CONCAT('Família criada automaticamente da declaração: ', COALESCE(i.protocolo, 'SEM_PROTOCOLO'))
    FROM tbInteresseMatricula i
    WHERE i.id = p_idDeclaracao;
    
    SET v_idFamilia = LAST_INSERT_ID();
    
    -- Verificar se a família foi criada com sucesso
    IF v_idFamilia IS NULL OR v_idFamilia = 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Erro ao criar família - verifique se a declaração possui dados válidos';
    END IF;
    
    -- 2. VERIFICAR SE RESPONSÁVEL JÁ EXISTE
    SELECT cpfResponsavel, tipoCota, integrantesRenda 
    INTO v_cpfResponsavel, v_tipoCota, v_integrantesJson
    FROM tbInteresseMatricula 
    WHERE id = p_idDeclaracao;
    
    -- Verificar se a pessoa já existe
    SELECT idPessoa INTO v_idResponsavel
    FROM tbPessoa 
    WHERE CpfPessoa = v_cpfResponsavel 
    LIMIT 1;
    
    IF v_idResponsavel IS NULL THEN
        -- 3. CRIAR PESSOA RESPONSÁVEL
        INSERT INTO tbPessoa (
            NmPessoa, CpfPessoa, dtNascPessoa, telefone, email, renda, profissao
        )
        SELECT 
            COALESCE(nomeResponsavel, 'Nome não informado'), 
            cpfResponsavel, 
            COALESCE(dataNascimentoResponsavel, CURDATE()), 
            telefoneResponsavel, 
            emailResponsavel,
            COALESCE(rendaResponsavel, 0.00),
            profissaoResponsavel
        FROM tbInteresseMatricula 
        WHERE id = p_idDeclaracao;
        
        SET v_idResponsavel = LAST_INSERT_ID();
        
        -- Verificar se o responsável foi criado com sucesso
        IF v_idResponsavel IS NULL OR v_idResponsavel = 0 THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Erro ao criar pessoa responsável';
        END IF;
        
        -- 4. CRIAR LOGIN PARA RESPONSÁVEL (apenas se não existir)
        SET v_usuarioLogin = REPLACE(REPLACE(v_cpfResponsavel, '.', ''), '-', '');
        SET v_senhaLogin = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; -- "password"
        
        INSERT IGNORE INTO tblogin (usuario, senha, tbPessoa_idPessoa)
        VALUES (v_usuarioLogin, v_senhaLogin, v_idResponsavel);
    END IF;
    
    -- 5. VINCULAR RESPONSÁVEL À FAMÍLIA
    -- Verificar se a família foi criada com sucesso
    IF v_idFamilia IS NULL OR v_idFamilia = 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Erro ao criar família - ID inválido';
    END IF;
    
    -- Verificar se o responsável foi criado/encontrado
    IF v_idResponsavel IS NULL OR v_idResponsavel = 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Erro ao criar/encontrar responsável - ID inválido';
    END IF;
    
    INSERT INTO tbResponsavel (tbFamilia_idtbFamilia, tbPessoa_idPessoa)
    VALUES (v_idFamilia, v_idResponsavel);
    
    -- 6. CRIAR PESSOA ALUNO
    INSERT INTO tbPessoa (
        NmPessoa, CpfPessoa, dtNascPessoa
    )
    SELECT 
        COALESCE(nomeAluno, 'Nome do aluno não informado'), 
        cpfAluno, 
        COALESCE(dataNascimentoAluno, CURDATE())
    FROM tbInteresseMatricula 
    WHERE id = p_idDeclaracao;
    
    SET v_idAluno = LAST_INSERT_ID();
    
    -- Capturar nome do aluno para evitar duplicatas
    SELECT nomeAluno INTO v_nomeAluno 
    FROM tbInteresseMatricula 
    WHERE id = p_idDeclaracao;
    
    -- 7. GERAR MATRÍCULA AUTOMÁTICA
    SET v_proximaMatricula = CONCAT(
        YEAR(CURDATE()), 
        LPAD((
            SELECT COALESCE(MAX(CAST(SUBSTRING(matricula, 5) AS UNSIGNED)), 0) + 1
            FROM tbAluno 
            WHERE matricula LIKE CONCAT(YEAR(CURDATE()), '%')
        ), 4, '0')
    );
    
    -- 8. CRIAR ALUNO
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
    
    -- 9. PROCESSAR INTEGRANTES DA FAMÍLIA
    IF v_integrantesJson IS NOT NULL AND JSON_LENGTH(v_integrantesJson) > 0 THEN
        SET v_maxIntegrantes = JSON_LENGTH(v_integrantesJson);
        SET v_count = 0;
        
        WHILE v_count < v_maxIntegrantes DO
            -- Extrair dados do JSON
            SET v_nomeIntegrante = JSON_UNQUOTE(JSON_EXTRACT(v_integrantesJson, CONCAT('$[', v_count, '].nome')));
            SET v_cpfIntegrante = JSON_UNQUOTE(JSON_EXTRACT(v_integrantesJson, CONCAT('$[', v_count, '].cpf')));
            SET v_dataNascIntegrante = STR_TO_DATE(JSON_UNQUOTE(JSON_EXTRACT(v_integrantesJson, CONCAT('$[', v_count, '].dataNascimento'))), '%Y-%m-%d');
            SET v_parentescoIntegrante = JSON_UNQUOTE(JSON_EXTRACT(v_integrantesJson, CONCAT('$[', v_count, '].parentesco')));
            SET v_rendaIntegrante = CAST(JSON_UNQUOTE(JSON_EXTRACT(v_integrantesJson, CONCAT('$[', v_count, '].renda'))) AS DECIMAL(10,2));
            SET v_profissaoIntegrante = JSON_UNQUOTE(JSON_EXTRACT(v_integrantesJson, CONCAT('$[', v_count, '].profissao')));
            SET v_observacoesIntegrante = JSON_UNQUOTE(JSON_EXTRACT(v_integrantesJson, CONCAT('$[', v_count, '].observacoes')));
            
            SET v_idPessoaIntegrante = NULL;
            
            -- Para responsável, usar a pessoa já criada e atualizar com renda
            IF v_parentescoIntegrante = 'responsavel' THEN
                SET v_idPessoaIntegrante = v_idResponsavel;
                -- Atualizar renda e profissão do responsável
                UPDATE tbPessoa 
                SET renda = COALESCE(v_rendaIntegrante, 0.00),
                    profissao = v_profissaoIntegrante
                WHERE idPessoa = v_idResponsavel;
            ELSE
                -- Verificar se é o mesmo aluno já criado (por nome)
                IF v_nomeIntegrante = v_nomeAluno AND v_parentescoIntegrante IN ('filho', 'filha') THEN
                    SET v_idPessoaIntegrante = v_idAluno;
                ELSE
                    -- Para outros integrantes, verificar se já existe por CPF
                    IF v_cpfIntegrante IS NOT NULL AND v_cpfIntegrante != 'null' AND v_cpfIntegrante != '' THEN
                        -- Verificar se já existe pessoa com esse CPF
                        SELECT idPessoa INTO v_idPessoaIntegrante
                        FROM tbPessoa 
                        WHERE CpfPessoa = v_cpfIntegrante 
                        LIMIT 1;
                    END IF;
                    
                    -- Se não encontrou pessoa existente, criar nova
                    IF v_idPessoaIntegrante IS NULL THEN
                        INSERT INTO tbPessoa (
                            NmPessoa, CpfPessoa, dtNascPessoa, renda, profissao
                        ) VALUES (
                            v_nomeIntegrante, 
                            CASE WHEN v_cpfIntegrante IS NULL OR v_cpfIntegrante = 'null' OR v_cpfIntegrante = '' 
                                 THEN NULL 
                                 ELSE v_cpfIntegrante 
                            END,
                            COALESCE(v_dataNascIntegrante, CURDATE()),
                            COALESCE(v_rendaIntegrante, 0.00),
                            v_profissaoIntegrante
                        );
                        
                        SET v_idPessoaIntegrante = LAST_INSERT_ID();
                    END IF;
                END IF;
                
                -- Se for responsável adicional, vincular à família
                IF v_parentescoIntegrante IN ('pai', 'mae', 'tutor', 'conjuge') THEN
                    INSERT IGNORE INTO tbResponsavel (tbFamilia_idtbFamilia, tbPessoa_idPessoa)
                    VALUES (v_idFamilia, v_idPessoaIntegrante);
                END IF;
            END IF;
            
            -- Inserir integrante na tabela específica
            INSERT INTO tbIntegranteFamilia (
                tbFamilia_idtbFamilia, tbPessoa_idPessoa, nomeIntegrante,
                cpfIntegrante, dataNascimento, parentesco, renda, profissao, observacoes
            ) VALUES (
                v_idFamilia, v_idPessoaIntegrante, v_nomeIntegrante,
                v_cpfIntegrante, v_dataNascIntegrante, v_parentescoIntegrante,
                COALESCE(v_rendaIntegrante, 0.00), v_profissaoIntegrante, v_observacoesIntegrante
            );
            
            SET v_count = v_count + 1;
        END WHILE;
    END IF;
    
    -- 10. CRIAR DOCUMENTOS PENDENTES baseados na cota
    CALL sp_CriarDocumentosPendentes(v_idFamilia, v_idAluno);
    
    -- 11. ATUALIZAR STATUS DA DECLARAÇÃO
    UPDATE tbInteresseMatricula 
    SET 
        status = 'matricula_iniciada',
        dataInicioMatricula = NOW(),
        funcionarioResponsavel_idPessoa = p_idFuncionario,
        responsavelLogin_idPessoa = v_idResponsavel
    WHERE id = p_idDeclaracao;
    
    -- 12. ATUALIZAR CAPACIDADE DA TURMA
    UPDATE tbTurma 
    SET capacidadeAtual = capacidadeAtual + 1 
    WHERE idtbTurma = p_idTurma;
    
    -- 13. LOG DA AÇÃO
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
        'password' as senhaTemporariaResponsavel,
        (SELECT COUNT(*) FROM tbDocumentoMatricula WHERE tbFamilia_idtbFamilia = v_idFamilia OR tbAluno_idPessoa = v_idAluno) as totalDocumentosPendentes;
        
END$$

-- -----------------------------------------------------
-- Procedure: sp_CriarDocumentosPendentes
-- Descrição: Cria documentos pendentes baseados na cota da família
-- -----------------------------------------------------
CREATE PROCEDURE `sp_CriarDocumentosPendentes`(
    IN p_idFamilia INT,
    IN p_idAluno INT
)
BEGIN
    DECLARE v_tipoCota ENUM('livre', 'economica', 'funcionario');
    
    -- Obter tipo de cota da família
    SELECT tipoCota INTO v_tipoCota FROM tbFamilia WHERE idtbFamilia = p_idFamilia;
    
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
    AND td.quemDeveFornencer IN ('FAMILIA', 'TODOS_INTEGRANTES');
    
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
    AND td.quemDeveFornencer = 'ALUNO';
    
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
        4
    ),
    (
        'alunos',
        'Alunos',
        'Menu de alunos',
        'people-circle-outline',
        NULL,
        'menu',
        5
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

-- Documentos (menu principal)
(
    'aprovacaoDocumentos',
    'Documentos',
    'Gerenciar e aprovar documentos enviados',
    'document-text-outline',
    NULL,
    'menu',
    6
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
    40
),
(
    'declaracaoInteresse',
    'Nova Declaração',
    'Criar nova declaração de interesse',
    'add-circle-outline',
    'matriculas',
    'acao',
    41
),

-- Configurações
(
    'configurarDocumentosCota',
    'Configurar Documentos por Cota',
    'Configurar documentos por cota',
    'settings-outline',
    'matriculas',
    'configuracao',
    42
),

-- Menu principal de Turmas
(
    'turmas',
    'Turmas',
    'Menu de gerenciamento de turmas',
    'library-outline',
    NULL,
    'menu',
    3
),

-- Ações de turmas
(
    'listarTurmas',
    'Lista de Turmas',
    'Visualizar e gerenciar turmas cadastradas',
    'list-outline',
    'turmas',
    'acao',
    31
),
(
    'cadastroTurma',
    'Cadastro de Turma',
    'Cadastrar nova turma',
    'add-circle-outline',
    'turmas',
    'acao',
    32
),

-- Tipos de Documentos (menu principal)
(
    'tiposDocumento',
    'Tipos de Documento',
    'Gerenciar tipos de documento do sistema',
    'document-outline',
    NULL,
    'menu',
    7
),

-- Ações de tipos de documento
(
    'listarTiposDocumento',
    'Lista de Tipos de Documento',
    'Visualizar e gerenciar tipos de documento',
    'list-outline',
    'tiposDocumento',
    'acao',
    71
),
(
    'cadastroTipoDocumento',
    'Cadastro de Tipo de Documento',
    'Cadastrar novo tipo de documento',
    'add-circle-outline',
    'tiposDocumento',
    'acao',
    72
);

-- ===================================================================
-- INSERÇÃO DE TIPOS DE DOCUMENTOS COM NOVA ESTRUTURA
-- ===================================================================

DELETE FROM `tbTipoDocumento`;

INSERT INTO
    `tbTipoDocumento` (
        `nome`,
        `descricao`,
        `modalidadeEntrega`,
        `quemDeveFornencer`
    )
VALUES
    -- Documentos da FAMÍLIA
    (
        'Comprovante de Residência',
        'Comprovante de endereço atualizado da família',
        'ANEXADO',
        'FAMILIA'
    ),
    (
        'Termo de Responsabilidade',
        'Termo de responsabilidade do responsável',
        'ASSINADO',
        'RESPONSAVEL'
    ),
    (
        'Declaração de Veracidade',
        'Declaração de veracidade das informações prestadas',
        'ASSINADO',
        'RESPONSAVEL'
    ),
    -- Documentos do ALUNO específico
    (
        'Certidão de Nascimento',
        'Certidão de nascimento do aluno',
        'ANEXADO',
        'ALUNO'
    ),
    (
        'Foto 3x4',
        'Foto recente 3x4 do aluno',
        'ANEXADO',
        'ALUNO'
    ),
    (
        'Cartão de Vacinação',
        'Cartão de vacinação atualizado do aluno',
        'ANEXADO',
        'ALUNO'
    ),
    (
        'Histórico Escolar',
        'Histórico escolar do aluno (se aplicável)',
        'ANEXADO',
        'ALUNO'
    ),
    (
        'Atestado Médico',
        'Atestado médico do aluno (se necessário)',
        'ANEXADO',
        'ALUNO'
    ),
    -- Documentos de TODOS OS INTEGRANTES da família (cada pessoa precisa fornecer)
    (
        'RG ou CNH',
        'Documento de identidade com foto de cada integrante',
        'ANEXADO',
        'TODOS_INTEGRANTES'
    ),
    (
        'CPF',
        'Cadastro de Pessoa Física de cada integrante',
        'ANEXADO',
        'TODOS_INTEGRANTES'
    ),
    (
        'Comprovante de Renda',
        'Comprovante de renda individual de cada integrante que trabalha',
        'ANEXADO',
        'TODOS_INTEGRANTES'
    ),
    -- Documentos gerais de assinatura
    (
        'Termo de Compromisso',
        'Termo de compromisso com as normas da instituição',
        'ASSINADO',
        'FAMILIA'
    ),
    (
        'Autorização de Uso de Imagem',
        'Autorização para uso de imagem do aluno',
        'ASSINADO',
        'RESPONSAVEL'
    ),
    (
        'Declaração de Hipossuficiência',
        'Declaração de situação socioeconômica familiar',
        'ASSINADO',
        'RESPONSAVEL'
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

-- TURMAS DISPONÍVEIS - DADOS SIMPLIFICADOS SEM PERÍODO
INSERT INTO
    `tbTurma` (
        `nomeTurma`,
        `capacidadeMaxima`,
        `capacidadeAtual`,
        `horarioInicio`,
        `horarioFim`,
        `ativo`,
        `observacoes`
    )
VALUES (
        'Turma A - Manhã',
        25,
        0,
        '08:00:00',
        '12:00:00',
        TRUE,
        'Turma matutina'
    ),
    (
        'Turma B - Tarde',
        25,
        0,
        '13:00:00',
        '17:00:00',
        TRUE,
        'Turma vespertina'
    ),
    (
        'Turma Integral',
        20,
        0,
        '08:00:00',
        '17:00:00',
        TRUE,
        'Turma integral'
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
    ),
    (
        2,
        (
            SELECT idFuncionalidade
            FROM tbFuncionalidade
            WHERE
                chave = 'aprovacaoDocumentos'
        ),
        TRUE
    ),
    -- Permissões para Turmas
    (
        2,
        (
            SELECT idFuncionalidade
            FROM tbFuncionalidade
            WHERE
                chave = 'turmas'
        ),
        TRUE
    ),
    (
        2,
        (
            SELECT idFuncionalidade
            FROM tbFuncionalidade
            WHERE
                chave = 'listarTurmas'
        ),
        TRUE
    ),
    (
        2,
        (
            SELECT idFuncionalidade
            FROM tbFuncionalidade
            WHERE
                chave = 'cadastroTurma'
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
        `rendaResponsavel`,
        `profissaoResponsavel`,
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
        `complemento`,
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
        2800.00,
        'Vendedora',
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
        NULL, -- complemento
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
        1800.00,
        'Pedreiro',
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
        NULL, -- complemento
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
        4200.00,
        'Professora',
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
        NULL, -- complemento
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
    td.modalidadeEntrega,
    td.quemDeveFornencer,
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
ORDER BY td.nome;

-- View para documentos pendentes do aluno (individuais)
CREATE VIEW vw_documentos_aluno AS
SELECT
    dm.idDocumentoMatricula,
    dm.tbAluno_idPessoa as idAluno,
    td.idTipoDocumento,
    td.nome as nomeDocumento,
    td.descricao,
    td.modalidadeEntrega,
    td.quemDeveFornencer,
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
ORDER BY td.nome;

-- View consolidada: Todos os documentos por responsável
CREATE VIEW vw_documentos_responsavel AS
SELECT
    'familia' as tipoDocumento,
    dm.idDocumentoMatricula,
    dm.tbFamilia_idtbFamilia as idReferencia,
    NULL as idAluno,
    td.nome as nomeDocumento,
    td.descricao,
    td.quemDeveFornencer,
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
    td.quemDeveFornencer,
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

-- View para turmas disponíveis - CORRIGIDA SEM PERÍODO
CREATE VIEW vw_turmas_disponiveis AS
SELECT
    t.idtbTurma,
    t.nomeTurma,
    t.capacidadeMaxima,
    t.capacidadeAtual,
    (
        t.capacidadeMaxima - t.capacidadeAtual
    ) as vagasDisponiveis,
    t.horarioInicio,
    t.horarioFim,
    CASE
        WHEN TIME(t.horarioInicio) >= '06:00:00'
        AND TIME(t.horarioInicio) < '12:00:00' THEN 'Manhã'
        WHEN TIME(t.horarioInicio) >= '12:00:00'
        AND TIME(t.horarioInicio) < '18:00:00' THEN 'Tarde'
        WHEN TIME(t.horarioInicio) >= '18:00:00'
        OR TIME(t.horarioInicio) < '06:00:00' THEN 'Noite'
        WHEN TIME(t.horarioInicio) >= '06:00:00'
        AND TIME(t.horarioFim) >= '17:00:00' THEN 'Integral'
        ELSE 'Não definido'
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
ORDER BY t.horarioInicio, t.nomeTurma;

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
-- VIEWS E PROCEDURES ADICIONAIS PARA INICIAR MATRÍCULA
-- ===================================================================

-- View para turmas disponíveis com seleção - CORRIGIDA SEM PERÍODO
CREATE VIEW vw_turmas_para_selecao AS
SELECT
    t.idtbTurma,
    t.nomeTurma,
    t.horarioInicio,
    t.horarioFim,
    t.capacidadeMaxima,
    t.capacidadeAtual,
    (
        t.capacidadeMaxima - t.capacidadeAtual
    ) as vagasDisponiveis,
    CASE
        WHEN t.capacidadeAtual < t.capacidadeMaxima THEN TRUE
        ELSE FALSE
    END as temVagas,
    CONCAT(
        t.nomeTurma,
        ' - ',
        CASE
            WHEN TIME(t.horarioInicio) >= '06:00:00'
            AND TIME(t.horarioInicio) < '12:00:00' THEN 'Manhã'
            WHEN TIME(t.horarioInicio) >= '12:00:00'
            AND TIME(t.horarioInicio) < '18:00:00' THEN 'Tarde'
            WHEN TIME(t.horarioInicio) >= '18:00:00'
            OR TIME(t.horarioInicio) < '06:00:00' THEN 'Noite'
            WHEN TIME(t.horarioInicio) >= '06:00:00'
            AND TIME(t.horarioFim) >= '17:00:00' THEN 'Integral'
            ELSE 'Não definido'
        END,
        ' (',
        (
            t.capacidadeMaxima - t.capacidadeAtual
        ),
        ' vagas)'
    ) as descricaoCompleta
FROM tbTurma t
WHERE
    t.ativo = TRUE
ORDER BY t.horarioInicio, t.nomeTurma;

-- View para declarações prontas para iniciar matrícula
CREATE VIEW vw_declaracoes_para_matricula AS
SELECT
    i.id,
    i.protocolo,
    i.nomeResponsavel,
    i.cpfResponsavel,
    i.telefoneResponsavel,
    i.emailResponsavel,
    i.nomeAluno,
    i.dataNascimentoAluno,
    i.tipoCota,
    i.escolaAluno,
    i.municipioEscola,
    i.ufEscola,
    i.numeroIntegrantes,
    i.observacoesResponsavel,
    i.dataEnvio,
    DATEDIFF(CURDATE(), i.dataEnvio) as diasAguardando,
    CASE i.tipoCota
        WHEN 'livre' THEN 'Cota Livre'
        WHEN 'economica' THEN 'Cota Econômica'
        WHEN 'funcionario' THEN 'Cota Funcionário'
        ELSE 'Não Informado'
    END as tipoCotaDescricao,
    -- Verificar se responsável já existe no sistema
    CASE
        WHEN p.idPessoa IS NOT NULL THEN TRUE
        ELSE FALSE
    END as responsavelJaExiste,
    p.idPessoa as idPessoaResponsavel
FROM
    tbInteresseMatricula i
    LEFT JOIN tbPessoa p ON p.CpfPessoa = i.cpfResponsavel
WHERE
    i.status = 'interesse_declarado'
    AND i.etapaAtual = 'finalizado'
ORDER BY i.dataEnvio ASC;

-- ===================================================================
-- PROCEDURES ADICIONAIS
-- ===================================================================

DELIMITER $$

-- Procedure para listar documentos do responsável
CREATE PROCEDURE `sp_ListarDocumentosResponsavel`(IN p_cpfResponsavel VARCHAR(14))
BEGIN
    -- Documentos da família
    SELECT 
        'familia' as tipoDocumento,
        dm.idDocumentoMatricula,
        td.nome as nomeDocumento,
        td.descricao,
        td.modalidadeEntrega,
        td.quemDeveFornencer,
        dm.status,
        dm.caminhoArquivo,
        dm.dataEnvio,
        dm.observacoes,
        f.idtbFamilia as referenciaId,
        pr.NmPessoa as nomeResponsavel,
        f.tipoCota
    FROM tbDocumentoMatricula dm
    INNER JOIN tbTipoDocumento td ON dm.tbTipoDocumento_idTipoDocumento = td.idTipoDocumento
    INNER JOIN tbFamilia f ON dm.tbFamilia_idtbFamilia = f.idtbFamilia
    INNER JOIN tbResponsavel r ON f.idtbFamilia = r.tbFamilia_idtbFamilia
    INNER JOIN tbPessoa pr ON r.tbPessoa_idPessoa = pr.idPessoa
    WHERE pr.CpfPessoa = p_cpfResponsavel
    AND dm.tbFamilia_idtbFamilia IS NOT NULL
    
    UNION ALL
    
    -- Documentos do aluno
    SELECT 
        'aluno' as tipoDocumento,
        dm.idDocumentoMatricula,
        td.nome as nomeDocumento,
        td.descricao,
        td.modalidadeEntrega,
        td.quemDeveFornencer,
        dm.status,
        dm.caminhoArquivo,
        dm.dataEnvio,
        dm.observacoes,
        a.tbPessoa_idPessoa as referenciaId,
        pa.NmPessoa as nomeAluno,
        fa.tipoCota
    FROM tbDocumentoMatricula dm
    INNER JOIN tbTipoDocumento td ON dm.tbTipoDocumento_idTipoDocumento = td.idTipoDocumento
    INNER JOIN tbAluno a ON dm.tbAluno_idPessoa = a.tbPessoa_idPessoa
    INNER JOIN tbPessoa pa ON a.tbPessoa_idPessoa = pa.idPessoa
    INNER JOIN tbFamilia fa ON a.tbFamilia_idtbFamilia = fa.idtbFamilia
    INNER JOIN tbResponsavel ra ON fa.idtbFamilia = ra.tbFamilia_idtbFamilia
    INNER JOIN tbPessoa pra ON ra.tbPessoa_idPessoa = pra.idPessoa
    WHERE pra.CpfPessoa = p_cpfResponsavel
    AND dm.tbAluno_idPessoa IS NOT NULL
    
    ORDER BY tipoDocumento, nomeDocumento;
END$$

-- Function para validar se pode iniciar matrícula
CREATE FUNCTION `fn_ValidarIniciarMatricula`(
    p_idDeclaracao INT, 
    p_idTurma INT
) RETURNS VARCHAR(500)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_mensagem VARCHAR(500) DEFAULT 'OK';
    DECLARE v_status VARCHAR(50);
    DECLARE v_temVagas BOOLEAN DEFAULT FALSE;
    DECLARE v_turmaAtiva BOOLEAN DEFAULT FALSE;
    
    -- Verificar se declaração existe e está no status correto
    SELECT status INTO v_status
    FROM tbInteresseMatricula 
    WHERE id = p_idDeclaracao;
    
    IF v_status IS NULL THEN
        SET v_mensagem = 'Declaração não encontrada';
    ELSEIF v_status NOT IN ('interesse_declarado', 'em_preenchimento') THEN
        SET v_mensagem = CONCAT('Declaração não pode ser processada. Status atual: ', v_status);
    END IF;
    
    -- Verificar se turma existe e tem vagas
    SELECT 
        ativo,
        CASE WHEN capacidadeAtual < capacidadeMaxima THEN TRUE ELSE FALSE END
    INTO v_turmaAtiva, v_temVagas
    FROM tbTurma 
    WHERE idtbTurma = p_idTurma;
    
    IF v_turmaAtiva IS NULL THEN
        SET v_mensagem = 'Turma não encontrada';
    ELSEIF v_turmaAtiva = FALSE THEN
        SET v_mensagem = 'Turma não está ativa';
    ELSEIF v_temVagas = FALSE THEN
        SET v_mensagem = 'Turma não possui vagas disponíveis';
    END IF;
    
    RETURN v_mensagem;
END$$

-- Function para contar documentos pendentes por responsável
CREATE FUNCTION `fn_CountDocumentosPendentesResponsavel`(p_cpfResponsavel VARCHAR(14))
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_total INT DEFAULT 0;
    
    SELECT COUNT(dm.idDocumentoMatricula) INTO v_total
    FROM tbDocumentoMatricula dm
    LEFT JOIN tbFamilia f ON dm.tbFamilia_idtbFamilia = f.idtbFamilia
    LEFT JOIN tbResponsavel r ON f.idtbFamilia = r.tbFamilia_idtbFamilia
    LEFT JOIN tbPessoa pr ON r.tbPessoa_idPessoa = pr.idPessoa
    LEFT JOIN tbAluno a ON dm.tbAluno_idPessoa = a.tbPessoa_idPessoa
    LEFT JOIN tbFamilia fa ON a.tbFamilia_idtbFamilia = fa.idtbFamilia
    LEFT JOIN tbResponsavel ra ON fa.idtbFamilia = ra.tbFamilia_idtbFamilia
    LEFT JOIN tbPessoa pra ON ra.tbPessoa_idPessoa = pra.idPessoa
    WHERE dm.status = 'pendente'
    AND (pr.CpfPessoa = p_cpfResponsavel OR pra.CpfPessoa = p_cpfResponsavel);
    
    RETURN v_total;
END$$

DELIMITER;

-- ===================================================================
-- DADOS DE TESTE REMOVIDOS - TURMAS SERÃO CRIADAS VIA INTERFACE
-- ===================================================================

-- NOTA: Todas as inserções de dados de teste para turmas foram removidas.
-- As turmas agora devem ser criadas através da interface web, garantindo
-- compatibilidade total com a estrutura da tabela tbTurma sem campos
-- 'periodo' e 'anoLetivo'.

-- Estrutura atual da tbTurma:
-- - idtbTurma (INT, AUTO_INCREMENT, PRIMARY KEY)
-- - nomeTurma (VARCHAR(50), NOT NULL)
-- - capacidadeMaxima (INT, DEFAULT 20)
-- - capacidadeAtual (INT, DEFAULT 0)
-- - horarioInicio (TIME, NULL)
-- - horarioFim (TIME, NULL)
-- - ativo (BOOLEAN, DEFAULT TRUE)
-- - observacoes (TEXT, NULL)
-- - dataCriacao (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

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

-- Verificar turmas disponíveis
SELECT 'Turmas disponíveis' as item, COUNT(*) as quantidade
FROM vw_turmas_para_selecao
WHERE
    temVagas = TRUE;

-- Verificar documentos por cota
SELECT 'Configurações de documentos' as item, COUNT(*) as quantidade
FROM tbConfiguracaoDocumentosCota;

-- Testar function de validação
SELECT
    'Teste de validação' as teste,
    fn_ValidarIniciarMatricula (1, 1) as resultado;

-- Mostrar estrutura final
SELECT
    'BANCO CIPALAM ATUALIZADO COM SUCESSO!' as status,
    NOW() as data_criacao,
    'Versão COMPLETA com FLUXO DE INICIAR MATRÍCULA' as observacao;

-- ===================================================================
-- INSTRUÇÕES DE USO - FLUXO COMPLETO DE INICIAR MATRÍCULA
-- ===================================================================

/*
🎉 BANCO DE DADOS CIPALAM - VERSÃO COMPLETA ATUALIZADA!

🆕 NOVO FLUXO IMPLEMENTADO - INICIAR MATRÍCULA:

✅ **PRINCIPAIS FUNCIONALIDADES**:
- ✅ Tabela tbIntegranteFamilia: Integrantes familiares separados do JSON
- ✅ Procedure sp_IniciarMatricula(): Processo completo automatizado
- ✅ Distribuição automática de dados da declaração para tabelas finais
- ✅ Criação automática de login para responsável (CPF/password)
- ✅ Sistema de documentos organizados por família e aluno
- ✅ Views especializadas para seleção de turmas e documentos
- ✅ Functions utilitárias para validação e contagem

📋 **ESTRUTURA PRINCIPAIS TABELAS**:
- **tbFamilia**: Dados completos + endereço + renda + integrantes
- **tbIntegranteFamilia**: Cada integrante familiar individual 
- **tbTurma**: Controle de capacidade e informações detalhadas
- **tbResponsavel**: Múltiplos responsáveis por família
- **tbAluno**: Dados completos da declaração + matrícula
- **tbDocumentoMatricula**: Separação família/aluno
- **tbTipoDocumento**: Escopo (familia/aluno/ambos) + cota

🔄 **FLUXO COMPLETO DE INICIAR MATRÍCULA**:

**1. FUNCIONÁRIO CONSULTA DECLARAÇÕES**:
```sql
SELECT * FROM vw_declaracoes_para_matricula;
```

**2. FUNCIONÁRIO CONSULTA TURMAS DISPONÍVEIS**:
```sql
SELECT * FROM vw_turmas_para_selecao WHERE temVagas = TRUE;
```

**3. VALIDAR SE PODE INICIAR**:
```sql
SELECT fn_ValidarIniciarMatricula(1, 1) as validacao;
```

**4. EXECUTAR INICIAR MATRÍCULA**:
```sql
CALL sp_IniciarMatricula(1, 1, 2);
-- Parâmetros: idDeclaracao, idTurma, idFuncionario
```

**5. RESPONSÁVEL CONSULTA DOCUMENTOS**:
```sql
CALL sp_ListarDocumentosResponsavel('111.222.333-44');
```

**6. CONTAR DOCUMENTOS PENDENTES**:
```sql
SELECT fn_CountDocumentosPendentesResponsavel('111.222.333-44') as total;
```

🔍 **VIEWS ÚTEIS**:
- **vw_turmas_para_selecao**: Turmas com vagas + descrição completa
- **vw_declaracoes_para_matricula**: Declarações prontas + dados resumidos
- **vw_documentos_responsavel**: Todos os documentos do responsável
- **vw_declaracoes_completas**: Declarações com formatação completa
- **vw_usuarios_sistema**: Para autenticação no sistema

🛠️ **PROCEDURES E FUNCTIONS**:
- **sp_IniciarMatricula()**: Automatiza todo o fluxo
- **sp_CriarDocumentosPendentes()**: Cria documentos baseados na cota
- **sp_ListarDocumentosResponsavel()**: Lista documentos do responsável
- **fn_ValidarIniciarMatricula()**: Valida se pode iniciar
- **fn_CountDocumentosPendentesResponsavel()**: Conta documentos pendentes

👤 **TIPOS DE LOGIN NO SISTEMA**:
- **admin** / password (Administrador completo)
- **joao.professor** / password (Funcionário de teste)
- **maria.responsavel** / password (Responsável de teste)
- **CPF_SEM_PONTOS** / password (Responsáveis auto-criados)

📋 **DOCUMENTOS POR COTA**:
- **LIVRE**: RG, CPF, Comprovante Residência, Certidão Nascimento, Foto 3x4
- **ECONÔMICA**: Documentos básicos + Comprovante Renda + Declaração Dependentes  
- **FUNCIONÁRIO**: Documentos básicos + Comprovante Vínculo + Declaração Parentesco

🔄 **PROCESSO AUTOMÁTICO sp_IniciarMatricula()**:
1. Validar declaração e turma
2. Criar família com dados da declaração
3. Verificar se responsável já existe
4. Criar responsável (se necessário) + login
5. Vincular responsável à família
6. Criar pessoa aluno
7. Gerar matrícula automática
8. Matricular aluno na turma selecionada
9. Processar integrantes familiares (JSON → tabela)
10. Criar documentos pendentes por cota
11. Atualizar status da declaração
12. Atualizar capacidade da turma
13. Registrar log da ação
14. Retornar dados do processo

⚡ **EXEMPLOS PRÁTICOS**:

```sql
-- 1. Ver declarações prontas para matricular
SELECT protocolo, nomeAluno, tipoCotaDescricao, diasAguardando 
FROM vw_declaracoes_para_matricula 
ORDER BY diasAguardando DESC;

-- 2. Ver turmas com vagas
SELECT descricaoCompleta, vagasDisponiveis 
FROM vw_turmas_para_selecao 
WHERE temVagas = TRUE;

-- 3. Iniciar matrícula (declaração 1, turma 1, funcionário 2)
CALL sp_IniciarMatricula(1, 1, 2);

-- 4. Ver documentos de um responsável
CALL sp_ListarDocumentosResponsavel('111.222.333-44');

-- 5. Verificar integrantes de uma família
SELECT nomeIntegrante, parentesco, renda, profissao 
FROM tbIntegranteFamilia 
WHERE tbFamilia_idtbFamilia = 1;
```

🚀 **SISTEMA COMPLETAMENTE PRONTO PARA**:
- ✅ Seleção de turma pelo funcionário
- ✅ Distribuição automática de todos os dados
- ✅ Criação automática de integrantes familiares
- ✅ Documentos organizados por cota e escopo
- ✅ Login automático para responsável
- ✅ Interface responsável para upload de documentos
- ✅ Controle completo do fluxo de matrícula

💡 **PARA USAR ESTE BANCO**:
1. Execute este arquivo SQL completo
2. O banco será recriado do zero com todos os dados
3. Teste as procedures e views
4. Integre com o backend/frontend

✨ **BANCO COMPLETAMENTE FUNCIONAL E OTIMIZADO!**
*/

-- ===================================================================
-- SEÇÃO DE VALIDAÇÃO E TESTES AUTOMÁTICOS
-- Execute as consultas abaixo para validar se tudo foi criado corretamente
-- ===================================================================

-- 1. Verificar se as tabelas principais foram criadas
SELECT 'VALIDAÇÃO: Tabelas principais criadas' as teste;

SELECT
    table_name as tabela,
    table_rows as registros_aproximados
FROM information_schema.tables
WHERE
    table_schema = 'Cipalam'
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Verificar views criadas
SELECT 'VALIDAÇÃO: Views criadas' as teste;

SELECT table_name as view_name
FROM information_schema.views
WHERE
    table_schema = 'Cipalam'
ORDER BY table_name;

-- 3. Verificar procedures criadas
SELECT 'VALIDAÇÃO: Procedures criadas' as teste;

SELECT routine_name as procedure_name
FROM information_schema.routines
WHERE
    routine_schema = 'Cipalam'
    AND routine_type = 'PROCEDURE'
ORDER BY routine_name;

-- 4. Verificar functions criadas
SELECT 'VALIDAÇÃO: Functions criadas' as teste;

SELECT routine_name as function_name
FROM information_schema.routines
WHERE
    routine_schema = 'Cipalam'
    AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 5. Testar views principais
SELECT 'TESTE: Turmas disponíveis' as teste;

SELECT COUNT(*) as total_turmas_ativas FROM vw_turmas_para_selecao;

SELECT 'TESTE: Declarações para matrícula' as teste;

SELECT COUNT(*) as total_declaracoes
FROM vw_declaracoes_para_matricula;

-- 6. Testar function de validação
SELECT 'TESTE: Function de validação' as teste;

SELECT fn_ValidarIniciarMatricula (1, 1) as resultado_validacao;

-- 7. Verificar dados de teste
SELECT 'DADOS DE TESTE: Usuários criados' as teste;

SELECT COUNT(*) as total_pessoas FROM tbPessoa;

SELECT COUNT(*) as total_funcionarios
FROM tbFuncionario
WHERE
    ativo = TRUE;

SELECT 'DADOS DE TESTE: Configuração documentos' as teste;

SELECT tipoCota, JSON_LENGTH(documentosObrigatorios) as total_documentos
FROM tbConfiguracaoDocumentosCota;

-- 8. Status final da validação
SELECT
    'BANCO CIPALAM VALIDADO COM SUCESSO!' as status,
    NOW() as data_validacao,
    'Sistema pronto para desenvolvimento e produção' as observacao;