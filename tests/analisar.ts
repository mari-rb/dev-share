import * as fs from "fs";
import * as path from "path";

/**
 * Script de exemplo para análise dos dados coletados
 * Uso: npx tsx tests/analisar.ts P01
 */

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
  rawEvents: any[];
}

function analyzeSession(participantId: string) {
  const jsonPath = path.join(
    process.cwd(),
    "results",
    "participantes",
    `${participantId}.json`,
  );

  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Arquivo não encontrado: ${jsonPath}`);
    process.exit(1);
  }

  const data: SessionMetrics = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  console.log("\n" + "=".repeat(70));
  console.log(`📊 Análise de Sessão - Participante ${data.participantId}`);
  console.log("=".repeat(70));

  // Informações gerais
  console.log("\n📋 Informações Gerais:");
  console.log(
    `   Início: ${new Date(data.sessionStart).toLocaleString("pt-BR")}`,
  );
  console.log(`   Fim: ${new Date(data.sessionEnd).toLocaleString("pt-BR")}`);
  console.log(`   Duração Total: ${(data.totalDuration / 1000).toFixed(2)}s`);
  console.log(`   Dead Clicks: ${data.deadClicks}`);
  console.log(`   Eventos Capturados: ${data.rawEvents.length}`);

  // Análise por fluxo
  console.log("\n🔄 Análise por Fluxo:");

  for (const flow of data.flows) {
    console.log(`\n   📌 ${flow.name.toUpperCase()}`);
    console.log(`      Duração: ${(flow.totalDuration / 1000).toFixed(2)}s`);
    console.log(`      Transições: ${flow.transitions.length}`);

    if (flow.transitions.length > 0) {
      console.log(`\n      Transições detalhadas:`);

      for (const transition of flow.transitions) {
        console.log(`      ├─ ${transition.from} → ${transition.to}`);
        console.log(`      │  Duração: ${transition.duration.toFixed(2)}ms`);
      }
    }
  }

  // Estatísticas de tempo entre steps
  console.log("\n⏱️  Estatísticas de Tempo entre Steps:");

  for (const flow of data.flows) {
    if (flow.transitions.length === 0) continue;

    const durations = flow.transitions.map((t) => t.duration);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    console.log(`\n   ${flow.name}:`);
    console.log(`      Média: ${avg.toFixed(2)}ms`);
    console.log(`      Mín: ${min.toFixed(2)}ms`);
    console.log(`      Máx: ${max.toFixed(2)}ms`);
  }

  // Identificar possíveis problemas de usabilidade
  console.log("\n⚠️  Alertas de Usabilidade:");

  let hasIssues = false;

  if (data.deadClicks > 0) {
    console.log(`   ⚠️  ${data.deadClicks} dead click(s) detectado(s)`);
    hasIssues = true;
  }

  for (const flow of data.flows) {
    for (const transition of flow.transitions) {
      // Transições muito longas (> 10 segundos) podem indicar confusão
      if (transition.duration > 10000) {
        console.log(
          `   ⚠️  Pausa longa (${(transition.duration / 1000).toFixed(1)}s) em ${flow.name}: ${transition.from} → ${transition.to}`,
        );
        hasIssues = true;
      }
    }
  }

  if (!hasIssues) {
    console.log("   ✅ Nenhum problema detectado");
  }

  console.log("\n" + "=".repeat(70));
  console.log("✅ Análise concluída!\n");
}

// Executar
const participantId = process.argv[2];

if (!participantId) {
  console.error("❌ Erro: ID do participante não fornecido");
  console.log("Uso: npx tsx tests/analisar.ts <PARTICIPANT_ID>");
  console.log("Exemplo: npx tsx tests/analisar.ts P01");
  process.exit(1);
}

analyzeSession(participantId);
