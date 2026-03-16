# ============================================================
# build-overleaf-zip.ps1
# Monta o pacote ZIP pronto para importar no Overleaf.
#
# Estrutura gerada dentro do ZIP:
#   artigo.tex
#   sbc-template.sty
#   sbc.bst
#   plots/
#     flow_duration_boxplot.png
#     qualitative_themes_bar.png
#     dead_clicks_by_participant.png
#     ueqs_scatter.png
#
# Uso: Execute a partir da pasta  docs/
#   cd docs
#   .\build-overleaf-zip.ps1
# ============================================================

$ErrorActionPreference = "Stop"

$ScriptDir  = $PSScriptRoot
$RepoRoot   = Split-Path $ScriptDir -Parent
$TempDir    = Join-Path $env:TEMP "overleaf-build-$(Get-Random)"
$ZipOut     = Join-Path $ScriptDir "artigo-overleaf.zip"

# ---- Arquivos de origem ----
$TexFile    = Join-Path $ScriptDir "artigo.tex"
$StyFile    = Join-Path $ScriptDir "template-latex\sbc-template.sty"
$BstFile    = Join-Path $ScriptDir "template-latex\sbc.bst"
$PlotsDir   = Join-Path $RepoRoot  "results\plots"

$Plots = @(
    "flow_duration_boxplot.png",
    "qualitative_themes_bar.png",
    "dead_clicks_by_participant.png",
    "ueqs_scatter.png"
)

Write-Host "`n=== Verificando arquivos de origem ===" -ForegroundColor Cyan
foreach ($f in @($TexFile, $StyFile, $BstFile)) {
    if (-not (Test-Path $f)) { Write-Error "Não encontrado: $f" }
    else { Write-Host "  [ok] $f" }
}
foreach ($p in $Plots) {
    $full = Join-Path $PlotsDir $p
    if (-not (Test-Path $full)) { Write-Error "Plot não encontrado: $full" }
    else { Write-Host "  [ok] $full" }
}

# ---- Montar estrutura temporária ----
Write-Host "`n=== Montando estrutura temporária ===" -ForegroundColor Cyan
New-Item -ItemType Directory -Path $TempDir | Out-Null
New-Item -ItemType Directory -Path (Join-Path $TempDir "plots") | Out-Null

Copy-Item $TexFile  (Join-Path $TempDir "artigo.tex")
Copy-Item $StyFile  (Join-Path $TempDir "sbc-template.sty")
Copy-Item $BstFile  (Join-Path $TempDir "sbc.bst")

foreach ($p in $Plots) {
    Copy-Item (Join-Path $PlotsDir $p) (Join-Path $TempDir "plots\$p")
}
Write-Host "  Arquivos copiados para $TempDir"

# ---- Gerar ZIP ----
Write-Host "`n=== Gerando ZIP ===" -ForegroundColor Cyan
if (Test-Path $ZipOut) { Remove-Item $ZipOut }
Compress-Archive -Path "$TempDir\*" -DestinationPath $ZipOut
Remove-Item -Recurse -Force $TempDir

Write-Host "`n[PRONTO] ZIP gerado em:" -ForegroundColor Green
Write-Host "  $ZipOut" -ForegroundColor Green
Write-Host ""
Write-Host "PRÓXIMOS PASSOS NO OVERLEAF:" -ForegroundColor Yellow
Write-Host "  1. Acesse overleaf.com > New Project > Upload Project"
Write-Host "  2. Faca upload do arquivo: artigo-overleaf.zip"
Write-Host "  3. No painel esquerdo, defina 'artigo.tex' como Main Document"
Write-Host "     (Menu > Settings > Main Document > artigo.tex)"
Write-Host "  4. Clique em Recompile. O compilador padrão (pdfLaTeX) deve funcionar."
Write-Host "  5. Substitua [URL_ANONIMA] e [URL_VERCEL] no artigo.tex."
