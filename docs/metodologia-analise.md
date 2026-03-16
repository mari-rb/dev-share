# Metodologia de Análise — QoE DevShare

**Artigo:** _Medição Automatizada de QoE com Playwright: Um Estudo Controlado em Plataforma Web com UEQ-S_  
**Evento:** SEMISH/CSBC 2026  
**Data de referência:** 01 de março de 2026

---

## 1. Visão Geral

Este documento descreve os passos metodológicos para coleta, normalização, análise e validação cruzada das métricas de Quality of Experience (QoE) capturadas durante o estudo controlado na plataforma DevShare. O instrumento combina métricas objetivas de interação (coletadas automaticamente por Playwright) com métricas subjetivas (UEQ-S, escala de −3 a +3).

---

## 2. Participantes

**N = 9 participantes reais** (P01–P09). P10 é sintético e usado apenas em análises descritivas, nunca em testes inferenciais.

| ID  | Status                                         |
| --- | ---------------------------------------------- |
| P01 | JSON + formulário ✅                           |
| P02 | JSON + formulário ✅                           |
| P03 | JSON + formulário ✅                           |
| P04 | JSON + formulário ✅                           |
| P05 | JSON + formulário ✅                           |
| P06 | JSON + formulário ✅                           |
| P07 | JSON + formulário ✅                           |
| P08 | JSON + formulário ✅                           |
| P09 | JSON + formulário ✅                           |
| P10 | Sintético — excluído de análise inferencial ⚠️ |

Todos os IDs seguem o padrão `P**` (dois dígitos) tanto nos arquivos JSON quanto no formulário UEQ-S.

---

## 3. Design Experimental dos Fluxos

| Fluxo           | Tipo       | Problemas propositais                                                 |
| --------------- | ---------- | --------------------------------------------------------------------- |
| explorar-salvar | Baseline   | Nenhum — fluxo de controle                                            |
| postar-dica     | Degradado  | Delay de 6s no submit sem feedback + formulário não limpa após envio  |
| criar-perfil    | Degradado  | Botão salvar sem feedback de sucesso (gera dead clicks) + redirect 5s |
| comentar-reagir | Secundário | Sem degradação planejada — dados parciais                             |

---

## 4. Métricas Objetivas

### 4.1 Nível de Sessão (por participante)

| Métrica              | Descrição                                        | Fonte           |
| -------------------- | ------------------------------------------------ | --------------- |
| `session_duration_s` | Duração total da sessão em segundos              | `totalDuration` |
| `dead_clicks_total`  | Total de cliques sem resposta imediata na sessão | `deadClicks`    |
| `long_pauses_total`  | Total de pausas ≥ 10s em todos os fluxos         | `transitions`   |
| `n_flows`            | Número de fluxos executados pelo participante    | `flows`         |
| `num_events`         | Total de eventos capturados na sessão            | `rawEvents`     |

> **Decisão metodológica:** `dead_clicks` é tratado exclusivamente no nível de sessão/participante, pois os `rawEvents` não contêm mapeamento explícito de fluxo por evento do tipo dead click.

### 4.2 Nível de Fluxo

| Métrica                 | Descrição                                     |
| ----------------------- | --------------------------------------------- |
| `flow_duration_s`       | Duração total do fluxo em segundos            |
| `n_transitions`         | Número de transições entre steps              |
| `mean_transition_ms`    | Duração média das transições em milissegundos |
| `long_pauses_count_10s` | Número de pausas ≥ 10s no fluxo               |

### 4.3 Friction Score por Fluxo (0–100)

Score composto de atrito objetivo por fluxo, calculado via normalização min-max:

$$\text{FrictionScore} = (0{,}6 \times z_{\text{duracao}}) + (0{,}4 \times z_{\text{pausas}})$$

onde $z_x = \frac{x - \min}{\max - \min}$ (normalização min-max entre fluxos).

**Pesos aplicados:**

- Duração média (60%) — maior sensibilidade à degradação de tempo na tarefa
- Pausas longas (40%) — indicador de hesitação e confusão

### 4.4 Friction Score por Sessão (0–100)

Score composto de atrito em nível de participante, para cruzamento com UEQ-S:

$$\text{FrictionSession} = (0{,}4 \times z_{\text{deadClicks}}) + (0{,}3 \times z_{\text{pausas}}) + (0{,}3 \times z_{\text{duracao}})$$

---

## 5. Métricas Subjetivas — UEQ-S

O questionário UEQ-S (User Experience Questionnaire – Short) foi aplicado ao final da sessão com 8 itens em escala semântica diferencial de −3 a +3.

### 5.1 Escala Pragmática (usabilidade percebida)

1. obstrutivo / solidário
2. complicado / fácil
3. ineficiente / eficiente
4. confuso / claro

### 5.2 Escala Hedônica (experiência emocional percebida)

1. entediante / empolgante
2. sem interesse / interessante
3. convencional / inventivo
4. comum / inovador

**Score por escala:** média aritmética dos 4 itens correspondentes.

---

## 6. Validação Cruzada — Correlação de Spearman

A hipótese central do estudo é que o **FrictionScore objetivo** (por sessão) correlaciona negativamente com a **escala pragmática do UEQ-S**: quanto maior o atrito objetivo, menor a qualidade pragmática percebida.

$$H_0: \rho_s(\text{FrictionSession}, \text{UEQs-Pragmatico}) = 0$$
$$H_1: \rho_s < 0$$

A Correlação de Spearman ($\rho_s$) é preferida aqui por:

- Amostra pequena (N ≤ 9)
- Não pressupõe normalidade das distribuições
- Robustez a outliers

> **Limitação:** Com N = 9 participantes reais, o p-value calculado é indicativo. A significância estatística formal requer amostras maiores. Os resultados devem ser apresentados como exploratórios, com essa limitação descrita na Seção de Limitações do artigo. P10 (sintético) é excluído da correlação de Spearman.

---

## 7. Passos de Execução

### Pré-requisitos

```bash
# Verificar que os JSONs de todos os participantes existem
ls results/participantes/
# Esperado: P01.json P02.json P03.json P04.json P05.json P06.json P07.json P08.json P09.json P10.json

# Verificar que o CSV do formulário existe
ls results/DevShare*.csv
```

### Passo 1 — Coletar análise individual (opcional, diagnóstico)

```bash
yarn analisar P01   # repetir para P02–P09 conforme necessário
```

### Passo 2 — Executar análise completa (todos os participantes + UEQ-S + Spearman)

```bash
cd <raiz-do-projeto>
python tests/analise_estatistica.py
```

### Passo 3 — Verificar outputs gerados em `results/`

| Arquivo                           | Conteúdo                                               |
| --------------------------------- | ------------------------------------------------------ |
| `participant_session_metrics.csv` | Métricas objetivas por participante (sessão)           |
| `participant_flow_metrics.csv`    | Métricas objetivas por participante por fluxo          |
| `flow_friction_ranking.csv`       | Ranking de atrito agregado por fluxo                   |
| `ueqs_scores.csv`                 | Escores UEQ-S (pragmático e hedônico) por participante |
| `spearman_pairs.csv`              | Pares objetivo-subjetivo + rho de Spearman             |

---

## 8. Resultados Esperados — Estrutura da Seção 4 (SBC)

### 4.1 Tabela de Métricas Objetivas por Fluxo

| Fluxo           | N   | Dur. Média (s) | Desvio | Pausas Longas (média) | Friction Score |
| --------------- | --- | -------------- | ------ | --------------------- | -------------- |
| explorar-salvar | 6   | ...            | ...    | ...                   | ...            |
| postar-dica     | 6   | ...            | ...    | ...                   | ...            |
| criar-perfil    | 6   | ...            | ...    | ...                   | ...            |
| comentar-reagir | 5   | ...            | ...    | ...                   | ...            |

### 4.2 Tabela de Métricas por Participante (Objetivo + Subjetivo)

| ID  | Nome     | Dur. Sessão (s) | Dead Clicks | FrictionSession | UEQs-Prag | UEQs-Hed |
| --- | -------- | --------------- | ----------- | --------------- | --------- | -------- |
| P01 | Andressa | ...             | ...         | ...             | ...       | ...      |
| ... | ...      | ...             | ...         | ...             | ...       | ...      |

### 4.3 Correlação de Spearman

> "A correlação de Spearman entre o FrictionScore objetivo (por sessão) e a escala pragmática do UEQ-S resultou em ρ = **[VALOR]** (p ≈ **[VALOR]**), com n = **[N]** participantes pareados. O resultado [confirma / não confirma, dado o tamanho amostral] a hipótese de que maior atrito objetivo está associado a menor qualidade pragmática percebida."

---

## 9. Decisões Metodológicas Documentadas

| Decisão                                         | Justificativa                                                                                                |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Dead clicks somente por sessão                  | `rawEvents` não mapeiam flow por evento de dead click; atribuição por fluxo seria inferência sem evidência   |
| Limiar de pausa longa = 10s                     | Padrão para indicar hesitação ou confusão em tarefas de navegação web (cf. Nielsen 2001)                     |
| Spearman (vs Pearson)                           | Amostra pequena, sem garantia de normalidade                                                                 |
| Friction Score: 60% duração + 40% pausas        | Peso maior à duração por ser a métrica com maior variância inter-fluxo                                       |
| Exclusão de P10 (sintético) da análise Spearman | Dados fabricados não devem influenciar testes inferenciais; P10 existe apenas para completar N=10 descritivo |

---

**Última atualização:** 01 de março de 2026
