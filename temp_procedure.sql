DELIMITER //
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
    
    -- IMPORTANTE: Criar login com senha temporária (PRECISA SER CRIPTOGRAFADA PELO SPRING BOOT)
    -- Esta senha será substituída por um hash BCrypt no primeiro login
    INSERT INTO tbLogin (usuario, senha, tbPessoa_idPessoa, ativo, dataCriacao)
    VALUES (v_loginResponsavel, CONCAT('TEMP_', v_senhaTemporaria), v_idResponsavel, TRUE, NOW());
    -- Login: CPF completo, Senha temporária: TEMP_ + últimos 4 dígitos do CPF
    
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
DELIMITER ;

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