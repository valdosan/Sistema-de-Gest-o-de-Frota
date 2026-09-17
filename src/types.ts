export type PerfilUsuario = 'administrador' | 'gestor' | 'despachante' | 'motorista';

export interface Usuario {
  id: string;
  nome: string;
  matricula: string;
  cargoPosto?: string;
  cnh?: string;
  categoriaCnh?: string;
  validadeCnh?: string;
  perfil: PerfilUsuario;
  senha?: string;
  email?: string;
  uop?: string;
}

export type StatusViatura = 'disponivel' | 'indisponivel' | 'manutencao' | 'baixada';

export interface Viatura {
  id: string;
  prefixo: string;
  placa: string;
  marca?: string;
  modelo: string;
  ano: string;
  tipo: '4 rodas' | '2 rodas' | 'carro' | 'moto';
  uop: string;
  dataAquisicao?: string;
  status: StatusViatura;
  kmAtual: number;
  dataBaixa?: string;
  motivoBaixa?: string;
  numPatrimonio?: string;
  chassi?: string;
  responsavelEntrega?: string;
  local?: string;
  responsavelRecebimento?: string;
}

export type StatusChecklistItem = 'SA' | 'IF' | 'CA';

export interface AvariaPoint {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  view: string;
  descricao: string;
  tipo: 'Arranhão' | 'Amassado' | 'Trinca' | 'Quebrado' | 'Faltando' | 'Outro';
}

export type NivelCombustivel = 'R' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';

export interface Checklist {
  id: string;
  tipoViatura: 'Viatura 4 rodas' | 'Viatura 2 rodas' | '4 rodas' | '2 rodas';
  dataCarga: string;
  horaCarga: string;
  placa: string;
  prefixo: string;
  kmInicial: number;
  turnoServico: string;
  nomeCondutor: string;
  matricula: string;
  uop: string;
  itensVerificados: Record<string, StatusChecklistItem>;
  nivelCombustivel: NivelCombustivel;
  avarias: AvariaPoint[];
  observacoes: string;
  assinaturaMotorista: string; // base64 canvas image data
  dataHoraAssinatura: string;
  vistoDespachante: string;
  createdAt: string;
  updatedAt?: string;
  statusViatura?: 'disponivel' | 'indisponivel' | 'manutencao' | 'emprestada';
  emailEnviado?: boolean;
  diagramaUrl?: string;
}

export interface CargaViatura {
  id: string;
  checklistId?: string;
  dataCarga: string;
  nomeMotorista: string;
  matricula: string;
  prefixo: string;
  placa: string;
  horaCarga: string;
  kmInicial: number;
  dataDescarga: string;
  horaDescarga: string;
  kmFinal: number | null;
  kmRodado: number;
  uop: string;
  turno: string;
}

export interface GastoManutencao {
  id: string;
  marca: string;
  modelo: string;
  ano: string;
  numPatrimonio: string;
  prefixo: string;
  placa: string;
  valorMercado: number;
  totalGastos: number;
}

export interface RevisaoViatura {
  id: string;
  prefixo: string;
  placa: string;
  tipoServico: string;
  kmUltimaRevisao: number;
  kmProximaRevisao: number;
  dataProximaRevisao: string;
  oficina: string;
  status: 'agendada' | 'concluida' | 'vencida';
  observacoes?: string;
}

export interface ItemInventario {
  id: string;
  codigoPatrimonio: string;
  descricao: string;
  categoria: string;
  quantidade: number;
  prefixoAlocado?: string;
  localizacao: string;
  estadoConservacao: string;
  dataEntrada?: string;
  dataAquisicao?: string;
}

export interface RegistroPneu {
  id: string;
  prefixo: string;
  placa: string;
  posicao: string;
  marcaModelo: string;
  dot: string;
  sulcoMm: number;
  kmInstalacao: number;
  dataInstalacao: string;
  estado: 'novo' | 'bom' | 'regular' | 'troca_urgente';
}

export interface RegistroHigienizacao {
  id: string;
  prefixo: string;
  placa: string;
  tipo: 'Lavagem Geral' | 'Higienização Interna' | 'Desinfecção Sanitária' | 'Lavagem de Motor' | 'Polimento e Cristalização';
  data: string;
  responsavel: string;
  local: string;
  km: number;
  observacoes?: string;
  custo?: number;
}

export interface RegistroManutencao {
  id: string;
  ordemServico: string;
  prefixo: string;
  placa: string;
  oficina: string;
  tipo: 'Corretiva' | 'Preventiva' | 'Funilaria/Pintura' | 'Elétrica' | 'Mecânica Geral' | 'Freios e Suspensão';
  descricaoServico: string;
  dataEntrada: string;
  dataPrevisaoSaida?: string;
  dataConclusao?: string;
  valorEstimado?: number;
  valorFinal?: number;
  status: 'em_andamento' | 'aguardando_pecas' | 'concluida' | 'cancelada';
  responsavelAbertura: string;
}

export type ViewTab =
  | "dashboard"
  | "checklist-carro"
  | "checklist-moto"
  | "gerar-qrcode"
  | "carga-viaturas"
  | "controle-estoque"
  | "controle-revisoes"
  | "manutencoes"
  | "higienizacoes"
  | "relatorios"
  | "gastos-manutencao"
  | "cadastro-viaturas"
  | "viaturas-baixadas"
  | "controle-pneus"
  | "gestao-motoristas";

export interface ConfigSistema {
  systemTitle: string;
  subTitle: string;
  orgaoSuperior?: string;
  comandoRegional?: string;
  unidade: string;
  cidade?: string;
  emailDestino: string;
  telefonePlantao?: string;
  brasaoEsquerdaUrl?: string;
  brasaoDireitaUrl?: string;
  iconeSistemaUrl?: string;
  diagramaCarroUrl?: string;
  diagramaMotoUrl?: string;
  rodapeTexto?: string;
}

export interface AppState {
  viaturas: Viatura[];
  checklists: Checklist[];
  cargas: CargaViatura[];
  gastos: GastoManutencao[];
  revisoes: RevisaoViatura[];
  inventario: ItemInventario[];
  pneus: RegistroPneu[];
  usuarios: Usuario[];
  config?: ConfigSistema;
}

export type FleetState = AppState;
