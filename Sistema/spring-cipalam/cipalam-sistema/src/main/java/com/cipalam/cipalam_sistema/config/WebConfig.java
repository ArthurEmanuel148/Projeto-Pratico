package com.cipalam.cipalam_sistema.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Configurar para servir arquivos da pasta cipalam_documentos
        registry.addResourceHandler("/cipalam_documentos/**")
                .addResourceLocations("file:/Applications/XAMPP/xamppfiles/htdocs/GitHub/Projeto-Pratico/Projeto-Pratico/cipalam_documentos/");
    }
}
