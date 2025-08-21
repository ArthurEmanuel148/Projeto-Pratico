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
-- Table `Cipalam`.`tbFamilia` (SIMPLIFICADA - SEM CAMPOS DE RENDA)
-- -----------------------------------------------------
CREATE TABLE `tbFamilia` (
    `idtbFamilia` INT NOT NULL AUTO_INCREMENT,
    `caminhoComprovanteresidencia` VARCHAR(255) NULL,
    `observacoes` TEXT NULL,
    `dataCriacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`idtbFamilia`)
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
    PRIMARY KEY (`tbPessoa_idPessoa`),
    INDEX `fk_tbAluno_tbFamilia1_idx` (`tbFamilia_idtbFamilia` ASC),
    INDEX `fk_tbAluno_tbTurma1_idx` (`tbTurma_idtbTurma` ASC),
    CONSTRAINT `fk_tbAluno_tbPessoa1` FOREIGN KEY (`tbPessoa_idPessoa`) REFERENCES `tbPessoa` (`idPessoa`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbAluno_tbFamilia1` FOREIGN KEY (`tbFamilia_idtbFamilia`) REFERENCES `tbFamilia` (`idtbFamilia`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbAluno_tbTurma1` FOREIGN KEY (`tbTurma_idtbTurma`) REFERENCES `tbTurma` (`idtbTurma`) ON DELETE NO ACTION ON UPDATE NO ACTION
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