"""
Gera os plots para o artigo a partir dos CSVs de resultados atuais.
Saída: results/plots/*.png
"""
import csv
import os
import statistics
from pathlib import Path

try:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
except ImportError:
    raise SystemExit("matplotlib não encontrado. Execute: pip install matplotlib")

# ---------------------------------------------------------------------------
ROOT = Path(__file__).parent.parent
RESULTS = ROOT / "results"
PLOTS   = RESULTS / "plots"
PLOTS.mkdir(parents=True, exist_ok=True)

SYNTHETIC = {"P10"}

# Paleta SBC-friendly (tons de cinza + azul único para destaque)
C_BASE    = "#4C72B0"
C_DEGRADE = "#DD8452"
C_NEUTRAL = "#8172B2"
C_OUTLINE = "#2d2d2d"
C_HILITE  = "#C44E52"  # destaque P04

FLOW_COLORS = {
    "explorar-salvar": C_BASE,
    "criar-perfil":    C_DEGRADE,
    "postar-dica":     C_DEGRADE,
    "comentar-reagir": C_NEUTRAL,
}

def load_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))

# ---------------------------------------------------------------------------
# 1. BOXPLOT — Duração por fluxo (participant_flow_metrics.csv)
# ---------------------------------------------------------------------------
def plot_flow_duration_boxplot():
    rows = [r for r in load_csv(RESULTS / "participant_flow_metrics.csv")
            if r["participant_id"] not in SYNTHETIC]

    flows_order = ["explorar-salvar", "postar-dica", "criar-perfil", "comentar-reagir"]
    data = {f: [] for f in flows_order}
    for r in rows:
        f = r["flow"]
        if f in data:
            data[f].append(float(r["flow_duration_s"]))

    labels_pt = {
        "explorar-salvar":  "explorar-salvar\n(Baseline)",
        "postar-dica":      "postar-dica\n(Degradado)",
        "criar-perfil":     "criar-perfil\n(Degradado)",
        "comentar-reagir":  "comentar-reagir\n(Neutro)",
    }
    colors = [FLOW_COLORS[f] for f in flows_order]

    fig, ax = plt.subplots(figsize=(7, 4))
    bp = ax.boxplot([data[f] for f in flows_order],
                    patch_artist=True, notch=False,
                    medianprops=dict(color="white", linewidth=2))
    for patch, color in zip(bp["boxes"], colors):
        patch.set_facecolor(color)
        patch.set_alpha(0.85)

    ax.set_xticklabels([labels_pt[f] for f in flows_order], fontsize=9)
    ax.set_ylabel("Duração do fluxo (s)", fontsize=10)
    ax.set_title("Distribuição de duração por fluxo de interação", fontsize=11, pad=10)
    ax.yaxis.grid(True, linestyle="--", alpha=0.5)
    ax.set_axisbelow(True)

    patches = [
        mpatches.Patch(color=C_BASE,    label="Baseline"),
        mpatches.Patch(color=C_DEGRADE, label="Degradado"),
        mpatches.Patch(color=C_NEUTRAL, label="Neutro"),
    ]
    ax.legend(handles=patches, fontsize=8, loc="upper right")
    fig.tight_layout()
    out = PLOTS / "flow_duration_boxplot.png"
    fig.savefig(out, dpi=150)
    plt.close(fig)
    print(f"  [ok] {out}")

# ---------------------------------------------------------------------------
# 2. BARRAS — Dead clicks por participante (spearman_pairs.csv)
# ---------------------------------------------------------------------------
def plot_dead_clicks_by_participant():
    rows = [r for r in load_csv(RESULTS / "spearman_pairs.csv")
            if r["pid"] not in SYNTHETIC]
    rows.sort(key=lambda r: r["pid"])

    pids   = [r["pid"] for r in rows]
    clicks = [int(r["dead_clicks"]) for r in rows]
    colors = [C_HILITE if p == "P04" else C_BASE for p in pids]

    fig, ax = plt.subplots(figsize=(7, 3.5))
    bars = ax.bar(pids, clicks, color=colors, edgecolor=C_OUTLINE, linewidth=0.6)

    for bar, val in zip(bars, clicks):
        if val > 0:
            ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.4,
                    str(val), ha="center", va="bottom", fontsize=8)

    ax.set_ylabel("Dead clicks (total por participante)", fontsize=10)
    ax.set_title("Distribuição de dead clicks por participante", fontsize=11, pad=10)
    ax.yaxis.grid(True, linestyle="--", alpha=0.5)
    ax.set_axisbelow(True)

    patches = [
        mpatches.Patch(color=C_HILITE, label="P04 — outlier extremo"),
        mpatches.Patch(color=C_BASE,   label="Demais participantes"),
    ]
    ax.legend(handles=patches, fontsize=8)
    fig.tight_layout()
    out = PLOTS / "dead_clicks_by_participant.png"
    fig.savefig(out, dpi=150)
    plt.close(fig)
    print(f"  [ok] {out}")

# ---------------------------------------------------------------------------
# 3. SCATTER — FrictionScore × UEQ-S pragmático (Spearman)
# ---------------------------------------------------------------------------
def plot_ueqs_scatter():
    rows = [r for r in load_csv(RESULTS / "spearman_pairs.csv")
            if r["pid"] not in SYNTHETIC]

    xs = [float(r["friction_session"]) for r in rows]
    ys = [float(r["ueqs_pragmatic"])   for r in rows]
    pids = [r["pid"] for r in rows]

    fig, ax = plt.subplots(figsize=(6, 4.5))
    ax.scatter(xs, ys, color=C_BASE, edgecolors=C_OUTLINE, s=70, zorder=3)

    for x, y, p in zip(xs, ys, pids):
        offset = (4, 4) if p != "P04" else (6, -10)
        ax.annotate(p, (x, y), xytext=offset, textcoords="offset points",
                    fontsize=7.5, color="#333333")

    # linha de tendência simples
    if len(xs) > 1:
        mx, my = statistics.mean(xs), statistics.mean(ys)
        num = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
        den = sum((x - mx) ** 2 for x in xs)
        if den:
            slope = num / den
            intercept = my - slope * mx
            x0, x1 = min(xs) - 2, max(xs) + 2
            ax.plot([x0, x1], [slope * x0 + intercept, slope * x1 + intercept],
                    "--", color=C_HILITE, linewidth=1, alpha=0.7, label="Tendência (OLS)")

    ax.axhline(0, color="gray", linewidth=0.6, linestyle=":")
    ax.set_xlabel("FrictionScore de sessão (0–100)", fontsize=10)
    ax.set_ylabel("UEQ-S — Qualidade Pragmática (−3 a +3)", fontsize=10)
    ax.set_title(r"FrictionScore × UEQ-S Pragmático ($\rho = +0{,}13$; $p = 0{,}73$; $N = 9$)",
                 fontsize=10, pad=10)
    ax.yaxis.grid(True, linestyle="--", alpha=0.4)
    ax.set_axisbelow(True)
    ax.legend(fontsize=8)
    fig.tight_layout()
    out = PLOTS / "ueqs_scatter.png"
    fig.savefig(out, dpi=150)
    plt.close(fig)
    print(f"  [ok] {out}")

# ---------------------------------------------------------------------------
# 4. BARRAS HORIZONTAIS — Frequência de temas qualitativos
# ---------------------------------------------------------------------------
def plot_qualitative_themes():
    rows = [r for r in load_csv(RESULTS / "qualitative_themes.csv")
            if r["participant_id"] not in SYNTHETIC]

    # temas e seus rótulos em PT
    themes = [
        ("feedback_ausente",        "Ausência de feedback visual"),
        ("botao_sem_resposta",      "Botão sem resposta perceptível"),
        ("redirect_ausente",        "Ausência de redirecionamento"),
        ("carregamento_lentidao",   "Lentidão / travamento percebido"),
        ("melhoria_visual",         "Melhoria visual solicitada"),
        ("positivo",                "Avaliação geral positiva"),
        ("navegacao_confusao",      "Confusão de navegação"),
        ("dados_inconsistentes",    "Dados inconsistentes (mock)"),
    ]

    n_total = len(rows)
    freqs = []
    for key, label in themes:
        count = sum(1 for r in rows if r.get(key, "0") == "1")
        freqs.append((label, count, count / n_total * 100))

    # ordena por frequência decrescente
    freqs.sort(key=lambda x: x[1], reverse=True)
    labels  = [f[0] for f in freqs]
    pcts    = [f[2] for f in freqs]
    counts  = [f[1] for f in freqs]

    # destaque para temas mapeados a métricas objetivas
    mapped = {"Ausência de feedback visual", "Botão sem resposta perceptível",
              "Ausência de redirecionamento", "Lentidão / travamento percebido",
              "Confusão de navegação"}
    colors = [C_BASE if l in mapped else "#AAAAAA" for l in labels]

    fig, ax = plt.subplots(figsize=(7.5, 4))
    bars = ax.barh(labels, pcts, color=colors, edgecolor=C_OUTLINE, linewidth=0.5)
    for bar, cnt, pct in zip(bars, counts, pcts):
        ax.text(pct + 0.5, bar.get_y() + bar.get_height() / 2,
                f"{cnt}/{n_total} ({pct:.0f}%)", va="center", fontsize=8)

    ax.set_xlabel("Frequência (%)", fontsize=10)
    ax.set_title("Categorias qualitativas — análise de conteúdo dedutiva", fontsize=11, pad=10)
    ax.set_xlim(0, 110)
    ax.xaxis.grid(True, linestyle="--", alpha=0.4)
    ax.set_axisbelow(True)
    ax.invert_yaxis()

    patches = [
        mpatches.Patch(color=C_BASE,   label="Mapeado a métrica objetiva"),
        mpatches.Patch(color="#AAAAAA", label="Sem correspondência direta"),
    ]
    ax.legend(handles=patches, fontsize=8, loc="lower right")
    fig.tight_layout()
    out = PLOTS / "qualitative_themes_bar.png"
    fig.savefig(out, dpi=150)
    plt.close(fig)
    print(f"  [ok] {out}")

# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print("Gerando plots...")
    plot_flow_duration_boxplot()
    plot_dead_clicks_by_participant()
    plot_ueqs_scatter()
    plot_qualitative_themes()
    print("Concluído. Arquivos em results/plots/")
