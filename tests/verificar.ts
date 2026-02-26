import { chromium } from "playwright";

/**
 * Script de teste rápido para verificar se o ambiente está configurado corretamente
 * Uso: npx tsx tests/verificar.ts
 */

async function main() {
  console.log("\n🔍 Verificando configuração do ambiente...\n");

  // 1. Verificar se o Chromium está instalado
  console.log("1️⃣  Verificando instalação do Chromium...");
  try {
    const browser = await chromium.launch({ headless: true });
    await browser.close();
    console.log("   ✅ Chromium instalado e funcionando\n");
  } catch (error) {
    console.log("   ❌ Chromium não encontrado");
    console.log("   Execute: npx playwright install chromium\n");
    process.exit(1);
  }

  // 2. Verificar se a aplicação está rodando
  console.log("2️⃣  Verificando se a aplicação está rodando...");
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto("http://localhost:3000", {
      waitUntil: "networkidle",
      timeout: 5000,
    });

    const title = await page.title();
    console.log(`   ✅ Aplicação acessível em http://localhost:3000`);
    console.log(`   📄 Título da página: ${title}\n`);

    await browser.close();
  } catch (error) {
    console.log("   ❌ Aplicação não está rodando em http://localhost:3000");
    console.log("   Execute em outro terminal: yarn dev\n");
    process.exit(1);
  }

  // 3. Verificar estrutura de diretórios
  console.log("3️⃣  Verificando estrutura de diretórios...");
  const fs = await import("fs");
  const path = await import("path");

  const dirs = ["tests", "results/videos", "results/participantes"];

  let allDirsExist = true;
  for (const dir of dirs) {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      console.log(`   ✅ ${dir}`);
    } else {
      console.log(`   ❌ ${dir} não encontrado`);
      allDirsExist = false;
    }
  }

  if (!allDirsExist) {
    console.log(
      "\n   Execute: New-Item -ItemType Directory -Force -Path tests, results\\videos, results\\participantes\n",
    );
    process.exit(1);
  }

  console.log();

  // 4. Verificar eventos QoE
  console.log("4️⃣  Testando captura de eventos QoE...");
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const capturedEvents: any[] = [];

    await page.exposeFunction("__pushEvento", (event: any) => {
      capturedEvents.push(event);
    });

    await page.addInitScript(() => {
      window.addEventListener("qoe:step", ((event: CustomEvent) => {
        // @ts-ignore
        if (typeof window.__pushEvento === "function") {
          // @ts-ignore
          window.__pushEvento(event.detail);
        }
      }) as EventListener);
    });

    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

    // Aguardar um pouco para capturar eventos iniciais
    await page.waitForTimeout(2000);

    if (capturedEvents.length > 0) {
      console.log(`   ✅ ${capturedEvents.length} evento(s) QoE capturado(s)`);
      console.log(
        `   📌 Primeiro evento: [${capturedEvents[0].flow}] ${capturedEvents[0].step}`,
      );
    } else {
      console.log(
        "   ⚠️  Nenhum evento QoE capturado (pode ser normal se a página inicial não dispara eventos)",
      );
    }

    await browser.close();
  } catch (error) {
    console.log("   ❌ Erro ao testar captura de eventos:", error);
    process.exit(1);
  }

  console.log("\n" + "=".repeat(70));
  console.log("✅ AMBIENTE CONFIGURADO CORRETAMENTE!");
  console.log("=".repeat(70));
  console.log("\nVocê pode iniciar a coleta com:");
  console.log("  yarn coletar P01");
  console.log();
}

main().catch((error) => {
  console.error("\n❌ Erro ao verificar ambiente:", error);
  process.exit(1);
});
