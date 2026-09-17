import React, { useState, useEffect } from "react";
import {
  Car,
  Save,
  RotateCcw,
  CheckCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  Edit3
} from "lucide-react";
import {
  Checklist,
  StatusChecklistItem,
  NivelCombustivel,
  AvariaPoint,
  Usuario,
  ConfigSistema
} from "../types";
import {
  PREFIXOS_CARRO_PADRAO,
  PLACAS_PADRAO,
  UOPS_PADRAO,
  TURNOS_PADRAO,
  ITENS_VERIFICADOS_CARRO,
  formatarPlaca,
  formatarPrefixo
} from "../constants";
import { MarcadorCombustivel } from "./MarcadorCombustivel";
import { DiagramaAvariasCarro } from "./DiagramaAvariasCarro";
import { CanvasAssinatura } from "./CanvasAssinatura";

interface ChecklistCarroViewProps {
  onSave: (checklist: Checklist) => void;
  onCancel: () => void;
  currentUser: Usuario | null;
  existingChecklist?: Checklist | null;
  diagramaCarroUrl?: string;
  config?: ConfigSistema;
}

export const ChecklistCarroView: React.FC<ChecklistCarroViewProps> = ({
  onSave,
  onCancel,
  currentUser,
  existingChecklist,
  diagramaCarroUrl,
  config,
}) => {
  const activeDiagramaCarro =
    existingChecklist?.diagramaUrl ||
    diagramaCarroUrl ||
    config?.diagramaCarroUrl ||
    "/assets/viatura_carro_duster.jpg";

  // Form State - opens unpopulated for new checklists to avoid accidental submission of default data
  const [dataCarga, setDataCarga] = useState<string>(
    existingChecklist?.dataCarga || ""
  );
  const [horaCarga, setHoraCarga] = useState<string>(
    existingChecklist?.horaCarga || ""
  );

  // Dropdown or manual selection for Prefixo, Placa, UOp, Turno
  const [prefixo, setPrefixo] = useState<string>(existingChecklist?.prefixo || "");
  const [prefixoManual, setPrefixoManual] = useState<boolean>(false);

  const [placa, setPlaca] = useState<string>(existingChecklist?.placa || "");
  const [placaManual, setPlacaManual] = useState<boolean>(false);

  const [uop, setUop] = useState<string>(existingChecklist?.uop || "");
  const [uopManual, setUopManual] = useState<boolean>(false);

  const [turno, setTurno] = useState<string>(existingChecklist?.turnoServico || "");
  const [turnoManual, setTurnoManual] = useState<boolean>(false);

  const [kmInicial, setKmInicial] = useState<string>(
    existingChecklist?.kmInicial ? String(existingChecklist.kmInicial) : ""
  );
  const [nomeCondutor, setNomeCondutor] = useState<string>(
    existingChecklist?.nomeCondutor || ""
  );
  const [matricula, setMatricula] = useState<string>(
    existingChecklist?.matricula || ""
  );

  // 46 items verification
  const [itens, setItens] = useState<Record<string, StatusChecklistItem>>(() => {
    if (existingChecklist?.itensVerificados) {
      return existingChecklist.itensVerificados;
    }
    return {};
  });

  // Toggle all items between S/A and unselected/CA
  const [allSA, setAllSA] = useState<boolean>(false);

  // Combustível
  const [nivelCombustivel, setNivelCombustivel] = useState<NivelCombustivel>(
    existingChecklist?.nivelCombustivel || ("" as NivelCombustivel)
  );

  // Avarias
  const [avarias, setAvarias] = useState<AvariaPoint[]>(existingChecklist?.avarias || []);

  // Observações
  const [observacoes, setObservacoes] = useState<string>(existingChecklist?.observacoes || "");

  // Assinatura e Despachante
  const [assinatura, setAssinatura] = useState<string>(existingChecklist?.assinaturaMotorista || "");
  const [vistoDespachante, setVistoDespachante] = useState<string>(
    existingChecklist?.vistoDespachante || ""
  );

  // Errors state
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Format manual license plate on change
  const handlePlacaChange = (val: string) => {
    setPlaca(formatarPlaca(val));
  };

  // Format manual prefix on change
  const handlePrefixoChange = (val: string) => {
    setPrefixo(formatarPrefixo(val));
  };

  // Toggle "Selecionar Todos (S/A)"
  const handleToggleAllSA = () => {
    const nextState = !allSA;
    setAllSA(nextState);
    const updated: Record<string, StatusChecklistItem> = {};
    ITENS_VERIFICADOS_CARRO.forEach((item) => {
      updated[item] = nextState ? "SA" : "IF";
    });
    setItens(updated);
  };

  const handleItemStatusChange = (item: string, status: StatusChecklistItem) => {
    setItens((prev) => ({
      ...prev,
      [item]: status,
    }));
  };

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!dataCarga) errs.push("Data da carga é obrigatória.");
    if (!horaCarga) errs.push("Hora da carga é obrigatória.");
    if (!prefixo || prefixo.trim().length < 2) errs.push("Prefixo da viatura é obrigatório.");
    if (!placa || placa.trim().length < 4) errs.push("Placa do veículo é obrigatória.");
    if (!kmInicial || isNaN(Number(kmInicial)) || Number(kmInicial) < 0) {
      errs.push("KM Inicial válido é obrigatório.");
    }
    if (!nomeCondutor || nomeCondutor.trim().length < 3) errs.push("Nome do condutor é obrigatório.");
    if (!matricula || matricula.trim().length < 3) errs.push("Matrícula do condutor é obrigatória.");
    if (!uop) errs.push("UOp é obrigatória.");
    if (!turno) errs.push("Turno de serviço é obrigatório.");
    if (!nivelCombustivel) errs.push("Nível de combustível é obrigatório.");
    if (!assinatura) errs.push("A assinatura digital do motorista é estritamente obrigatória.");

    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    const nowIso = new Date().toISOString();
    const dataHoraAssinatura = new Date().toLocaleString("pt-BR");

    const chk: Checklist = {
      id: existingChecklist?.id || "chk-car-" + Date.now(),
      tipoViatura: "4 rodas",
      dataCarga,
      horaCarga,
      placa: placa.toUpperCase().trim(),
      prefixo: prefixo.toUpperCase().trim(),
      kmInicial: Number(kmInicial),
      nomeCondutor: nomeCondutor.toUpperCase().trim(),
      matricula: matricula.trim(),
      uop: uop.toUpperCase().trim(),
      turnoServico: turno,
      itensVerificados: itens,
      nivelCombustivel,
      avarias,
      observacoes,
      assinaturaMotorista: assinatura,
      dataHoraAssinatura,
      vistoDespachante: vistoDespachante.toUpperCase().trim(),
      statusViatura: "indisponivel",
      diagramaUrl: activeDiagramaCarro,
      createdAt: existingChecklist?.createdAt || nowIso,
      updatedAt: nowIso,
    };

    onSave(chk);
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 px-2 sm:px-4 pt-4 text-slate-800">
      {/* Page Title Card (Cabeçalho com fundo preto e letras brancas) */}
      <div className="bg-black text-white border border-neutral-800 rounded-xl p-4 mb-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-neutral-900 text-white rounded-xl border border-neutral-700">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-white">
                {existingChecklist ? "Editar Checklist de Viatura (4 Rodas)" : "Novo Checklist de Viatura (4 Rodas)"}
              </h2>
              <p className="text-xs text-neutral-300">
                {config?.unidade || "19ª CIPM"} • Formulário Oficial de Vistoria e Carga de Viatura
              </p>
            </div>
          </div>
          <div className="text-xs text-white font-mono font-bold bg-neutral-900 px-3 py-1 rounded-md border border-neutral-700 self-start sm:self-auto">
            46 Itens de Verificação
          </div>
        </div>

        {/* Validation Errors Notice */}
        {errors.length > 0 && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-red-700">
              <AlertTriangle className="w-4 h-4" />
              Por favor, preencha os campos obrigatórios antes de salvar:
            </div>
            <ul className="list-disc list-inside space-y-0.5">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1 - DADOS DA CARGA */}
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="bg-black text-white px-4 py-2.5 flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white text-black font-extrabold flex items-center justify-center text-xs">
                1
              </span>
              Dados da Carga
            </h3>
            <span className="text-[11px] text-neutral-300 font-medium">* Campos obrigatórios</span>
          </div>

          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Data da Carga */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data da Carga *
              </label>
              <input
                type="date"
                required
                value={dataCarga}
                onChange={(e) => setDataCarga(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Hora da Carga */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hora da Carga *
              </label>
              <input
                type="time"
                required
                value={horaCarga}
                onChange={(e) => setHoraCarga(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Prefixo com Lista suspensa + manual */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Prefixo da Viatura *
                </label>
                <button
                  type="button"
                  onClick={() => setPrefixoManual(!prefixoManual)}
                  className="text-[10px] text-blue-700 hover:text-blue-900 font-medium cursor-pointer"
                >
                  {prefixoManual ? "Usar Lista" : "Digitar Manual"}
                </button>
              </div>
              {prefixoManual ? (
                <input
                  type="text"
                  placeholder="Ex: 9.1901 ou R.0061"
                  value={prefixo}
                  onChange={(e) => handlePrefixoChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-bold tracking-wider uppercase focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              ) : (
                <select
                  value={prefixo}
                  onChange={(e) => setPrefixo(e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="">Selecione o Prefixo...</option>
                  {PREFIXOS_CARRO_PADRAO.map((pref) => (
                    <option key={pref} value={pref}>
                      {pref}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Placa com Lista suspensa + manual (com formatação automática) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Placa do Veículo *
                </label>
                <button
                  type="button"
                  onClick={() => setPlacaManual(!placaManual)}
                  className="text-[10px] text-blue-700 hover:text-blue-900 font-medium cursor-pointer"
                >
                  {placaManual ? "Usar Lista" : "Digitar Manual"}
                </button>
              </div>
              {placaManual ? (
                <input
                  type="text"
                  placeholder="Ex: RPV 9G24"
                  value={placa}
                  onChange={(e) => handlePlacaChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-bold uppercase tracking-wider focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              ) : (
                <select
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono font-bold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="">Selecione a Placa...</option>
                  {PLACAS_PADRAO.map((plc) => (
                    <option key={plc} value={plc}>
                      {plc}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* KM Inicial */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                KM Inicial *
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="Ex: 45200"
                value={kmInicial}
                onChange={(e) => setKmInicial(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Turno de Serviço com Lista suspensa + manual */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Turno de Serviço *
                </label>
                <button
                  type="button"
                  onClick={() => setTurnoManual(!turnoManual)}
                  className="text-[10px] text-blue-700 hover:text-blue-900 font-medium cursor-pointer"
                >
                  {turnoManual ? "Usar Lista" : "Digitar Manual"}
                </button>
              </div>
              {turnoManual ? (
                <input
                  type="text"
                  placeholder="Ex: 12h ou 24h Especial"
                  value={turno}
                  onChange={(e) => setTurno(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              ) : (
                <select
                  value={turno}
                  onChange={(e) => setTurno(e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="">Selecione o Turno...</option>
                  {TURNOS_PADRAO.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Nome do Condutor */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome do Condutor / Motorista *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Sd PM Silva"
                value={nomeCondutor}
                onChange={(e) => setNomeCondutor(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 uppercase focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Matrícula */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Matrícula *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: 30.123.456-7"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Unidade Operacional (UOp) com Lista suspensa + manual */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Unidade Operacional (UOp) *
                </label>
                <button
                  type="button"
                  onClick={() => setUopManual(!uopManual)}
                  className="text-[10px] text-blue-700 hover:text-blue-900 font-medium cursor-pointer"
                >
                  {uopManual ? "Usar Lista" : "Digitar Manual"}
                </button>
              </div>
              {uopManual ? (
                <input
                  type="text"
                  placeholder="Ex: 19ªCIPM"
                  value={uop}
                  onChange={(e) => setUop(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              ) : (
                <select
                  value={uop}
                  onChange={(e) => setUop(e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="">Selecione a UOp...</option>
                  {UOPS_PADRAO.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* NOME DO DESPACHANTE */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NOME DO DESPACHANTE
              </label>
              <input
                type="text"
                placeholder="Ex: SGT PM J. SOUZA"
                value={vistoDespachante}
                onChange={(e) => setVistoDespachante(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 uppercase focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>
      </section>

        {/* 2 - ITENS VERIFICADOS */}
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="bg-black text-white px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white text-black font-extrabold flex items-center justify-center text-xs">
                  2
                </span>
                Itens Verificados (46 Itens)
              </h3>
              {/* Legenda Obrigatória */}
              <div className="flex items-center gap-2 mt-1 text-[11px] font-semibold flex-wrap text-white">
                <span className="text-emerald-300">S/A = Sem Alteração</span>
                <span className="text-neutral-500">•</span>
                <span className="text-amber-300">I/F = Inexiste/Faltando</span>
                <span className="text-neutral-500">•</span>
                <span className="text-red-300">C/A = Com Alteração</span>
              </div>
            </div>

            {/* Botão Selecionar Todos S/A */}
            <button
              type="button"
              id="btn-toggle-todos-sa"
              onClick={handleToggleAllSA}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer ${
                allSA
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-600"
              }`}
            >
              <CheckCheck className="w-4 h-4" />
              <span>{allSA ? "Todos Marcados como S/A" : "Selecionar Todos (S/A)"}</span>
            </button>
          </div>

          <div className="p-4 sm:p-5">

          {/* Grid of 46 items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-4">
            {ITENS_VERIFICADOS_CARRO.map((item, idx) => {
              const currentStatus = itens[item];

              return (
                <div
                  key={item}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between gap-2 hover:border-slate-300 transition"
                >
                  <span className="text-xs text-slate-700 font-medium truncate flex-1" title={item}>
                    <span className="text-[10px] text-slate-400 mr-1 font-mono font-bold">{idx + 1}.</span>
                    {item}
                  </span>

                  {/* 3 Status Options: SA, IF, CA */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleItemStatusChange(item, "SA")}
                      title="Sem Alteração"
                      className={`px-2 py-1 text-[10px] font-black rounded transition cursor-pointer ${
                        currentStatus === "SA"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      S/A
                    </button>
                    <button
                      type="button"
                      onClick={() => handleItemStatusChange(item, "IF")}
                      title="Inexiste ou Faltando"
                      className={`px-2 py-1 text-[10px] font-black rounded transition cursor-pointer ${
                        currentStatus === "IF"
                          ? "bg-amber-600 text-white shadow-xs"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      I/F
                    </button>
                    <button
                      type="button"
                      onClick={() => handleItemStatusChange(item, "CA")}
                      title="Com Alteração (Avaria)"
                      className={`px-2 py-1 text-[10px] font-black rounded transition cursor-pointer ${
                        currentStatus === "CA"
                          ? "bg-red-600 text-white shadow-xs"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      C/A
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </section>

        {/* 3 - NÍVEL DE COMBUSTÍVEL */}
        <section>
          <MarcadorCombustivel
            value={nivelCombustivel}
            onChange={setNivelCombustivel}
          />
        </section>

        {/* 4 - DIAGRAMA DE AVARIAS */}
        <section>
          <DiagramaAvariasCarro
            avarias={avarias}
            onChange={setAvarias}
            imageUrl={activeDiagramaCarro}
          />
        </section>

        {/* 5 - OBSERVAÇÕES */}
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="bg-black text-white px-4 py-2.5 flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white text-black font-extrabold flex items-center justify-center text-xs">
                5
              </span>
              Observações
            </h3>
            <span className="text-[11px] text-neutral-300 font-medium">Avarias e detalhes adicionais</span>
          </div>
          <div className="p-4 sm:p-5">
            <textarea
              rows={3}
              placeholder="Descreva aqui quaisquer observações ou detalhes mecânicos, elétricos ou de funilaria da viatura..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </section>

        {/* 6 - ASSINATURA */}
        <section className="space-y-4">
          <CanvasAssinatura
            value={assinatura}
            onChange={setAssinatura}
            nomeCondutor={nomeCondutor}
            matricula={matricula}
          />
        </section>

        {/* ACTION BUTTONS */}
        <div className="sticky bottom-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200 p-3 sm:p-4 rounded-t-xl shadow-lg flex items-center justify-between gap-3">
          <button
            type="button"
            id="btn-cancelar-checklist"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition border border-slate-300 cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="submit"
            id="btn-salvar-checklist"
            disabled={submitting}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm transition shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar e Enviar Checklist</span>
          </button>
        </div>
      </form>
    </div>
  );
};
