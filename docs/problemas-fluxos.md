# 🐛 Problemas de Usabilidade Propositais por Fluxo

## 📊 Visão Geral

Este documento lista os problemas de usabilidade **propositalmente implementados** na plataforma QoE para coletar métricas reais sobre o impacto na experiência do usuário.

---

## 📝 Fluxo: POSTAR-DICA

### Problemas Identificados

| Problema | Descrição | Impacto QoE |
|----------|-----------|-----------|
| ❌ **Sem feedback visual (6s)** | Botão de submit não responde por 6 segundos | Captura *dead clicks* e frustração |
| ❌ **Campos não limpam** | Após confirmação, formulário mantém dados preenchidos | Usuário fica em dúvida se postou |
| ❌ **Confusão pós-submit** | Sem mensagem de sucesso ou redirecionamento claro | Incerteza sobre confirmação da ação |

### Objetivo
Medir impacto de feedback atrasado e falta de confirmação visual na taxa de erros do usuário.

---

## 💾 Fluxo: EXPLORAR-SALVAR

### Problemas Identificados

| Problema | Descrição | Impacto QoE |
|----------|-----------|-----------|
| ❌ **Itens mockados misturados** | 8 itens falsos embaralhados com itens reais | Confunde navegação e tarefas de busca |
| ❌ **Ordem aleatória** | Ordem é embaralhada a cada carregamento | Sem previsibilidade, reduz confiança |
| ❌ **Sem hierarquia visual** | Texto corrido, sem formatação distinção | Dificulta leitura e escaneabilidade |
| ❌ **Sem metadados** | Sem data ou indicação de ordem de salvamento | Usuário não sabe quando foi salvo |

### Objetivo
Medir impacto de conteúdo fake, inconsistência de ordem e falta de contexto informacional.

---

## 👤 Fluxo: CRIAR-PERFIL

### Problemas Identificados

| Problema | Descrição | Impacto QoE |
|----------|-----------|---------|
| ❌ **Sem feedback visual (5s)** | Botão de salvar não responde por 5 segundos | Captura *dead clicks* |
| ❌ **Sem indicação de sucesso** | Nenhum toast, mensagem ou feedback visual | Usuário não sabe se salvou com sucesso |
| ❌ **Redirecionamento automático** | Após 5 segundos, redireciona automaticamente | Gera confusão e sensação de falta de controle |

### Objetivo
Medir impacto de feedback atrasado e redirecionamento automático na satisfação do usuário.

---

## 📊 Resumo Comparativo

### Tabela de Impacto por Critério QoE

| Fluxo | Dead Clicks | Feedback Visual | Clareza | Escaneabilidade | Controle |
|-------|-----------|-----------------|----------|-----------------|----------|
| **Postar-Dica** | ✅ Capturado (6s) | ❌ Nenhum | ❌ Confuso | ✅ OK | ❌ Baixo |
| **Explorar-Salvar** | ❌ N/A | ✅ OK | ❌ Confuso | ❌ Ruim | ✅ OK |
| **Criar-Perfil** | ✅ Capturado (5s) | ❌ Nenhum | ❌ Confuso | ✅ OK | ❌ Baixo |

---

## 🎯 Métricas Coletadas

Cada problema foi projetado para capturar:

- **Dead Clicks**: Cliques em elementos sem resposta imediata
- **Erro de Usuário**: Tentativas repetidas por falta de feedback
- **Tempo na Tarefa**: Aumento de tempo devido a confusão
- **Taxa de Abandono**: Desistência da tarefa por frustração
- **Satisfação Subjetiva**: Post-task SUS score

---

## 📋 Configuração de Fluxos

Cada fluxo deve ser testado pelo participante em ordem definida para evitar aprendizado cruzado:

1. **Fluxo 1**: POSTAR-DICA
2. **Fluxo 2**: EXPLORAR-SALVAR  
3. **Fluxo 3**: CRIAR-PERFIL

---

## 🔄 Coleta de Dados

Os problemas são coletados automaticamente via:
- **Eventos de Click**: Rastreados em `qoe.ts`
- **Timestamps**: Registrados em `results/participantes/[ID].json`
- **Análise**: Processada em `tests/analise_estatistica.py`

---

**Última atualização**: 27 de fevereiro de 2026
