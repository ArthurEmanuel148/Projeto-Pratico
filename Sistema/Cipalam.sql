-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema Cipalam
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema Cipalam
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `Cipalam` DEFAULT CHARACTER SET utf8 ;
USE `Cipalam` ;

-- -----------------------------------------------------
-- Table `Cipalam`.`tbPessoa`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbPessoa` ;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbPessoa` (
  `idPessoa` INT NOT NULL AUTO_INCREMENT,
  `NmPessoa` VARCHAR(100) NOT NULL,
  `CpfPessoa` CHAR(14) NOT NULL,
  `caminhoImagem` VARCHAR(45) NULL,
  `dtNascPessoa` DATE NOT NULL,
  `caminhoIdentidadePessoa` VARCHAR(45) NULL,
  PRIMARY KEY (`idPessoa`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Cipalam`.`tbFamilia`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbFamilia` ;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbFamilia` (
  `idtbFamilia` INT NOT NULL AUTO_INCREMENT,
  `rendaFamiliar` DECIMAL(10,2) NULL,
  `rendaPerCapita` DECIMAL(10,2) NULL,
  `caminhoComprovanteresidencia` VARCHAR(45) NULL,
  `caminhoFichaInscricao` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idtbFamilia`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Cipalam`.`tbResponsavel`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbResponsavel` ;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbResponsavel` (
  `tbFamilia_idtbFamilia` INT NULL,
  `tbPessoa_idPessoa` INT NULL,
  INDEX `fk_tbResponsavel_tbFamilia1_idx` (`tbFamilia_idtbFamilia` ASC) ,
  INDEX `fk_tbResponsavel_tbPessoa1_idx` (`tbPessoa_idPessoa` ASC) ,
  CONSTRAINT `fk_tbResponsavel_tbFamilia1`
    FOREIGN KEY (`tbFamilia_idtbFamilia`)
    REFERENCES `Cipalam`.`tbFamilia` (`idtbFamilia`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_tbResponsavel_tbPessoa1`
    FOREIGN KEY (`tbPessoa_idPessoa`)
    REFERENCES `Cipalam`.`tbPessoa` (`idPessoa`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Cipalam`.`tbDiretor`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbDiretor` ;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbDiretor` (
  `tbPessoa_idPessoa` INT NULL,
  INDEX `fk_tbDiretor_tbPessoa1_idx` (`tbPessoa_idPessoa` ASC) ,
  CONSTRAINT `fk_tbDiretor_tbPessoa1`
    FOREIGN KEY (`tbPessoa_idPessoa`)
    REFERENCES `Cipalam`.`tbPessoa` (`idPessoa`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Cipalam`.`tbProfessor`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbProfessor` ;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbProfessor` (
  `tbPessoa_idPessoa` INT NULL,
  INDEX `fk_tbProfessor_tbPessoa1_idx` (`tbPessoa_idPessoa` ASC) ,
  CONSTRAINT `fk_tbProfessor_tbPessoa1`
    FOREIGN KEY (`tbPessoa_idPessoa`)
    REFERENCES `Cipalam`.`tbPessoa` (`idPessoa`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Cipalam`.`tbEstagiario`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbEstagiario` ;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbEstagiario` (
  `tbPessoa_idPessoa` INT NULL,
  INDEX `fk_tbEstagiario_tbPessoa1_idx` (`tbPessoa_idPessoa` ASC) ,
  CONSTRAINT `fk_tbEstagiario_tbPessoa1`
    FOREIGN KEY (`tbPessoa_idPessoa`)
    REFERENCES `Cipalam`.`tbPessoa` (`idPessoa`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Cipalam`.`tbLivro`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbLivro` ;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbLivro` (
  `idtbLivro` INT NOT NULL AUTO_INCREMENT,
  `nmLivro` VARCHAR(45) NOT NULL,
  `codigoBarras` VARCHAR(45) NOT NULL,
  `caminhoImagem` VARCHAR(45) NULL,
  `numPaginas` INT NOT NULL,
  PRIMARY KEY (`idtbLivro`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Cipalam`.`tbPeca`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbPeca` ;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbPeca` (
  `idtbVestimenta` INT NOT NULL AUTO_INCREMENT,
  `tipoVestimenta` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idtbVestimenta`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Cipalam`.`tbTipoRoupa`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbTipoRoupa` ;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbTipoRoupa` (
  `nmTipoRoupa` VARCHAR(30) NOT NULL,
  `idTipoRoupa` INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`idTipoRoupa`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Cipalam`.`tbRoupa`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbRoupa` ;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbRoupa` (
  `tbVestimenta_idtbVestimenta` INT NOT NULL,
  `tamRoupa` VARCHAR(5) NOT NULL,
  `tbTipoRoupa_idTipoRoupa` INT NOT NULL,
  PRIMARY KEY (`tbVestimenta_idtbVestimenta`),
  INDEX `fk_tbUniforme_tbVestimenta1_idx` (`tbVestimenta_idtbVestimenta` ASC) ,
  INDEX `fk_tbRoupa_tbTipoRoupa1_idx` (`tbTipoRoupa_idTipoRoupa` ASC) ,
  CONSTRAINT `fk_tbUniforme_tbVestimenta1`
    FOREIGN KEY (`tbVestimenta_idtbVestimenta`)
    REFERENCES `Cipalam`.`tbPeca` (`idtbVestimenta`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_tbRoupa_tbTipoRoupa1`
    FOREIGN KEY (`tbTipoRoupa_idTipoRoupa`)
    REFERENCES `Cipalam`.`tbTipoRoupa` (`idTipoRoupa`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Cipalam`.`tbFaixa`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbFaixa` ;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbFaixa` (
  `tbPeca_idtbVestimenta` INT NOT NULL,
  `corFaixa` VARCHAR(15) NOT NULL,
  PRIMARY KEY (`tbPeca_idtbVestimenta`),
  CONSTRAINT `fk_tbFaixa_tbPeca1`
    FOREIGN KEY (`tbPeca_idtbVestimenta`)
    REFERENCES `Cipalam`.`tbPeca` (`idtbVestimenta`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Cipalam`.`tbTurma`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbTurma` ;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbTurma` (
  `idtbTurma` INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`idtbTurma`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Cipalam`.`tbAluno`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbAluno` ;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbAluno` (
  `tbPessoa_idPessoa` INT NOT NULL,
  `tbFamilia_idtbFamilia` INT NULL,
  `tbTurma_idtbTurma` INT NULL,
  `tbPessoa_idPessoa1` INT NULL,
  PRIMARY KEY (`tbPessoa_idPessoa`),
  INDEX `fk_tbAluno_tbFamilia1_idx` (`tbFamilia_idtbFamilia` ASC) ,
  INDEX `fk_tbAluno_tbTurma1_idx` (`tbTurma_idtbTurma` ASC) ,
  INDEX `fk_tbAluno_tbPessoa1_idx` (`tbPessoa_idPessoa1` ASC) ,
  CONSTRAINT `fk_tbAluno_tbFamilia1`
    FOREIGN KEY (`tbFamilia_idtbFamilia`)
    REFERENCES `Cipalam`.`tbFamilia` (`idtbFamilia`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_tbAluno_tbTurma1`
    FOREIGN KEY (`tbTurma_idtbTurma`)
    REFERENCES `Cipalam`.`tbTurma` (`idtbTurma`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_tbAluno_tbPessoa1`
    FOREIGN KEY (`tbPessoa_idPessoa1`)
    REFERENCES `Cipalam`.`tbPessoa` (`idPessoa`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Cipalam`.`tbEmprestimoVestimentas`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbEmprestimoVestimentas` ;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbEmprestimoVestimentas` (
  `idtbEmprestimoVestimentas` INT NOT NULL AUTO_INCREMENT,
  `dtEmprestimo` DATE NOT NULL,
  `dtDevolucao` DATE NULL,
  `tbAluno_tbPessoa_idPessoa` INT NOT NULL,
  PRIMARY KEY (`idtbEmprestimoVestimentas`),
  INDEX `fk_tbEmprestimoVestimentas_tbAluno1_idx` (`tbAluno_tbPessoa_idPessoa` ASC) ,
  CONSTRAINT `fk_tbEmprestimoVestimentas_tbAluno1`
    FOREIGN KEY (`tbAluno_tbPessoa_idPessoa`)
    REFERENCES `Cipalam`.`tbAluno` (`tbPessoa_idPessoa`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Cipalam`.`tbEmprestimoVestimentas_has_tbPeca`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbEmprestimoVestimentas_has_tbPeca` ;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbEmprestimoVestimentas_has_tbPeca` (
  `tbEmprestimoVestimentas_idtbEmprestimoVestimentas` INT NOT NULL,
  `tbPeca_idtbVestimenta` INT NOT NULL,
  PRIMARY KEY (`tbEmprestimoVestimentas_idtbEmprestimoVestimentas`, `tbPeca_idtbVestimenta`),
  INDEX `fk_tbEmprestimoVestimentas_has_tbPeca_tbPeca1_idx` (`tbPeca_idtbVestimenta` ASC) ,
  INDEX `fk_tbEmprestimoVestimentas_has_tbPeca_tbEmprestimoVestiment_idx` (`tbEmprestimoVestimentas_idtbEmprestimoVestimentas` ASC) ,
  CONSTRAINT `fk_tbEmprestimoVestimentas_has_tbPeca_tbEmprestimoVestimentas1`
    FOREIGN KEY (`tbEmprestimoVestimentas_idtbEmprestimoVestimentas`)
    REFERENCES `Cipalam`.`tbEmprestimoVestimentas` (`idtbEmprestimoVestimentas`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_tbEmprestimoVestimentas_has_tbPeca_tbPeca1`
    FOREIGN KEY (`tbPeca_idtbVestimenta`)
    REFERENCES `Cipalam`.`tbPeca` (`idtbVestimenta`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Cipalam`.`tbEmprestimoLivros`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbEmprestimoLivros` ;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbEmprestimoLivros` (
  `idtbEmprestimoVestimentas` INT NOT NULL AUTO_INCREMENT,
  `dtEmprestimo` DATE NOT NULL,
  `dtDevolucao` DATE NULL,
  `tbAluno_tbPessoa_idPessoa` INT NOT NULL,
  `pagInicial` INT NULL,
  `pagFinal` INT NULL,
  `tbLivro_idtbLivro` INT NOT NULL,
  PRIMARY KEY (`idtbEmprestimoVestimentas`),
  INDEX `fk_tbEmprestimoVestimentas_tbAluno1_idx` (`tbAluno_tbPessoa_idPessoa` ASC) ,
  INDEX `fk_tbEmprestimoLivros_tbLivro1_idx` (`tbLivro_idtbLivro` ASC) ,
  CONSTRAINT `fk_tbEmprestimoVestimentas_tbAluno10`
    FOREIGN KEY (`tbAluno_tbPessoa_idPessoa`)
    REFERENCES `Cipalam`.`tbAluno` (`tbPessoa_idPessoa`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_tbEmprestimoLivros_tbLivro1`
    FOREIGN KEY (`tbLivro_idtbLivro`)
    REFERENCES `Cipalam`.`tbLivro` (`idtbLivro`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Cipalam`.`tblogin`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tblogin` ;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tblogin` (
  `idtblogin` INT NOT NULL AUTO_INCREMENT,
  `usuario` VARCHAR(45) NOT NULL,
  `senha` VARCHAR(45) NOT NULL,
  `tbPessoa_idPessoa` INT NULL,
  PRIMARY KEY (`idtblogin`),
  INDEX `fk_tblogin_tbPessoa1_idx` (`tbPessoa_idPessoa` ASC) ,
  CONSTRAINT `fk_tblogin_tbPessoa1`
    FOREIGN KEY (`tbPessoa_idPessoa`)
    REFERENCES `Cipalam`.`tbPessoa` (`idPessoa`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Cipalam`.`tbAula`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbAula` ;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbAula` (
  `idtbAula` INT NOT NULL AUTO_INCREMENT,
  `atvAula` TEXT(150) NOT NULL,
  PRIMARY KEY (`idtbAula`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Cipalam`.`tbAula_has_tbTurma`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbAula_has_tbTurma` ;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbAula_has_tbTurma` (
  `tbAula_idtbAula` INT NOT NULL,
  `tbTurma_idtbTurma` INT NOT NULL,
  PRIMARY KEY (`tbAula_idtbAula`, `tbTurma_idtbTurma`),
  INDEX `fk_tbAula_has_tbTurma_tbTurma1_idx` (`tbTurma_idtbTurma` ASC) ,
  INDEX `fk_tbAula_has_tbTurma_tbAula1_idx` (`tbAula_idtbAula` ASC) ,
  CONSTRAINT `fk_tbAula_has_tbTurma_tbAula1`
    FOREIGN KEY (`tbAula_idtbAula`)
    REFERENCES `Cipalam`.`tbAula` (`idtbAula`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_tbAula_has_tbTurma_tbTurma1`
    FOREIGN KEY (`tbTurma_idtbTurma`)
    REFERENCES `Cipalam`.`tbTurma` (`idtbTurma`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Cipalam`.`tbMotivoAdvertencia`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbMotivoAdvertencia` ;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbMotivoAdvertencia` (
  `idtbMotivoAdvertencia` INT NOT NULL AUTO_INCREMENT,
  `motivo` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idtbMotivoAdvertencia`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Cipalam`.`advertenciaGeral`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`advertenciaGeral` ;

CREATE TABLE IF NOT EXISTS `Cipalam`.`advertenciaGeral` (
  `idadvertenciaGeral` INT NOT NULL AUTO_INCREMENT,
  `caminhoAdvertenciaAssinada` VARCHAR(45) NULL,
  `tbAluno_tbPessoa_idPessoa` INT NOT NULL,
  `tbMotivoAdvertencia_idtbMotivoAdvertencia` INT NOT NULL,
  PRIMARY KEY (`idadvertenciaGeral`),
  INDEX `fk_advertenciaGeral_tbAluno1_idx` (`tbAluno_tbPessoa_idPessoa` ASC) ,
  INDEX `fk_advertenciaGeral_tbMotivoAdvertencia1_idx` (`tbMotivoAdvertencia_idtbMotivoAdvertencia` ASC) ,
  CONSTRAINT `fk_advertenciaGeral_tbAluno1`
    FOREIGN KEY (`tbAluno_tbPessoa_idPessoa`)
    REFERENCES `Cipalam`.`tbAluno` (`tbPessoa_idPessoa`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_advertenciaGeral_tbMotivoAdvertencia1`
    FOREIGN KEY (`tbMotivoAdvertencia_idtbMotivoAdvertencia`)
    REFERENCES `Cipalam`.`tbMotivoAdvertencia` (`idtbMotivoAdvertencia`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Cipalam`.`tbMotivoAdvertencia`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbMotivoAdvertencia` ;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbMotivoAdvertencia` (
  `idtbMotivoAdvertencia` INT NOT NULL AUTO_INCREMENT,
  `motivo` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idtbMotivoAdvertencia`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Cipalam`.`tbAdvertenciaRodaLeitura`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Cipalam`.`tbAdvertenciaRodaLeitura` ;

CREATE TABLE IF NOT EXISTS `Cipalam`.`tbAdvertenciaRodaLeitura` (
  `idtbAdvertenciaRodaLeitura` INT NOT NULL AUTO_INCREMENT,
  `caminhoAdvertenciaAssinada` VARCHAR(45) NULL,
  `motivoAdvertencia` VARCHAR(60) NOT NULL,
  `tbAluno_tbPessoa_idPessoa` INT NOT NULL,
  `tbMotivoAdvertencia_idtbMotivoAdvertencia` INT NOT NULL,
  PRIMARY KEY (`idtbAdvertenciaRodaLeitura`),
  INDEX `fk_tbAdvertenciaRodaLeitura_tbAluno1_idx` (`tbAluno_tbPessoa_idPessoa` ASC) ,
  INDEX `fk_tbAdvertenciaRodaLeitura_tbMotivoAdvertencia1_idx` (`tbMotivoAdvertencia_idtbMotivoAdvertencia` ASC) ,
  CONSTRAINT `fk_tbAdvertenciaRodaLeitura_tbAluno1`
    FOREIGN KEY (`tbAluno_tbPessoa_idPessoa`)
    REFERENCES `Cipalam`.`tbAluno` (`tbPessoa_idPessoa`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_tbAdvertenciaRodaLeitura_tbMotivoAdvertencia1`
    FOREIGN KEY (`tbMotivoAdvertencia_idtbMotivoAdvertencia`)
    REFERENCES `Cipalam`.`tbMotivoAdvertencia` (`idtbMotivoAdvertencia`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
