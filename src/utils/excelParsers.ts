import { findValue } from "./excelImport";
import {
  Checklist,
  CargaViatura,
  Viatura,
  RevisaoViatura,
  RegistroManutencao,
  GastoManutencao,
  RegistroHigienizacao,
  RegistroPneu,
  ItemInventario,
  Usuario,
  NivelCombustivel,
  StatusViatura,
  PerfilUsuario,
} from "../types";

export const parseExcelToChecklists = (rows: Array<Record<string, any>>): Checklist[] => {
  const nowStr = new Date().toISOString();
  return rows.map((row, idx) => {
    const rawTipo = String(findValue(row, ["tipo", "tipoviatura", "veiculo", "categoria"]) || "").toLowerCase();
    const isMoto = rawTipo.includes("moto") || rawTipo.includes("2") || rawTipo.includes("duas");
    const tipoViatura: Checklist["tipoViatura"] = isMoto ? "2 rodas" : "4 rodas";

    const dataCarga = String(findValue(row, ["datacarga", "data", "datavistoria"]) || nowStr.slice(0, 10));
    const horaCarga = String(findValue(row, ["horacarga", "hora"]) || "08:00");
    const prefixo = String(findValue(row, ["prefixo", "viatura", "vtr"]) || "9.1901").toUpperCase();
    const placa = String(findValue(row, ["placa", "placaantiga"]) || "BRA2E19").toUpperCase();
    const kmInicial = Number(findValue(row, ["kminicial", "km", "quilometragem"])) || 0;
    const nomeCondutor = String(findValue(row, ["nomecondutor", "condutor", "motorista", "nome"]) || "POLICIAL CONDUTOR").toUpperCase();
    const matricula = String(findValue(row, ["matricula", "mat", "matr"]) || "30.000.000-0");
    const uop = String(findValue(row, ["uop", "pelotao", "unidade"]) || "19ª CIPM").toUpperCase();
    const turnoServico = String(findValue(row, ["turnoservico", "turno"]) || "12 HORAS");
    
    let rawNivel = String(findValue(row, ["nivelcombustivel", "combustivel", "nivel"]) || "4").toUpperCase();
    if (rawNivel.startsWith("R")) rawNivel = "R";
    else if (!["1","2","3","4","5","6","7","8"].includes(rawNivel)) rawNivel = "4";
    const nivelCombustivel = rawNivel as NivelCombustivel;

    const observacoes = String(findValue(row, ["observacoes", "obs", "observacao"]) || "");
    const vistoDespachante = String(findValue(row, ["vistodespachante", "visto", "despachante"]) || "SGT PM DESPACHANTE").toUpperCase();

    return {
      id: `chk-imp-${Date.now()}-${idx}`,
      tipoViatura,
      dataCarga,
      horaCarga,
      prefixo,
      placa,
      kmInicial,
      nomeCondutor,
      matricula,
      uop,
      turnoServico,
      itensVerificados: {},
      nivelCombustivel,
      avarias: [],
      observacoes,
      assinaturaMotorista: "",
      dataHoraAssinatura: `${dataCarga} ${horaCarga}`,
      vistoDespachante,
      createdAt: nowStr,
    };
  });
};

export const parseExcelToCargas = (rows: Array<Record<string, any>>): CargaViatura[] => {
  return rows.map((row, idx) => {
    const dataCarga = String(findValue(row, ["datacarga", "data", "datasaida"]) || new Date().toISOString().slice(0, 10));
    const horaCarga = String(findValue(row, ["horacarga", "hora", "horasaida"]) || "08:00");
    const nomeMotorista = String(findValue(row, ["nomemotorista", "motorista", "condutor", "nome"]) || "CONDUTOR").toUpperCase();
    const matricula = String(findValue(row, ["matricula", "mat"]) || "");
    const prefixo = String(findValue(row, ["prefixo", "viatura", "vtr"]) || "9.1901").toUpperCase();
    const placa = String(findValue(row, ["placa"]) || "BRA2E19").toUpperCase();
    const kmInicial = Number(findValue(row, ["kminicial", "km", "kmsaida"])) || 0;

    const dataDescarga = String(findValue(row, ["datadescarga", "dataretorno", "devolucao"]) || "");
    const horaDescarga = String(findValue(row, ["horadescarga", "horaretorno"]) || "");
    const rawKmFinal = findValue(row, ["kmfinal", "kmretorno"]);
    const kmFinal = rawKmFinal !== "" ? Number(rawKmFinal) : null;
    const kmRodado = kmFinal !== null && kmFinal >= kmInicial ? kmFinal - kmInicial : 0;

    return {
      id: `crg-imp-${Date.now()}-${idx}`,
      dataCarga,
      horaCarga,
      nomeMotorista,
      matricula,
      prefixo,
      placa,
      kmInicial,
      dataDescarga,
      horaDescarga,
      kmFinal,
      kmRodado,
      uop: String(findValue(row, ["uop", "unidade"]) || "19ª CIPM").toUpperCase(),
      turno: String(findValue(row, ["turno"]) || "12h"),
    };
  });
};

export const parseExcelToViaturas = (rows: Array<Record<string, any>>): Viatura[] => {
  return rows.map((row, idx) => {
    const prefixo = String(findValue(row, ["prefixo", "vtr", "viatura"]) || `9.19${idx + 10}`).toUpperCase();
    const placa = String(findValue(row, ["placa"]) || `BRA2E${idx + 10}`).toUpperCase();
    const modelo = String(findValue(row, ["modelo", "veiculo", "marca"]) || "Renault Duster").toUpperCase();
    const ano = String(findValue(row, ["ano", "fabricacao"]) || String(new Date().getFullYear()));
    const tipoRaw = String(findValue(row, ["tipo", "categoria"]) || "").toLowerCase();
    const tipo: Viatura["tipo"] = tipoRaw.includes("moto") || tipoRaw.includes("2") ? "2 rodas" : "4 rodas";
    const kmAtual = Number(findValue(row, ["kmatual", "km", "quilometragem"])) || 0;
    const statusRaw = String(findValue(row, ["status", "situacao"]) || "").toLowerCase();
    let status: StatusViatura = "disponivel";
    if (statusRaw.includes("indisp") || statusRaw.includes("servico") || statusRaw.includes("carga")) status = "indisponivel";
    else if (statusRaw.includes("manut") || statusRaw.includes("oficina")) status = "manutencao";
    else if (statusRaw.includes("baix") || statusRaw.includes("alien")) status = "baixada";

    return {
      id: `vtr-imp-${Date.now()}-${idx}`,
      prefixo,
      placa,
      modelo,
      ano,
      tipo,
      uop: String(findValue(row, ["uop", "unidade"]) || "19ª CIPM").toUpperCase(),
      status,
      kmAtual,
      numPatrimonio: String(findValue(row, ["numpatrimonio", "patrimonio"]) || `PAT-${prefixo}`),
      chassi: String(findValue(row, ["chassi"]) || ""),
    };
  });
};

export const parseExcelToRevisoes = (rows: Array<Record<string, any>>): RevisaoViatura[] => {
  return rows.map((row, idx) => {
    const prefixo = String(findValue(row, ["prefixo", "viatura"]) || "9.1901").toUpperCase();
    const placa = String(findValue(row, ["placa"]) || "BRA2E19").toUpperCase();
    const kmUltimaRevisao = Number(findValue(row, ["kmultimarevisao", "kmatual", "km"])) || 0;
    const kmProximaRevisao = Number(findValue(row, ["kmproximarevisao", "kmrevisao", "proximarevisao"])) || kmUltimaRevisao + 10000;
    const dataProximaRevisao = String(findValue(row, ["dataproximarevisao", "dataprevisao", "data"]) || new Date().toISOString().slice(0, 10));
    const tipoServico = String(findValue(row, ["tiposervico", "tiporevisao", "tipo", "servico"]) || "Revisão Geral Preventiva");
    const oficina = String(findValue(row, ["oficina", "mecanico", "prestador"]) || "Oficina Credenciada");
    const rawStatus = String(findValue(row, ["status"]) || "").toLowerCase();
    let status: RevisaoViatura["status"] = "agendada";
    if (rawStatus.includes("concl")) status = "concluida";
    else if (rawStatus.includes("venc")) status = "vencida";

    return {
      id: `rev-imp-${Date.now()}-${idx}`,
      prefixo,
      placa,
      tipoServico,
      kmUltimaRevisao,
      kmProximaRevisao,
      dataProximaRevisao,
      oficina,
      status,
      observacoes: String(findValue(row, ["observacoes", "obs"]) || ""),
    };
  });
};

export const parseExcelToManutencoes = (rows: Array<Record<string, any>>): RegistroManutencao[] => {
  return rows.map((row, idx) => {
    const rawTipo = String(findValue(row, ["tipo", "tipomanutencao"]) || "").toLowerCase();
    let tipo: RegistroManutencao["tipo"] = "Corretiva";
    if (rawTipo.includes("prev")) tipo = "Preventiva";
    else if (rawTipo.includes("funil") || rawTipo.includes("pint")) tipo = "Funilaria/Pintura";
    else if (rawTipo.includes("eletr")) tipo = "Elétrica";
    else if (rawTipo.includes("freio") || rawTipo.includes("susp")) tipo = "Freios e Suspensão";
    else if (rawTipo.includes("mecan")) tipo = "Mecânica Geral";

    const rawStatus = String(findValue(row, ["status"]) || "").toLowerCase();
    let status: RegistroManutencao["status"] = "em_andamento";
    if (rawStatus.includes("concl")) status = "concluida";
    else if (rawStatus.includes("peca") || rawStatus.includes("aguard")) status = "aguardando_pecas";
    else if (rawStatus.includes("canc")) status = "cancelada";

    const valor = Number(findValue(row, ["valor", "custo", "preco", "valortotal"])) || 0;

    return {
      id: `man-imp-${Date.now()}-${idx}`,
      ordemServico: String(findValue(row, ["ordemservico", "os", "numeroos"]) || `OS-${Date.now().toString().slice(-5)}-${idx}`),
      prefixo: String(findValue(row, ["prefixo", "viatura"]) || "9.1901").toUpperCase(),
      placa: String(findValue(row, ["placa"]) || "BRA2E19").toUpperCase(),
      oficina: String(findValue(row, ["oficina", "prestador"]) || "Oficina Central"),
      tipo,
      descricaoServico: String(findValue(row, ["descricaoservico", "descricao", "servico", "defeito"]) || "Serviço de manutenção geral"),
      dataEntrada: String(findValue(row, ["dataentrada", "data", "entrada"]) || new Date().toISOString().slice(0, 10)),
      dataPrevisaoSaida: String(findValue(row, ["dataprevisaosaida", "previsao"]) || ""),
      dataConclusao: String(findValue(row, ["dataconclusao", "datasaida", "saida"]) || ""),
      valorEstimado: valor,
      valorFinal: valor,
      status,
      responsavelAbertura: String(findValue(row, ["responsavelabertura", "responsavel"]) || "SGT PM ENCARREGADO"),
    };
  });
};

export const parseExcelToGastos = (rows: Array<Record<string, any>>): GastoManutencao[] => {
  return rows.map((row, idx) => {
    const prefixo = String(findValue(row, ["prefixo", "viatura"]) || "9.1901").toUpperCase();
    const placa = String(findValue(row, ["placa"]) || "BRA2E19").toUpperCase();
    const marca = String(findValue(row, ["marca", "fabricante"]) || "Renault");
    const modelo = String(findValue(row, ["modelo", "veiculo"]) || "Duster 1.6");
    const ano = String(findValue(row, ["ano", "fabricacao"]) || "2023");
    const numPatrimonio = String(findValue(row, ["numpatrimonio", "patrimonio", "codpatrimonio"]) || `PAT-${prefixo}`);
    const valorMercado = Number(findValue(row, ["valormercado", "fipe", "valorviatura"])) || 95000;
    const totalGastos = Number(findValue(row, ["totalgastos", "gastos", "valor", "custo"])) || 0;

    return {
      id: `gst-imp-${Date.now()}-${idx}`,
      marca,
      modelo,
      ano,
      numPatrimonio,
      prefixo,
      placa,
      valorMercado,
      totalGastos,
    };
  });
};

export const parseExcelToHigienizacoes = (rows: Array<Record<string, any>>): RegistroHigienizacao[] => {
  return rows.map((row, idx) => {
    const rawTipo = String(findValue(row, ["tipo", "tipohigienizacao"]) || "").toLowerCase();
    let tipo: RegistroHigienizacao["tipo"] = "Lavagem Geral";
    if (rawTipo.includes("interna")) tipo = "Higienização Interna";
    else if (rawTipo.includes("desinf")) tipo = "Desinfecção Sanitária";
    else if (rawTipo.includes("motor")) tipo = "Lavagem de Motor";
    else if (rawTipo.includes("polimento") || rawTipo.includes("cristal")) tipo = "Polimento e Cristalização";

    return {
      id: `hig-imp-${Date.now()}-${idx}`,
      prefixo: String(findValue(row, ["prefixo", "viatura"]) || "9.1901").toUpperCase(),
      placa: String(findValue(row, ["placa"]) || "BRA2E19").toUpperCase(),
      tipo,
      data: String(findValue(row, ["data", "datahigienizacao"]) || new Date().toISOString().slice(0, 10)),
      responsavel: String(findValue(row, ["responsavel", "atendente", "motorista"]) || "Equipe de Higienização"),
      local: String(findValue(row, ["local", "lavajato"]) || "Lava Jato Credenciado"),
      km: Number(findValue(row, ["km", "quilometragem"])) || 0,
      custo: Number(findValue(row, ["custo", "valor", "preco"])) || 0,
      observacoes: String(findValue(row, ["observacoes", "obs"]) || ""),
    };
  });
};

export const parseExcelToPneus = (rows: Array<Record<string, any>>): RegistroPneu[] => {
  return rows.map((row, idx) => {
    const prefixo = String(findValue(row, ["prefixo", "viatura"]) || "9.1901").toUpperCase();
    const placa = String(findValue(row, ["placa"]) || "BRA2E19").toUpperCase();
    const posicao = String(findValue(row, ["posicao", "eixo"]) || "Dianteiro Esquerdo");
    const marca = String(findValue(row, ["marca", "fabricante"]) || "Pirelli");
    const modelo = String(findValue(row, ["modelo"]) || "Scorpion 215/65 R16");
    const marcaModelo = `${marca} ${modelo}`.trim();
    const dot = String(findValue(row, ["dot", "fabricacao"]) || "3223");
    const sulcoMm = Number(findValue(row, ["sulco", "sulcomm", "milimetros"])) || 7.0;
    const kmInstalacao = Number(findValue(row, ["kminstalacao", "km"])) || 0;
    const dataInstalacao = String(findValue(row, ["datainstalacao", "data"]) || new Date().toISOString().slice(0, 10));

    const rawEstado = String(findValue(row, ["estado", "condicao"]) || "").toLowerCase();
    let estado: RegistroPneu["estado"] = "bom";
    if (rawEstado.includes("novo")) estado = "novo";
    else if (rawEstado.includes("urgente") || rawEstado.includes("troca") || rawEstado.includes("ruim")) estado = "troca_urgente";
    else if (rawEstado.includes("regul") || sulcoMm <= 3.0) estado = "regular";

    return {
      id: `pnu-imp-${Date.now()}-${idx}`,
      prefixo,
      placa,
      posicao,
      marcaModelo,
      dot,
      sulcoMm,
      kmInstalacao,
      dataInstalacao,
      estado,
    };
  });
};

export const parseExcelToMateriais = (rows: Array<Record<string, any>>): ItemInventario[] => {
  return rows.map((row, idx) => {
    return {
      id: `mat-imp-${Date.now()}-${idx}`,
      codigoPatrimonio: String(findValue(row, ["codigopatrimonio", "patrimonio", "tombamento", "codigo"]) || `MAT-${100 + idx}`),
      descricao: String(findValue(row, ["descricao", "nome", "item", "material"]) || "Equipamento Operacional").toUpperCase(),
      categoria: String(findValue(row, ["categoria", "grupo", "tipo"]) || "Equipamento de Bordo"),
      quantidade: Number(findValue(row, ["quantidade", "qtd", "estoque"])) || 1,
      prefixoAlocado: String(findValue(row, ["prefixoalocado", "prefixo", "viatura"]) || ""),
      localizacao: String(findValue(row, ["localizacao", "prateleira", "almoxarifado", "reserva"]) || "Reserva de Armamento 19ª CIPM"),
      estadoConservacao: String(findValue(row, ["estadoconservacao", "conservacao", "estado"]) || "Bom"),
      dataAquisicao: String(findValue(row, ["dataaquisicao", "dataentrada", "data"]) || new Date().toISOString().slice(0, 10)),
    };
  });
};

export const parseExcelToUsuarios = (rows: Array<Record<string, any>>): Usuario[] => {
  return rows.map((row, idx) => {
    const rawPerfil = String(findValue(row, ["perfil", "role", "tipo"]) || "").toLowerCase();
    let perfil: PerfilUsuario = "motorista";
    if (rawPerfil.includes("admin")) perfil = "administrador";
    else if (rawPerfil.includes("gestor")) perfil = "gestor";
    else if (rawPerfil.includes("despach")) perfil = "despachante";

    return {
      id: `usr-imp-${Date.now()}-${idx}`,
      nome: String(findValue(row, ["nome", "policial", "militar", "nomecompleto"]) || "POLICIAL MILITAR").toUpperCase(),
      matricula: String(findValue(row, ["matricula", "mat"]) || `30.${idx + 100}.000-0`),
      cargoPosto: String(findValue(row, ["cargoposto", "postograduacao", "posto", "cargo", "graduacao"]) || "Sd PM"),
      cnh: String(findValue(row, ["cnh", "cnhnumero", "carteira"]) || "12345678900"),
      categoriaCnh: String(findValue(row, ["categoriacnh", "cnhcategoria", "categoria"]) || "AB").toUpperCase(),
      validadeCnh: String(findValue(row, ["validadecnh", "cnhvalidade", "validade"]) || "2028-12-31"),
      perfil,
      email: String(findValue(row, ["email"]) || ""),
      uop: String(findValue(row, ["uop", "unidade", "pelotao"]) || "19ª CIPM"),
    };
  });
};
