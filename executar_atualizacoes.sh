#!/bin/bash

# ============================================================================
# SCRIPT DE EXECUÇÃO RÁPIDA - CIPALAM ATUALIZAÇÕES
# ============================================================================

echo "🚀 Iniciando aplicação das atualizações do CIPALAM..."
echo "📅 Data: $(date)"
echo ""

# Verificar se o MySQL está rodando
if ! pgrep -x "mysqld" > /dev/null; then
    echo "❌ Erro: MySQL não está rodando!"
    echo "   Inicie o XAMPP ou MySQL antes de continuar."
    exit 1
fi

echo "✅ MySQL está rodando"

# Executar o script consolidado
echo "📋 Executando script consolidado..."
/Applications/XAMPP/xamppfiles/bin/mysql -u root Cipalam < CIPALAM_ATUALIZACOES_CONSOLIDADAS.sql

# Verificar se houve erro
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCESSO! Todas as atualizações foram aplicadas."
    echo ""
    echo "📊 Resumo das alterações aplicadas:"
    echo "   ✅ Funcionalidade 'Tipos de Documento' inserida"
    echo "   ✅ Procedure 'sp_IniciarMatricula' atualizada"
    echo "   ✅ Procedure 'sp_CriarDocumentosPendentes' atualizada"
    echo ""
    echo "🔧 O que foi corrigido:"
    echo "   • Sistema de configuração de documentos por cota funcionando"
    echo "   • Criação automática de documentos usando configurações personalizadas"
    echo "   • Geração de senha temporária para responsáveis"
    echo "   • Integração completa entre declaração → matrícula → documentos"
    echo ""
    echo "📝 Próximos passos:"
    echo "   1. Reinicie o servidor Spring Boot"
    echo "   2. Teste a funcionalidade de configuração de documentos"
    echo "   3. Teste o processo completo de matrícula"
    echo ""
else
    echo ""
    echo "❌ ERRO! Houve problema na execução do script."
    echo "   Verifique os logs acima para mais detalhes."
    echo ""
    exit 1
fi
