import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

@Injectable()
export class PdfGeneratorService {
  /**
   * Genera un PDF genérico con estructura básica
   */
  private createBasePdf(titulo: string): PDFKit.PDFDocument {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    // Header
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(titulo, { align: 'center' })
      .moveDown();

    // Fecha de generación
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Generado: ${new Date().toLocaleString('es-ES')}`, { align: 'right' })
      .moveDown(2);

    return doc;
  }

  /**
   * Agrega una sección al PDF
   */
  private addSection(doc: PDFKit.PDFDocument, titulo: string, contenido: string | string[]): void {
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text(titulo)
      .moveDown(0.5);

    doc.fontSize(11).font('Helvetica');

    if (Array.isArray(contenido)) {
      contenido.forEach((linea) => {
        doc.text(linea, { indent: 20 });
      });
    } else {
      doc.text(contenido, { indent: 20 });
    }

    doc.moveDown(1.5);
  }

  /**
   * Agrega una tabla al PDF
   */
  private addTable(
    doc: PDFKit.PDFDocument,
    headers: string[],
    rows: string[][],
    columnWidths?: number[],
  ): void {
    const startX = 50;
    let startY = doc.y;
    const defaultColumnWidth = (doc.page.width - 100) / headers.length;
    const widths = columnWidths || headers.map(() => defaultColumnWidth);

    // Headers
    doc.fontSize(10).font('Helvetica-Bold');
    let x = startX;
    headers.forEach((header, i) => {
      doc.text(header, x, startY, { width: widths[i], align: 'left' });
      x += widths[i];
    });

    // Línea separadora
    startY += 20;
    doc
      .moveTo(startX, startY)
      .lineTo(startX + widths.reduce((a, b) => a + b, 0), startY)
      .stroke();

    // Rows
    doc.fontSize(9).font('Helvetica');
    startY += 10;

    rows.forEach((row) => {
      x = startX;
      const rowHeight = 15;

      // Verificar si hay espacio, si no, nueva página
      if (startY + rowHeight > doc.page.height - 50) {
        doc.addPage();
        startY = 50;
      }

      row.forEach((cell, i) => {
        doc.text(cell || '-', x, startY, { width: widths[i], align: 'left' });
        x += widths[i];
      });

      startY += rowHeight;
    });

    doc.moveDown(2);
  }

  /**
   * Convierte el documento PDF en un Buffer
   */
  async pdfToBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc.end();
    });
  }

  /**
   * Genera reporte de paciente con historial médico
   */
  async generarReportePaciente(data: {
    paciente: any;
    historiales: any[];
    citas: any[];
    prescripciones: any[];
  }): Promise<Buffer> {
    const doc = this.createBasePdf('Reporte de Paciente - Historial Médico');

    // Información del paciente
    this.addSection(doc, 'Datos del Paciente', [
      `Código: ${data.paciente.codPac}`,
      `Nombre: ${data.paciente.persona?.nomPers || 'N/A'}`,
      `Documento: ${data.paciente.persona?.numDoc || 'N/A'}`,
      `Correo: ${data.paciente.persona?.correo || 'N/A'}`,
      `Teléfono: ${data.paciente.persona?.telPers || 'N/A'}`,
      `Tipo Sangre: ${data.paciente.tipoSangre || 'N/A'}`,
      `Alergias: ${data.paciente.alergias || 'N/A'}`,
    ]);

    // Historiales médicos
    if (data.historiales.length > 0) {
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Historiales Médicos')
        .moveDown(0.5);

      const historialesRows = data.historiales.map((h) => [
        String(h.codHist || '-'),
        new Date(h.fecha).toLocaleDateString('es-ES'),
        String(h.diagnostico || '-'),
        String(h.tratamiento || '-').substring(0, 50) + '...',
      ]);

      this.addTable(doc, ['Código', 'Fecha', 'Diagnóstico', 'Tratamiento'], historialesRows);
    }

    // Citas médicas
    if (data.citas.length > 0) {
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Citas Médicas')
        .moveDown(0.5);

      const citasRows = data.citas.map((c) => [
        String(c.idCita || '-'),
        new Date(c.fecha).toLocaleDateString('es-ES'),
        String(c.hora || '-'),
        String(c.estado || '-'),
        String(c.tipoServicio || '-'),
      ]);

      this.addTable(doc, ['ID', 'Fecha', 'Hora', 'Estado', 'Servicio'], citasRows, [
        60, 80, 60, 80, 120,
      ]);
    }

    // Prescripciones
    if (data.prescripciones.length > 0) {
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Prescripciones Médicas')
        .moveDown(0.5);

      const prescripcionesRows = data.prescripciones.map((p) => [
        String(p.medicamento?.nomMed || '-'),
        String(p.dosis || '-'),
        String(p.frecuencia || '-'),
        new Date(p.fechaEmision).toLocaleDateString('es-ES'),
      ]);

      this.addTable(doc, ['Medicamento', 'Dosis', 'Frecuencia', 'Fecha'], prescripcionesRows);
    }

    // Footer
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .text(
          `Página ${i + 1} de ${pages.count} | Hospital Management System`,
          50,
          doc.page.height - 30,
          { align: 'center' },
        );
    }

    return this.pdfToBuffer(doc);
  }

  /**
   * Genera reporte general del hospital
   */
  async generarReporteGeneral(data: {
    estadisticas: any;
    citas: any[];
    medicamentosStockBajo: any[];
  }): Promise<Buffer> {
    const doc = this.createBasePdf('Reporte General del Hospital');

    // Estadísticas generales
    this.addSection(doc, 'Estadísticas Generales', [
      `Total de Pacientes: ${data.estadisticas.totalPacientes || 0}`,
      `Total de Empleados: ${data.estadisticas.totalEmpleados || 0}`,
      `Total de Sedes: ${data.estadisticas.totalSedes || 0}`,
      `Citas Programadas: ${data.estadisticas.citasProgramadas || 0}`,
      `Citas Completadas: ${data.estadisticas.citasCompletadas || 0}`,
      `Citas Canceladas: ${data.estadisticas.citasCanceladas || 0}`,
    ]);

    // Citas recientes
    if (data.citas.length > 0) {
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Citas Recientes')
        .moveDown(0.5);

      const citasRows = data.citas.slice(0, 10).map((c) => [
        new Date(c.fecha).toLocaleDateString('es-ES'),
        String(c.hora || '-'),
        String(c.paciente?.persona?.nomPers || '-').substring(0, 20),
        String(c.estado || '-'),
      ]);

      this.addTable(doc, ['Fecha', 'Hora', 'Paciente', 'Estado'], citasRows);
    }

    // Medicamentos con stock bajo
    if (data.medicamentosStockBajo.length > 0) {
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('red')
        .text('⚠️ Medicamentos con Stock Bajo')
        .fillColor('black')
        .moveDown(0.5);

      const medRows = data.medicamentosStockBajo.map((m) => [
        String(m.nomMed || '-'),
        String(m.stock || 0),
        String(m.presentacion || '-'),
        String(m.ubicacion || '-'),
      ]);

      this.addTable(doc, ['Medicamento', 'Stock', 'Presentación', 'Ubicación'], medRows);
    }

    // Footer
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .text(
          `Página ${i + 1} de ${pages.count} | Hospital Management System`,
          50,
          doc.page.height - 30,
          { align: 'center' },
        );
    }

    return this.pdfToBuffer(doc);
  }

  /**
   * Genera reporte de sede hospitalaria
   */
  async generarReporteSede(data: {
    sede: any;
    departamentos: any[];
    empleados: any[];
    citas: any[];
  }): Promise<Buffer> {
    const doc = this.createBasePdf('Reporte de Sede Hospitalaria');

    // Información de la sede
    this.addSection(doc, 'Datos de la Sede', [
      `ID Sede: ${data.sede.idSede}`,
      `Nombre: ${data.sede.nomSede || 'N/A'}`,
      `Dirección: ${data.sede.direccion || 'N/A'}`,
      `Teléfono: ${data.sede.telSede || 'N/A'}`,
    ]);

    // Departamentos
    if (data.departamentos.length > 0) {
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Departamentos')
        .moveDown(0.5);

      const deptRows = data.departamentos.map((d) => [
        String(d.nomDept || '-'),
        String(d.empleado?.persona?.nomPers || 'Sin jefe'),
      ]);

      this.addTable(doc, ['Departamento', 'Jefe de Departamento'], deptRows, [250, 250]);
    }

    // Empleados
    if (data.empleados.length > 0) {
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(`Empleados de la Sede (Total: ${data.empleados.length})`)
        .moveDown(0.5);

      const empRows = data.empleados.slice(0, 15).map((e) => [
        String(e.persona?.nomPers || '-'),
        String(e.especialidad || '-'),
        String(e.cargo || '-'),
      ]);

      this.addTable(doc, ['Nombre', 'Especialidad', 'Cargo'], empRows);
    }

    // Citas en la sede
    if (data.citas.length > 0) {
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Citas Programadas en la Sede')
        .moveDown(0.5);

      const citasRows = data.citas.slice(0, 10).map((c) => [
        new Date(c.fecha).toLocaleDateString('es-ES'),
        String(c.hora || '-'),
        String(c.tipoServicio || '-'),
        String(c.estado || '-'),
      ]);

      this.addTable(doc, ['Fecha', 'Hora', 'Servicio', 'Estado'], citasRows);
    }

    // Footer
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .text(
          `Página ${i + 1} de ${pages.count} | Hospital Management System`,
          50,
          doc.page.height - 30,
          { align: 'center' },
        );
    }

    return this.pdfToBuffer(doc);
  }
}
