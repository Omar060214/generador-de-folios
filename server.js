const express = require('express');
const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const EXCEL_FILE = 'registros.xlsx';

// Inicializar el archivo Excel si no existe
function initializeExcelFile() {
  if (!fs.existsSync(EXCEL_FILE)) {
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet([]);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Registros');
    xlsx.writeFile(workbook, EXCEL_FILE);
  }
}

initializeExcelFile();

app.post('/generar-folio', (req, res) => {
  const { area, asunto, solicitante, fecha } = req.body;

  if (!area || !asunto || !solicitante || !fecha) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const workbook = xlsx.readFile(EXCEL_FILE);
  const worksheet = workbook.Sheets['Registros'];
  const registros = xlsx.utils.sheet_to_json(worksheet);

  // Generar el folio asegurándose de que tenga 4 dígitos
  const folio = registros.length > 0 ? registros[registros.length - 1].Folio + 1 : 1;


  const nuevoRegistro = {
    Folio: folio,
    Area: area,
    Asunto: asunto,
    Solicitante: solicitante,
    Fecha: fecha,
  };

  registros.push(nuevoRegistro);

  const nuevoWorksheet = xlsx.utils.json_to_sheet(registros);
  workbook.Sheets['Registros'] = nuevoWorksheet;
  xlsx.writeFile(workbook, EXCEL_FILE);

  res.json({ folio });
});

app.listen(3000, () => {
  console.log('Servidor iniciado en http://localhost:3000');
});


