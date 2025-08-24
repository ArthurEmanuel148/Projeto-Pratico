-- Inserir nova funcionalidade tiposDocumento
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
        'tiposDocumento',
        'Tipos de Documento',
        'Gerenciar tipos de documentos do sistema',
        'document-outline',
        'matriculas',
        'configuracao',
        34
    )
ON DUPLICATE KEY UPDATE
    nomeAmigavel = 'Tipos de Documento',
    descricao = 'Gerenciar tipos de documentos do sistema',
    icone = 'document-outline',
    categoria = 'matriculas',
    tipo = 'configuracao',
    ordemExibicao = 34;