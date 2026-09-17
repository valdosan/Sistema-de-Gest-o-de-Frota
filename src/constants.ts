// Constants and default lists for 19ª CIPM / PARIPE Fleet Management
import {
  Viatura,
  Usuario,
  GastoManutencao,
  RevisaoViatura,
  ItemInventario,
  RegistroPneu,
  ConfigSistema,
  RegistroHigienizacao,
  RegistroManutencao
} from "./types";

export const PREFIXOS_CARRO_PADRAO = [
  "9.1901", "9.1902", "9.1903", "9.1904", "9.1905", "9.1906", "9.1907", "9.1908", "9.1909",
  "9.1910", "9.1911", "9.1912", "9.1913", "9.1914", "9.1915", "9.1916", "9.1917", "9.1918",
  "9.1919", "9.1920", "9.1921", "9.1922", "9.1923", "9.1924", "9.1925", "9.1990", "R.0058", "R.0061"
];

export const PREFIXOS_MOTO_PADRAO = [
  "9.1910", "9.1912", "9.1913", "9.1914", "9.1917", "9.1918", "9.1919", "9.1920"
];

export const PLACAS_PADRAO = [
  "RPV 9G24", "TGW 5I85", "TMZ 1H81", "SJN 8G41", "TGW 4H14", "TGW 4G86", "TGW 2B58",
  "TGW 1D38", "SSM 7B98", "SKE 1C89", "PKY 1291", "SKE 8A36", "RDQ 5F21", "RDQ 1C99",
  "RCZ 6F21", "TMK 6A60", "PKW 3373", "PKW 8231", "SKL 9F57", "SKK 3H81", "THH 9J13", "THG 2B59", "TGZ 3G81", "TGZ 0G49"
];

export const UOPS_PADRAO = [
  "2ªCIPM", "9ªCIPM", "14ªCIPM", "16ªCIPM", "17ªCIPM", "18ªCIPM", "19ªCIPM",
  "31ªCIPM", "37ªCIPM", "18º BPM", "CPRC-B", "RONDESP BTS", "APM", "QCG"
];

export const TURNOS_PADRAO = [
  "5h", "6h", "8h", "10h", "12h", "14h", "15h", "16h", "18h", "20h", "22h", "24h"
];

// 46 ITENS PARA CARRO (4 RODAS)
export const ITENS_VERIFICADOS_CARRO = [
  "ÓLEO DO MOTOR",
  "FLUIDO DE FREIO",
  "ARREFECIMENTO",
  "AGUA DO ESGUINCHO",
  "ÓLEO DA DIRECÃO",
  "MOTOR",
  "BATERIA",
  "BATERIA AUXILIAR",
  "EMBREAGEM",
  "FREIO DE MÃO",
  "CAMBIO",
  "DIRECÃO",
  "FAROIS",
  "LANTERNAS",
  "LUZ DE FREIO",
  "LUZ DE RE",
  "PISCA ALERTA",
  "LUZ DE DIRECÃO",
  "ALTO FALANTES",
  "ANTENA",
  "TOLDO LATERAL",
  "AROS",
  "AR CONDICIONADO",
  "TAPETES",
  "KIT CHAVE DE RODAS",
  "PARACHOQUE DIANTEIRO",
  "PARACHOQUE TRASEIRO",
  "EXTINTOR",
  "GIROFLEX",
  "BUZINA",
  "PARABRISA",
  "RADIO E GPS",
  "TRIÂNGULO",
  "MACACO",
  "SIRENE",
  "ESTOFAMENTO",
  "LIMPADOR DE PARABRISA",
  "PLOTAGEM NUMÉRICA",
  "PLACA POLICIAL",
  "RETROVISOR LD",
  "RETROVISOR LE",
  "CALOTAS",
  "CRLV",
  "PNEU DIANTEIRO",
  "PNEU TRASEIRO",
  "PNEU RESERVA"
];

// ITENS PARA MOTOCICLETAS (2 RODAS) COM SIRENE, GIROFLEX E PREFIXO
export const ITENS_VERIFICADOS_MOTO = [
  "ÓLEO DO MOTOR",
  "FLUIDO DE FREIO DIANTEIRO",
  "FLUIDO DE FREIO TRASEIRO",
  "EMBREAGEM",
  "ACELERADOR / CABOS",
  "CORRENTE / TRANSMISSÃO",
  "PNEU DIANTEIRO",
  "PNEU TRASEIRO",
  "AROS E RAIOS",
  "FAROL",
  "LANTERNA TRASEIRA",
  "LUZ DE FREIO",
  "PISCAS / SETAS",
  "BUZINA",
  "RETROVISOR LD",
  "RETROVISOR LE",
  "PAINEL / VELOCÍMETRO",
  "BATERIA",
  "SIRENE",
  "GIROFLEX",
  "PREFIXO",
  "ANTENA",
  "CRLV",
  "PLACA POLICIAL",
  "PEDALEIRAS",
  "DESCANSO LATERAL",
  "BAÚ / SUPORTE"
];

// 500 Pre-generated unique passcodes for users
export const SENHAS_SISTEMA_500: string[] = (() => {
  const list: string[] = [];
  for (let i = 1001; i <= 1500; i++) {
    list.push(i.toString());
  }
  return list;
})();

export function formatarPlaca(value: string): string {
  if (!value) return "";
  const clean = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (clean.length <= 3) {
    return clean;
  }
  return clean.slice(0, 3) + " " + clean.slice(3, 7);
}

export function formatarPrefixo(value: string): string {
  if (!value) return "";
  const clean = value.trim().toUpperCase();
  if (clean.includes(".")) return clean;
  if (clean.length > 1) {
    return clean.charAt(0) + "." + clean.slice(1);
  }
  return clean;
}

export function formatarMoedaBRL(val: number | string | null | undefined): string {
  if (val === null || val === undefined || isNaN(Number(val))) {
    return "R$ 0,00";
  }
  return Number(val).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Initial Mock Viaturas for 19ª CIPM
export const MOCK_VIATURAS: Viatura[] = [
  {
    id: "v-1",
    prefixo: "9.1901",
    placa: "RPV 9G24",
    marca: "Renault",
    modelo: "Duster 1.6 CVT",
    ano: "2023",
    tipo: "4 rodas",
    uop: "19ªCIPM",
    status: "disponivel",
    kmAtual: 38450,
  },
  {
    id: "v-2",
    prefixo: "9.1902",
    placa: "TGW 5I85",
    marca: "Renault",
    modelo: "Duster 1.6 CVT",
    ano: "2023",
    tipo: "4 rodas",
    uop: "19ªCIPM",
    status: "disponivel",
    kmAtual: 42100,
  },
  {
    id: "v-3",
    prefixo: "9.1903",
    placa: "TMZ 1H81",
    marca: "Renault",
    modelo: "Duster 1.6 CVT",
    ano: "2023",
    tipo: "4 rodas",
    uop: "19ªCIPM",
    status: "disponivel",
    kmAtual: 29800,
  },
  {
    id: "v-4",
    prefixo: "9.1904",
    placa: "SJN 8G41",
    marca: "Toyota",
    modelo: "Corolla Cross",
    ano: "2022",
    tipo: "4 rodas",
    uop: "19ªCIPM",
    status: "disponivel",
    kmAtual: 61500,
  },
  {
    id: "v-5",
    prefixo: "9.1910",
    placa: "PKY 1291",
    marca: "Yamaha",
    modelo: "Lander 250 ABS",
    ano: "2022",
    tipo: "2 rodas",
    uop: "19ªCIPM",
    status: "disponivel",
    kmAtual: 18200,
  },
  {
    id: "v-6",
    prefixo: "9.1912",
    placa: "SKE 8A36",
    marca: "Yamaha",
    modelo: "Lander 250 ABS",
    ano: "2022",
    tipo: "2 rodas",
    uop: "19ªCIPM",
    status: "disponivel",
    kmAtual: 15400,
  },
  {
    id: "v-7",
    prefixo: "9.1917",
    placa: "SKL 9F57",
    marca: "Honda",
    modelo: "XRE 300 Rally",
    ano: "2023",
    tipo: "2 rodas",
    uop: "19ªCIPM",
    status: "manutencao",
    kmAtual: 21300,
  },
  {
    id: "v-8",
    prefixo: "9.1920",
    placa: "THH 9J13",
    marca: "Yamaha",
    modelo: "Lander 250 ABS",
    ano: "2023",
    tipo: "2 rodas",
    uop: "19ªCIPM",
    status: "disponivel",
    kmAtual: 12900,
  },
  {
    id: "v-9",
    prefixo: "9.1990",
    placa: "PKW 3373",
    marca: "Chevrolet",
    modelo: "Spin 1.8 LTZ",
    ano: "2021",
    tipo: "4 rodas",
    uop: "19ªCIPM",
    status: "disponivel",
    kmAtual: 88500,
  },
  {
    id: "v-10",
    prefixo: "9.1900",
    placa: "PKW 8231",
    marca: "Renault",
    modelo: "Duster 1.6 Expression",
    ano: "2018",
    tipo: "4 rodas",
    uop: "19ªCIPM",
    status: "baixada",
    kmAtual: 198400,
    dataBaixa: "2023-11-15",
    motivoBaixa: "Fim da vida útil operacional - Destinada a leilão público patrimonial do Estado",
  },
];

// Initial Mock Usuarios
export const MOCK_USUARIOS: Usuario[] = [
  {
    id: "usr-1",
    nome: "Maj PM Elsimar",
    matricula: "30.221.450-9",
    cargoPosto: "Maj PM - Comandante",
    perfil: "administrador",
    email: "19cipm.cmt@pm.ba.gov.br",
    uop: "19ªCIPM",
  },
  {
    id: "usr-2",
    nome: "Sgt PM Silva Santos",
    matricula: "30.345.678-1",
    cargoPosto: "Sgt PM - SPO/Frota",
    perfil: "despachante",
    email: "19cipm.spo@pm.ba.gov.br",
    uop: "19ªCIPM",
  },
  {
    id: "usr-3",
    nome: "Sd PM Carlos Eduardo",
    matricula: "30.567.890-2",
    cargoPosto: "Sd PM - Motorista",
    perfil: "motorista",
    email: "carlos.eduardo@pm.ba.gov.br",
    uop: "19ªCIPM",
  },
  {
    id: "usr-4",
    nome: "Cb PM Marcos Rocha",
    matricula: "30.456.789-3",
    cargoPosto: "Cb PM - Motociclista",
    perfil: "motorista",
    email: "marcos.rocha@pm.ba.gov.br",
    uop: "19ªCIPM",
  },
];

// Initial Mock Gastos
export const MOCK_GASTOS: GastoManutencao[] = [
  {
    id: "gasto-1",
    marca: "Renault",
    modelo: "Duster 1.6 CVT",
    ano: "2023",
    numPatrimonio: "PAT-001901",
    prefixo: "9.1901",
    placa: "RPV 9G24",
    valorMercado: 95000,
    totalGastos: 4850.5,
  },
  {
    id: "gasto-2",
    marca: "Renault",
    modelo: "Duster 1.6 CVT",
    ano: "2023",
    numPatrimonio: "PAT-001902",
    prefixo: "9.1902",
    placa: "TGW 5I85",
    valorMercado: 95000,
    totalGastos: 2400.0,
  },
  {
    id: "gasto-3",
    marca: "Toyota",
    modelo: "Corolla Cross",
    ano: "2022",
    numPatrimonio: "PAT-001904",
    prefixo: "9.1904",
    placa: "SJN 8G41",
    valorMercado: 145000,
    totalGastos: 8900.0,
  },
  {
    id: "gasto-4",
    marca: "Yamaha",
    modelo: "Lander 250",
    ano: "2022",
    numPatrimonio: "PAT-001910",
    prefixo: "9.1910",
    placa: "PKY 1291",
    valorMercado: 24000,
    totalGastos: 1250.0,
  },
];

// Initial Mock Revisões
export const MOCK_REVISOES: RevisaoViatura[] = [
  {
    id: "rev-1",
    prefixo: "9.1901",
    placa: "RPV 9G24",
    tipoServico: "Troca de óleo de motor, filtros e pastilhas de freio",
    kmUltimaRevisao: 30000,
    kmProximaRevisao: 40000,
    dataProximaRevisao: "2026-10-15",
    oficina: "Oficina Central PMBA - DAL",
    status: "agendada",
    observacoes: "Viatura em operação regular",
  },
  {
    id: "rev-2",
    prefixo: "9.1917",
    placa: "SKL 9F57",
    tipoServico: "Kit Relação (Coroa, Pinhão e Corrente) e Regulagem de Válvulas",
    kmUltimaRevisao: 15000,
    kmProximaRevisao: 20000,
    dataProximaRevisao: "2026-09-20",
    oficina: "Motopeças Subúrbio Credenciada",
    status: "vencida",
    observacoes: "Em manutenção na oficina",
  },
  {
    id: "rev-3",
    prefixo: "9.1904",
    placa: "SJN 8G41",
    tipoServico: "Revisão de 60.000 KM (Amortecedores e Suspensão)",
    kmUltimaRevisao: 50000,
    kmProximaRevisao: 60000,
    dataProximaRevisao: "2026-11-01",
    oficina: "Concessionária Guebor",
    status: "agendada",
  },
];

// Initial Mock Inventário
export const MOCK_INVENTARIO: ItemInventario[] = [
  {
    id: "inv-1",
    codigoPatrimonio: "ARM-019-042",
    descricao: "Espingarda Calibre 12 CBC Military 3.0",
    categoria: "armamento",
    quantidade: 1,
    prefixoAlocado: "9.1901",
    localizacao: "Cofre de Viaturas / Suporte Interno",
    estadoConservacao: "bom",
    dataEntrada: "2023-01-10",
  },
  {
    id: "inv-2",
    codigoPatrimonio: "RAD-019-108",
    descricao: "Rádio Transceptor Portátil HT Motorola APX 2000",
    categoria: "radio_comunicacao",
    quantidade: 2,
    prefixoAlocado: "9.1901",
    localizacao: "Base Carregadora no Painel",
    estadoConservacao: "bom",
    dataEntrada: "2023-02-15",
  },
  {
    id: "inv-3",
    codigoPatrimonio: "FER-019-014",
    descricao: "Kit Macaco Hidráulico Tipo Garrafa + Triângulo",
    categoria: "ferramentas",
    quantidade: 1,
    prefixoAlocado: "9.1902",
    localizacao: "Porta-malas",
    estadoConservacao: "novo",
    dataEntrada: "2023-03-01",
  },
  {
    id: "inv-4",
    codigoPatrimonio: "COL-019-088",
    descricao: "Colete Balístico Nível III-A CBC",
    categoria: "colete",
    quantidade: 4,
    prefixoAlocado: "9.1904",
    localizacao: "Porta-malas",
    estadoConservacao: "bom",
    dataEntrada: "2022-08-20",
  },
];

// Initial Mock Pneus
export const MOCK_PNEUS: RegistroPneu[] = [
  {
    id: "pneu-1",
    prefixo: "9.1901",
    placa: "RPV 9G24",
    posicao: "Dianteiro Direito",
    marcaModelo: "Pirelli Scorpion 215/65 R16",
    dot: "3223",
    sulcoMm: 7.2,
    kmInstalacao: 30000,
    dataInstalacao: "2023-08-10",
    estado: "bom",
  },
  {
    id: "pneu-2",
    prefixo: "9.1901",
    placa: "RPV 9G24",
    posicao: "Dianteiro Esquerdo",
    marcaModelo: "Pirelli Scorpion 215/65 R16",
    dot: "3223",
    sulcoMm: 7.0,
    kmInstalacao: 30000,
    dataInstalacao: "2023-08-10",
    estado: "bom",
  },
  {
    id: "pneu-3",
    prefixo: "9.1904",
    placa: "SJN 8G41",
    posicao: "Traseiro Esquerdo",
    marcaModelo: "Michelin Primacy 4 215/60 R17",
    dot: "1422",
    sulcoMm: 2.8,
    kmInstalacao: 45000,
    dataInstalacao: "2022-09-12",
    estado: "regular",
  },
];

export const MOCK_MANUTENCOES: RegistroManutencao[] = [
  {
    id: "manut-1",
    ordemServico: "OS-2024-0089",
    prefixo: "9.1917",
    placa: "SKL 9F57",
    oficina: "Mecânica e Elétrica Central Bahia",
    tipo: "Mecânica Geral",
    descricaoServico: "Substituição do kit de transmissão (coroa, pinhão, corrente) e pastilhas de freio dianteiras.",
    dataEntrada: "2024-03-01",
    dataPrevisaoSaida: "2024-03-15",
    valorEstimado: 1250.0,
    status: "em_andamento",
    responsavelAbertura: "Sgt PM Silva Santos",
  },
  {
    id: "manut-2",
    ordemServico: "OS-2024-0062",
    prefixo: "9.1901",
    placa: "RPV 9G24",
    oficina: "Auto Centro Especializado Duster",
    tipo: "Freios e Suspensão",
    descricaoServico: "Troca de amortecedores dianteiros, batentes e bieletas estabilizadoras.",
    dataEntrada: "2024-02-10",
    dataConclusao: "2024-02-14",
    valorFinal: 2480.0,
    status: "concluida",
    responsavelAbertura: "Sgt PM Silva Santos",
  },
  {
    id: "manut-3",
    ordemServico: "OS-2024-0094",
    prefixo: "9.1903",
    placa: "TMZ 1H81",
    oficina: "Oficina e Funilaria Salvador Norte",
    tipo: "Funilaria/Pintura",
    descricaoServico: "Reparo do para-choque traseiro e substituição de lente da lanterna esquerda.",
    dataEntrada: "2024-03-05",
    dataPrevisaoSaida: "2024-03-20",
    valorEstimado: 980.0,
    status: "aguardando_pecas",
    responsavelAbertura: "Sgt PM Silva Santos",
  },
];

export const MOCK_HIGIENIZACOES: RegistroHigienizacao[] = [
  {
    id: "hig-1",
    prefixo: "9.1901",
    placa: "RPV 9G24",
    tipo: "Higienização Interna",
    data: "2024-03-08",
    responsavel: "Sd PM Carlos Eduardo",
    local: "Lava Jato Paripe Express",
    km: 45200,
    observacoes: "Limpeza profunda de estofamentos, teto e desinfecção com quaternário de amônio.",
    custo: 120.0,
  },
  {
    id: "hig-2",
    prefixo: "9.1902",
    placa: "TGW 5I85",
    tipo: "Lavagem Geral",
    data: "2024-03-09",
    responsavel: "Sd PM Souza",
    local: "Pátio 19ª CIPM",
    km: 32400,
    observacoes: "Lavagem de chassi, caixa de rodas e aplicação de cera protetora.",
    custo: 50.0,
  },
  {
    id: "hig-3",
    prefixo: "9.1910",
    placa: "PKY 1291",
    tipo: "Desinfecção Sanitária",
    data: "2024-03-07",
    responsavel: "Cb PM Marcos Rocha",
    local: "Pátio 19ª CIPM",
    km: 18200,
    observacoes: "Desinfecção completa de manoplas, comando e baú.",
    custo: 30.0,
  },
];

export const DEFAULT_CONFIG: ConfigSistema = {
  systemTitle: "SISTEMA DE GESTÃO DE FROTA",
  subTitle: "19ª CIPM / PARIPE • O GUARDIÃO DO SUBÚRBIO",
  orgaoSuperior: "POLÍCIA MILITAR DA BAHIA",
  comandoRegional: "CPRC-BTS",
  unidade: "19ª CIPM",
  cidade: "Salvador - BA",
  emailDestino: "frotas19cipm@pm.ba.gov.br",
  telefonePlantao: "(71) 3117-2100",
  brasaoEsquerdaUrl: "",
  brasaoDireitaUrl: "",
  iconeSistemaUrl: "/assets/icone_frota_19cipm.jpg",
  diagramaCarroUrl: "/assets/viatura_carro_duster.jpg",
  diagramaMotoUrl: "/assets/viatura_moto_pmba.jpg",
  rodapeTexto: "19ª CIPM • PARIPE • Versão 2.4 Online/Offline",
};
