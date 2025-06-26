-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS = @@UNIQUE_CHECKS, UNIQUE_CHECKS = 0;

SET
    @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS,
    FOREIGN_KEY_CHECKS = 0;

SET
    @OLD_SQL_MODE = @@SQL_MODE,
    SQL_MODE = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema Cipalam
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema Cipalam
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `Cipalam` DEFAULT CHARACTER SET utf8;

USE `Cipalam`;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbPessoa`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbPessoa`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbPessoa` (
    `idPessoa` INT NOT NULL AUTO_INCREMENT,
    `NmPessoa` VARCHAR(100) NOT NULL,
    `CpfPessoa` CHAR(14) NOT NULL,
    `caminhoImagem` VARCHAR(45) NULL,
    `dtNascPessoa` DATE NOT NULL,
    `caminhoIdentidadePessoa` VARCHAR(45) NULL,
    PRIMARY KEY (`idPessoa`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbFamilia`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbFamilia`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbFamilia` (
    `idtbFamilia` INT NOT NULL AUTO_INCREMENT,
    `rendaFamiliar` DECIMAL(10, 2) NULL,
    `rendaPerCapita` DECIMAL(10, 2) NULL,
    `caminhoComprovanteresidencia` VARCHAR(45) NULL,
    `caminhoFichaInscricao` VARCHAR(45) NOT NULL,
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
-- Table `Cipalam`.`tbDiretor`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbDiretor`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbDiretor` (
    `tbPessoa_idPessoa` INT NULL,
    INDEX `fk_tbDiretor_tbPessoa1_idx` (`tbPessoa_idPessoa` ASC),
    CONSTRAINT `fk_tbDiretor_tbPessoa1` FOREIGN KEY (`tbPessoa_idPessoa`) REFERENCES `Cipalam`.`tbPessoa` (`idPessoa`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbProfessor`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbProfessor`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbProfessor` (
    `tbPessoa_idPessoa` INT NULL,
    INDEX `fk_tbProfessor_tbPessoa1_idx` (`tbPessoa_idPessoa` ASC),
    CONSTRAINT `fk_tbProfessor_tbPessoa1` FOREIGN KEY (`tbPessoa_idPessoa`) REFERENCES `Cipalam`.`tbPessoa` (`idPessoa`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbEstagiario`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbEstagiario`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbEstagiario` (
    `tbPessoa_idPessoa` INT NULL,
    INDEX `fk_tbEstagiario_tbPessoa1_idx` (`tbPessoa_idPessoa` ASC),
    CONSTRAINT `fk_tbEstagiario_tbPessoa1` FOREIGN KEY (`tbPessoa_idPessoa`) REFERENCES `Cipalam`.`tbPessoa` (`idPessoa`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbLivro`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbLivro`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbLivro` (
    `idtbLivro` INT NOT NULL AUTO_INCREMENT,
    `nmLivro` VARCHAR(45) NOT NULL,
    `codigoBarras` VARCHAR(45) NOT NULL,
    `caminhoImagem` VARCHAR(45) NULL,
    `numPaginas` INT NOT NULL,
    PRIMARY KEY (`idtbLivro`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbPeca`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbPeca`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbPeca` (
    `idtbVestimenta` INT NOT NULL AUTO_INCREMENT,
    `tipoVestimenta` VARCHAR(45) NOT NULL,
    PRIMARY KEY (`idtbVestimenta`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbTipoRoupa`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbTipoRoupa`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbTipoRoupa` (
    `nmTipoRoupa` VARCHAR(30) NOT NULL,
    `idTipoRoupa` INT NOT NULL AUTO_INCREMENT,
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
    PRIMARY KEY (`tbPeca_idtbVestimenta`),
    CONSTRAINT `fk_tbFaixa_tbPeca1` FOREIGN KEY (`tbPeca_idtbVestimenta`) REFERENCES `Cipalam`.`tbPeca` (`idtbVestimenta`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbTurma`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbTurma`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbTurma` (
    `idtbTurma` INT NOT NULL AUTO_INCREMENT,
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
    `tbPessoa_idPessoa1` INT NULL,
    PRIMARY KEY (`tbPessoa_idPessoa`),
    INDEX `fk_tbAluno_tbFamilia1_idx` (`tbFamilia_idtbFamilia` ASC),
    INDEX `fk_tbAluno_tbTurma1_idx` (`tbTurma_idtbTurma` ASC),
    INDEX `fk_tbAluno_tbPessoa1_idx` (`tbPessoa_idPessoa1` ASC),
    CONSTRAINT `fk_tbAluno_tbFamilia1` FOREIGN KEY (`tbFamilia_idtbFamilia`) REFERENCES `Cipalam`.`tbFamilia` (`idtbFamilia`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbAluno_tbTurma1` FOREIGN KEY (`tbTurma_idtbTurma`) REFERENCES `Cipalam`.`tbTurma` (`idtbTurma`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbAluno_tbPessoa1` FOREIGN KEY (`tbPessoa_idPessoa1`) REFERENCES `Cipalam`.`tbPessoa` (`idPessoa`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbEmprestimoVestimentas`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbEmprestimoVestimentas`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbEmprestimoVestimentas` (
    `idtbEmprestimoVestimentas` INT NOT NULL AUTO_INCREMENT,
    `dtEmprestimo` DATE NOT NULL,
    `dtDevolucao` DATE NULL,
    `tbAluno_tbPessoa_idPessoa` INT NOT NULL,
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
-- Table `Cipalam`.`tbEmprestimoLivros`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbEmprestimoLivros`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbEmprestimoLivros` (
    `idtbEmprestimoVestimentas` INT NOT NULL AUTO_INCREMENT,
    `dtEmprestimo` DATE NOT NULL,
    `dtDevolucao` DATE NULL,
    `tbAluno_tbPessoa_idPessoa` INT NOT NULL,
    `pagInicial` INT NULL,
    `pagFinal` INT NULL,
    `tbLivro_idtbLivro` INT NOT NULL,
    PRIMARY KEY (`idtbEmprestimoVestimentas`),
    INDEX `fk_tbEmprestimoVestimentas_tbAluno1_idx` (
        `tbAluno_tbPessoa_idPessoa` ASC
    ),
    INDEX `fk_tbEmprestimoLivros_tbLivro1_idx` (`tbLivro_idtbLivro` ASC),
    CONSTRAINT `fk_tbEmprestimoVestimentas_tbAluno10` FOREIGN KEY (`tbAluno_tbPessoa_idPessoa`) REFERENCES `Cipalam`.`tbAluno` (`tbPessoa_idPessoa`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbEmprestimoLivros_tbLivro1` FOREIGN KEY (`tbLivro_idtbLivro`) REFERENCES `Cipalam`.`tbLivro` (`idtbLivro`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tblogin`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tblogin`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tblogin` (
    `idtblogin` INT NOT NULL AUTO_INCREMENT,
    `usuario` VARCHAR(45) NOT NULL,
    `senha` VARCHAR(45) NOT NULL,
    `tbPessoa_idPessoa` INT NULL,
    PRIMARY KEY (`idtblogin`),
    INDEX `fk_tblogin_tbPessoa1_idx` (`tbPessoa_idPessoa` ASC),
    CONSTRAINT `fk_tblogin_tbPessoa1` FOREIGN KEY (`tbPessoa_idPessoa`) REFERENCES `Cipalam`.`tbPessoa` (`idPessoa`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbAula`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbAula`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbAula` (
    `idtbAula` INT NOT NULL AUTO_INCREMENT,
    `atvAula` TEXT(150) NOT NULL,
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
    `motivo` VARCHAR(45) NOT NULL,
    PRIMARY KEY (`idtbMotivoAdvertencia`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`advertenciaGeral`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`advertenciaGeral`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`advertenciaGeral` (
    `idadvertenciaGeral` INT NOT NULL AUTO_INCREMENT,
    `caminhoAdvertenciaAssinada` VARCHAR(45) NULL,
    `tbAluno_tbPessoa_idPessoa` INT NOT NULL,
    `tbMotivoAdvertencia_idtbMotivoAdvertencia` INT NOT NULL,
    PRIMARY KEY (`idadvertenciaGeral`),
    INDEX `fk_advertenciaGeral_tbAluno1_idx` (
        `tbAluno_tbPessoa_idPessoa` ASC
    ),
    INDEX `fk_advertenciaGeral_tbMotivoAdvertencia1_idx` (
        `tbMotivoAdvertencia_idtbMotivoAdvertencia` ASC
    ),
    CONSTRAINT `fk_advertenciaGeral_tbAluno1` FOREIGN KEY (`tbAluno_tbPessoa_idPessoa`) REFERENCES `Cipalam`.`tbAluno` (`tbPessoa_idPessoa`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `fk_advertenciaGeral_tbMotivoAdvertencia1` FOREIGN KEY (
        `tbMotivoAdvertencia_idtbMotivoAdvertencia`
    ) REFERENCES `Cipalam`.`tbMotivoAdvertencia` (`idtbMotivoAdvertencia`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbMotivoAdvertencia`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbMotivoAdvertencia`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbMotivoAdvertencia` (
    `idtbMotivoAdvertencia` INT NOT NULL AUTO_INCREMENT,
    `motivo` VARCHAR(45) NOT NULL,
    PRIMARY KEY (`idtbMotivoAdvertencia`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbAdvertenciaRodaLeitura`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbAdvertenciaRodaLeitura`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbAdvertenciaRodaLeitura` (
    `idtbAdvertenciaRodaLeitura` INT NOT NULL AUTO_INCREMENT,
    `caminhoAdvertenciaAssinada` VARCHAR(45) NULL,
    `motivoAdvertencia` VARCHAR(60) NOT NULL,
    `tbAluno_tbPessoa_idPessoa` INT NOT NULL,
    `tbMotivoAdvertencia_idtbMotivoAdvertencia` INT NOT NULL,
    PRIMARY KEY (`idtbAdvertenciaRodaLeitura`),
    INDEX `fk_tbAdvertenciaRodaLeitura_tbAluno1_idx` (
        `tbAluno_tbPessoa_idPessoa` ASC
    ),
    INDEX `fk_tbAdvertenciaRodaLeitura_tbMotivoAdvertencia1_idx` (
        `tbMotivoAdvertencia_idtbMotivoAdvertencia` ASC
    ),
    CONSTRAINT `fk_tbAdvertenciaRodaLeitura_tbAluno1` FOREIGN KEY (`tbAluno_tbPessoa_idPessoa`) REFERENCES `Cipalam`.`tbAluno` (`tbPessoa_idPessoa`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `fk_tbAdvertenciaRodaLeitura_tbMotivoAdvertencia1` FOREIGN KEY (
        `tbMotivoAdvertencia_idtbMotivoAdvertencia`
    ) REFERENCES `Cipalam`.`tbMotivoAdvertencia` (`idtbMotivoAdvertencia`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbInteresseMatricula`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbInteresseMatricula`;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbInteresseMatricula` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `protocolo` VARCHAR(50) UNIQUE NOT NULL,
    `nomeCompleto` VARCHAR(100) NOT NULL,
    `cpf` VARCHAR(14) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `telefone` VARCHAR(20) NOT NULL,
    `tipoEscola` VARCHAR(20) NOT NULL,
    `anoLetivo` VARCHAR(10) NOT NULL,
    `serieDesejada` VARCHAR(20) NOT NULL,
    `tipoCota` VARCHAR(30) NOT NULL,
    `dataEnvio` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

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
    PRIMARY KEY (`idFuncionalidade`)
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
    INDEX `fk_tbPermissao_tbPessoa1_idx` (`tbPessoa_idPessoa` ASC),
    INDEX `fk_tbPermissao_tbFuncionalidade1_idx` (
        `tbFuncionalidade_idFuncionalidade` ASC
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
-- Inserindo dados iniciais
-- -----------------------------------------------------

-- Inserindo funcionalidades do sistema
INSERT INTO
    `tbFuncionalidade` (
        `chave`,
        `nomeAmigavel`,
        `descricao`,
        `rota`,
        `icone`,
        `pai`
    )
VALUES (
        'painel',
        'Painel',
        'Painel principal do sistema.',
        '/paineis/painel',
        'home-outline',
        NULL
    ),
    (
        'funcionarios',
        'Funcionários',
        'Menu de funcionários.',
        '',
        'people-outline',
        NULL
    ),
    (
        'cadastroFuncionario',
        'Cadastro de Funcionário',
        'Cadastrar e editar funcionários.',
        '/paineis/gerenciamento-funcionarios/cadastro-funcionario',
        'person-add-outline',
        'funcionarios'
    ),
    (
        'gerenciamentoFuncionarios',
        'Lista de Funcionários',
        'Visualizar e gerenciar funcionários.',
        '/paineis/gerenciamento-funcionarios',
        'list-outline',
        'funcionarios'
    ),
    (
        'matriculas',
        'Matrículas',
        'Menu de matrículas.',
        '',
        'school-outline',
        NULL
    ),
    (
        'declaracoesInteresse',
        'Declarações de Interesse',
        'Gerenciar declarações de interesse.',
        '/paineis/interesse-matricula/lista-declaracoes',
        'document-text-outline',
        'matriculas'
    ),
    (
        'configurarDocumentosCota',
        'Configurar Documentos por Cota',
        'Configurar documentos por cota.',
        '/paineis/interesse-matricula/configuracao-documentos',
        'settings-outline',
        'matriculas'
    ),
    (
        'alunos',
        'Alunos',
        'Menu de alunos.',
        '',
        'people-circle-outline',
        NULL
    ),
    (
        'cadastroAluno',
        'Cadastro de Aluno',
        'Cadastrar novos alunos.',
        '/paineis/alunos/cadastro',
        'person-add-outline',
        'alunos'
    ),
    (
        'listaAlunos',
        'Lista de Alunos',
        'Visualizar e gerenciar alunos.',
        '/paineis/alunos/lista',
        'list-outline',
        'alunos'
    ),
    (
        'advertencias',
        'Advertências',
        'Menu de advertências.',
        '',
        'warning-outline',
        NULL
    ),
    (
        'advertenciasGerais',
        'Advertências Gerais',
        'Gerenciar advertências gerais.',
        '/paineis/advertencias/gerais',
        'alert-outline',
        'advertencias'
    ),
    (
        'advertenciasRodaLeitura',
        'Advertências Roda de Leitura',
        'Gerenciar advertências de roda de leitura.',
        '/paineis/advertencias/roda-leitura',
        'book-outline',
        'advertencias'
    ),
    (
        'biblioteca',
        'Biblioteca',
        'Menu da biblioteca.',
        '',
        'library-outline',
        NULL
    ),
    (
        'emprestimoLivros',
        'Empréstimo de Livros',
        'Gerenciar empréstimos de livros.',
        '/paineis/biblioteca/emprestimos',
        'book-outline',
        'biblioteca'
    ),
    (
        'catalogoLivros',
        'Catálogo de Livros',
        'Gerenciar catálogo de livros.',
        '/paineis/biblioteca/catalogo',
        'library-outline',
        'biblioteca'
    ),
    (
        'uniformes',
        'Uniformes',
        'Menu de uniformes.',
        '',
        'shirt-outline',
        NULL
    ),
    (
        'emprestimoUniformes',
        'Empréstimo de Uniformes',
        'Gerenciar empréstimos de uniformes.',
        '/paineis/uniformes/emprestimos',
        'shirt-outline',
        'uniformes'
    ),
    (
        'estoqueUniformes',
        'Estoque de Uniformes',
        'Gerenciar estoque de uniformes.',
        '/paineis/uniformes/estoque',
        'cube-outline',
        'uniformes'
    ),
    (
        'administracao',
        'Administração',
        'Menu administrativo (apenas administradores).',
        '',
        'shield-outline',
        NULL
    ),
    (
        'usuarios',
        'Gerenciar Usuários',
        'Gerenciar usuários do sistema.',
        '/paineis/administracao/usuarios',
        'people-outline',
        'administracao'
    ),
    (
        'relatorios',
        'Relatórios',
        'Gerar relatórios do sistema.',
        '/paineis/administracao/relatorios',
        'bar-chart-outline',
        'administracao'
    ),
    (
        'configuracoes',
        'Configurações',
        'Configurações do sistema.',
        '/paineis/administracao/configuracoes',
        'settings-outline',
        'administracao'
    ),
    (
        'backup',
        'Backup',
        'Realizar backup do sistema.',
        '/paineis/administracao/backup',
        'cloud-upload-outline',
        'administracao'
    ),
    (
        'logs',
        'Logs do Sistema',
        'Visualizar logs do sistema.',
        '/paineis/administracao/logs',
        'document-text-outline',
        'administracao'
    );

-- Inserindo usuário administrador
INSERT INTO
    `tbPessoa` (
        `NmPessoa`,
        `CpfPessoa`,
        `dtNascPessoa`
    )
VALUES (
        'Administrador do Sistema',
        '000.000.000-00',
        '1990-01-01'
    );

-- Inserindo login do administrador
INSERT INTO
    `tblogin` (
        `usuario`,
        `senha`,
        `tbPessoa_idPessoa`
    )
VALUES ('admin', 'admin123', 1);

-- Inserindo o administrador como professor (para ter acesso completo)
INSERT INTO `tbProfessor` (`tbPessoa_idPessoa`) VALUES (1);

-- Dando todas as permissões para o administrador
INSERT INTO
    `tbPermissao` (
        `tbPessoa_idPessoa`,
        `tbFuncionalidade_idFuncionalidade`,
        `temPermissao`
    )
SELECT 1, `idFuncionalidade`, TRUE
FROM `tbFuncionalidade`;

-- Inserindo dados de teste adicionais
INSERT INTO
    `tbPessoa` (
        `NmPessoa`,
        `CpfPessoa`,
        `dtNascPessoa`
    )
VALUES (
        'João Professor Silva',
        '111.111.111-11',
        '1985-05-15'
    ),
    (
        'Maria Responsável Santos',
        '222.222.222-22',
        '1980-03-20'
    ),
    (
        'Pedro Aluno Costa',
        '333.333.333-33',
        '2010-08-10'
    );

-- Logins para os usuários de teste
INSERT INTO
    `tblogin` (
        `usuario`,
        `senha`,
        `tbPessoa_idPessoa`
    )
VALUES ('joao.professor', '123456', 2),
    (
        'maria.responsavel',
        '123456',
        3
    );

-- Inserindo professor
INSERT INTO `tbProfessor` (`tbPessoa_idPessoa`) VALUES (2);

-- Dando permissões específicas para o professor
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
                chave = 'funcionarios'
        ),
        TRUE
    ),
    (
        2,
        (
            SELECT idFuncionalidade
            FROM tbFuncionalidade
            WHERE
                chave = 'gerenciamentoFuncionarios'
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
    ),
    (
        2,
        (
            SELECT idFuncionalidade
            FROM tbFuncionalidade
            WHERE
                chave = 'alunos'
        ),
        TRUE
    ),
    (
        2,
        (
            SELECT idFuncionalidade
            FROM tbFuncionalidade
            WHERE
                chave = 'listaAlunos'
        ),
        TRUE
    ),
    (
        2,
        (
            SELECT idFuncionalidade
            FROM tbFuncionalidade
            WHERE
                chave = 'advertencias'
        ),
        TRUE
    ),
    (
        2,
        (
            SELECT idFuncionalidade
            FROM tbFuncionalidade
            WHERE
                chave = 'advertenciasGerais'
        ),
        TRUE
    );

-- Inserindo dados de família para teste
INSERT INTO
    `tbFamilia` (
        `rendaFamiliar`,
        `rendaPerCapita`,
        `caminhoFichaInscricao`
    )
VALUES (
        2500.00,
        625.00,
        '/uploads/ficha_familia_1.pdf'
    );

-- Inserindo responsável
INSERT INTO
    `tbResponsavel` (
        `tbFamilia_idtbFamilia`,
        `tbPessoa_idPessoa`
    )
VALUES (1, 3);

-- Inserindo aluno
INSERT INTO
    `tbAluno` (
        `tbPessoa_idPessoa`,
        `tbFamilia_idtbFamilia`
    )
VALUES (4, 1);

-- Dados de exemplo para interesse de matrícula
INSERT INTO
    `tbInteresseMatricula` (
        `protocolo`,
        `nomeCompleto`,
        `cpf`,
        `email`,
        `telefone`,
        `tipoEscola`,
        `anoLetivo`,
        `serieDesejada`,
        `tipoCota`
    )
VALUES (
        'INT-2025001',
        'Ana Silva Santos',
        '444.444.444-44',
        'ana.santos@email.com',
        '(11) 99999-1111',
        'publica',
        '2025',
        '1º ano',
        'geral'
    ),
    (
        'INT-2025002',
        'Carlos Oliveira Lima',
        '555.555.555-55',
        'carlos.lima@email.com',
        '(11) 99999-2222',
        'particular',
        '2025',
        '2º ano',
        'economica'
    ),
    (
        'INT-2025003',
        'Beatriz Costa Ferreira',
        '666.666.666-66',
        'beatriz.ferreira@email.com',
        '(11) 99999-3333',
        'publica',
        '2025',
        '3º ano',
        'pcd'
    );

SET SQL_MODE = @OLD_SQL_MODE;

SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;

SET UNIQUE_CHECKS = @OLD_UNIQUE_CHECKS;