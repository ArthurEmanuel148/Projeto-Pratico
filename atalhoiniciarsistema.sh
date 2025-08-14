#!/bin/bash

# Inicia o MySQL
echo "Iniciando MySQL..."
mysql.server start &

# Aguarda 5 segundos para o MySQL iniciar completamente
sleep 5

# Abre uma nova janela do Terminal para o Spring
osascript -e 'tell application "Terminal" to do script "cd /Applications/XAMPP/xamppfiles/htdocs/GitHub/Projeto-Pratico/Sistema/spring-cipalam/cipalam-sistema && ./mvnw spring-boot:run" in window 1'

# Abre outra nova janela do Terminal para o Ionic
osascript -e 'tell application "Terminal" to do script "cd /Applications/XAMPP/xamppfiles/htdocs/GitHub/Projeto-Pratico/Sistema/Cipalam && ionic serve" in window 1'