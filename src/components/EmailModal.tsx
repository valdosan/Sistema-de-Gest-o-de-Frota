import React, { useState } from "react";
import { Mail, Send, Copy, Check, X } from "lucide-react";
import { Checklist, ConfigSistema } from "../types";

interface EmailModalProps {
  checklist: Checklist;
  onClose: () => void;
  config?: ConfigSistema;
}

export const EmailModal: React.FC<EmailModalProps> = ({ checklist, onClose, config }) => {
  const [destinatario, setDestinatario] = useState<string>("19cipm.spo@pm.ba.gov.br");
  const [copiado, setCopiado] = useState<boolean>(false);

  const unidade = config?.unidade || "19ª CIPM / PARIPE";
  const subTitulo = config?.subTitulo || "POLÍCIA MILITAR DA BAHIA";
  const orgaoSuperior = config?.orgaoSuperior || "COMANDO DE POLICIAMENTO REGIONAL DA CAPITAL - BTS";

  const assunto = `[CHECKLIST ${unidade}] Vistoria ${checklist.tipoViatura.toUpperCase()} - Prefixo ${checklist.prefixo} - Placa ${checklist.placa}`;

  const corpo = `${subTitulo.toUpperCase()}
${orgaoSuperior.toUpperCase()}
${unidade.toUpperCase()}
SPO - SEÇÃO DE PLANEJAMENTO OPERACIONAL E FROTAS

============================================================
RELATÓRIO OFICIAL DE VISTORIA / CHECKLIST
============================================================

1. DADOS DA CARGA:
- Tipo de Viatura: ${checklist.tipoViatura.toUpperCase()}
- Prefixo: ${checklist.prefixo}
- Placa: ${checklist.placa}
- Data da Carga: ${checklist.dataCarga}
- Hora da Carga: ${checklist.horaCarga}
- KM Inicial: ${Number(checklist.kmInicial || 0).toLocaleString("pt-BR")} KM
- Turno de Serviço: ${checklist.turnoServico}
- Condutor: ${checklist.nomeCondutor.toUpperCase()}
- Matrícula: ${checklist.matricula}
- Unidade Operacional (UOp): ${checklist.uop}

2. NÍVEL DE COMBUSTÍVEL:
- Nível Registrado: ${checklist.nivelCombustivel === "R" ? "RESERVA" : `${checklist.nivelCombustivel}/8`}

3. AVARIAS E DANOS IDENTIFICADOS:
${
  checklist.avarias.length === 0
    ? "- Nenhuma avaria registrada na lataria ou carenagem."
    : checklist.avarias
        .map((av, idx) => `- Avaria ${idx + 1}: ${av.tipo.toUpperCase()} (${av.descricao})`)
        .join("\n")
}

4. OBSERVAÇÕES GERAIS:
${checklist.observacoes ? checklist.observacoes : "- Nenhuma observação adicional."}

5. ASSINATURA E CONFORMIDADE:
- Data e Hora do Registro: ${checklist.dataHoraAssinatura || new Date().toLocaleString("pt-BR")}
- Assinatura Digital do Condutor: Coletada eletronicamente no sistema.
- Visto do Despachante: ${checklist.vistoDespachante || "SGT PM DESPACHANTE DE DIA"}

Documento gerado eletronicamente pelo Sistema de Gestão de Frota - ${unidade}.`;

  const handleOpenMailto = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(destinatario)}?subject=${encodeURIComponent(
      assunto
    )}&body=${encodeURIComponent(corpo)}`;
    window.open(mailtoUrl, "_blank");
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(corpo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-lg w-full shadow-2xl text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Enviar Checklist por E-mail
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              E-mail de Destino:
            </label>
            <input
              type="email"
              value={destinatario}
              onChange={(e) => setDestinatario(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Assunto:</label>
            <input
              type="text"
              readOnly
              value={assunto}
              className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-600"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Pré-visualização do Relatório:
            </label>
            <textarea
              readOnly
              rows={8}
              value={corpo}
              className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-800 font-mono text-[11px]"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 cursor-pointer"
            >
              {copiado ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiado ? "Copiado!" : "Copiar Texto"}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs border border-slate-300 cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handleOpenMailto}
                className="flex items-center gap-1.5 px-4 py-2 rounded bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Abrir no E-mail</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
