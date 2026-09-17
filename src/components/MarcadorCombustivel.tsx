import React from "react";
import { Fuel } from "lucide-react";
import { NivelCombustivel } from "../types";

interface MarcadorCombustivelProps {
  value: NivelCombustivel;
  onChange: (level: NivelCombustivel) => void;
  disabled?: boolean;
}

const NIVEIS: NivelCombustivel[] = ["R", "1", "2", "3", "4", "5", "6", "7", "8"];

// Heights in pixels or percent for progressive height bars
const ALTURAS = {
  R: "h-6",
  "1": "h-7",
  "2": "h-9",
  "3": "h-11",
  "4": "h-13",
  "5": "h-15",
  "6": "h-17",
  "7": "h-19",
  "8": "h-21"
};

export const MarcadorCombustivel: React.FC<MarcadorCombustivelProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  // Determine if a given level is active (at or below the selected level)
  const isLevelActive = (lvl: NivelCombustivel): boolean => {
    if (!value) return false;
    const selectedIdx = NIVEIS.indexOf(value);
    const currIdx = NIVEIS.indexOf(lvl);
    return currIdx <= selectedIdx;
  };

  return (
    <div id="marcador-combustivel-container" className="bg-white border border-slate-200 rounded-xl overflow-hidden text-slate-800 shadow-xs">
      <div className="bg-black text-white px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-neutral-900 text-amber-400 rounded-lg border border-neutral-700">
            <Fuel className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-neutral-300 font-bold block">
              3. Nível de Combustível *
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-white">
              {value === "R" ? "RESERVA CRÍTICA (R)" : value ? `Nível ${value}/8 do Tanque` : "Selecione o nível"}
            </span>
          </div>
        </div>
        <div className="text-xs bg-neutral-900 px-3 py-1 rounded-full border border-neutral-700 font-bold text-neutral-200">
          {value ? `Marcado: ${value}` : "Obrigatório"}
        </div>
      </div>

      <div className="p-4">

      {/* Fuel Gauge Bar Display */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-end justify-between gap-1.5 sm:gap-3 h-24 px-2 pt-2">
          {NIVEIS.map((lvl) => {
            const active = isLevelActive(lvl);
            const isSelected = value === lvl;
            const isReserve = lvl === "R";

            let barColor = "bg-slate-200 border-slate-300";
            if (active) {
              if (isReserve) {
                barColor = "bg-red-500 border-red-600 shadow-xs shadow-red-500/50";
              } else if (["1", "2"].includes(lvl)) {
                barColor = "bg-amber-500 border-amber-600 shadow-xs shadow-amber-500/50";
              } else {
                barColor = "bg-emerald-500 border-emerald-600 shadow-xs shadow-emerald-500/50";
              }
            }

            return (
              <button
                key={lvl}
                type="button"
                disabled={disabled}
                onClick={() => onChange(lvl)}
                className={`flex-1 flex flex-col items-center justify-end group transition-all duration-150 cursor-pointer ${
                  disabled ? "cursor-not-allowed opacity-60" : ""
                }`}
              >
                {/* Bar */}
                <div
                  className={`w-full rounded-t-md border transition-all ${ALTURAS[lvl]} ${barColor} ${
                    isSelected ? "ring-2 ring-blue-600 scale-105" : "group-hover:opacity-90"
                  }`}
                />

                {/* Level Label */}
                <span
                  className={`mt-2 text-xs font-bold font-mono transition ${
                    isSelected
                      ? isReserve
                        ? "text-red-600 font-extrabold"
                        : "text-blue-700 font-extrabold"
                      : isReserve
                      ? "text-red-500"
                      : "text-slate-600"
                  }`}
                >
                  {lvl === "R" ? "R" : `${lvl}/8`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-200 px-1 font-medium">
          <span className="flex items-center gap-1 text-red-600 font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Vazio / Reserva (R)
          </span>
          <span className="flex items-center gap-1 text-amber-600 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            1/4 a 1/2
          </span>
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Tanque Cheio (8/8)
          </span>
        </div>
      </div>
    </div>
  </div>
  );
};
