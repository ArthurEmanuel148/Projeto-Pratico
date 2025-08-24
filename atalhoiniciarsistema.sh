#!/bin/bash

# ===================================================================
# SCRIPT DE EXECUÇÃO ÚNICA - CIPALAM HOSPEDAGEM
# Executa o arquivo SQL consolidado completo
# ===================================================================

echo "🚀 CIPALAM - Criação do Banco de Dados para Hospedagem"
echo "=================================================="
echo ""
echo "⚠️  ATENÇÃO: Este script irá RECRIAR completamente o banco!"
echo "   - Apagará o banco 'Cipalam' existente"
echo "   - Criará todas as tabelas do zero"
echo "   - Inserirá todos os dados iniciais"
echo ""

read -p "Deseja continuar? (s/N): " confirma

if [[ $confirma != "s" && $confirma != "S" ]]; then
    echo "❌ Operação cancelada."
    exit 0
fi

echo ""
echo "🔧 Executando criação do banco..."

# Executar o SQL consolidado
/Applications/XAMPP/xamppfiles/bin/mysql -u root < CIPALAM_HOSPEDAGEM_COMPLETO.sql

# Verificar resultado
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCESSO! Banco de dados criado com sucesso!"
    echo ""
    echo "📊 Resumo do que foi criado:"
    echo "   ✅ Schema 'Cipalam' recriado"
    echo "   ✅ 12 tabelas principais"
    echo "   ✅ 2 stored procedures atualizadas"
    echo "   ✅ 3 views úteis"
    echo "   ✅ Dados iniciais inseridos"
    echo ""
    echo "👥 Usuários de teste criados:"
    echo "   🔑 admin / password (Administrador)"
    echo "   🔑 joao.professor / password (Funcionário)"
    echo "   🔑 maria.responsavel / password (Responsável)"
    echo ""
    echo "🎯 Sistema pronto para:"
    echo "   • Desenvolvimento local"
    echo "   • Testes completos"
    echo "   • Deploy em produção"
    echo ""
    echo "📝 Próximo passo: Reinicie o Spring Boot!"
    echo ""
else
    echo ""
    echo "❌ ERRO! Falha na criação do banco de dados."
    echo "   Verifique os logs acima para detalhes."
    exit 1
fi