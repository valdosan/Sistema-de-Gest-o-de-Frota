import { CargaViatura, Viatura, Usuario } from "../types";

/**
 * Formata placa de veículo:
 * - Sempre em maiúsculas (independente de Caps Lock)
 * - Separa as 3 primeiras letras dos caracteres restantes por um espaço (ex: "RPV 9G24", "TGZ 3G81")
 */
export function formatPlaca(raw: string): string {
  if (!raw) return "";
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (cleaned.length <= 3) return cleaned;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)}`;
}

/**
 * Formata prefixo de viatura:
 * - Sempre em maiúsculas
 * - Ponto separando o primeiro número ou letra dos demais números (ex: "9.1901", "R.0061", "R.0058")
 */
export function formatPrefixo(raw: string): string {
  if (!raw) return "";
  const trimmed = raw.trim().toUpperCase();
  // Se já possui o ponto correto no segundo caractere (ex: 9.1901 ou R.0058), apenas limpa caracteres inválidos
  if (trimmed.length > 1 && trimmed[1] === ".") {
    const firstChar = trimmed[0];
    const rest = trimmed.slice(2).replace(/[^A-Z0-9]/g, "");
    return `${firstChar}.${rest}`;
  }
  const cleaned = trimmed.replace(/[^A-Z0-9]/g, "");
  if (cleaned.length <= 1) return cleaned;
  return `${cleaned[0]}.${cleaned.slice(1)}`;
}

/**
 * Formata data para o padrão brasileiro dd/mm/aaaa (ex: 14/09/2026)
 */
export function formatDateBR(dateStr?: string | null): string {
  if (!dateStr) return "";
  const trimmed = String(dateStr).trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) return trimmed;
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const [year, month, day] = trimmed.slice(0, 10).split("-");
    return `${day}/${month}/${year}`;
  }
  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch {
    // fallback
  }
  return trimmed;
}

/**
 * Exporta dados tabulares para planilha formatada (.xls)
 * com cabeçalho em PRETO (#000000) e letras em BRANCO (#FFFFFF),
 * colunas alinhadas e formatação mso para preservar textos como prefixo e placa.
 */
export function exportToExcelStyled({
  filename,
  title,
  headers,
  rows,
}: {
  filename: string;
  title?: string;
  headers: string[];
  rows: (string | number | undefined | null)[][];
}) {
  const cleanFilename = filename.endsWith(".xls")
    ? filename
    : `${filename.replace(/\.(csv|xlsx?)$/i, "")}.xls`;

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <style>
        body { font-family: Calibri, Arial, sans-serif; }
        .title-row {
          background-color: #000000;
          color: #FFFFFF;
          font-weight: bold;
          font-size: 14pt;
          text-align: center;
          padding: 12px;
        }
        table {
          border-collapse: collapse;
          width: 100%;
        }
        th {
          background-color: #000000 !important;
          color: #FFFFFF !important;
          font-weight: bold;
          font-size: 11pt;
          text-transform: uppercase;
          padding: 10px 8px;
          border: 1px solid #333333;
          text-align: center;
        }
        td {
          padding: 8px;
          border: 1px solid #D1D5DB;
          font-size: 10pt;
          color: #111827;
          mso-number-format: "\\@";
        }
        tr:nth-child(even) td {
          background-color: #F9FAFB;
        }
      </style>
    </head>
    <body>
      <table>
        ${
          title
            ? `<thead><tr><th colspan="${headers.length}" class="title-row">${title}</th></tr></thead>`
            : ""
        }
        <thead>
          <tr style="background-color: #000000;">
            ${headers
              .map(
                (h) =>
                  `<th style="background-color: #000000; color: #FFFFFF; font-weight: bold; border: 1px solid #333333; padding: 10px;">${h}</th>`
              )
              .join("")}
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) =>
                `<tr>${row
                  .map((val) => {
                    const str = val !== undefined && val !== null ? String(val) : "";
                    return `<td style="mso-number-format:'\\@'; border: 1px solid #D1D5DB; padding: 8px;">${str}</td>`;
                  })
                  .join("")}</tr>`
            )
            .join("")}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(["\uFEFF" + htmlContent], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = cleanFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Reorganiza carga de viaturas da mais recente para a mais antiga:
 * 1º Critério: Data da Carga (decrescente)
 * 2º Critério: Hora da Carga (decrescente)
 */
export function sortCargasDesc(cargas: CargaViatura[]): CargaViatura[] {
  return [...cargas].sort((a, b) => {
    // Normalizar datas para comparação YYYY-MM-DD
    const parseDateKey = (dStr?: string) => {
      if (!dStr) return "0000-00-00";
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dStr)) {
        const [d, m, y] = dStr.split("/");
        return `${y}-${m}-${d}`;
      }
      return dStr;
    };

    const dateA = parseDateKey(a.dataCarga);
    const dateB = parseDateKey(b.dataCarga);

    if (dateA !== dateB) {
      return dateB.localeCompare(dateA);
    }

    const timeA = a.horaCarga || "00:00";
    const timeB = b.horaCarga || "00:00";
    return timeB.localeCompare(timeA);
  });
}

/**
 * Reorganiza Cadastro de viaturas na sequência de prefixo de cima para baixo:
 * - Sequência iniciada com final 01 seguido de 02, 03, 04... até 90
 * - Viaturas reservas (ex: R.0058, R.0061) no final da lista
 */
export function sortViaturasByPrefixo(viaturas: Viatura[]): Viatura[] {
  return [...viaturas].sort((a, b) => {
    const prefA = (a.prefixo || "").trim().toUpperCase();
    const prefB = (b.prefixo || "").trim().toUpperCase();

    const isReservaA = prefA.startsWith("R");
    const isReservaB = prefB.startsWith("R");

    // Viaturas operacionais convencionais primeiro, reservas depois
    if (!isReservaA && isReservaB) return -1;
    if (isReservaA && !isReservaB) return 1;

    // Se ambas forem reservas (R.0058, R.0061)
    if (isReservaA && isReservaB) {
      const numA = parseInt(prefA.replace(/\D/g, "") || "0", 10);
      const numB = parseInt(prefB.replace(/\D/g, "") || "0", 10);
      return numA - numB;
    }

    // Para viaturas operacionais (ex: 9.1901, 9.1902, ..., 9.1990)
    // Extrai o sufixo numérico final (dois últimos dígitos)
    const digitsA = prefA.replace(/\D/g, "");
    const digitsB = prefB.replace(/\D/g, "");

    const suffixA = parseInt(digitsA.slice(-2) || digitsA || "0", 10);
    const suffixB = parseInt(digitsB.slice(-2) || digitsB || "0", 10);

    if (suffixA !== suffixB) {
      return suffixA - suffixB;
    }

    const fullNumA = parseInt(digitsA || "0", 10);
    const fullNumB = parseInt(digitsB || "0", 10);
    return fullNumA - fullNumB;
  });
}

/**
 * Reorganiza Gestão de Motoristas / Usuários em ordem alfabética pelo nome
 */
export function sortUsuariosAlfabetico(usuarios: Usuario[]): Usuario[] {
  return [...usuarios].sort((a, b) =>
    (a.nome || "").localeCompare(b.nome || "", "pt-BR", { sensitivity: "base" })
  );
}
