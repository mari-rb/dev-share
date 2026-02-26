# Script de Coleta de Métricas QoE

Este script implementa observação passiva de sessões reais de usuários para estudo de Quality of Experience (QoE).

## 🎯 Funcionalidades

- ✅ Observação não-intrusiva (não simula ações do usuário)
- ✅ Gravação de vídeo da sessão completa
- ✅ Captura de eventos `qoe:step` em tempo real
- ✅ Mock de APIs com latência configurável por fluxo
- ✅ Detecção de dead clicks
- ✅ Métricas estruturadas por fluxo com transições entre steps

## 🚀 Como Usar

### Pré-requisitos

Certifique-se de que a aplicação está rodando:

```bash
yarn dev
```

A aplicação deve estar acessível em `http://localhost:3000`

### Verificar Configuração (Recomendado)

Antes de iniciar a coleta, verifique se tudo está configurado corretamente:

```bash
yarn verificar
```

Este comando irá verificar:

- ✅ Instalação do Chromium
- ✅ Aplicação rodando na porta correta
- ✅ Estrutura de diretórios
- ✅ Captura de eventos QoE

### Workflow Completo

1. **Iniciar a aplicação**:

   ```bash
   yarn dev
   ```

2. **Iniciar a coleta** (em outro terminal):

   ```bash
   yarn coletar P01
   ```

3. **Participante navega na aplicação** normalmente no browser que abriu

4. **Finalizar a sessão**: Pressione ENTER no terminal quando o participante terminar

5. **Analisar os dados**:

   ```bash
   yarn analisar P01
   ```

6. **Resultados disponíveis em**:
   - Vídeo: `results/videos/P01/`
   - Métricas: `results/participantes/P01.json`

### Executar Coleta

```bash
# Método 1: usando o script configurado
yarn coletar P01

# Método 2: usando npx tsx diretamente
npx tsx tests/coletar.ts P01
```

Substitua `P01` pelo ID do participante.

### Analisar Dados Coletados

Após a coleta, você pode analisar as métricas:

```bash
# Método 1: usando o script configurado
yarn analisar P01

# Método 2: usando npx tsx diretamente
npx tsx tests/analisar.ts P01
```

Isso mostrará um relatório detalhado com:

- Duração total da sessão
- Dead clicks detectados
- Análise por fluxo
- Estatísticas de tempo entre steps
- Alertas de usabilidade

**Exemplo de saída:**

```
======================================================================
📊 Análise de Sessão - Participante P01
======================================================================

📋 Informações Gerais:
   Início: 25/02/2026 21:30:00
   Fim: 25/02/2026 21:32:00
   Duração Total: 120.00s
   Dead Clicks: 3
   Eventos Capturados: 10

🔄 Análise por Fluxo:

   📌 POSTAR-DICA
      Duração: 45.23s
      Transições: 4

      Transições detalhadas:
      ├─ inicio-fluxo → preenchimento-titulo
      │  Duração: 234.56ms
      ├─ preenchimento-titulo → preenchimento-conteudo
      │  Duração: 4444.34ms
      ├─ preenchimento-conteudo → clique-submit
      │  Duração: 11111.11ms
      ├─ clique-submit → confirmacao-postagem
      │  Duração: 23012.34ms (incluindo delay proposital de 3s)

⏱️  Estatísticas de Tempo entre Steps:

   postar-dica:
      Média: 9700.59ms
      Mín: 234.56ms
      Máx: 23012.34ms

⚠️  Alertas de Usabilidade:
   ⚠️  3 dead click(s) detectado(s)
   ⚠️  Pausa longa (23.0s) em postar-dica: clique-submit → confirmacao-postagem

======================================================================
✅ Análise concluída!
```

### Durante a Sessão

1. O browser Chromium abrirá maximizado
2. O participante navegará na aplicação normalmente
3. Eventos serão capturados em tempo real (visíveis no terminal)
4. Quando o participante finalizar, pressione **ENTER** no terminal

**Exemplo de saída no terminal:**

```
🎬 Iniciando observação para participante: P01
📊 Timestamp de início: 2026-02-25T21:30:00.000Z
✅ Browser iniciado e maximizado
📹 Gravação de vídeo ativa em: C:\...\results\videos\P01
🌐 Navegando para: http://localhost:3000
✅ Aplicação carregada com sucesso

============================================================
🔴 SESSÃO ATIVA - Observando navegação do participante
============================================================

Pressione ENTER para encerrar a sessão e salvar os dados...
📌 Evento capturado: [postar-dica] inicio-fluxo @ 1234.56ms
📌 Evento capturado: [postar-dica] preenchimento-titulo @ 1469.12ms
🔌 API Mock: GET http://localhost:3000/api/profile
📌 Evento capturado: [postar-dica] preenchimento-conteudo @ 5678.90ms
📌 Evento capturado: [postar-dica] clique-submit @ 23456.78ms
🔌 API Mock: POST http://localhost:3000/api/tips
⏱️  Aplicando delay de 3s para rota do fluxo Post
📌 Evento capturado: [postar-dica] confirmacao-postagem @ 46469.12ms
```

### Após a Sessão

Os dados são salvos automaticamente em:

- **Vídeo**: `results/videos/{participantId}/`
- **Métricas**: `results/participantes/{participantId}.json`

## 📊 Estrutura das Métricas

```json
{
  "participantId": "P01",
  "sessionStart": 1740513120000,
  "sessionEnd": 1740513240000,
  "totalDuration": 120000,
  "deadClicks": 3,
  "flows": [
    {
      "name": "postar-dica",
      "totalDuration": 45000,
      "transitions": [
        {
          "from": "inicio-fluxo",
          "to": "preenchimento-titulo",
          "timestamp": 1234.56,
          "duration": 234.56
        }
      ]
    }
  ],
  "rawEvents": [...]
}
```

## 🔧 Configuração de Latência

O script mocka automaticamente as APIs:

- **Rotas gerais** (`/api/*`): Resposta imediata (0ms)
- **Rotas do fluxo Post** (`POST/PUT /api/tips`): Delay de 3 segundos

Para modificar o delay, edite a linha no `coletar.ts`:

```typescript
await new Promise((resolve) => setTimeout(resolve, 3000)); // 3 segundos
```

## 📝 Eventos Capturados

O script escuta todos os eventos `qoe:step` disparados pela aplicação:

- `postar-dica`: Fluxo de criação de nova dica
- `explorar-salvar`: Fluxo de exploração e salvamento
- Outros fluxos instrumentados na aplicação

## ⚠️ Troubleshooting

### Erro: "Aplicação não está rodando"

Verifique se o Next.js está rodando em `http://localhost:3000`:

```bash
yarn dev
```

### Erro: "chromium not found"

Instale o browser Chromium:

```bash
npx playwright install chromium
```

### Vídeo não foi salvo

O vídeo é salvo apenas quando o contexto é fechado ao pressionar ENTER. Certifique-se de encerrar a sessão corretamente.

## 📂 Estrutura de Arquivos

```
tests/
  └── coletar.ts          # Script principal de coleta
results/
  ├── videos/             # Vídeos das sessões
  │   └── {participantId}/
  └── participantes/      # Métricas em JSON
      └── {participantId}.json
```

## 🔬 Uso Acadêmico

Este script foi desenvolvido para pesquisas de QoE (Quality of Experience). Os problemas de usabilidade propositais inseridos na aplicação são para fins de experimentação controlada.

**Importante**: Sempre obtenha consentimento informado dos participantes e siga as diretrizes éticas de pesquisa da sua instituição.

### Análise Estatística Avançada (Python)

Para análises estatísticas mais avançadas com múltiplos participantes:

**Pré-requisito: Instalar Python (Windows)**

Se você ainda não tem Python instalado:

**Opção 1: Microsoft Store (Recomendado)**

```powershell
# Abra o Microsoft Store e procure por "Python 3.12"
# Ou execute no PowerShell:
winget install Python.Python.3.12
```

**Opção 2: Download direto**

- Baixe de: https://www.python.org/downloads/
- Durante a instalação, marque "Add Python to PATH"
- Reinicie o terminal após a instalação

**Executar análise:**

```bash
# Instalar dependências Python
pip install pandas matplotlib seaborn

# Executar análise
python tests/analise_estatistica.py
```

Isso gerará:

- Gráficos em `results/plots/`:
  - Distribuição de dead clicks
  - Duração de sessão por participante
  - Box plots de duração por fluxo
  - Heatmap de transições entre steps
- Arquivos CSV para análise em Excel/R:
  - `results/general_metrics.csv`
  - `results/flow_metrics.csv`

**Nota:** A análise estatística é opcional. Os dados em JSON podem ser analisados diretamente com `yarn analisar P01`.
