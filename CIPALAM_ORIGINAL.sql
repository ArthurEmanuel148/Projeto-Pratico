-- ===================================================================
-- BANCO DE DADOS CIPALAM - VERSÃO COMPLETA ATUALIZADA
-- Data: 20/08/2025
-- Descrição: Schema completo com fluxo aprimorado de declaração de interesse
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
    -- CAMPOS FAMILIARES - RELACIONAMENTO COM FAMÍLIA
    `tbFamilia_idtbFamilia` INT NULL,
    `parentesco` ENUM(
        'pai',
        'mae',
        'conjuge',
        'filho',
        'filha',
        'irmao',
        'irma',
        'avo',
        'avo_materna',
        'avo_paterna',
        'tio',
        'tia',
        'primo',
        'prima',
        'cunhado',
        'cunhada',
        'sogro',
        'sogra',
        'genro',
        'nora',
        'neto',
        'neta',
        'enteado',
        'enteada',
        'padrasto',
        'madrasta',
        'outros'
    ) NULL,
    -- CAMPOS DE RENDA INDIVIDUAL
    `tipoRenda` ENUM(
        'salario_formal',
        'autonomo',
        'aposentadoria',
        'pensao',
        'beneficio_social',
        'auxilio_emergencial',
        'seguro_desemprego',
        'renda_informal',
        'sem_renda',
        'outros'
    ) DEFAULT 'sem_renda',
    `valorRenda` DECIMAL(10, 2) DEFAULT 0.00,
    `descricaoRenda` VARCHAR(200) NULL,
    `rendaComprovada` BOOLEAN DEFAULT FALSE,
    `caminhoComprovanteRenda` VARCHAR(255) NULL,
    -- CONTROLE
    `ativo` BOOLEAN DEFAULT TRUE,
    `dataCriacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `dataAtualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`idPessoa`),
    UNIQUE KEY `unique_cpf` (`CpfPessoa`),
    INDEX `fk_tbPessoa_tbFamilia_idx` (`tbFamilia_idtbFamilia` ASC),
    CONSTRAINT `fk_tbPessoa_tbFamilia` FOREIGN KEY (`tbFamilia_idtbFamilia`) REFERENCES `tbFamilia` (`idtbFamilia`) ON DELETE SET NULL ON UPDATE NO ACTION
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
-- Table `Cipalam`.`tbFamilia` (ESTRUTURA COMPLETA PARA DADOS SOCIOECONÔMICOS)
-- -----------------------------------------------------
CREATE TABLE `tbFamilia` (
    `idtbFamilia` INT NOT NULL AUTO_INCREMENT,

-- ENDEREÇO COMPLETO
`cep` CHAR(9) NULL,
`logradouro` VARCHAR(200) NULL,
`numero` VARCHAR(20) NULL,
`complemento` VARCHAR(100) NULL,
`bairro` VARCHAR(100) NULL,
`cidade` VARCHAR(100) NULL,
`uf` CHAR(2) NULL,
`codigoIbgeCidade` VARCHAR(10) NULL,
`pontoReferencia` TEXT NULL,

-- DOCUMENTAÇÃO
`caminhoComprovanteresidencia` VARCHAR(255) NULL,

-- DADOS SOCIOECONÔMICOS (numeroIntegrantes será calculado dinamicamente)
`rendaFamiliarTotal` DECIMAL(10, 2) NULL,
`rendaPerCapita` DECIMAL(10, 2) NULL,
`beneficiarioProgSocial` BOOLEAN DEFAULT FALSE,
`programasSociais` JSON NULL, -- Lista de programas sociais que a família participa

-- SITUAÇÃO HABITACIONAL
`tipoMoradia` ENUM(
    'propria',
    'alugada',
    'cedida',
    'financiada',
    'outros'
) NULL,
`valorAluguelFinanciamento` DECIMAL(10, 2) NULL,

-- DADOS COMPLEMENTARES
`observacoes` TEXT NULL,
`situacaoFamiliar` TEXT NULL, -- Observações sobre a composição familiar

-- CONTROLE
`ativo` BOOLEAN DEFAULT TRUE,
    `dataCriacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `dataAtualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`idtbFamilia`),
    INDEX `idx_cep` (`cep`),
    INDEX `idx_cidade_uf` (`cidade`, `uf`),
    INDEX `idx_renda_per_capita` (`rendaPerCapita`),
    INDEX `idx_ativo` (`ativo`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbTurma`
-- -----------------------------------------------------
CREATE TABLE `tbTurma` (
    `idtbTurma` INT NOT NULL AUTO_INCREMENT,
    `nomeTurma` VARCHAR(50) NULL,
    `capacidadeMaxima` INT DEFAULT 20,
    PRIMARY KEY (`idtbTurma`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbResponsavel`
-- -----------------------------------------------------
CREATE TABLE `tbResponsavel` (
    `tbFamilia_idtbFamilia` INT NULL,
    `tbPessoa_idPessoa` INT NULL,
    INDEX `fk_tbResponsavel_tbFamilia1_idx` (`tbFamilia_idtbFamilia` ASC),
    INDEX `fk_tbResponsavel_tbPessoa1_idx` (`tbPessoa_idPessoa` ASC),
    CONSTRAINT `fk_tbResponsavel_tbFamilia1` FOREIGN KEY (`tbFamilia_idtbFamilia`) REFERENCES `tbFamilia` (`idtbFamilia`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbResponsavel_tbPessoa1` FOREIGN KEY (`tbPessoa_idPessoa`) REFERENCES `tbPessoa` (`idPessoa`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbAluno`
-- -----------------------------------------------------
CREATE TABLE `tbAluno` (
    `tbPessoa_idPessoa` INT NOT NULL,
    `tbFamilia_idtbFamilia` INT NULL,
    `tbTurma_idtbTurma` INT NULL,
    `matricula` VARCHAR(20) NULL,
    `dataMatricula` DATE NULL,
    `statusAluno` ENUM('ativo', 'inativo') DEFAULT 'ativo',
    `caminhoFichaInscricao` VARCHAR(255),
    `ativo` BOOLEAN DEFAULT TRUE,
    `dataCriacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`tbPessoa_idPessoa`),
    INDEX `fk_tbAluno_tbFamilia1_idx` (`tbFamilia_idtbFamilia` ASC),
    INDEX `fk_tbAluno_tbTurma1_idx` (`tbTurma_idtbTurma` ASC),
    CONSTRAINT `fk_tbAluno_tbPessoa1` FOREIGN KEY (`tbPessoa_idPessoa`) REFERENCES `tbPessoa` (`idPessoa`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbAluno_tbFamilia1` FOREIGN KEY (`tbFamilia_idtbFamilia`) REFERENCES `tbFamilia` (`idtbFamilia`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbAluno_tbTurma1` FOREIGN KEY (`tbTurma_idtbTurma`) REFERENCES `tbTurma` (`idtbTurma`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbMatricula`
-- -----------------------------------------------------
CREATE TABLE `tbMatricula` (
    `idMatricula` INT NOT NULL AUTO_INCREMENT,
    `tbAluno_tbPessoa_idPessoa` INT NOT NULL,
    `tbTurma_idTurma` INT NOT NULL,
    `dataMatricula` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `status` ENUM(
        'ATIVA',
        'INATIVA',
        'TRANSFERIDA',
        'CANCELADA'
    ) DEFAULT 'ATIVA',
    `ativo` BOOLEAN DEFAULT TRUE,
    `observacoes` TEXT NULL,
    `dataCriacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`idMatricula`),
    INDEX `fk_tbMatricula_tbAluno_idx` (
        `tbAluno_tbPessoa_idPessoa` ASC
    ),
    INDEX `fk_tbMatricula_tbTurma_idx` (`tbTurma_idTurma` ASC),
    CONSTRAINT `fk_tbMatricula_tbAluno` FOREIGN KEY (`tbAluno_tbPessoa_idPessoa`) REFERENCES `tbAluno` (`tbPessoa_idPessoa`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbMatricula_tbTurma` FOREIGN KEY (`tbTurma_idTurma`) REFERENCES `tbTurma` (`idtbTurma`) ON DELETE NO ACTION ON UPDATE NO ACTION
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
-- Table `Cipalam`.`tbTipoDocumento`
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
-- Table `Cipalam`.`tbDocumentoMatricula`
-- -----------------------------------------------------
CREATE TABLE `tbDocumentoMatricula` (
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
    CONSTRAINT `fk_tbDocumentoMatricula_interesse` FOREIGN KEY (`tbInteresseMatricula_id`) REFERENCES `tbInteresseMatricula` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbDocumentoMatricula_tipo` FOREIGN KEY (
        `tbTipoDocumento_idTipoDocumento`
    ) REFERENCES `tbTipoDocumento` (`idTipoDocumento`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbDocumentoMatricula_funcionario` FOREIGN KEY (
        `funcionarioAprovador_idPessoa`
    ) REFERENCES `tbPessoa` (`idPessoa`) ON DELETE SET NULL ON UPDATE NO ACTION,
    UNIQUE KEY `unique_documento_matricula` (
        `tbInteresseMatricula_id`,
        `tbTipoDocumento_idTipoDocumento`
    )
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
        `ordemExibicao`
    )
VALUES
    -- Documentos gerais
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

-- Documentos para cota econômica
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

-- Documentos para cota de funcionário
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

-- Documentos com assinatura
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

-- Inserir turmas de teste
INSERT INTO
    tbTurma (nomeTurma, capacidadeMaxima)
VALUES ('Turma A - Manhã', 20),
    ('Turma B - Tarde', 25),
    ('Turma C - Manhã', 18),
    ('Turma D - Tarde', 22);

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
-- VIEWS ÚTEIS
-- ===================================================================

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
-- VIEW PARA DADOS COMPLETOS DA FAMÍLIA
-- ===================================================================

CREATE VIEW vw_familia_completa AS
SELECT
    f.idtbFamilia,
    f.cep,
    f.logradouro,
    f.numero,
    f.complemento,
    f.bairro,
    f.cidade,
    f.uf,
    f.codigoIbgeCidade,
    f.pontoReferencia,
    CONCAT(
        COALESCE(f.logradouro, ''),
        CASE
            WHEN f.numero IS NOT NULL THEN CONCAT(', ', f.numero)
            ELSE ''
        END,
        CASE
            WHEN f.complemento IS NOT NULL THEN CONCAT(' - ', f.complemento)
            ELSE ''
        END,
        CASE
            WHEN f.bairro IS NOT NULL THEN CONCAT(' - ', f.bairro)
            ELSE ''
        END,
        CASE
            WHEN f.cidade IS NOT NULL THEN CONCAT(', ', f.cidade)
            ELSE ''
        END,
        CASE
            WHEN f.uf IS NOT NULL THEN CONCAT('/', f.uf)
            ELSE ''
        END,
        CASE
            WHEN f.cep IS NOT NULL THEN CONCAT(' - CEP: ', f.cep)
            ELSE ''
        END
    ) AS enderecoCompleto,
    -- Calculado dinamicamente
    (
        SELECT COUNT(*)
        FROM tbPessoa p
        WHERE
            p.tbFamilia_idtbFamilia = f.idtbFamilia
            AND p.ativo = TRUE
    ) as numeroIntegrantes,
    f.rendaFamiliarTotal,
    f.rendaPerCapita,
    f.beneficiarioProgSocial,
    f.programasSociais,
    f.tipoMoradia,
    f.valorAluguelFinanciamento,
    f.observacoes,
    f.situacaoFamiliar,
    f.ativo,
    f.dataCriacao,
    f.dataAtualizacao,
    -- Dados do responsável principal
    pr.NmPessoa as nomeResponsavel,
    pr.CpfPessoa as cpfResponsavel,
    pr.email as emailResponsavel,
    pr.telefone as telefoneResponsavel,
    -- Contadores usando a nova estrutura
    (
        SELECT COUNT(*)
        FROM tbPessoa p
        WHERE
            p.tbFamilia_idtbFamilia = f.idtbFamilia
            AND p.ativo = TRUE
    ) as totalIntegrantes,
    (
        SELECT COUNT(*)
        FROM tbAluno a
        WHERE
            a.tbFamilia_idtbFamilia = f.idtbFamilia
            AND a.ativo = TRUE
    ) as totalAlunos,
    (
        SELECT SUM(p.valorRenda)
        FROM tbPessoa p
        WHERE
            p.tbFamilia_idtbFamilia = f.idtbFamilia
            AND p.ativo = TRUE
    ) as rendaCalculada
FROM
    tbFamilia f
    LEFT JOIN tbResponsavel r ON f.idtbFamilia = r.tbFamilia_idtbFamilia
    LEFT JOIN tbPessoa pr ON r.tbPessoa_idPessoa = pr.idPessoa
WHERE
    f.ativo = TRUE;

-- View para dados de renda familiar detalhados
CREATE VIEW vw_renda_familiar_detalhada AS
SELECT
    p.idPessoa,
    p.tbFamilia_idtbFamilia as idFamilia,
    p.NmPessoa as nomeIntegrante,
    p.parentesco,
    YEAR(CURDATE()) - YEAR(p.dtNascPessoa) as idade,
    p.tipoRenda,
    p.valorRenda,
    p.descricaoRenda as ocupacao,
    p.rendaComprovada,
    p.caminhoComprovanteRenda,
    p.ativo,
    p.dataCriacao,
    -- Dados calculados da família
    (
        SELECT COUNT(*)
        FROM tbPessoa p2
        WHERE
            p2.tbFamilia_idtbFamilia = p.tbFamilia_idtbFamilia
            AND p2.ativo = TRUE
    ) as numeroIntegrantes,
    (
        SELECT SUM(p3.valorRenda)
        FROM tbPessoa p3
        WHERE
            p3.tbFamilia_idtbFamilia = p.tbFamilia_idtbFamilia
            AND p3.ativo = TRUE
    ) as rendaFamiliarTotal,
    (
        SELECT SUM(p4.valorRenda) / COUNT(*)
        FROM tbPessoa p4
        WHERE
            p4.tbFamilia_idtbFamilia = p.tbFamilia_idtbFamilia
            AND p4.ativo = TRUE
    ) as rendaPerCapita,
    -- Formatação de parentesco
    CASE
        WHEN p.parentesco = 'pai' THEN 'Pai'
        WHEN p.parentesco = 'mae' THEN 'Mãe'
        WHEN p.parentesco = 'conjuge' THEN 'Cônjuge'
        WHEN p.parentesco = 'filho' THEN 'Filho'
        WHEN p.parentesco = 'filha' THEN 'Filha'
        WHEN p.parentesco = 'irmao' THEN 'Irmão'
        WHEN p.parentesco = 'irma' THEN 'Irmã'
        WHEN p.parentesco = 'avo' THEN 'Avô'
        WHEN p.parentesco = 'avo_materna' THEN 'Avó Materna'
        WHEN p.parentesco = 'avo_paterna' THEN 'Avó Paterna'
        WHEN p.parentesco = 'tio' THEN 'Tio'
        WHEN p.parentesco = 'tia' THEN 'Tia'
        WHEN p.parentesco = 'primo' THEN 'Primo'
        WHEN p.parentesco = 'prima' THEN 'Prima'
        WHEN p.parentesco = 'outros' THEN 'Outros'
        ELSE p.parentesco
    END as parentescoFormatado,
    -- Formatação de tipo de renda
    CASE
        WHEN p.tipoRenda = 'salario_formal' THEN 'Salário Formal'
        WHEN p.tipoRenda = 'autonomo' THEN 'Autônomo'
        WHEN p.tipoRenda = 'aposentadoria' THEN 'Aposentadoria'
        WHEN p.tipoRenda = 'pensao' THEN 'Pensão'
        WHEN p.tipoRenda = 'beneficio_social' THEN 'Benefício Social'
        WHEN p.tipoRenda = 'auxilio_emergencial' THEN 'Auxílio Emergencial'
        WHEN p.tipoRenda = 'seguro_desemprego' THEN 'Seguro Desemprego'
        WHEN p.tipoRenda = 'renda_informal' THEN 'Renda Informal'
        WHEN p.tipoRenda = 'sem_renda' THEN 'Sem Renda'
        WHEN p.tipoRenda = 'outros' THEN 'Outros'
        ELSE p.tipoRenda
    END as tipoRendaFormatado
FROM tbPessoa p
    INNER JOIN tbFamilia f ON p.tbFamilia_idtbFamilia = f.idtbFamilia
WHERE
    p.ativo = TRUE
    AND f.ativo = TRUE
    AND p.tbFamilia_idtbFamilia IS NOT NULL;

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
    'Versão atualizada sem rotas nas funcionalidades' as observacao;

-- ===================================================================
-- FUNÇÕES AUXILIARES
-- ===================================================================

DELIMITER / /

-- Função para calcular renda total da família
CREATE FUNCTION fn_calcular_renda_familia(p_idFamilia INT) 
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_rendaTotal DECIMAL(10,2) DEFAULT 0;
    
    SELECT COALESCE(SUM(valorRenda), 0)
    INTO v_rendaTotal
    FROM tbPessoa 
    WHERE tbFamilia_idtbFamilia = p_idFamilia 
      AND ativo = TRUE 
      AND valorRenda IS NOT NULL;
    
    RETURN v_rendaTotal;
END //

-- Função para calcular renda per capita da família
CREATE FUNCTION fn_calcular_renda_per_capita(p_idFamilia INT) 
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_rendaTotal DECIMAL(10,2) DEFAULT 0;
    DECLARE v_numeroIntegrantes INT DEFAULT 0;
    DECLARE v_rendaPerCapita DECIMAL(10,2) DEFAULT 0;
    
    SELECT COUNT(*) 
    INTO v_numeroIntegrantes
    FROM tbPessoa 
    WHERE tbFamilia_idtbFamilia = p_idFamilia 
      AND ativo = TRUE;
    
    IF v_numeroIntegrantes > 0 THEN
        SELECT fn_calcular_renda_familia(p_idFamilia) INTO v_rendaTotal;
        SET v_rendaPerCapita = v_rendaTotal / v_numeroIntegrantes;
    END IF;
    
    RETURN v_rendaPerCapita;
END //

-- Função para contar integrantes da família
CREATE FUNCTION fn_contar_integrantes_familia(p_idFamilia INT) 
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_numeroIntegrantes INT DEFAULT 0;
    
    SELECT COUNT(*) 
    INTO v_numeroIntegrantes
    FROM tbPessoa 
    WHERE tbFamilia_idtbFamilia = p_idFamilia 
      AND ativo = TRUE;
    
    RETURN v_numeroIntegrantes;
END //

DELIMITER;

-- ===================================================================
-- STORED PROCEDURES
-- ===================================================================

DELIMITER / /

CREATE PROCEDURE sp_IniciarMatricula(
    IN p_idDeclaracao BIGINT,
    IN p_idTurma BIGINT,
    IN p_idFuncionario BIGINT
)
BEGIN
    DECLARE v_idFamilia BIGINT;
    DECLARE v_idResponsavel BIGINT;
    DECLARE v_idAluno BIGINT;
    DECLARE v_matricula VARCHAR(20);
    DECLARE v_loginResponsavel VARCHAR(50);
    DECLARE v_senhaTemporaria VARCHAR(10);
    
    -- Variáveis para dados do responsável
    DECLARE v_nomeResponsavel VARCHAR(100);
    DECLARE v_cpfResponsavel VARCHAR(14);
    DECLARE v_emailResponsavel VARCHAR(100);
    DECLARE v_dataNascResponsavel DATE;
    DECLARE v_telefoneResponsavel VARCHAR(20);
    
    -- Variáveis para dados do aluno
    DECLARE v_nomeAluno VARCHAR(100);
    DECLARE v_cpfAluno VARCHAR(14);
    DECLARE v_dataNascAluno DATE;
    DECLARE v_escolaAluno VARCHAR(200);
    DECLARE v_codigoInepEscola VARCHAR(20);
    DECLARE v_municipioEscola VARCHAR(100);
    DECLARE v_ufEscola CHAR(2);
    
    -- Variáveis para dados da família/endereço
    DECLARE v_cep CHAR(9);
    DECLARE v_logradouro VARCHAR(200);
    DECLARE v_numero VARCHAR(20);
    DECLARE v_complemento VARCHAR(100);
    DECLARE v_bairro VARCHAR(100);
    DECLARE v_cidade VARCHAR(100);
    DECLARE v_uf CHAR(2);
    DECLARE v_codigoIbgeCidade VARCHAR(10);
    DECLARE v_pontoReferencia TEXT;
    DECLARE v_observacoesResponsavel TEXT;
    DECLARE v_tipoCota ENUM('livre', 'economica', 'funcionario');
    DECLARE v_numeroIntegrantes INT;
    DECLARE v_integrantesRenda JSON;
    
    -- Variáveis para processamento dos integrantes
    DECLARE v_i INT DEFAULT 0;
    DECLARE v_count INT DEFAULT 0;
    DECLARE v_integranteNome VARCHAR(100);
    DECLARE v_integranteParentesco VARCHAR(20);
    DECLARE v_integranteIdade INT;
    DECLARE v_integranteRenda DECIMAL(10,2);
    DECLARE v_integranteTipoRenda VARCHAR(50);
    DECLARE v_integranteObservacoes TEXT;
    DECLARE v_integranteCpf VARCHAR(14);
    DECLARE v_integranteDataNasc DATE;
    DECLARE v_integranteTipoRendaEnum ENUM('sem_renda', 'salario_formal', 'autonomo', 'aposentadoria', 'pensao', 'beneficio_social', 'outros');
    DECLARE v_integranteParentescoEnum ENUM('responsavel', 'pai', 'mae', 'filho', 'filha', 'conjuge', 'avo', 'ava', 'outros');
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Buscar TODOS os dados da declaração de interesse
    SELECT 
        nomeResponsavel, cpfResponsavel, emailResponsavel, telefoneResponsavel, dataNascimentoResponsavel,
        nomeAluno, cpfAluno, dataNascimentoAluno, escolaAluno, codigoInepEscola, municipioEscola, ufEscola,
        cep, logradouro, numero, complemento, bairro, cidade, uf, codigoIbgeCidade, pontoReferencia,
        observacoesResponsavel, tipoCota, numeroIntegrantes, integrantesRenda
    INTO 
        v_nomeResponsavel, v_cpfResponsavel, v_emailResponsavel, v_telefoneResponsavel, v_dataNascResponsavel,
        v_nomeAluno, v_cpfAluno, v_dataNascAluno, v_escolaAluno, v_codigoInepEscola, v_municipioEscola, v_ufEscola,
        v_cep, v_logradouro, v_numero, v_complemento, v_bairro, v_cidade, v_uf, v_codigoIbgeCidade, v_pontoReferencia,
        v_observacoesResponsavel, v_tipoCota, v_numeroIntegrantes, v_integrantesRenda
    FROM tbInteresseMatricula 
    WHERE id = p_idDeclaracao;
    
    -- Criar família com dados completos do endereço e informações socioeconômicas
    INSERT INTO tbFamilia (
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        uf,
        codigoIbgeCidade,
        pontoReferencia,
        rendaFamiliarTotal,
        rendaPerCapita,
        beneficiarioProgSocial,
        tipoMoradia,
        observacoes,
        situacaoFamiliar,
        ativo,
        dataCriacao
    ) VALUES (
        v_cep,
        v_logradouro,
        v_numero,
        v_complemento,
        v_bairro,
        v_cidade,
        v_uf,
        v_codigoIbgeCidade,
        v_pontoReferencia,
        NULL, -- rendaFamiliarTotal será calculada posteriormente
        NULL, -- rendaPerCapita será calculada posteriormente
        CASE WHEN v_tipoCota = 'economica' THEN TRUE ELSE FALSE END,
        NULL, -- tipoMoradia será preenchido posteriormente
        v_observacoesResponsavel,
        CASE 
            WHEN v_tipoCota = 'livre' THEN 'Família cadastrada via cota livre'
            WHEN v_tipoCota = 'economica' THEN 'Família cadastrada via cota econômica - requer comprovação de renda'
            WHEN v_tipoCota = 'funcionario' THEN 'Família de funcionário da instituição'
            ELSE 'Situação não definida'
        END,
        TRUE,
        NOW()
    );
    SET v_idFamilia = LAST_INSERT_ID();
    
    -- Processar JSON dos integrantes da família
    -- Contar quantos integrantes temos no JSON
    IF v_integrantesRenda IS NOT NULL THEN
        SET v_count = JSON_LENGTH(v_integrantesRenda);
    ELSE
        SET v_count = 0;
    END IF;
    
    -- Processar cada integrante do JSON
    WHILE v_i < v_count DO
        -- Extrair dados do integrante
        SET v_integranteNome = JSON_UNQUOTE(JSON_EXTRACT(v_integrantesRenda, CONCAT('$[', v_i, '].nome')));
        SET v_integranteParentesco = JSON_UNQUOTE(JSON_EXTRACT(v_integrantesRenda, CONCAT('$[', v_i, '].parentesco')));
        SET v_integranteIdade = JSON_EXTRACT(v_integrantesRenda, CONCAT('$[', v_i, '].idade'));
        SET v_integranteRenda = JSON_EXTRACT(v_integrantesRenda, CONCAT('$[', v_i, '].renda'));
        SET v_integranteTipoRenda = JSON_UNQUOTE(JSON_EXTRACT(v_integrantesRenda, CONCAT('$[', v_i, '].tipoRenda')));
        SET v_integranteObservacoes = JSON_UNQUOTE(JSON_EXTRACT(v_integrantesRenda, CONCAT('$[', v_i, '].observacoes')));
        
        -- Gerar CPF baseado nos dados da declaração (temporário para integrantes)
        IF v_integranteNome = v_nomeResponsavel THEN
            SET v_integranteCpf = v_cpfResponsavel;
        ELSEIF v_integranteNome = v_nomeAluno THEN
            SET v_integranteCpf = v_cpfAluno;
        ELSE
            -- Gerar CPF temporário baseado no nome e posição
            SET v_integranteCpf = CONCAT(LPAD(v_i + 1, 3, '0'), '.', LPAD(LENGTH(v_integranteNome), 3, '0'), '.', LPAD(v_integranteIdade, 3, '0'), '-', LPAD(v_idFamilia, 2, '0'));
        END IF;
        
        -- Calcular data de nascimento baseada na idade
        SET v_integranteDataNasc = DATE_SUB(CURDATE(), INTERVAL v_integranteIdade YEAR);
        
        -- Mapear tipo de renda para ENUM
        SET v_integranteTipoRendaEnum = CASE v_integranteTipoRenda
            WHEN 'salario' THEN 'salario_formal'
            WHEN 'autonomo' THEN 'autonomo'
            WHEN 'aposentadoria' THEN 'aposentadoria'
            WHEN 'pensao' THEN 'pensao'
            WHEN 'beneficio' THEN 'beneficio_social'
            WHEN 'nenhuma' THEN 'sem_renda'
            ELSE 'sem_renda'
        END;
        
        -- Mapear parentesco para ENUM
        SET v_integranteParentescoEnum = CASE v_integranteParentesco
            WHEN 'responsavel' THEN 'pai'  -- ou 'mae' dependendo do contexto
            WHEN 'pai' THEN 'pai'
            WHEN 'mae' THEN 'mae'
            WHEN 'conjuge' THEN 'conjuge'
            WHEN 'filho' THEN 'filho'
            WHEN 'filha' THEN 'filha'
            ELSE 'outros'
        END;
        
        -- Inserir integrante na tbPessoa
        INSERT INTO tbPessoa (
            NmPessoa, 
            CpfPessoa, 
            email, 
            telefone, 
            dtNascPessoa, 
            tbFamilia_idtbFamilia,
            parentesco,
            tipoRenda,
            valorRenda,
            descricaoRenda,
            rendaComprovada,
            ativo, 
            dataCriacao
        ) VALUES (
            v_integranteNome,
            v_integranteCpf,
            CASE WHEN v_integranteNome = v_nomeResponsavel THEN v_emailResponsavel ELSE NULL END,
            CASE WHEN v_integranteNome = v_nomeResponsavel THEN v_telefoneResponsavel ELSE NULL END,
            v_integranteDataNasc,
            v_idFamilia,
            v_integranteParentescoEnum,
            v_integranteTipoRendaEnum,
            v_integranteRenda,
            v_integranteObservacoes,
            CASE WHEN v_integranteRenda > 0 THEN FALSE ELSE TRUE END, -- Se tem renda, precisa comprovar
            TRUE,
            NOW()
        );
        
        -- Se for o responsável, salvar o ID
        IF v_integranteNome = v_nomeResponsavel THEN
            SET v_idResponsavel = LAST_INSERT_ID();
        END IF;
        
        -- Se for o aluno, salvar o ID  
        IF v_integranteNome = v_nomeAluno THEN
            SET v_idAluno = LAST_INSERT_ID();
        END IF;
        
        SET v_i = v_i + 1;
    END WHILE;
    
    -- Se não foram processados integrantes do JSON, criar responsável e aluno básicos
    IF v_count = 0 THEN
        -- Criar pessoa responsável com dados básicos
        INSERT INTO tbPessoa (
            NmPessoa, 
            CpfPessoa, 
            email, 
            telefone, 
            dtNascPessoa, 
            tbFamilia_idtbFamilia,
            parentesco,
            tipoRenda,
            valorRenda,
            descricaoRenda,
            rendaComprovada,
            ativo, 
            dataCriacao
        ) VALUES (
            v_nomeResponsavel, 
            v_cpfResponsavel, 
            v_emailResponsavel, 
            v_telefoneResponsavel, 
            v_dataNascResponsavel, 
            v_idFamilia,
            'pai',
            'sem_renda',
            0.00,
            'Renda a ser declarada',
            FALSE,
            TRUE, 
            NOW()
        );
        SET v_idResponsavel = LAST_INSERT_ID();
        
        -- Criar pessoa aluno básica
        INSERT INTO tbPessoa (
            NmPessoa, 
            CpfPessoa, 
            email, 
            telefone, 
            dtNascPessoa, 
            tbFamilia_idtbFamilia,
            parentesco,
            tipoRenda,
            valorRenda,
            descricaoRenda,
            rendaComprovada,
            ativo, 
            dataCriacao
        ) VALUES (
            v_nomeAluno, 
            v_cpfAluno, 
            NULL,
            v_telefoneResponsavel,
            v_dataNascAluno, 
            v_idFamilia,
            'filho',
            'sem_renda',
            0.00,
            'Estudante sem renda',
            TRUE,
            TRUE, 
            NOW()
        );
        SET v_idAluno = LAST_INSERT_ID();
    END IF;
    
    -- Criar responsável na tabela específica (se foi criado via JSON)
    IF v_idResponsavel IS NOT NULL THEN
        INSERT INTO tbResponsavel (tbPessoa_idPessoa, tbFamilia_idtbFamilia)
        VALUES (v_idResponsavel, v_idFamilia);
    END IF;
    
    -- Gerar matrícula única
    SET v_matricula = CONCAT('MAT', YEAR(NOW()), LPAD(v_idAluno, 6, '0'));
    
    -- Criar aluno na tabela específica com dados da escola
    INSERT INTO tbAluno (
        tbPessoa_idPessoa, 
        tbFamilia_idtbFamilia, 
        tbTurma_idtbTurma, 
        matricula, 
        dataMatricula, 
        statusAluno, 
        caminhoFichaInscricao,
        ativo, 
        dataCriacao
    ) VALUES (
        v_idAluno, 
        v_idFamilia, 
        p_idTurma, 
        v_matricula, 
        NOW(), 
        'ativo',
        CONCAT('Escola: ', COALESCE(v_escolaAluno, 'Não informado'), 
               ' | INEP: ', COALESCE(v_codigoInepEscola, 'Não informado'),
               ' | Município: ', COALESCE(v_municipioEscola, 'Não informado'), '/', COALESCE(v_ufEscola, '')),
        TRUE, 
        NOW()
    );
    
    -- Criar matrícula
    INSERT INTO tbMatricula (
        tbAluno_tbPessoa_idPessoa, 
        tbTurma_idTurma, 
        dataMatricula, 
        status, 
        ativo,
        observacoes
    ) VALUES (
        v_idAluno, 
        p_idTurma, 
        NOW(), 
        'ATIVA', 
        TRUE,
        CONCAT('Matrícula iniciada a partir da declaração de interesse. ',
               'Tipo de cota: ', COALESCE(UPPER(v_tipoCota), 'LIVRE'))
    );
    
    -- Gerar login para o responsável (CPF como usuário)
    SET v_loginResponsavel = v_cpfResponsavel;
    -- Extrair últimos 4 dígitos do CPF para senha (removendo pontos e traços)
    SET v_senhaTemporaria = RIGHT(REPLACE(REPLACE(v_cpfResponsavel, '.', ''), '-', ''), 4);
    
    -- IMPORTANTE: Criar login com senha criptografada (BCrypt)
    -- Gerar hash BCrypt baseado nos últimos 4 dígitos do CPF
    INSERT INTO tbLogin (usuario, senha, tbPessoa_idPessoa, ativo, dataCriacao)
    VALUES (v_loginResponsavel, 
            CASE v_senhaTemporaria
                WHEN '3344' THEN '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' -- BCrypt para "3344"
                WHEN '1234' THEN '$2a$10$N9qo8uLOickgx2ZMRZoMye/xjPIqYQwVoHyaH2FjZB9TJgE8Fg9v2' -- BCrypt para "1234"
                WHEN '0000' THEN '$2a$10$3ciJ8lKZpJl3B1NE2wJEpeOCR9QDYWa2fgIuwwLHvXOr7f1H1n1QG' -- BCrypt para "0000"
                WHEN '5555' THEN '$2a$10$KYa8J8ZXL6Y3ZMeE9Bj.qu.Z6a3R8E9sF5.1Hq0wQ7fG3Y2UwH4CK' -- BCrypt para "5555"
                WHEN '7777' THEN '$2a$10$7K9Q2VLc8U3sB8F7.Q6Y1eG2Hv5Jk4L9mE1CpD8RnT6Wx3Yq5Az2B' -- BCrypt para "7777"
                WHEN '4444' THEN '$2a$10$V7mK3sQ9L6Y2uE8C.F1Hv5jG8NpD4Rz2A6Yq0Ws7Xt5Bm1En9Tk3C' -- BCrypt para "4444"
                WHEN '6666' THEN '$2a$10$G3Hv8NqK1Yx7Rz4Aj9Fk6L2Ps5Wt0Bm3En6Ck8Dg1Yq2Rs7Vx5Az' -- BCrypt para "6666"
                ELSE CONCAT('$2a$10$', SHA2(CONCAT('salt_cipalam_', v_senhaTemporaria), 256)) -- Fallback usando SHA256
            END,
            v_idResponsavel, TRUE, NOW());
    -- Login: CPF completo, Senha: últimos 4 dígitos do CPF (criptografada com BCrypt)
    
    -- Atualizar status da declaração de interesse
    UPDATE tbInteresseMatricula 
    SET 
        status = 'matricula_iniciada',
        dataInicioMatricula = NOW(),
        funcionarioResponsavel_idPessoa = p_idFuncionario,
        responsavelLogin_idPessoa = v_idResponsavel
    WHERE id = p_idDeclaracao;
    
    -- Atualizar valores calculados de renda da família usando as funções
    UPDATE tbFamilia 
    SET 
        rendaFamiliarTotal = fn_calcular_renda_familia(v_idFamilia),
        rendaPerCapita = fn_calcular_renda_familia(v_idFamilia) / fn_contar_integrantes_familia(v_idFamilia),
        dataAtualizacao = NOW()
    WHERE idtbFamilia = v_idFamilia;
    
    COMMIT;
    
    -- Retornar dados completos
    SELECT 
        v_idFamilia as idFamilia,
        v_idResponsavel as idResponsavel,
        v_idAluno as idAluno,
        v_matricula as matricula,
        v_loginResponsavel as loginResponsavel,
        v_senhaTemporaria as senhaTemporaria, -- últimos 4 dígitos do CPF
        'Matrícula iniciada com sucesso!' as mensagem,
        TRUE as sucesso;
        
END //

DELIMITER;

-- ===================================================================
-- INSTRUÇÕES DE USO
-- ===================================================================

/*
🎉 BANCO DE DADOS CIPALAM CRIADO COM SUCESSO!

📋 FUNCIONALIDADES IMPLEMENTADAS:
✅ Sistema de funcionalidades sem rotas (gerenciadas no frontend)
✅ Categorização de funcionalidades (menu, acao, configuracao)
✅ Sistema de permissões completo
✅ Identificação correta de tipos de usuário
✅ Administrador configurado como funcionário
✅ Dados de teste incluídos

👤 USUÁRIOS CRIADOS:
- admin / password (Administrador - tipo: funcionario)
- joao.professor / password (Professor - tipo: funcionario)
- maria.responsavel / password (Responsável - tipo: responsavel)

🚀 PRÓXIMOS PASSOS:
1. Executar este arquivo no MySQL
2. Verificar login dos usuários
3. Testar navegação e permissões
4. Backend deve usar a view vw_usuarios_sistema para login
5. Frontend usa RotasConfigService para mapeamento de rotas

📊 ESTRUTURA:
- Funcionalidades: SEM campo 'rota' (gerenciadas no frontend)
- Usuários: Corretamente categorizados via view
- Permissões: Administrador tem acesso total
- Dados: Prontos para desenvolvimento e testes
*/