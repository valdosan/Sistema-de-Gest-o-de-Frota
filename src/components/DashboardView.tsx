import React from "react";
import {
  Car,
  Bike,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  FileCheck2,
  Truck,
  Wrench,
  DollarSign,
  ArrowUpRight,
  ShieldAlert
} from "lucide-react";
import { Viatura, Checklist, CargaViatura, RevisaoViatura, GastoManutencao, ConfigSistema } from "../types";
import { formatarMoedaBRL } from "../constants";
import { ViewTab } from "./MenuLateral";

interface DashboardViewProps {
  viaturas: Viatura[];
  checklists: Checklist[];
  cargas: CargaViatura[];
  revisoes: RevisaoViatura[];
  gastos: GastoManutencao[];
  onNavigateTab: (tab: ViewTab) => void;
  config?: ConfigSistema;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  viaturas,
  checklists,
  cargas,
  revisoes,
  gastos,
  onNavigateTab,
  config,
}) => {
  const totalViaturas = viaturas.length;
  const disponiveis = viaturas.filter((v) => v.status === "disponivel").length;
  const indisponiveis = viaturas.filter((v) => v.status === "indisponivel").length;
  const manutencao = viaturas.filter((v) => v.status === "manutencao").length;

  const totalCarros = viaturas.filter((v) => v.tipo === "carro").length;
  const totalMotos = viaturas.filter((v) => v.tipo === "moto").length;

  const totalGastosGeral = gastos.reduce((acc, curr) => acc + curr.totalGastos, 0);
  const revisoesProximas = revisoes.filter((r) => r.status === "agendada" || r.status === "vencida");

  // Recent checklists (last 5)
  const recentChecklists = [...checklists].slice(-5).reverse();

  // Recent cargas (last 5)
  const recentCargas = [...cargas].slice(-5).reverse();

  const unidade = config?.unidade || "19ª CIPM";
  const subtitulo = config?.subTitle || "PARIPE • O GUARDIÃO DO SUBÚRBIO";
  const orgaoSuperior = config?.orgaoSuperior || "POLÍCIA MILITAR DA BAHIA";
  const comandoRegional = config?.comandoRegional || "CPRC-BTS";

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-5 text-slate-800">
      {/* Banner do Dashboard com Ícone do Sistema e Hierarquia Oficial (Cabeçalho Fundo Preto) */}
      <div className="relative overflow-hidden bg-black text-white border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Apenas o ícone do sistema */}
          <div className="shrink-0 flex items-center">
            <img
              src={config?.iconeSistemaUrl || "/assets/icone_frota_19cipm.jpg"}
              alt="Ícone do Sistema"
              referrerPolicy="no-referrer"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-neutral-700 shadow-xs"
              title="Ícone da Frota"
            />
          </div>
          <div>
            <h1 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-wide text-white leading-tight">
              19º COMPANHIA INDEPENDENTE DE POLÍCIA MILITAR
            </h1>
            <h2 className="text-xs sm:text-sm font-bold uppercase text-neutral-300 tracking-wider mt-0.5">
              SEÇÃO DE APOIO ADMINISTRATIVO
            </h2>
            <h3 className="text-xs sm:text-sm font-semibold uppercase text-neutral-400 tracking-wider">
              SETOR DE TRANSPORTE E MANUTENÇÃO
            </h3>
          </div>
        </div>
      </div>

      {/* 4 Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Frota */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase">Total da Frota</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {totalViaturas}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
              <span className="font-semibold">{totalCarros} Carros</span>
              <span>•</span>
              <span className="font-semibold">{totalMotos} Motos</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
            <Car className="w-6 h-6" />
          </div>
        </div>

        {/* Disponíveis (Verde) */}
        <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-700 font-bold uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Disponíveis
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
              {disponiveis}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Prontas para empenho
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Indisponíveis / Em Carga (Vermelho) */}
        <div className="bg-white border border-red-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-red-700 font-bold uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Indisponíveis / Em Carga
            </span>
            <div className="text-2xl sm:text-3xl font-black text-red-700 mt-1">
              {indisponiveis}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Em ronda / operação
            </div>
          </div>
          <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Manutenção (Amarelo) */}
        <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-700 font-bold uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Em Manutenção
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-1">
              {manutencao}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Oficina / Revisão
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Wrench className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Status da Frota em Tempo Real + Alertas de Revisão */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Viaturas e Disponibilidade */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-700" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Prontidão da Frota - {unidade}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("cadastro-viaturas")}
              className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Gerenciar Viaturas</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cards Grid of All Viaturas */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {viaturas.map((v) => {
              const isCar = v.tipo === "carro";
              const isDisp = v.status === "disponivel";
              const isIndisp = v.status === "indisponivel";

              return (
                <div
                  key={v.id}
                  className={`p-3 rounded-xl border transition flex flex-col justify-between ${
                    isDisp
                      ? "bg-white border-emerald-200 hover:border-emerald-400 hover:shadow-xs"
                      : isIndisp
                      ? "bg-white border-red-200 hover:border-red-400 hover:shadow-xs"
                      : "bg-white border-amber-200 hover:border-amber-400 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black text-slate-900 tracking-wide">
                      {v.prefixo}
                    </span>
                    {isCar ? (
                      <Car className="w-3.5 h-3.5 text-blue-700" />
                    ) : (
                      <Bike className="w-3.5 h-3.5 text-amber-600" />
                    )}
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 font-bold truncate mb-2">
                    {v.placa}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        isDisp
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : isIndisp
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {v.status}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono font-medium">
                      {v.kmAtual ? `${Math.round(v.kmAtual / 1000)}k` : "0k"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumo Financeiro e Alertas de Revisão */}
        <div className="space-y-4">
          {/* Card Gastos */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Gastos com Manutenção
              </span>
              <button
                type="button"
                onClick={() => onNavigateTab("gastos-manutencao")}
                className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold cursor-pointer"
              >
                Ver Detalhes
              </button>
            </div>
            <div className="text-xl font-black text-emerald-700 font-mono">
              {formatarMoedaBRL(totalGastosGeral)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Soma total acumulada de manutenções em viaturas cadastradas.
            </p>
          </div>

          {/* Card Revisões */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                Alertas de Revisão
              </span>
              <button
                type="button"
                onClick={() => onNavigateTab("controle-revisoes")}
                className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold cursor-pointer"
              >
                Ver Todas
              </button>
            </div>

            <div className="space-y-2">
              {revisoesProximas.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-2">
                  Nenhuma revisão pendente no momento.
                </div>
              ) : (
                revisoesProximas.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{r.prefixo}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({r.placa})</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                        {r.tipoServico}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-amber-700 font-bold block">
                        {Number(r.kmProximaRevisao || 0).toLocaleString("pt-BR")} KM
                      </span>
                      <span className="text-[9px] text-slate-500">{r.dataProximaRevisao}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Atividades Recentes (Últimos Checklists & Cargas) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Últimos Checklists Salvos */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-blue-700" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Últimos Relatórios de Vistoria
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("relatorios")}
              className="text-xs text-blue-700 hover:text-blue-900 font-semibold cursor-pointer"
            >
              Ver Relatórios
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentChecklists.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 italic">
                Nenhum checklist registrado ainda.
              </div>
            ) : (
              recentChecklists.map((chk) => (
                <div key={chk.id} className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-1 rounded transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{chk.prefixo}</span>
                      <span className="text-[10px] font-mono text-slate-500 font-semibold">
                        {chk.placa}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-medium">
                        {chk.tipoViatura}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 uppercase mt-0.5">
                      Condutor: {chk.nomeCondutor}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-slate-700 font-semibold block">{chk.dataCarga}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{chk.horaCarga}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Últimas Cargas de Viatura */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-700" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Últimas Cargas de Viaturas
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("carga-viaturas")}
              className="text-xs text-blue-700 hover:text-blue-900 font-semibold cursor-pointer"
            >
              Ver Cargas
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentCargas.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 italic">
                Nenhum registro de carga ainda.
              </div>
            ) : (
              recentCargas.map((crg) => (
                <div key={crg.id} className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-1 rounded transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-800">{crg.prefixo}</span>
                      <span className="text-[10px] font-mono text-slate-500 font-semibold">
                        {crg.placa}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 uppercase mt-0.5">
                      {crg.nomeMotorista}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-amber-700 block">
                      {crg.kmRodado ? `${crg.kmRodado} KM Rodados` : "Em ronda"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{crg.dataCarga}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
