import { chromium, type Browser, type Page } from "playwright";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

interface QoeEvent {
  flow: string;
  step: string;
  timestamp: number;
}

interface StepTransition {
  from: string;
  to: string;
  timestamp: number;
  duration: number;
}

interface FlowMetrics {
  name: string;
  totalDuration: number;
  transitions: StepTransition[];
}

interface SessionMetrics {
  participantId: string;
  sessionStart: number;
  sessionEnd: number;
  totalDuration: number;
  deadClicks: number;
  flows: FlowMetrics[];
  rawEvents: QoeEvent[];
}

const capturedEvents: QoeEvent[] = [];
let deadClickCount = 0;
const sessionStart = Date.now();

async function main() {
  // Obter ID do participante via argumento
  const participantId = process.argv[2];

  if (!participantId) {
    console.error("❌ Erro: ID do participante não fornecido");
    console.log("Uso: npx tsx tests/coletar.ts <PARTICIPANT_ID>");
    console.log("Exemplo: npx tsx tests/coletar.ts P01");
    process.exit(1);
  }

  console.log(`\n🎬 Iniciando observação para participante: ${participantId}`);
  console.log(`📊 Timestamp de início: ${new Date().toISOString()}`);

  // Criar diretórios se não existirem
  const videosDir = path.join(
    process.cwd(),
    "results",
    "videos",
    participantId,
  );
  const participantesDir = path.join(process.cwd(), "results", "participantes");

  fs.mkdirSync(videosDir, { recursive: true });
  fs.mkdirSync(participantesDir, { recursive: true });

  // Configurar browser com gravação de vídeo
  const browser: Browser = await chromium.launch({
    headless: false,
    args: [
      "--start-maximized",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const context = await browser.newContext({
    recordVideo: {
      dir: videosDir,
      size: { width: 1920, height: 1080 },
    },
    viewport: null, // Usa o tamanho da janela
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const page: Page = await context.newPage();

  console.log("✅ Browser iniciado e maximizado");
  console.log(`📹 Gravação de vídeo ativa em: ${videosDir}`);

  // Expor função para receber eventos do cliente
  await page.exposeFunction("__pushEvento", (event: QoeEvent) => {
    capturedEvents.push(event);
    console.log(
      `📌 Evento capturado: [${event.flow}] ${event.step} @ ${event.timestamp.toFixed(2)}ms`,
    );
  });

  // Injetar script que escuta eventos qoe:step
  await page.addInitScript(() => {
    window.addEventListener("qoe:step", ((event: CustomEvent) => {
      const detail = event.detail;
      // @ts-ignore - a função é exposta via page.exposeFunction
      if (typeof window.__pushEvento === "function") {
        // @ts-ignore
        window.__pushEvento({
          flow: detail.flow,
          step: detail.step,
          timestamp: detail.timestamp,
        });
      }
    }) as EventListener);
  });

  // Mockar todas as chamadas de API
  await page.route("**/api/**", async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    console.log(`🔌 API Mock: ${method} ${url}`);

    // Detectar se é uma rota do fluxo Post (qualquer operação de criar/adicionar dica)
    const isPostFlow =
      url.includes("/api/tips") && (method === "POST" || method === "PUT");

    if (isPostFlow) {
      // Simular latência de 6 segundos para fluxo Post (matching front-end delay)
      console.log(`⏱️  Aplicando delay de 6s para rota do fluxo Post`);
      await new Promise((resolve) => setTimeout(resolve, 6000));
    }

    // Retornar resposta mockada
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: "ok" }),
    });
  });

  // Monitorar requisições falhadas (pode indicar dead clicks ou problemas)
  page.on("requestfailed", (request) => {
    console.log(`❌ Requisição falhou: ${request.method()} ${request.url()}`);
    console.log(`   Motivo: ${request.failure()?.errorText}`);
  });

  // Monitorar erros de console
  page.on("console", (msg) => {
    const type = msg.type();
    if (type === "error" || type === "warning") {
      console.log(`🔍 Console [${type}]: ${msg.text()}`);
    }
  });

  // Monitorar dead clicks (cliques em elementos que não respondem)
  await page.addInitScript(() => {
    let lastClickTime = 0;
    let clickedElement: Element | null = null;

    document.addEventListener(
      "click",
      (e) => {
        const now = Date.now();
        const target = e.target as Element;

        // Se clicou no mesmo elemento em menos de 500ms, pode ser dead click
        if (target === clickedElement && now - lastClickTime < 500) {
          // @ts-ignore
          if (typeof window.__reportDeadClick === "function") {
            // @ts-ignore
            window.__reportDeadClick({
              element: target.tagName,
              timestamp: now,
            });
          }
        }

        lastClickTime = now;
        clickedElement = target;
      },
      true,
    );
  });

  await page.exposeFunction("__reportDeadClick", (data: any) => {
    deadClickCount++;
    console.log(
      `⚠️  Dead click detectado: ${data.element} @ ${new Date(data.timestamp).toISOString()}`,
    );
  });

  // Navegar para a aplicação
  const appUrl = "http://localhost:3000";
  console.log(`🌐 Navegando para: ${appUrl}`);

  try {
    await page.goto(appUrl, { waitUntil: "networkidle", timeout: 10000 });
    console.log("✅ Aplicação carregada com sucesso");
  } catch (error) {
    console.error("❌ Erro ao carregar aplicação:", error);
    console.error(
      "Certifique-se de que a aplicação está rodando em http://localhost:3000",
    );
    await browser.close();
    process.exit(1);
  }

  // Aguardar ENTER para encerrar
  console.log("\n" + "=".repeat(60));
  console.log("🔴 SESSÃO ATIVA - Observando navegação do participante");
  console.log("=".repeat(60));
  console.log("\nPressione ENTER para encerrar a sessão e salvar os dados...");

  await waitForEnter();

  const sessionEnd = Date.now();
  const totalDuration = sessionEnd - sessionStart;

  console.log("\n⏹️  Encerrando sessão...");
  console.log(`⏱️  Duração total: ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`📊 Eventos capturados: ${capturedEvents.length}`);
  console.log(`⚠️  Dead clicks: ${deadClickCount}`);

  // Processar eventos e calcular métricas por fluxo
  const flowMetrics = processFlowMetrics(capturedEvents);

  // Estruturar métricas finais
  const metrics: SessionMetrics = {
    participantId,
    sessionStart,
    sessionEnd,
    totalDuration,
    deadClicks: deadClickCount,
    flows: flowMetrics,
    rawEvents: capturedEvents,
  };

  // Salvar JSON
  const jsonPath = path.join(participantesDir, `${participantId}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(metrics, null, 2), "utf-8");

  console.log(`\n💾 Métricas salvas em: ${jsonPath}`);

  // Fechar browser (isso automaticamente salva o vídeo)
  await context.close();
  await browser.close();

  console.log("✅ Sessão finalizada com sucesso!\n");
}

/**
 * Aguarda o usuário pressionar ENTER
 */
function waitForEnter(): Promise<void> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("", () => {
      rl.close();
      resolve();
    });
  });
}

/**
 * Processa eventos e calcula métricas por fluxo
 */
function processFlowMetrics(events: QoeEvent[]): FlowMetrics[] {
  // Agrupar eventos por fluxo
  const flowGroups: Map<string, QoeEvent[]> = new Map();

  for (const event of events) {
    if (!flowGroups.has(event.flow)) {
      flowGroups.set(event.flow, []);
    }
    flowGroups.get(event.flow)!.push(event);
  }

  // Calcular métricas para cada fluxo
  const metrics: FlowMetrics[] = [];

  for (const [flowName, flowEvents] of flowGroups.entries()) {
    // Ordenar eventos por timestamp
    const sortedEvents = [...flowEvents].sort(
      (a, b) => a.timestamp - b.timestamp,
    );

    if (sortedEvents.length === 0) continue;

    // Calcular transições entre steps
    const transitions: StepTransition[] = [];

    for (let i = 1; i < sortedEvents.length; i++) {
      const prev = sortedEvents[i - 1];
      const curr = sortedEvents[i];

      transitions.push({
        from: prev.step,
        to: curr.step,
        timestamp: curr.timestamp,
        duration: curr.timestamp - prev.timestamp,
      });
    }

    // Duração total do fluxo (do primeiro ao último evento)
    const totalDuration =
      sortedEvents[sortedEvents.length - 1].timestamp -
      sortedEvents[0].timestamp;

    metrics.push({
      name: flowName,
      totalDuration,
      transitions,
    });
  }

  return metrics;
}

// Executar script
main().catch((error) => {
  console.error("\n❌ Erro fatal:", error);
  process.exit(1);
});
