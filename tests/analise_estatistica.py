#!/usr/bin/env python3
"""
Análise Estatística — QoE DevShare
SEMISH/CSBC 2026 — "Medição Automatizada de QoE com Playwright"

Metodologia:
  - Métricas objetivas: duração por fluxo + pausas longas (por fluxo),
    dead clicks (por sessão)
  - Métricas subjetivas: UEQ-S (escala pragmática e hedônica, -3 a +3)
  - Validação cruzada: Correlação de Spearman entre score de atrito
    objetivo e qualidade pragmática UEQ-S

Uso:
    python tests/analise_estatistica.py

Dependências (stdlib apenas — sem pandas/matplotlib obrigatórios):
    nenhuma instalação extra necessária para exportação CSV e Spearman
"""

import csv
import json
import glob
import math
from pathlib import Path
from statistics import mean, stdev

# ---------------------------------------------------------------------------
# Mapeamento canônico: ID no formulário → ID do participante
# O CSV do formulário já usa o padrão P01–P10 desde 01/03/2026.
# Este mapa garante lookup case-insensitive (p01 → P01).
# ---------------------------------------------------------------------------
PARTICIPANT_MAP: dict[str, str] = {
    f"p{i:02d}": f"P{i:02d}" for i in range(1, 11)
}

# Flag para identificar participantes sintéticos na análise
SYNTHETIC_IDS: set[str] = {"P10"}

LONG_PAUSE_MS  = 10_000   # limiar de pausa longa: 10 s
UEQS_CSV_GLOB  = "results/DevShare*.csv"
RESULTS_DIR    = Path("results")


# ---------------------------------------------------------------------------
# 1. CARREGAMENTO
# ---------------------------------------------------------------------------

def load_sessions() -> list[dict]:
    """Carrega todos os JSONs de resultados/participantes/."""
    sessions = []
    for path in sorted(glob.glob("results/participantes/*.json")):
        with open(path, encoding="utf-8") as f:
            sessions.append(json.load(f))
    return sessions


def _parse_score(value: str) -> float | None:
    """Converte strings como '+2', '-1', '0' para float. Retorna None se inválido."""
    v = str(value).strip().replace("\u200b", "")
    try:
        return float(v)
    except ValueError:
        return None


def load_ueqs() -> dict[str, dict]:
    """
    Lê o CSV do formulário UEQ-S e retorna dict:
      { participant_id: { 'pragmatic': float, 'hedonic': float,
                          'raw_p': list, 'raw_h': list,
                          'area': str, 'experiencia': str,
                          'comentarios': dict } }
    """
    files = glob.glob(UEQS_CSV_GLOB)
    if not files:
        print("[AVISO] CSV UEQ-S não encontrado. Spearman será ignorado.")
        return {}

    result: dict[str, dict] = {}
    with open(files[0], encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            raw_id = row.get("ID do Participante", "").strip()
            pid = PARTICIPANT_MAP.get(raw_id.lower())
            if not pid:
                print(f"  [AVISO] ID de formulário não mapeado: '{raw_id}' — ignorado")
                continue

            # Colunas UEQ-S pragmáticas (índices 5–8) e hedônicas (9–12)
            cols = list(row.keys())
            pragmatic_cols = [c for c in cols if "Pragmática" in c or "Pragm" in c]
            hedonic_cols   = [c for c in cols if "Hedônica"  in c or "Hed"   in c]

            raw_p = [_parse_score(row[c]) for c in pragmatic_cols]
            raw_h = [_parse_score(row[c]) for c in hedonic_cols]

            valid_p = [x for x in raw_p if x is not None]
            valid_h = [x for x in raw_h if x is not None]

            if not valid_p or not valid_h:
                print(f"  [AVISO] Scores UEQ-S inválidos para '{raw_id}' — ignorado")
                continue

            result[pid] = {
                "pid":         pid,
                "area":        row.get("Área de Atuação", "").strip(),
                "experiencia": row.get("Anos de Experiência em Tech", "").strip(),
                "pragmatic":   round(mean(valid_p), 4),
                "hedonic":     round(mean(valid_h), 4),
                "raw_p":       valid_p,
                "raw_h":       valid_h,
                "q_confusao":  row.get("1. Houve algum momento em que você ficou confuso ou frustrado ao usar a plataforma? Se sim, descreva o que aconteceu.", "").strip(),
                "q_comportamento": row.get("2. Alguma funcionalidade não se comportou como você esperava? Qual?", "").strip(),
                "q_melhoria":  row.get("3. O que você mudaria na plataforma para melhorar sua experiência?", "").strip(),
            }
    return result


# ---------------------------------------------------------------------------
# 2. MÉTRICAS OBJETIVAS
# ---------------------------------------------------------------------------

def compute_session_metrics(sessions: list[dict]) -> list[dict]:
    """Retorna métricas objetivas em nível de sessão/participante."""
    rows = []
    for s in sessions:
        pid = s["participantId"]
        flows = s.get("flows", [])
        long_total = sum(
            sum(1 for t in flow.get("transitions", []) if t.get("duration", 0) >= LONG_PAUSE_MS)
            for flow in flows
        )
        rows.append({
            "participant_id":      pid,
            "session_duration_s":  round(s.get("totalDuration", 0) / 1000, 3),
            "dead_clicks_total":   int(s.get("deadClicks", 0)),
            "n_flows":             len(flows),
            "long_pauses_total":   long_total,
            "num_events":          len(s.get("rawEvents", [])),
        })
    return rows


def compute_flow_metrics(sessions: list[dict]) -> list[dict]:
    """Retorna métricas por fluxo (duração + pausas longas apenas)."""
    rows = []
    for s in sessions:
        pid = s["participantId"]
        for flow in s.get("flows", []):
            transitions = flow.get("transitions", [])
            durations   = [max(0.0, float(t.get("duration", 0))) for t in transitions]
            long_pauses = sum(1 for d in durations if d >= LONG_PAUSE_MS)
            rows.append({
                "participant_id":       pid,
                "flow":                 flow.get("name", "unknown"),
                "flow_duration_s":      round(float(flow.get("totalDuration", 0)) / 1000, 3),
                "n_transitions":        len(transitions),
                "mean_transition_ms":   round(mean(durations), 3) if durations else 0.0,
                "long_pauses_count_10s": long_pauses,
            })
    return rows


def compute_flow_aggregate(flow_rows: list[dict]) -> list[dict]:
    """Agrega métricas por fluxo + calcula friction score (duração + pausas)."""
    by_flow: dict[str, dict] = {}
    for r in flow_rows:
        f = r["flow"]
        by_flow.setdefault(f, {"dur": [], "long": [], "pids": set()})
        by_flow[f]["dur"].append(r["flow_duration_s"])
        by_flow[f]["long"].append(r["long_pauses_count_10s"])
        by_flow[f]["pids"].add(r["participant_id"])

    rows = []
    for f, info in by_flow.items():
        rows.append({
            "flow":                  f,
            "n_participants":        len(info["pids"]),
            "mean_duration_s":       round(mean(info["dur"]), 3),
            "std_duration_s":        round(stdev(info["dur"]), 3) if len(info["dur"]) > 1 else 0.0,
            "mean_long_pauses":      round(mean(info["long"]), 3),
            "sum_long_pauses":       int(sum(info["long"])),
        })

    # friction score: min-max em duração (60%) + pausas (40%)
    dur_vals  = [r["mean_duration_s"]  for r in rows]
    long_vals = [r["mean_long_pauses"] for r in rows]

    def mm(v, arr):
        lo, hi = min(arr), max(arr)
        return 0.0 if hi == lo else (v - lo) / (hi - lo)

    for r in rows:
        r["friction_score"] = round((0.6 * mm(r["mean_duration_s"], dur_vals)
                                     + 0.4 * mm(r["mean_long_pauses"], long_vals)) * 100, 2)

    rows.sort(key=lambda x: x["friction_score"], reverse=True)
    return rows


# ---------------------------------------------------------------------------
# 3. CORRELAÇÃO DE SPEARMAN
# ---------------------------------------------------------------------------

def spearman(x: list[float], y: list[float]) -> tuple[float, float]:
    """Calcula rho de Spearman e p-value aproximado (distribuição t, n>=4)."""
    n = len(x)
    if n < 3:
        return float("nan"), float("nan")

    def rank(lst):
        sorted_lst = sorted(range(n), key=lambda i: lst[i])
        ranks = [0.0] * n
        i = 0
        while i < n:
            j = i
            while j < n - 1 and lst[sorted_lst[j]] == lst[sorted_lst[j + 1]]:
                j += 1
            avg_rank = (i + j) / 2 + 1
            for k in range(i, j + 1):
                ranks[sorted_lst[k]] = avg_rank
            i = j + 1
        return ranks

    rx, ry = rank(x), rank(y)
    d2 = sum((rx[i] - ry[i]) ** 2 for i in range(n))
    rho = 1 - (6 * d2) / (n * (n ** 2 - 1))

    # Aproximação t-student
    if abs(rho) == 1.0:
        p = 0.0
    else:
        t_stat = rho * math.sqrt(n - 2) / math.sqrt(1 - rho ** 2)
        # p-value aproximado via gaussiana (válido para n >= 10; indicativo para n < 10)
        p = 2 * (1 - _norm_cdf(abs(t_stat)))

    return round(rho, 4), round(p, 4)


def _norm_cdf(x: float) -> float:
    """CDF da normal padrão via aproximação de Abramowitz & Stegun."""
    a1, a2, a3, a4, a5 = 0.319381530, -0.356563782, 1.781477937, -1.821255978, 1.330274429
    k = 1.0 / (1.0 + 0.2316419 * abs(x))
    poly = k * (a1 + k * (a2 + k * (a3 + k * (a4 + k * a5))))
    cdf = 1.0 - (1.0 / math.sqrt(2 * math.pi)) * math.exp(-0.5 * x ** 2) * poly
    return cdf if x >= 0 else 1.0 - cdf


def _norm_cdf_inv(p: float) -> float:
    """
    Inversa aproximada da CDF normal padrão (Beasley-Springer-Moro).
    Válida para 0 < p < 1.
    """
    a = [2.50662823884, -18.61500062529, 41.39119773534, -25.44106049637]
    b = [-8.47351093090, 23.08336743743, -21.06224101826, 3.13082909833]
    c = [0.3374754822726147, 0.9761690190917186, 0.1607979714918209,
         0.0276438810333863, 0.0038405729373609, 0.0003951896511349,
         0.0000321767881768, 0.0000002888167364, 0.0000003960315187]
    y = p - 0.5
    if abs(y) < 0.42:
        r = y * y
        x = y * (((a[3]*r + a[2])*r + a[1])*r + a[0]) / \
            ((((b[3]*r + b[2])*r + b[1])*r + b[0])*r + 1)
        return x
    r = math.log(-math.log(min(p, 1 - p)))
    x = c[0] + r*(c[1] + r*(c[2] + r*(c[3] + r*(c[4] + r*(c[5] + r*(c[6] + r*(c[7] + r*c[8])))))))
    return x if p >= 0.5 else -x


def correlate_objective_subjective(
    session_rows: list[dict],
    ueqs: dict[str, dict],
) -> list[dict]:
    """
    Cruza score de atrito objetivo (dead_clicks + long_pauses, normalizado)
    com escala pragmática UEQ-S.
    Retorna lista de pares para Spearman.
    """
    pairs = []
    for row in session_rows:
        pid = row["participant_id"]
        if pid in SYNTHETIC_IDS:
            continue  # exclui participantes sintéticos da análise inferencial
        if pid not in ueqs:
            continue
        # Score objetivo de atrito por sessão: dead_clicks (60%) + long_pauses (40%)
        # (valores brutos — normalizados com min-max abaixo)
        pairs.append({
            "pid":              pid,
            "dead_clicks":      row["dead_clicks_total"],
            "long_pauses":      row["long_pauses_total"],
            "session_dur_s":    row["session_duration_s"],
            "ueqs_pragmatic":   ueqs[pid]["pragmatic"],
            "ueqs_hedonic":     ueqs[pid]["hedonic"],
        })

    if not pairs:
        return []

    # Normalizar score objetivo
    dc_vals   = [p["dead_clicks"]   for p in pairs]
    lp_vals   = [p["long_pauses"]    for p in pairs]
    dur_vals  = [p["session_dur_s"]  for p in pairs]

    def mmv(v, arr):
        lo, hi = min(arr), max(arr)
        return 0.0 if hi == lo else (v - lo) / (hi - lo)

    for p in pairs:
        p["friction_session"] = round(
            (0.4 * mmv(p["dead_clicks"], dc_vals)
             + 0.3 * mmv(p["long_pauses"],   lp_vals)
             + 0.3 * mmv(p["session_dur_s"],  dur_vals)) * 100, 3
        )

    return pairs


# ---------------------------------------------------------------------------
# 4. ANÁLISE TEMÁTICA — RESPOSTAS QUALITATIVAS
# ---------------------------------------------------------------------------

# Categorias temáticas e palavras-chave (case-insensitive, busca substring)
THEMES: dict[str, list[str]] = {
    # --- Temas negativos de usabilidade ---

    # Ausência de resposta visual após ação (feedback de sistema)
    "feedback_ausente":      ["feedback", "retorno", "esperando", "aguardei",
                              "não mostrou", "não houve", "sem indicação",
                              "sinal de carr",            # P03: typo "carrgamento"
                              "não apareceu", "não mostrou nada",
                              "resposta imediata", "imediata",  # P01 (feminino)
                              "nada estava acontecendo",    # P03 literal
                              "loading"],                   # P07/P08
    # Botões não responsivos / clicks repetidos
    "botao_sem_resposta":    ["não funciona", "não funcionam", "spam",
                              "cliquei várias vezes",       # P07 literal
                              "clicando mais de uma vez",   # P08 sugerido
                              "botões de like", "dando spam",
                              "clicaveis"],                 # P01: "aparecer clicaveis"
    # Ausência de redirecionamento após completar ação
    "redirect_ausente":      ["redireciona",                # cobre "redirecionar"/"redirecionados"
                              "redirect", "não sabia para onde",
                              "não direcionou", "reencaminha",  # P04
                              "não fui direcionado",
                              "onde ir"],
    # Lentidão ou travamento percebido
    "carregamento_lentidao": ["carregamento", "travou", "demor",  # P04: "demoram"
                              "lento", "lentidão", "travada",
                              "5 a 10 segundos",            # P03 literal
                              "demorada"],
    # Confusão de navegação ou orientação
    "navegacao_confusao":    ["confuso", "confusão", "perdido",
                              "difícil encontrar", "não encontrei",
                              "não encontrou", "confus", "não sabia"],
    # Dados incorretos / comportamento inconsistente (mocks, salvos errados)
    "dados_inconsistentes":  ["mocado", "mock", "não salvei",
                              "posts que não salvei",       # P09 literal
                              "não está funcionando",       # P09 literal
                              "não funcionou"],
    # Sugestão de melhorias visuais / polish da interface
    "melhoria_visual":       ["imagem", "personalização", "ícone", "icon",
                              "flat", "visual", "design",
                              "retoque"],

    # --- Tema positivo ---
    "positivo":              ["intuitiv", "fácil", "gostei", "ótima",
                              "simples e direta", "fluiu", "tranquil",
                              "100%", "acima das minhas expectativas",
                              "atendendo o principio"],     # P01 geral positivo
}


def analyze_qualitative_themes(ueqs: dict[str, dict]) -> list[dict]:
    """
    Analisa tematicamente as respostas abertas Q1, Q2, Q3 do formulário.
    Retorna uma linha por participante com flags por tema detectado.
    Participantes sintéticos são excluídos.
    """
    rows = []
    for pid, data in sorted(ueqs.items()):
        if pid in SYNTHETIC_IDS:
            continue

        # Concatena Q1+Q2+Q3 em minúsculo para busca de substring
        text = " ".join([
            data.get("q_confusao", ""),
            data.get("q_comportamento", ""),
            data.get("q_melhoria", ""),
        ]).lower()

        row: dict = {"participant_id": pid}
        detected: list[str] = []
        for theme, keywords in THEMES.items():
            hit = any(kw.lower() in text for kw in keywords)
            row[theme] = 1 if hit else 0
            if hit:
                detected.append(theme)

        row["n_temas"] = len(detected)
        row["q1"] = data.get("q_confusao", "").strip()
        row["q2"] = data.get("q_comportamento", "").strip()
        row["q3"] = data.get("q_melhoria", "").strip()
        rows.append(row)
    return rows


# ---------------------------------------------------------------------------
# 5. POWER ANALYSIS — SPEARMAN
# ---------------------------------------------------------------------------

def power_analysis_spearman(
    target_rho: float = 0.5,
    alpha: float = 0.05,
    power: float = 0.80,
) -> dict:
    """
    Calcula N mínimo para detectar correlação de Spearman via transformação Fisher-Z.
    Fórmula: N = ceil((z_α/2 + z_β)² / z_ρ² + 3)
    """
    z_rho   = 0.5 * math.log((1 + target_rho) / (1 - target_rho))  # Fisher-Z(ρ)
    z_alpha = _norm_cdf_inv(1 - alpha / 2)                           # bicaudal
    z_beta  = _norm_cdf_inv(power)
    n_needed = math.ceil((z_alpha + z_beta) ** 2 / z_rho ** 2 + 3)
    return {
        "target_rho":    target_rho,
        "alpha":         alpha,
        "power":         power,
        "z_rho_fisher":  round(z_rho, 4),
        "z_alpha":       round(z_alpha, 4),
        "z_beta":        round(z_beta, 4),
        "n_needed":      n_needed,
        "n_atual":       9,
        "deficit":       max(0, n_needed - 9),
    }


# ---------------------------------------------------------------------------
# 6. RAW EVENTS — DISTRIBUIÇÃO POR TIPO E FLUXO
# ---------------------------------------------------------------------------

def compute_raw_events_by_flow(sessions: list[dict]) -> list[dict]:
    """
    Distribui rawEvents pelos fluxos usando timestamps das transitions.
    Conta tipos de evento por fluxo (click, input, navigation, etc.).
    Retorna lista de dicts {participant_id, flow, total_events, evt_<tipo>...}.
    """
    rows: list[dict] = []

    for s in sessions:
        pid        = s["participantId"]
        raw_events = s.get("rawEvents", [])
        flows      = s.get("flows", [])

        if not raw_events or not flows:
            continue

        # Mapeia intervalos de timestamp por fluxo a partir das transitions
        flow_intervals: list[tuple[str, float, float]] = []
        for flow in flows:
            ts_list = [
                float(t["timestamp"])
                for t in flow.get("transitions", [])
                if t.get("timestamp") is not None
            ]
            if ts_list:
                flow_intervals.append((flow.get("name", "unknown"), min(ts_list), max(ts_list)))

        if not flow_intervals:
            # Sem timestamps: conta globalmente por sessão
            type_counts: dict[str, int] = {}
            for evt in raw_events:
                t = evt.get("type", "unknown")
                type_counts[t] = type_counts.get(t, 0) + 1
            row = {"participant_id": pid, "flow": "_session", "total_events": len(raw_events)}
            for t, c in sorted(type_counts.items()):
                row[f"evt_{t}"] = c
            rows.append(row)
            continue

        # Agrupa eventos por fluxo
        buckets: dict[str, dict[str, int]] = {name: {} for name, _, _ in flow_intervals}
        buckets["_unassigned"] = {}

        for evt in raw_events:
            evt_type = evt.get("type", "unknown")
            evt_ts   = float(evt.get("timestamp", 0))
            assigned = False
            for name, t_start, t_end in flow_intervals:
                if t_start <= evt_ts <= t_end:
                    buckets[name][evt_type] = buckets[name].get(evt_type, 0) + 1
                    assigned = True
                    break
            if not assigned:
                buckets["_unassigned"][evt_type] = buckets["_unassigned"].get(evt_type, 0) + 1

        # Coleta todos os tipos observados para colunas uniformes
        all_types: set[str] = set()
        for counts in buckets.values():
            all_types.update(counts.keys())

        for flow_name, counts in buckets.items():
            if not counts and flow_name == "_unassigned":
                continue
            row = {
                "participant_id": pid,
                "flow":           flow_name,
                "total_events":   sum(counts.values()),
            }
            for t in sorted(all_types):
                row[f"evt_{t}"] = counts.get(t, 0)
            rows.append(row)

    return rows


# ---------------------------------------------------------------------------
# 7. EXPORTAÇÃO
# ---------------------------------------------------------------------------

def write_csv(path: Path, rows: list[dict]) -> None:
    if not rows:
        return
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"  salvo: {path}")


# ---------------------------------------------------------------------------
# 8. RELATÓRIO NO TERMINAL
# ---------------------------------------------------------------------------

def print_report(
    session_rows:  list[dict],
    flow_agg:      list[dict],
    pairs:         list[dict],
    theme_rows:    list[dict] | None = None,
    power_result:  dict        | None = None,
) -> None:
    sep = "=" * 72

    print(f"\n{sep}")
    print("  ANALISE QoE — DevShare  |  SEMISH/CSBC 2026")
    print(sep)

    # Sessao geral
    print(f"\n{'='*72}")
    print("  METRICAS OBJETIVAS — POR SESSAO")
    print(f"{'='*72}")
    print(f"  {'ID':<6} {'Duracao(s)':<12} {'DeadClicks':<12} {'PausasLongas':<14} {'Eventos'}")
    print(f"  {'-'*58}")
    for r in sorted(session_rows, key=lambda x: x["participant_id"]):
        print(f"  {r['participant_id']:<6} {r['session_duration_s']:<12} {r['dead_clicks_total']:<12} {r['long_pauses_total']:<14} {r['num_events']}")

    dc_all = [r["dead_clicks_total"] for r in session_rows]
    dur_all = [r["session_duration_s"] for r in session_rows]
    print(f"\n  Dead clicks — total: {sum(dc_all):>3} | media: {mean(dc_all):.2f} | max: {max(dc_all)}")
    print(f"  Duracao sessao — media: {mean(dur_all):.1f}s | min: {min(dur_all):.1f}s | max: {max(dur_all):.1f}s")

    # Por fluxo
    print(f"\n{'='*72}")
    print("  METRICAS OBJETIVAS — POR FLUXO")
    print(f"{'='*72}")
    print(f"  {'Fluxo':<22} {'Dur.Media(s)':<14} {'Std':<8} {'PausasMedia':<13} {'Friction'}")
    print(f"  {'-'*65}")
    for r in flow_agg:
        print(f"  {r['flow']:<22} {r['mean_duration_s']:<14} {r['std_duration_s']:<8} {r['mean_long_pauses']:<13} {r['friction_score']}")

    # Spearman
    if pairs:
        print(f"\n{'='*72}")
        print("  CORRELACAO DE SPEARMAN — Atrito Objetivo x UEQ-S Pragmatico")
        print(f"{'='*72}")
        print(f"  {'ID':<6} {'FrictionSessao':<16} {'UEQs-Prag':<11} {'UEQs-Hed'}")
        print(f"  {'-'*47}")
        for p in sorted(pairs, key=lambda x: x["pid"]):
            print(f"  {p['pid']:<6} {p['friction_session']:<16} {p['ueqs_pragmatic']:<11} {p['ueqs_hedonic']}")

        friction_vals = [p["friction_session"]  for p in pairs]
        prag_vals     = [p["ueqs_pragmatic"]    for p in pairs]
        hed_vals      = [p["ueqs_hedonic"]      for p in pairs]

        rho_p, pval_p = spearman(friction_vals, prag_vals)
        rho_h, pval_h = spearman(friction_vals, hed_vals)

        print(f"\n  n = {len(pairs)} participantes com dados pareados")
        print(f"  Spearman (atrito vs pragmatico): rho = {rho_p:+.4f}  |  p-value ≈ {pval_p:.4f}")
        print(f"  Spearman (atrito vs hedo'nico):  rho = {rho_h:+.4f}  |  p-value ≈ {pval_h:.4f}")

        if pval_p < 0.05:
            print("  [sig] correlacao pragmatica estatisticamente significativa (p < 0.05)")
        else:
            print(f"  [info] n reduzido ({len(pairs)}); interpretar com cautela")
    else:
        print("\n  [AVISO] Nenhum par objetivo-subjetivo disponivel para Spearman.")
        print("  Verifique se o CSV UEQ-S esta em results/ com o nome correto.")

    # Power analysis
    if power_result:
        print(f"\n{'='*72}")
        print("  POWER ANALYSIS — N necessario para Spearman")
        print(f"{'='*72}")
        print(f"  Alvo: |rho| >= {power_result['target_rho']}  |  alpha = {power_result['alpha']}  |  poder = {power_result['power']}")
        print(f"  Transformacao Fisher-Z(rho): z = {power_result['z_rho_fisher']}")
        print(f"  N necessario : {power_result['n_needed']}")
        print(f"  N atual      : {power_result['n_atual']}  (deficit: {power_result['deficit']} participantes)")
        print(f"\n  -> Com N=9 e rho observado de ~0.13, o estudo esta subamostrado.")
        print(f"     Interpretar Spearman como exploratório, nao confirmatório.")

    # Análise temática
    if theme_rows:
        n = len(theme_rows)
        print(f"\n{'='*72}")
        print("  ANALISE TEMATICA — RESPOSTAS QUALITATIVAS (Q1+Q2+Q3)")
        print(f"{'='*72}")
        theme_keys = list(THEMES.keys())
        for theme in theme_keys:
            count = sum(r[theme] for r in theme_rows)
            pct   = round(count / n * 100)
            bar   = chr(0x2588) * count
            print(f"  {theme:<25} {bar:<12} {count}/{n} ({pct}%)")
        print()
        for r in theme_rows:
            detected = [t for t in theme_keys if r[t]]
            label    = ', '.join(detected) if detected else '(sem tema)'
            print(f"  {r['participant_id']}: {label}")

    print(f"\n{sep}")
    print("  ANALISE CONCLUIDA")
    print(sep + "\n")


# ---------------------------------------------------------------------------
# 9. MAIN
# ---------------------------------------------------------------------------

def main() -> None:
    print("\nCarregando dados...")

    sessions = load_sessions()
    if not sessions:
        print("ERRO: Nenhum JSON encontrado em results/participantes/")
        return

    ueqs = load_ueqs()

    session_rows = compute_session_metrics(sessions)
    flow_rows    = compute_flow_metrics(sessions)
    flow_agg     = compute_flow_aggregate(flow_rows)
    pairs        = correlate_objective_subjective(session_rows, ueqs)

    # Novas análises
    theme_rows   = analyze_qualitative_themes(ueqs) if ueqs else []
    power_result = power_analysis_spearman(target_rho=0.5, alpha=0.05, power=0.80)
    raw_evt_rows = compute_raw_events_by_flow(sessions)

    # Salva CSVs
    RESULTS_DIR.mkdir(exist_ok=True)
    write_csv(RESULTS_DIR / "participant_session_metrics.csv", session_rows)
    write_csv(RESULTS_DIR / "participant_flow_metrics.csv",   flow_rows)
    write_csv(RESULTS_DIR / "flow_friction_ranking.csv",      flow_agg)
    if pairs:
        write_csv(RESULTS_DIR / "spearman_pairs.csv", pairs)
    if theme_rows:
        write_csv(RESULTS_DIR / "qualitative_themes.csv", theme_rows)
    if raw_evt_rows:
        write_csv(RESULTS_DIR / "raw_events_by_flow.csv", raw_evt_rows)

    # Relatório UEQ-S
    if ueqs:
        ueqs_rows = [
            {
                "participant_id": v["pid"],
                "area":           v["area"],
                "experiencia":    v["experiencia"],
                "ueqs_pragmatic": v["pragmatic"],
                "ueqs_hedonic":   v["hedonic"],
            }
            for v in ueqs.values()
        ]
        write_csv(RESULTS_DIR / "ueqs_scores.csv", ueqs_rows)

    print_report(session_rows, flow_agg, pairs,
                 theme_rows=theme_rows, power_result=power_result)


if __name__ == "__main__":
    main()
