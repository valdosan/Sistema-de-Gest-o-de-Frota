import * as XLSX from "xlsx";

/**
 * Normaliza o nome da chave para comparação sem acento e em minúsculas
 */
export const normalizeKey = (str: string): string => {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");
};

/**
 * Lê arquivo Excel (.xlsx, .xls ou .csv) e retorna array de objetos JS
 */
export const parseExcelFile = async (file: File): Promise<Array<Record<string, any>>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          resolve([]);
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        // Converte planilha para JSON com primeira linha como cabeçalho
        const rawJson: Array<Record<string, any>> = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
        });

        resolve(rawJson);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Encontra valor em linha usando múltiplos sinônimos de cabeçalho
 */
export const findValue = (row: Record<string, any>, possibleKeys: string[]): any => {
  const normalizedRowKeys = Object.keys(row).reduce((acc, k) => {
    acc[normalizeKey(k)] = row[k];
    return acc;
  }, {} as Record<string, any>);

  for (const key of possibleKeys) {
    const norm = normalizeKey(key);
    if (normalizedRowKeys[norm] !== undefined && normalizedRowKeys[norm] !== "") {
      return normalizedRowKeys[norm];
    }
  }
  return "";
};
