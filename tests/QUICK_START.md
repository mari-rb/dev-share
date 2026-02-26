# Guia Rápido - Coleta de Métricas QoE

## ⚡ Início Rápido

### 0️⃣ Verificar ambiente (primeira vez)

```bash
yarn verificar  # Verifica se tudo está configurado
```

### 1️⃣ Preparar ambiente

```bash
yarn dev  # Terminal 1 - Iniciar aplicação
```

### 2️⃣ Coletar dados

```bash
yarn coletar P01  # Terminal 2 - Iniciar observação
```

- Browser abre automaticamente
- Participante navega normalmente
- Eventos aparecem no terminal em tempo real
- Pressione **ENTER** para encerrar

### 3️⃣ Analisar dados

```bash
yarn analisar P01  # Ver relatório detalhado
```

## 📁 Arquivos Gerados

```
results/
├── videos/
│   └── P01/
│       └── video.webm          # Gravação da sessão
└── participantes/
    └── P01.json                # Métricas completas
```

## 📊 Estrutura do JSON

```json
{
  "participantId": "P01",
  "totalDuration": 120000,      // ms
  "deadClicks": 3,
  "flows": [
    {
      "name": "postar-dica",
      "totalDuration": 45234.56,
      "transitions": [
        {
          "from": "inicio-fluxo",
          "to": "preenchimento-titulo",
          "duration": 234.56    // ms
        }
      ]
    }
  ],
  "rawEvents": [...]
}
```

## 🔌 Configuração de APIs Mockadas

### Comportamento Padrão

- **Rotas gerais** (`/api/*`): ✅ Resposta imediata
- **Fluxo Post** (`POST/PUT /api/tips`): ⏱️ Delay de 6s (matching front-end delay)

### Personalizar Delay

Em `tests/coletar.ts`, linha ~119:

```typescript
await new Promise((resolve) => setTimeout(resolve, 6000)); // Alterar aqui
```

## 🎯 Eventos QoE Capturados

### Fluxo: `postar-dica`

- `inicio-fluxo`
- `preenchimento-titulo`
- `preenchimento-conteudo`
- `formatacao-codigo`
- `clique-submit`
- `confirmacao-postagem`

### Fluxo: `explorar-salvar`

- `inicio-feed`
- `visualizacao-dica`
- `toggle-salvo`
- `inicio-salvos`

### Fluxo: `criar-perfil`

- `inicio-fluxo`
- `preenchimento-nome`
- `preenchimento-bio`
- `preenchimento-area`
- `preenchimento-ferramentas`
- `clique-submit`
- `confirmacao-salvo`

## 🐛 Problemas de Usabilidade Propositais

### Fluxo Post

❌ Botão de submit sem feedback visual por **6 segundos**

- Captura dead clicks durante o delay
- Após confirmação, formulário NÃO limpa os campos
- Usuário fica em dúvida se a postagem foi realmente salva

### Fluxo Saved

❌ **8 itens mockados misturados** aos itens reais

- Ordem embaralhada a cada carregamento
- Sem hierarquia visual (texto corrido sem formatação)
- Sem indicação de data ou ordem de salvamento
- Dificulta identificação e escaneabilidade

### Fluxo Profile

❌ Botão de salvar sem feedback visual por **5 segundos**

- Nenhuma indicação de sucesso (sem toast, sem mensagem)
- Após 5 segundos, redireciona automaticamente
- Captura dead clicks e confusão do usuário

## 📈 Análise Estatística (Opcional)

### Instalar Python via Terminal (Windows)

Escolha uma das opções abaixo:

**Opção 1: winget (Windows 10/11 - Recomendado)**

```powershell
winget install Python.Python.3.12
```

**Opção 2: Chocolatey**

```powershell
# Se ainda não tem Chocolatey, instale primeiro:
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Depois instale Python:
choco install python312 -y
```

**Opção 3: Scoop**

```powershell
# Se ainda não tem Scoop, instale primeiro:
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Depois instale Python:
scoop install python
```

**Após instalar, reinicie o terminal e verifique:**

```bash
python --version
pip --version
```

### Executar análise estatística

```bash
# Instalar dependências Python
pip install pandas matplotlib seaborn

# Executar análise
python tests/analise_estatistica.py
```

Gera:

- 📊 Gráficos de distribuição
- 🔥 Heatmaps de transições
- 📄 CSVs para Excel/R

**Nota:** A análise estatística é opcional. Os dados em JSON podem ser analisados diretamente com `yarn analisar P01`.

## ⚙️ Scripts Disponíveis

| Comando                               | Descrição                                  |
| ------------------------------------- | ------------------------------------------ |
| `yarn verificar`                      | Verifica se o ambiente está configurado    |
| `yarn coletar P01`                    | Inicia observação do participante P01      |
| `yarn analisar P01`                   | Gera relatório de análise do P01           |
| `python tests/analise_estatistica.py` | Análise agregada de todos os participantes |

## 🆘 Troubleshooting

### "Python não foi encontrado" (Aliases do Windows)

Se aparecer mensagem sobre "Microsoft Store" ou "Aliases de execução":

**Solução: Desabilitar aliases do Windows**

1. Pressione `Windows + R`
2. Digite: `ms-settings:appsfeatures-app`
3. Clique em **"Aliases de execução do aplicativo"** (App execution aliases)
4. **Desative** os aliases de `python.exe` e `python3.exe`
5. Reinicie o terminal

**Depois instale via winget:**

```powershell
winget install Python.Python.3.12
```

**Reinicie o terminal e verifique:**

```bash
python --version
pip --version
```

### "Aplicação não está rodando"

```bash
yarn dev  # Certifique-se que está na porta 3000
```

### "chromium not found"

```bash
npx playwright install chromium
```

### Vídeo não foi gerado

- Certifique-se de pressionar ENTER para encerrar corretamente
- O vídeo é salvo apenas quando o contexto fecha

### "pip install" falha

- Verifique se Python está instalado: `python --version`
- Atualize pip: `python -m pip install --upgrade pip`
- Use: `python -m pip install pandas matplotlib seaborn`

## 📞 Suporte

Ver documentação completa: [tests/README.md](README.md)

---

**Desenvolvido para pesquisa acadêmica de QoE**
