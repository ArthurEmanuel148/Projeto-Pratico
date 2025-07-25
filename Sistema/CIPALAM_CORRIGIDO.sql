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
-- Table `Cipalam`.`tbAluno`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbAluno`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbAluno` (
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
    CONSTRAINT `fk_tbAluno_tbPessoa1` FOREIGN KEY (`tbPessoa_idPessoa`) REFERENCES `Cipalam`.`tbPessoa` (`idPessoa`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbAluno_tbFamilia1` FOREIGN KEY (`tbFamilia_idtbFamilia`) REFERENCES `Cipalam`.`tbFamilia` (`idtbFamilia`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbAluno_tbTurma1` FOREIGN KEY (`tbTurma_idtbTurma`) REFERENCES `Cipalam`.`tbTurma` (`idtbTurma`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;

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
-- Table `Cipalam`.`tbFamilia`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbFamilia`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbFamilia` (
    `idtbFamilia` INT NOT NULL AUTO_INCREMENT,
    `rendaFamiliar` DECIMAL(10, 2) NULL,
    `rendaPerCapita` DECIMAL(10, 2) NULL,
    `caminhoComprovanteresidencia` VARCHAR(255) NULL,
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
    `capacidadeMaxima` INT DEFAULT 20,
    PRIMARY KEY (`idtbTurma`)
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
    `icone` VARCHAR(50) NULL,
    `pai` VARCHAR(50) NULL,
    `ativo` BOOLEAN DEFAULT TRUE,
    `ordemExibicao` INT DEFAULT 0,
    `categoria` ENUM(
        'menu',
        'acao',
        'configuracao'
    ) DEFAULT 'menu',
    PRIMARY KEY (`idFuncionalidade`),
    INDEX `idx_chave` (`chave`),
    INDEX `idx_pai` (`pai`),
    INDEX `idx_ativo` (`ativo`),
    INDEX `idx_categoria` (`categoria`)
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

-- -----------------------------------------------------
-- Table `Cipalam`.`tbFuncionario`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbFuncionario`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbFuncionario` (
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
    CONSTRAINT `fk_tbFuncionario_tbPessoa` FOREIGN KEY (`tbPessoa_idPessoa`) REFERENCES `Cipalam`.`tbPessoa` (`idPessoa`) ON DELETE CASCADE ON UPDATE NO ACTION,
    UNIQUE KEY `unique_pessoa_funcionario` (`tbPessoa_idPessoa`)
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
        `icone`,
        `pai`,
        `categoria`,
        `ordemExibicao`
    )
VALUES (
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
        'declaracoesInteresse',
        'Declarações de Interesse',
        'Gerenciar declarações de interesse',
        'document-text-outline',
        'matriculas',
        'acao',
        31
    ),
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
        'declaracaoInteresse',
        'Nova Declaração',
        'Criar nova declaração de interesse',
        'add-circle-outline',
        'matriculas',
        'acao',
        33
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

-- Dando todas as permissões para o administrador
INSERT INTO
    `tbPermissao` (
        `tbPessoa_idPessoa`,
        `tbFuncionalidade_idFuncionalidade`,
        `temPermissao`
    )
SELECT 1, `idFuncionalidade`, TRUE
FROM `tbFuncionalidade`;

-- Inserindo funcionário administrador na tabela tbFuncionario
INSERT INTO
    `tbFuncionario` (
        `tbPessoa_idPessoa`,
        `dataInicio`
    )
VALUES (1, '2023-01-01');

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

-- Inserindo funcionário de teste (apenas João Professor)
INSERT INTO
    `tbFuncionario` (
        `tbPessoa_idPessoa`,
        `dataInicio`
    )
VALUES (2, '2023-01-01');

-- ===================================================================
-- INSERÇÃO DE RESPONSÁVEIS (PAIS/RESPONSÁVEIS)
-- ===================================================================

-- Inserindo família para Maria Responsável
INSERT INTO
    `tbFamilia` (
        `rendaFamiliar`,
        `rendaPerCapita`
    )
VALUES (5000.00, 2500.00);

-- Inserindo Maria como responsável (não funcionário)
INSERT INTO
    `tbResponsavel` (
        `tbFamilia_idtbFamilia`,
        `tbPessoa_idPessoa`
    )
VALUES (1, 3);

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
-- VIEW PARA IDENTIFICAÇÃO DE TIPO DE USUÁRIO NO LOGIN
-- ===================================================================

-- View para identificar o tipo de usuário durante o login
CREATE OR REPLACE VIEW vw_usuarios_sistema AS
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