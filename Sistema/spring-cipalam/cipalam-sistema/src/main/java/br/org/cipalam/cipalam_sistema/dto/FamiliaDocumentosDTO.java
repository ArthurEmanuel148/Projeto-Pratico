package br.org.cipalam.cipalam_sistema.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.List;

public class FamiliaDocumentosDTO {

    @JsonProperty("familia")
    private FamiliaInfo familia;

    @JsonProperty("documentosPorPessoa")
    private List<DocumentoPorPessoa> documentosPorPessoa;

    @JsonProperty("resumo")
    private ResumoDocumentos resumo;

    // Construtor
    public FamiliaDocumentosDTO() {
    }

    public FamiliaDocumentosDTO(FamiliaInfo familia, List<DocumentoPorPessoa> documentosPorPessoa,
            ResumoDocumentos resumo) {
        this.familia = familia;
        this.documentosPorPessoa = documentosPorPessoa;
        this.resumo = resumo;
    }

    // Getters e Setters
    public FamiliaInfo getFamilia() {
        return familia;
    }

    public void setFamilia(FamiliaInfo familia) {
        this.familia = familia;
    }

    public List<DocumentoPorPessoa> getDocumentosPorPessoa() {
        return documentosPorPessoa;
    }

    public void setDocumentosPorPessoa(List<DocumentoPorPessoa> documentosPorPessoa) {
        this.documentosPorPessoa = documentosPorPessoa;
    }

    public ResumoDocumentos getResumo() {
        return resumo;
    }

    public void setResumo(ResumoDocumentos resumo) {
        this.resumo = resumo;
    }

    // Classes internas
    public static class FamiliaInfo {
        @JsonProperty("id")
        private Long id;

        @JsonProperty("responsavel")
        private ResponsavelInfo responsavel;

        public FamiliaInfo() {
        }

        public FamiliaInfo(Long id, ResponsavelInfo responsavel) {
            this.id = id;
            this.responsavel = responsavel;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public ResponsavelInfo getResponsavel() {
            return responsavel;
        }

        public void setResponsavel(ResponsavelInfo responsavel) {
            this.responsavel = responsavel;
        }
    }

    public static class ResponsavelInfo {
        @JsonProperty("id")
        private Long id;

        @JsonProperty("nome")
        private String nome;

        @JsonProperty("email")
        private String email;

        public ResponsavelInfo() {
        }

        public ResponsavelInfo(Long id, String nome, String email) {
            this.id = id;
            this.nome = nome;
            this.email = email;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getNome() {
            return nome;
        }

        public void setNome(String nome) {
            this.nome = nome;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

    public static class DocumentoPorPessoa {
        @JsonProperty("pessoa")
        private PessoaInfo pessoa;

        @JsonProperty("documentos")
        private List<DocumentoIndividual> documentos;

        public DocumentoPorPessoa() {
        }

        public DocumentoPorPessoa(PessoaInfo pessoa, List<DocumentoIndividual> documentos) {
            this.pessoa = pessoa;
            this.documentos = documentos;
        }

        public PessoaInfo getPessoa() {
            return pessoa;
        }

        public void setPessoa(PessoaInfo pessoa) {
            this.pessoa = pessoa;
        }

        public List<DocumentoIndividual> getDocumentos() {
            return documentos;
        }

        public void setDocumentos(List<DocumentoIndividual> documentos) {
            this.documentos = documentos;
        }
    }

    public static class PessoaInfo {
        @JsonProperty("id")
        private Long id;

        @JsonProperty("nome")
        private String nome;

        @JsonProperty("parentesco")
        private String parentesco;

        public PessoaInfo() {
        }

        public PessoaInfo(Long id, String nome, String parentesco) {
            this.id = id;
            this.nome = nome;
            this.parentesco = parentesco;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getNome() {
            return nome;
        }

        public void setNome(String nome) {
            this.nome = nome;
        }

        public String getParentesco() {
            return parentesco;
        }

        public void setParentesco(String parentesco) {
            this.parentesco = parentesco;
        }
    }

    public static class DocumentoIndividual {
        @JsonProperty("id")
        private Long id;

        @JsonProperty("idDocumentoMatricula")
        private Long idDocumentoMatricula;

        @JsonProperty("tipoDocumento")
        private TipoDocumento tipoDocumento;

        @JsonProperty("status")
        private String status;

        @JsonProperty("statusDescricao")
        private String statusDescricao;

        @JsonProperty("nomeArquivo")
        private String nomeArquivo;

        @JsonProperty("dataEnvio")
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDateTime dataEnvio;

        @JsonProperty("dataAprovacao")
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDateTime dataAprovacao;

        @JsonProperty("observacoes")
        private String observacoes;

        @JsonProperty("obrigatorio")
        private Boolean obrigatorio;

        public DocumentoIndividual() {
        }

        // Getters e Setters
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Long getIdDocumentoMatricula() {
            return idDocumentoMatricula;
        }

        public void setIdDocumentoMatricula(Long idDocumentoMatricula) {
            this.idDocumentoMatricula = idDocumentoMatricula;
        }

        public TipoDocumento getTipoDocumento() {
            return tipoDocumento;
        }

        public void setTipoDocumento(TipoDocumento tipoDocumento) {
            this.tipoDocumento = tipoDocumento;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getStatusDescricao() {
            return statusDescricao;
        }

        public void setStatusDescricao(String statusDescricao) {
            this.statusDescricao = statusDescricao;
        }

        public String getNomeArquivo() {
            return nomeArquivo;
        }

        public void setNomeArquivo(String nomeArquivo) {
            this.nomeArquivo = nomeArquivo;
        }

        public LocalDateTime getDataEnvio() {
            return dataEnvio;
        }

        public void setDataEnvio(LocalDateTime dataEnvio) {
            this.dataEnvio = dataEnvio;
        }

        public LocalDateTime getDataAprovacao() {
            return dataAprovacao;
        }

        public void setDataAprovacao(LocalDateTime dataAprovacao) {
            this.dataAprovacao = dataAprovacao;
        }

        public String getObservacoes() {
            return observacoes;
        }

        public void setObservacoes(String observacoes) {
            this.observacoes = observacoes;
        }

        public Boolean getObrigatorio() {
            return obrigatorio;
        }

        public void setObrigatorio(Boolean obrigatorio) {
            this.obrigatorio = obrigatorio;
        }
    }

    public static class TipoDocumento {
        @JsonProperty("id")
        private Long id;

        @JsonProperty("nome")
        private String nome;

        @JsonProperty("descricao")
        private String descricao;

        @JsonProperty("categoria")
        private String categoria;

        public TipoDocumento() {
        }

        public TipoDocumento(Long id, String nome, String descricao, String categoria) {
            this.id = id;
            this.nome = nome;
            this.descricao = descricao;
            this.categoria = categoria;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getNome() {
            return nome;
        }

        public void setNome(String nome) {
            this.nome = nome;
        }

        public String getDescricao() {
            return descricao;
        }

        public void setDescricao(String descricao) {
            this.descricao = descricao;
        }

        public String getCategoria() {
            return categoria;
        }

        public void setCategoria(String categoria) {
            this.categoria = categoria;
        }
    }

    public static class ResumoDocumentos {
        @JsonProperty("totalDocumentos")
        private Integer totalDocumentos;

        @JsonProperty("pendentes")
        private Integer pendentes;

        @JsonProperty("anexados")
        private Integer anexados;

        @JsonProperty("aprovados")
        private Integer aprovados;

        @JsonProperty("rejeitados")
        private Integer rejeitados;

        public ResumoDocumentos() {
        }

        public ResumoDocumentos(Integer totalDocumentos, Integer pendentes, Integer anexados, Integer aprovados,
                Integer rejeitados) {
            this.totalDocumentos = totalDocumentos;
            this.pendentes = pendentes;
            this.anexados = anexados;
            this.aprovados = aprovados;
            this.rejeitados = rejeitados;
        }

        public Integer getTotalDocumentos() {
            return totalDocumentos;
        }

        public void setTotalDocumentos(Integer totalDocumentos) {
            this.totalDocumentos = totalDocumentos;
        }

        public Integer getPendentes() {
            return pendentes;
        }

        public void setPendentes(Integer pendentes) {
            this.pendentes = pendentes;
        }

        public Integer getAnexados() {
            return anexados;
        }

        public void setAnexados(Integer anexados) {
            this.anexados = anexados;
        }

        public Integer getAprovados() {
            return aprovados;
        }

        public void setAprovados(Integer aprovados) {
            this.aprovados = aprovados;
        }

        public Integer getRejeitados() {
            return rejeitados;
        }

        public void setRejeitados(Integer rejeitados) {
            this.rejeitados = rejeitados;
        }
    }
}
