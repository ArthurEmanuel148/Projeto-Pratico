package com.cipalam.cipalam_sistema.service;

import com.cipalam.cipalam_sistema.model.InteresseMatricula;
import com.cipalam.cipalam_sistema.model.Pessoa;
import com.cipalam.cipalam_sistema.repository.InteresseMatriculaRepository;
import com.cipalam.cipalam_sistema.repository.PessoaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class InteresseMatriculaService {

    @Autowired
    private InteresseMatriculaRepository interesseMatriculaRepository;

    @Autowired
    private PessoaRepository pessoaRepository;

    public InteresseMatricula criarInteresse(InteresseMatricula interesse) {
        return interesseMatriculaRepository.save(interesse);
    }

    public List<InteresseMatricula> listarTodos() {
        return interesseMatriculaRepository.findAll();
    }

    public Optional<InteresseMatricula> buscarPorId(Integer id) {
        return interesseMatriculaRepository.findById(id);
    }

    public Optional<InteresseMatricula> buscarPorProtocolo(String protocolo) {
        return interesseMatriculaRepository.findByProtocolo(protocolo);
    }

    public void deletar(Integer id) {
        interesseMatriculaRepository.deleteById(id);
    }

    public InteresseMatricula atualizar(Integer id, InteresseMatricula interesseAtualizado) {
        InteresseMatricula interesse = interesseMatriculaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interesse de matrícula não encontrado"));

        // Atualizar campos do responsável
        interesse.setNomeResponsavel(interesseAtualizado.getNomeResponsavel());
        interesse.setCpfResponsavel(interesseAtualizado.getCpfResponsavel());
        interesse.setDataNascimentoResponsavel(interesseAtualizado.getDataNascimentoResponsavel());
        interesse.setTelefoneResponsavel(interesseAtualizado.getTelefoneResponsavel());
        interesse.setEmailResponsavel(interesseAtualizado.getEmailResponsavel());

        // Atualizar campos do aluno
        interesse.setNomeAluno(interesseAtualizado.getNomeAluno());
        interesse.setDataNascimentoAluno(interesseAtualizado.getDataNascimentoAluno());
        interesse.setCpfAluno(interesseAtualizado.getCpfAluno());

        // Atualizar outros campos
        interesse.setTipoCota(interesseAtualizado.getTipoCota());
        interesse.setRendaFamiliar(interesseAtualizado.getRendaFamiliar());
        interesse.setRendaPerCapita(interesseAtualizado.getRendaPerCapita());
        interesse.setNumeroIntegrantes(interesseAtualizado.getNumeroIntegrantes());
        interesse.setEnderecoCompleto(interesseAtualizado.getEnderecoCompleto());
        interesse.setIntegrantesRenda(interesseAtualizado.getIntegrantesRenda());
        interesse.setHorariosSelecionados(interesseAtualizado.getHorariosSelecionados());
        interesse.setMensagemAdicional(interesseAtualizado.getMensagemAdicional());
        interesse.setObservacoes(interesseAtualizado.getObservacoes());

        return interesseMatriculaRepository.save(interesse);
    }

    public Map<String, Object> iniciarMatricula(Integer interesseId, Integer funcionarioId) {
        InteresseMatricula interesse = interesseMatriculaRepository.findById(interesseId)
                .orElseThrow(() -> new RuntimeException("Interesse de matrícula não encontrado"));

        Pessoa funcionario = pessoaRepository.findById(funcionarioId)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado"));

        // Criar pessoa para o responsável se não existir
        Pessoa responsavel = pessoaRepository.findByCpfPessoa(interesse.getCpfResponsavel())
                .orElseGet(() -> {
                    Pessoa novoResponsavel = new Pessoa();
                    novoResponsavel.setNmPessoa(interesse.getNomeResponsavel());
                    novoResponsavel.setCpfPessoa(interesse.getCpfResponsavel());
                    novoResponsavel.setDtNascPessoa(java.sql.Date.valueOf(interesse.getDataNascimentoResponsavel()));
                    return pessoaRepository.save(novoResponsavel);
                });

        // Atualizar interesse (sem criar login aqui - login será criado apenas no
        // MatriculaController)
        interesse.setStatus(InteresseMatricula.StatusInteresse.matricula_iniciada);
        interesse.setDataInicioMatricula(LocalDateTime.now());
        interesse.setFuncionarioResponsavel(funcionario);
        interesse.setResponsavelLogin(responsavel);
        interesseMatriculaRepository.save(interesse);

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("success", true);
        resultado.put("message", "Matrícula iniciada com sucesso!");
        resultado.put("interesse", interesse);

        return resultado;
    }

    public List<InteresseMatricula> buscarPorResponsavel(Integer responsavelId) {
        return interesseMatriculaRepository.findByResponsavelLogin_IdPessoa(responsavelId);
    }
}
