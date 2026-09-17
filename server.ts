import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Server-side persistent storage file path
const DATA_FILE = path.join(process.cwd(), "fleet-data.json");

// Default initial state
function getDefaultData() {
  return {
    config: {
      systemTitle: "SISTEMA GESTÃO DE FROTA - 19ª CIPM/PARIPE",
      subTitle: "POLÍCIA MILITAR DA BAHIA - CPRC-BTS",
      unidade: "19ª CIPM - PARIPE",
      emailDestino: "transporte.19cipm@pm.ba.gov.br",
    },
    checklists: [],
    cargas: [],
    viaturas: [
      { id: "v-1", prefixo: "9.1901", placa: "RPV 9G24", marca: "Renault", modelo: "Duster", ano: "2023", tipo: "4 rodas", uop: "19ªCIPM", dataAquisicao: "2023-05-10", status: "disponivel", kmAtual: 45200 },
      { id: "v-2", prefixo: "9.1902", placa: "TGW 5I85", marca: "Renault", modelo: "Duster", ano: "2023", tipo: "4 rodas", uop: "19ªCIPM", dataAquisicao: "2023-05-10", status: "disponivel", kmAtual: 38100 },
      { id: "v-3", prefixo: "9.1903", placa: "TMZ 1H81", marca: "Toyota", modelo: "Hilux", ano: "2024", tipo: "4 rodas", uop: "19ªCIPM", dataAquisicao: "2024-01-15", status: "disponivel", kmAtual: 21500 },
      { id: "v-4", prefixo: "9.1904", placa: "SJN 8G41", marca: "Renault", modelo: "Duster", ano: "2022", tipo: "4 rodas", uop: "19ªCIPM", dataAquisicao: "2022-09-20", status: "manutencao", kmAtual: 62000 },
      { id: "v-5", prefixo: "9.1905", placa: "TGW 4H14", marca: "Toyota", modelo: "Corolla", ano: "2023", tipo: "4 rodas", uop: "19ªCIPM", dataAquisicao: "2023-06-01", status: "disponivel", kmAtual: 29400 },
      { id: "v-6", prefixo: "9.1910", placa: "PKW 3373", marca: "Honda", modelo: "XRE 300", ano: "2022", tipo: "2 rodas", uop: "19ªCIPM", dataAquisicao: "2022-04-12", status: "disponivel", kmAtual: 18300 },
      { id: "v-7", prefixo: "9.1912", placa: "PKW 8231", marca: "Honda", modelo: "XRE 300", ano: "2022", tipo: "2 rodas", uop: "19ªCIPM", dataAquisicao: "2022-04-12", status: "disponivel", kmAtual: 19500 },
      { id: "v-8", prefixo: "9.1913", placa: "SKL 9F57", marca: "Yamaha", modelo: "Lander 250", ano: "2023", tipo: "2 rodas", uop: "19ªCIPM", dataAquisicao: "2023-07-22", status: "disponivel", kmAtual: 12400 },
      { id: "v-9", prefixo: "9.1914", placa: "SKK 3H81", marca: "Yamaha", modelo: "Lander 250", ano: "2023", tipo: "2 rodas", uop: "19ªCIPM", dataAquisicao: "2023-07-22", status: "disponivel", kmAtual: 11200 },
      { id: "v-10", prefixo: "9.1917", placa: "THH 9J13", marca: "Honda", modelo: "XRE 300", ano: "2023", tipo: "2 rodas", uop: "19ªCIPM", dataAquisicao: "2023-11-05", status: "disponivel", kmAtual: 9800 },
      { id: "v-11", prefixo: "9.1918", placa: "THG 2B59", marca: "Honda", modelo: "XRE 300", ano: "2023", tipo: "2 rodas", uop: "19ªCIPM", dataAquisicao: "2023-11-05", status: "disponivel", kmAtual: 8900 },
      { id: "v-12", prefixo: "9.1919", placa: "SKE 1C89", marca: "Yamaha", modelo: "Lander 250", ano: "2023", tipo: "2 rodas", uop: "19ªCIPM", dataAquisicao: "2023-08-14", status: "disponivel", kmAtual: 14100 },
      { id: "v-13", prefixo: "9.1920", placa: "PKY 1291", marca: "Honda", modelo: "XRE 300", ano: "2022", tipo: "2 rodas", uop: "19ªCIPM", dataAquisicao: "2022-03-30", status: "disponivel", kmAtual: 22600 }
    ],
    gastosManutencao: [
      { id: "g-1", marca: "Renault", modelo: "Duster", ano: "2023", numPatrimonio: "PMBA-19-0012", prefixo: "9.1901", placa: "RPV 9G24", valorMercado: 85000, totalGastos: 3450.50 },
      { id: "g-2", marca: "Renault", modelo: "Duster", ano: "2023", numPatrimonio: "PMBA-19-0015", prefixo: "9.1902", placa: "TGW 5I85", valorMercado: 85000, totalGastos: 1820.00 },
      { id: "g-3", marca: "Toyota", modelo: "Hilux", ano: "2024", numPatrimonio: "PMBA-19-0030", prefixo: "9.1903", placa: "TMZ 1H81", valorMercado: 195000, totalGastos: 4100.00 },
      { id: "g-4", marca: "Honda", modelo: "XRE 300", ano: "2022", numPatrimonio: "PMBA-19-0088", prefixo: "9.1910", placa: "PKW 3373", valorMercado: 28000, totalGastos: 880.00 }
    ],
    estoque: [
      { id: "e-1", item: "Óleo 15W40 Motor", categoria: "Lubrificantes", entrada: 50, saida: 18, prefixoViatura: "9.1901" },
      { id: "e-2", item: "Fluido de Freio DOT 4", categoria: "Fluidos", entrada: 24, saida: 8, prefixoViatura: "9.1902" },
      { id: "e-3", item: "Pastilha de Freio Dianteira", categoria: "Peças", entrada: 20, saida: 6, prefixoViatura: "9.1903" },
      { id: "e-4", item: "Lâmpada H4 Farol", categoria: "Elétrica", entrada: 40, saida: 15, prefixoViatura: "9.1910" },
      { id: "e-5", item: "Pneu 215/65 R16", categoria: "Pneus", entrada: 12, saida: 4, prefixoViatura: "9.1901" }
    ],
    manutencoes: [
      { id: "m-1", dataEntrada: "2026-09-01", dataSaida: "2026-09-03", os: "OS-2026-041", local: "Oficina Central PMBA", motivo: "Revisão periódica e freios", servicoRealizado: "Troca de pastilhas e discos", viaturaReserva: "9.1905", prefixo: "9.1904", placa: "SJN 8G41", custo: 1250.00 }
    ],
    revisoes: [
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
        observacoes: "Viatura em operação regular"
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
        observacoes: "Em manutenção na oficina"
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
        status: "agendada"
      }
    ],
    higienizacoes: [
      {
        id: "hig-1",
        prefixo: "9.1901",
        placa: "RPV 9G24",
        tipo: "Lavagem Geral",
        data: "2026-09-10",
        responsavel: "Sd PM Marcos Santos",
        local: "Base 19ª CIPM - Paripe",
        km: 45200,
        custo: 50.0,
        observacoes: "Higienização completa pós-chuva"
      },
      {
        id: "hig-2",
        prefixo: "9.1910",
        placa: "PKW 3373",
        tipo: "Lavagem Geral",
        data: "2026-09-11",
        responsavel: "Cb PM Ferreira",
        local: "Base 19ª CIPM - Paripe",
        km: 18300,
        custo: 30.0,
        observacoes: "Lavagem com aplicação de cera e lubrificação de corrente"
      }
    ],
    usuarios: [
      { id: "u-1", nome: "Cap PM Silva", matricula: "30.456.789-1", cnh: "04987654321", categoriaCnh: "AB", validadeCnh: "2027-10-15", perfil: "administrador", senha: "5656" },
      { id: "u-2", nome: "Ten PM Oliveira", matricula: "30.123.456-7", cnh: "03876543210", categoriaCnh: "AB", validadeCnh: "2028-04-20", perfil: "gestor", senha: "5656" },
      { id: "u-3", nome: "Sgt PM Souza", matricula: "30.987.654-3", cnh: "02765432109", categoriaCnh: "B", validadeCnh: "2026-11-30", perfil: "despachante", senha: "5656" },
      { id: "u-4", nome: "Sd PM Nascimento", matricula: "30.555.444-2", cnh: "05123456789", categoriaCnh: "AB", validadeCnh: "2029-02-18", perfil: "motorista", senha: "1004" },
      { id: "u-5", nome: "Cb PM Santos", matricula: "30.666.777-5", cnh: "04234567890", categoriaCnh: "AB", validadeCnh: "2027-08-12", perfil: "motorista", senha: "1005" }
    ],
    lastUpdated: new Date().toISOString()
  };
}

// Load data from file or initialize
let fleetData = getDefaultData();
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    fleetData = { ...getDefaultData(), ...JSON.parse(raw) };
  } else {
    fs.writeFileSync(DATA_FILE, JSON.stringify(fleetData, null, 2), "utf-8");
  }
} catch (err) {
  console.error("Error reading data file, using defaults:", err);
}

function saveData() {
  try {
    fleetData.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(fleetData, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving data file:", err);
  }
}

// ======================== API ROUTES ========================

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Full state sync
app.get("/api/sync", (req, res) => {
  res.json(fleetData);
});

app.post("/api/sync", (req, res) => {
  try {
    const incoming = req.body;
    if (incoming && typeof incoming === "object") {
      fleetData = {
        ...fleetData,
        ...incoming,
        lastUpdated: new Date().toISOString()
      };
      saveData();
      return res.json({ success: true, message: "Dados sincronizados com sucesso", data: fleetData });
    }
    res.status(400).json({ success: false, error: "Dados inválidos" });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// Submit new checklist: saves checklist, adds auto carga, updates vehicle status to 'indisponivel'
app.post("/api/checklist", (req, res) => {
  try {
    const checklist = req.body;
    if (!checklist || !checklist.prefixo || !checklist.placa) {
      return res.status(400).json({ error: "Dados incompletos no checklist" });
    }

    // Add unique ID and timestamp if missing
    if (!checklist.id) {
      checklist.id = "chk-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
    }
    checklist.createdAt = checklist.createdAt || new Date().toISOString();

    // Add to checklists array (most recent first)
    fleetData.checklists = [checklist, ...fleetData.checklists.filter((c: any) => c.id !== checklist.id)];

    // Auto-create / update Carga de Viatura record
    const novaCarga = {
      id: "crg-" + checklist.id,
      checklistId: checklist.id,
      dataCarga: checklist.dataCarga || new Date().toISOString().split("T")[0],
      nomeMotorista: checklist.nomeCondutor || "",
      matricula: checklist.matricula || "",
      prefixo: checklist.prefixo,
      placa: checklist.placa,
      horaCarga: checklist.horaCarga || new Date().toTimeString().slice(0, 5),
      kmInicial: Number(checklist.kmInicial) || 0,
      dataDescarga: "",
      horaDescarga: "",
      kmFinal: null,
      kmRodado: 0,
      uop: checklist.uop || "19ªCIPM",
      turno: checklist.turnoServico || "12h"
    };

    // Filter out existing carga for this checklist ID if any, prepend new
    fleetData.cargas = [novaCarga, ...fleetData.cargas.filter((c: any) => c.checklistId !== checklist.id)];

    // Update vehicle status to "indisponivel" (cargueada)
    const veiculoIndex = fleetData.viaturas.findIndex(
      (v: any) => v.prefixo.trim().toUpperCase() === checklist.prefixo.trim().toUpperCase()
    );
    if (veiculoIndex >= 0) {
      fleetData.viaturas[veiculoIndex].status = "indisponivel";
      fleetData.viaturas[veiculoIndex].kmAtual = Number(checklist.kmInicial) || fleetData.viaturas[veiculoIndex].kmAtual;
    }

    saveData();
    res.json({ success: true, checklist, carga: novaCarga });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// Update Carga (e.g. Descarga with KM Final)
app.put("/api/carga/:id", (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const index = fleetData.cargas.findIndex((c: any) => c.id === id);
    if (index < 0) {
      return res.status(404).json({ error: "Carga não encontrada" });
    }

    const current = fleetData.cargas[index];
    const kmFinal = update.kmFinal !== undefined && update.kmFinal !== null && update.kmFinal !== ""
      ? Number(update.kmFinal)
      : current.kmFinal;

    const kmInicial = Number(update.kmInicial ?? current.kmInicial);
    const kmRodado = (kmFinal !== null && !isNaN(kmFinal) && kmFinal >= kmInicial)
      ? kmFinal - kmInicial
      : 0;

    fleetData.cargas[index] = {
      ...current,
      ...update,
      kmInicial,
      kmFinal,
      kmRodado
    };

    // If kmFinal is filled, viatura becomes "disponivel" again!
    if (kmFinal !== null && !isNaN(kmFinal) && kmFinal > 0) {
      const pref = fleetData.cargas[index].prefixo;
      const vIndex = fleetData.viaturas.findIndex(
        (v: any) => v.prefixo.trim().toUpperCase() === pref.trim().toUpperCase()
      );
      if (vIndex >= 0) {
        fleetData.viaturas[vIndex].status = "disponivel";
        fleetData.viaturas[vIndex].kmAtual = kmFinal;
      }
    }

    saveData();
    res.json({ success: true, carga: fleetData.cargas[index] });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// Delete Carga
app.delete("/api/carga/:id", (req, res) => {
  fleetData.cargas = fleetData.cargas.filter((c: any) => c.id !== req.params.id);
  saveData();
  res.json({ success: true });
});

// Delete Checklist (keeps carga intact as requested!)
app.delete("/api/checklist/:id", (req, res) => {
  fleetData.checklists = fleetData.checklists.filter((c: any) => c.id !== req.params.id);
  saveData();
  res.json({ success: true });
});

// Static file serving for downloads folder
const downloadsDir = path.join(process.cwd(), "public", "downloads");
app.use("/downloads", express.static(downloadsDir));

// Direct download endpoints
app.get("/api/download/html", (req, res) => {
  const filePath = path.join(downloadsDir, "sistema_frotas_19cipm.html");
  if (fs.existsSync(filePath)) {
    res.download(filePath, "sistema_frotas_19cipm.html");
  } else {
    res.status(404).send("Arquivo ainda não gerado. Execute npm run build.");
  }
});

app.get("/api/download/installer-exe", (req, res) => {
  const filePath = path.join(downloadsDir, "Instalador_Gestao_Frotas_19CIPM.exe");
  if (fs.existsSync(filePath)) {
    res.download(filePath, "Instalador_Gestao_Frotas_19CIPM.exe");
  } else {
    res.status(404).send("Instalador não encontrado.");
  }
});

app.get("/api/download/portable-exe", (req, res) => {
  const filePath = path.join(downloadsDir, "GestaoFrotas19CIPM.exe");
  if (fs.existsSync(filePath)) {
    res.download(filePath, "GestaoFrotas19CIPM.exe");
  } else {
    res.status(404).send("Executável portátil não encontrado.");
  }
});

app.get("/api/download/zip", (req, res) => {
  const filePath = path.join(downloadsDir, "GestaoFrotas19CIPM_Windows.zip");
  if (fs.existsSync(filePath)) {
    res.download(filePath, "GestaoFrotas19CIPM_Windows.zip");
  } else {
    res.status(404).send("Arquivo zip não encontrado.");
  }
});

// Windows setup launcher / batch installer generator
app.get("/api/download/windows-setup", (req, res) => {
  const batScript = `@echo off
chcp 65001 > nul
cls
echo ====================================================================
echo   POLICIA MILITAR DA BAHIA - 19a CIPM / PARIPE
echo   INSTALADOR E ATALHO DO SISTEMA DE GESTAO DE FROTA
echo ====================================================================
echo.
echo Iniciando o aplicativo no navegador padrao...
set TARGET_URL=https://ais-dev-z4uueeu5sa3odu4fpa44oz-146833051896.us-east1.run.app

:: Criar atalho na area de trabalho
set SCRIPT="%TEMP%\\%RANDOM%-%RANDOM%_shortcut.vbs"
echo Set oWS = WScript.CreateObject("WScript.Shell") >> %SCRIPT%
echo sLinkFile = oWS.ExpandEnvironmentStrings("%%USERPROFILE%%\\Desktop\\Gestao de Frota - 19 CIPM.lnk") >> %SCRIPT%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %SCRIPT%
echo oLink.TargetPath = "%TARGET_URL%" >> %SCRIPT%
echo oLink.Description = "Sistema de Gestao de Frota - 19 CIPM/PARIPE PMBA" >> %SCRIPT%
echo oLink.Save >> %SCRIPT%
cscript /nologo %SCRIPT%
del %SCRIPT%

echo.
echo [OK] Atalho criado na sua Area de Trabalho com sucesso!
echo.
echo Abrindo o Sistema de Gestao de Frota da 19a CIPM...
start "" "%TARGET_URL%"
timeout /t 3 > nul
exit
`;
  res.setHeader("Content-Disposition", "attachment; filename=\"Instalador_Gestao_Frota_19CIPM.bat\"");
  res.setHeader("Content-Type", "application/x-bat");
  res.send(batScript);
});

// Start server with Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`19ª CIPM Gestão de Frota rodando na porta ${PORT}`);
  });
}

startServer();
