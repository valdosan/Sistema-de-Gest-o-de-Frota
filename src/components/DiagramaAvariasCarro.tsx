import React, { useState, useRef } from "react";
import { AlertCircle, Info } from "lucide-react";
import { AvariaPoint } from "../types";

interface DiagramaAvariasCarroProps {
  avarias: AvariaPoint[];
  onChange: (avarias: AvariaPoint[]) => void;
  disabled?: boolean;
  imageUrl?: string;
}

export const DiagramaAvariasCarro: React.FC<DiagramaAvariasCarroProps> = ({
  avarias,
  onChange,
  disabled = false,
  imageUrl = "/assets/viatura_carro_duster.jpg",
}) => {
  const [activeTipo, setActiveTipo] = useState<AvariaPoint["tipo"]>("Amassado");
  const [descricaoInput, setDescricaoInput] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDiagramClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    // Identify which angle the point belongs to (4 views)
    let view = "Lateral Esquerda";
    if (x < 55 && y < 50) view = "Lateral Esquerda (LE)";
    else if (x >= 55 && y < 50) view = "Frente (Dianteira)";
    else if (x < 55 && y >= 50) view = "Lateral Direita (LD)";
    else view = "Traseira";

    const newAvaria: AvariaPoint = {
      id: "av-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
      x,
      y,
      view,
      tipo: activeTipo,
      descricao: descricaoInput.trim() || `${activeTipo} em ${view}`,
    };

    onChange([...avarias, newAvaria]);
    setDescricaoInput("");
  };

  const removeAvaria = (id: string) => {
    if (disabled) return;
    onChange(avarias.filter((a) => a.id !== id));
  };

  return (
    <div id="diagrama-avarias-carro" className="bg-white border border-slate-200 rounded-xl overflow-hidden text-slate-800 shadow-xs">
      {/* Header (Fundo preto e letras brancas) */}
      <div className="bg-black text-white px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-neutral-900 text-red-400 rounded-lg border border-neutral-700">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <span>4. Diagrama de Avarias - Viatura 4 Rodas</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-200 border border-neutral-700">
                Renault Duster PMBA
              </span>
            </h4>
            <p className="text-[11px] text-neutral-300">
              Toque ou clique em qualquer ponto da viatura para marcar a avaria constatada no local exato.
            </p>
          </div>
        </div>
        <div className="text-xs font-bold px-3 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-200">
          {avarias.length} {avarias.length === 1 ? "avaria registrada" : "avarias registradas"}
        </div>
      </div>

      <div className="p-4">

      {/* Controls: Type and Description */}
      {!disabled && (
        <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-bold">Tipo de Avaria:</span>
            <select
              id="select-tipo-avaria"
              value={activeTipo}
              onChange={(e) => setActiveTipo(e.target.value as AvariaPoint["tipo"])}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500 font-semibold"
            >
              <option value="Amassado">Amassado</option>
              <option value="Arranhão">Arranhão</option>
              <option value="Trinca">Trinca</option>
              <option value="Quebrado">Quebrado</option>
              <option value="Faltando">Faltando</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div className="flex-1 min-w-[220px]">
            <input
              type="text"
              id="input-desc-avaria"
              placeholder="Descrição ou detalhe (ex: parachoque dianteiro ralado)"
              value={descricaoInput}
              onChange={(e) => setDescricaoInput(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            <span>Clique na viatura para fixar o ponto</span>
          </div>
        </div>
      )}

      {/* Interactive Blueprint Canvas Container */}
      <div
        ref={containerRef}
        onClick={handleDiagramClick}
        id="canvas-diagrama-carro"
        className={`relative mt-4 bg-slate-50 border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl overflow-hidden cursor-crosshair select-none p-2 transition flex items-center justify-center ${
          disabled ? "pointer-events-none" : ""
        }`}
        style={{ minHeight: "340px" }}
      >
        {/* Quadrant Guide Badges */}
        <div className="absolute top-2 left-2 pointer-events-none z-10 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-slate-200 text-[10px] font-bold text-slate-700 shadow-xs">
          LATERAL ESQUERDA (MOTORISTA)
        </div>
        <div className="absolute top-2 right-2 pointer-events-none z-10 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-slate-200 text-[10px] font-bold text-slate-700 shadow-xs">
          FRENTE (DIANTEIRA)
        </div>
        <div className="absolute bottom-2 left-2 pointer-events-none z-10 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-slate-200 text-[10px] font-bold text-slate-700 shadow-xs">
          LATERAL DIREITA (PASSAGEIRO)
        </div>
        <div className="absolute bottom-2 right-2 pointer-events-none z-10 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-slate-200 text-[10px] font-bold text-slate-700 shadow-xs">
          TRASEIRA
        </div>

        {/* Subdued subtle dividing crosshairs */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-full h-px bg-slate-200/60"></div>
        </div>
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="h-full w-px bg-slate-200/60"></div>
        </div>

        {/* The 4-views Patrol Car Image (Imagem 1) */}
        <img
          src={imageUrl}
          alt="Diagrama Viatura Renault Duster PMBA"
          referrerPolicy="no-referrer"
          className="w-full h-auto max-h-[460px] object-contain pointer-events-none drop-shadow-sm select-none"
        />

        {/* Interactive Damage Pins */}
        {avarias.map((av, index) => (
          <div
            key={av.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
            style={{ left: `${av.x}%`, top: `${av.y}%` }}
            onClick={(e) => {
              e.stopPropagation();
              removeAvaria(av.id);
            }}
            title={`${index + 1}: ${av.tipo} - ${av.descricao} (Clique para remover)`}
          >
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-red-400 opacity-75"></span>
              <div className="relative w-6 h-6 rounded-full bg-red-600 border-2 border-white text-white font-bold text-[11px] flex items-center justify-center shadow-md hover:scale-125 transition-transform">
                {index + 1}
              </div>
            </div>

            {/* Tooltip on Hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none whitespace-nowrap z-30">
              <div className="bg-slate-900 text-white text-[10px] font-semibold px-2 py-1 rounded shadow-lg">
                Marcação #{index + 1} ({av.view}) - Clique para remover
              </div>
              <div className="w-2 h-1 bg-slate-900 clip-triangle"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info (sem lista textual de avarias, apenas as marcações na imagem) */}
      <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span>
          {avarias.length === 0
            ? "Nenhuma avaria assinalada na imagem."
            : `${avarias.length} marcação(ões) fixada(s) exatamente no local indicado.`}
        </span>
        {!disabled && avarias.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-red-600 hover:text-red-700 font-medium text-xs hover:underline cursor-pointer"
          >
            Limpar todas as marcações
          </button>
        )}
      </div>
      </div>
    </div>
  );
};
