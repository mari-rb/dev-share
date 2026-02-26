#!/usr/bin/env python3
"""
Script de exemplo para análise estatística avançada das métricas QoE
Requer: pandas, matplotlib, seaborn

Instalação:
    pip install pandas matplotlib seaborn

Uso:
    python tests/analise_estatistica.py
"""

import json
import glob
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

def load_all_sessions():
    """Carrega todas as sessões do diretório de participantes"""
    sessions = []
    
    for json_file in glob.glob("results/participantes/*.json"):
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            sessions.append(data)
    
    return sessions

def analyze_sessions(sessions):
    """Analisa todas as sessões e gera estatísticas"""
    
    # Criar DataFrame com dados gerais
    general_data = []
    for session in sessions:
        general_data.append({
            'participant_id': session['participantId'],
            'total_duration_s': session['totalDuration'] / 1000,
            'dead_clicks': session['deadClicks'],
            'num_events': len(session['rawEvents']),
            'num_flows': len(session['flows'])
        })
    
    df_general = pd.DataFrame(general_data)
    
    print("\n" + "="*70)
    print("📊 ANÁLISE ESTATÍSTICA - RESUMO GERAL")
    print("="*70)
    print(f"\nTotal de participantes: {len(sessions)}")
    print(f"\nEstatísticas gerais:")
    print(df_general.describe())
    
    # Análise por fluxo
    flow_data = []
    for session in sessions:
        for flow in session['flows']:
            for transition in flow['transitions']:
                flow_data.append({
                    'participant_id': session['participantId'],
                    'flow': flow['name'],
                    'from_step': transition['from'],
                    'to_step': transition['to'],
                    'duration_ms': transition['duration']
                })
    
    df_flows = pd.DataFrame(flow_data)
    
    if not df_flows.empty:
        print("\n" + "="*70)
        print("📊 ANÁLISE POR FLUXO")
        print("="*70)
        
        for flow_name in df_flows['flow'].unique():
            flow_df = df_flows[df_flows['flow'] == flow_name]
            print(f"\n🔄 {flow_name.upper()}")
            print(f"   Número de transições: {len(flow_df)}")
            print(f"   Duração média: {flow_df['duration_ms'].mean():.2f}ms")
            print(f"   Duração mediana: {flow_df['duration_ms'].median():.2f}ms")
            print(f"   Desvio padrão: {flow_df['duration_ms'].std():.2f}ms")
            print(f"   Mín: {flow_df['duration_ms'].min():.2f}ms")
            print(f"   Máx: {flow_df['duration_ms'].max():.2f}ms")
    
    # Análise de dead clicks
    print("\n" + "="*70)
    print("⚠️  ANÁLISE DE DEAD CLICKS")
    print("="*70)
    print(f"\nTotal de dead clicks: {df_general['dead_clicks'].sum()}")
    print(f"Média por participante: {df_general['dead_clicks'].mean():.2f}")
    print(f"Participantes com dead clicks: {(df_general['dead_clicks'] > 0).sum()}")
    
    return df_general, df_flows

def generate_plots(df_general, df_flows):
    """Gera gráficos de análise"""
    
    sns.set_style("whitegrid")
    
    # Criar diretório de plots
    Path("results/plots").mkdir(parents=True, exist_ok=True)
    
    # 1. Distribuição de dead clicks
    plt.figure(figsize=(10, 6))
    sns.histplot(df_general['dead_clicks'], bins=10, kde=True)
    plt.title('Distribuição de Dead Clicks por Participante')
    plt.xlabel('Número de Dead Clicks')
    plt.ylabel('Frequência')
    plt.savefig('results/plots/dead_clicks_distribution.png', dpi=300, bbox_inches='tight')
    print("\n✅ Gráfico salvo: results/plots/dead_clicks_distribution.png")
    
    # 2. Duração total por participante
    plt.figure(figsize=(12, 6))
    sns.barplot(data=df_general, x='participant_id', y='total_duration_s')
    plt.title('Duração Total da Sessão por Participante')
    plt.xlabel('Participante')
    plt.ylabel('Duração (segundos)')
    plt.xticks(rotation=45)
    plt.savefig('results/plots/session_duration.png', dpi=300, bbox_inches='tight')
    print("✅ Gráfico salvo: results/plots/session_duration.png")
    
    # 3. Box plot de duração por fluxo
    if not df_flows.empty:
        plt.figure(figsize=(12, 6))
        sns.boxplot(data=df_flows, x='flow', y='duration_ms')
        plt.title('Distribuição de Duração das Transições por Fluxo')
        plt.xlabel('Fluxo')
        plt.ylabel('Duração (ms)')
        plt.xticks(rotation=45)
        plt.savefig('results/plots/flow_duration_boxplot.png', dpi=300, bbox_inches='tight')
        print("✅ Gráfico salvo: results/plots/flow_duration_boxplot.png")
        
        # 4. Heatmap de transições
        transition_matrix = df_flows.groupby(['from_step', 'to_step'])['duration_ms'].mean().unstack(fill_value=0)
        if not transition_matrix.empty:
            plt.figure(figsize=(12, 10))
            sns.heatmap(transition_matrix, annot=True, fmt='.0f', cmap='YlOrRd')
            plt.title('Duração Média das Transições (ms)')
            plt.xlabel('Para Step')
            plt.ylabel('De Step')
            plt.savefig('results/plots/transition_heatmap.png', dpi=300, bbox_inches='tight')
            print("✅ Gráfico salvo: results/plots/transition_heatmap.png")
    
    plt.close('all')

def export_csv(df_general, df_flows):
    """Exporta dados para CSV para análise em outras ferramentas"""
    
    df_general.to_csv('results/general_metrics.csv', index=False)
    print("\n✅ CSV exportado: results/general_metrics.csv")
    
    if not df_flows.empty:
        df_flows.to_csv('results/flow_metrics.csv', index=False)
        print("✅ CSV exportado: results/flow_metrics.csv")

def main():
    print("\n🔬 Iniciando análise estatística avançada...")
    
    sessions = load_all_sessions()
    
    if not sessions:
        print("\n❌ Nenhuma sessão encontrada em results/participantes/")
        print("Execute primeiro: yarn coletar P01")
        return
    
    df_general, df_flows = analyze_sessions(sessions)
    
    print("\n📈 Gerando gráficos...")
    generate_plots(df_general, df_flows)
    
    print("\n💾 Exportando CSVs...")
    export_csv(df_general, df_flows)
    
    print("\n" + "="*70)
    print("✅ Análise completa!")
    print("="*70)
    print("\nResultados disponíveis em:")
    print("  - results/plots/")
    print("  - results/general_metrics.csv")
    print("  - results/flow_metrics.csv")
    print()

if __name__ == "__main__":
    main()
