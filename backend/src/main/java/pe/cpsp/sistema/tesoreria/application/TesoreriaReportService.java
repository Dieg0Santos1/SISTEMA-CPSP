package pe.cpsp.sistema.tesoreria.application;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.ClientAnchor;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import pe.cpsp.sistema.tesoreria.api.dto.ConceptoCobroCatalogoResponse;
import pe.cpsp.sistema.tesoreria.api.dto.ConceptoCobroResponse;
import pe.cpsp.sistema.tesoreria.api.dto.ComprobanteListadoResponse;
import pe.cpsp.sistema.tesoreria.api.dto.ComprobantesPageResponse;
import pe.cpsp.sistema.tesoreria.api.dto.HistorialPageResponse;
import pe.cpsp.sistema.tesoreria.api.dto.OperacionTesoreriaResponse;

@Service
public class TesoreriaReportService {

  private static final String INSTITUTION_NAME = "COLEGIO DE PSICOLOGOS DE LIMA";
  private static final String INSTITUTION_SUBTITLE = "SISTEMA DE GESTION INSTITUCIONAL";
  private static final DateTimeFormatter FILE_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");
  private static final DateTimeFormatter DISPLAY_DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

  private final TesoreriaQueryService tesoreriaQueryService;
  private final Clock appClock;

  public TesoreriaReportService(TesoreriaQueryService tesoreriaQueryService, Clock appClock) {
    this.tesoreriaQueryService = tesoreriaQueryService;
    this.appClock = appClock;
  }

  public ReportFile exportHistorial(String search, String metodoPago, String format) {
    HistorialPageResponse response =
        tesoreriaQueryService.getHistorial(search, metodoPago, 1, 5000);
    String normalizedFormat = normalizeFormat(format);

    if ("pdf".equals(normalizedFormat)) {
      return new ReportFile(
          buildFilename("historial-caja", "pdf"),
          "application/pdf",
          buildHistorialPdf(response, metodoPago));
    }

    return new ReportFile(
        buildFilename("historial-caja", "xlsx"),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        buildHistorialExcel(response, metodoPago));
  }

  public ReportFile exportComprobantes(
      String search, String printStatus, String tipo, String format) {
    ComprobantesPageResponse response =
        tesoreriaQueryService.getComprobantes(search, printStatus, tipo, 1, 5000);
    String normalizedFormat = normalizeFormat(format);

    if ("pdf".equals(normalizedFormat)) {
      return new ReportFile(
          buildFilename("comprobantes-emitidos", "pdf"),
          "application/pdf",
          buildComprobantesPdf(response, printStatus, tipo));
    }

    return new ReportFile(
        buildFilename("comprobantes-emitidos", "xlsx"),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        buildComprobantesExcel(response, printStatus, tipo));
  }

  public ReportFile exportConceptosCatalogo(String format) {
    ConceptoCobroCatalogoResponse response = tesoreriaQueryService.getConceptosCobroCatalogo();
    String normalizedFormat = normalizeFormat(format);

    if ("pdf".equals(normalizedFormat)) {
      return new ReportFile(
          buildFilename("conceptos-cobro", "pdf"),
          "application/pdf",
          buildConceptosPdf(response));
    }

    return new ReportFile(
        buildFilename("conceptos-cobro", "xlsx"),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        buildConceptosExcel(response));
  }

  private byte[] buildHistorialPdf(HistorialPageResponse response, String metodoPago) {
    try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
      Document document = new Document(PageSize.A4.rotate(), 28f, 28f, 28f, 28f);
      PdfWriter.getInstance(document, outputStream);
      document.open();

      addReportHeader(
          document,
          "Historial de caja",
          "Consulta operativa consolidada de tesoreria.",
          "Metodo de pago: " + safe(metodoPago, "Todos"));
      addSummaryTable(
          document,
          List.of(
              new SummaryBox("Total hoy", formatMoney(response.totalHoy())),
              new SummaryBox("Operaciones hoy", String.valueOf(response.operacionesHoy())),
              new SummaryBox("Ultimos 7 dias", formatMoney(response.totalUltimosSieteDias())),
              new SummaryBox("Ticket promedio", formatMoney(response.ticketPromedio()))));

      PdfPTable table =
          new PdfPTable(new float[] {1.5f, 1.1f, 2.5f, 2.8f, 1.4f, 1.4f, 1.1f, 1.2f});
      table.setWidthPercentage(100);

      addHeaderCell(table, "Referencia");
      addHeaderCell(table, "Fecha");
      addHeaderCell(table, "Persona");
      addHeaderCell(table, "Concepto");
      addHeaderCell(table, "Metodo");
      addHeaderCell(table, "Comprobante");
      addHeaderCell(table, "Estado");
      addHeaderCell(table, "Total");

      for (OperacionTesoreriaResponse row : response.rows().content()) {
        table.addCell(buildBodyCell(row.reference()));
        table.addCell(buildBodyCell(formatDate(row.fechaEmision()), Element.ALIGN_CENTER));
        table.addCell(buildBodyCell(row.colegiadoNombre()));
        table.addCell(buildBodyCell(row.conceptoResumen()));
        table.addCell(buildBodyCell(row.metodoPago(), Element.ALIGN_CENTER));
        table.addCell(
            buildBodyCell(
                row.serie() + "-" + String.format("%07d", row.numeroComprobante()),
                Element.ALIGN_CENTER));
        table.addCell(buildBodyCell(row.estado(), Element.ALIGN_CENTER));
        table.addCell(buildBodyCell(formatMoney(row.total()), Element.ALIGN_RIGHT));
      }

      document.add(table);
      document.close();
      return outputStream.toByteArray();
    } catch (DocumentException | IOException exception) {
      throw new IllegalStateException("No se pudo generar el reporte PDF de historial.", exception);
    }
  }

  private byte[] buildComprobantesPdf(
      ComprobantesPageResponse response, String printStatus, String tipo) {
    try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
      Document document = new Document(PageSize.A4.rotate(), 28f, 28f, 28f, 28f);
      PdfWriter.getInstance(document, outputStream);
      document.open();

      addReportHeader(
          document,
          "Comprobantes emitidos",
          "Control institucional de boletas y facturas registradas.",
          "Estado impresion: " + safe(printStatus, "Todos") + "  |  Tipo: " + safe(tipo, "Todos"));
      addSummaryTable(
          document,
          List.of(
              new SummaryBox("Boletas", String.valueOf(response.boletasEmitidas())),
              new SummaryBox("Facturas", String.valueOf(response.facturasEmitidas())),
              new SummaryBox("No impresas", String.valueOf(response.noImpresas()))));

      PdfPTable table =
          new PdfPTable(new float[] {1.1f, 1.5f, 1.2f, 2.6f, 1.2f, 1.1f, 1.1f, 1.2f});
      table.setWidthPercentage(100);

      addHeaderCell(table, "Tipo");
      addHeaderCell(table, "Referencia");
      addHeaderCell(table, "Origen");
      addHeaderCell(table, "Persona");
      addHeaderCell(table, "Fecha");
      addHeaderCell(table, "Estado");
      addHeaderCell(table, "Impreso");
      addHeaderCell(table, "Total");

      for (ComprobanteListadoResponse row : response.rows().content()) {
        table.addCell(buildBodyCell(row.tipoComprobante(), Element.ALIGN_CENTER));
        table.addCell(
            buildBodyCell(
                row.serie() + "-" + String.format("%07d", row.numeroComprobante()),
                Element.ALIGN_CENTER));
        table.addCell(
            buildBodyCell(
                "VENTA_PRODUCTO".equals(row.origenOperacion()) ? "Venta" : "Cobro",
                Element.ALIGN_CENTER));
        table.addCell(buildBodyCell(row.colegiadoNombre()));
        table.addCell(buildBodyCell(formatDate(row.fechaEmision()), Element.ALIGN_CENTER));
        table.addCell(buildBodyCell(row.estado(), Element.ALIGN_CENTER));
        table.addCell(buildBodyCell(row.impreso() ? "Si" : "No", Element.ALIGN_CENTER));
        table.addCell(buildBodyCell(formatMoney(row.total()), Element.ALIGN_RIGHT));
      }

      document.add(table);
      document.close();
      return outputStream.toByteArray();
    } catch (DocumentException | IOException exception) {
      throw new IllegalStateException("No se pudo generar el reporte PDF de comprobantes.", exception);
    }
  }

  private byte[] buildHistorialExcel(HistorialPageResponse response, String metodoPago) {
    try (XSSFWorkbook workbook = new XSSFWorkbook();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
      XSSFSheet sheet = workbook.createSheet("Historial");
      insertLogo(workbook, sheet);

      int rowIndex = 6;
      rowIndex = addWorkbookHeading(sheet, rowIndex, "Historial de caja");
      rowIndex = addWorkbookSubheading(sheet, rowIndex, "Metodo de pago: " + safe(metodoPago, "Todos"));
      rowIndex++;

      rowIndex = addKeyValueRow(sheet, rowIndex, "Total hoy", formatMoney(response.totalHoy()), "Operaciones hoy", String.valueOf(response.operacionesHoy()));
      rowIndex = addKeyValueRow(sheet, rowIndex, "Ultimos 7 dias", formatMoney(response.totalUltimosSieteDias()), "Ticket promedio", formatMoney(response.ticketPromedio()));
      rowIndex++;

      String[] headers = {"Referencia", "Fecha", "Persona", "Concepto", "Metodo", "Comprobante", "Estado", "Total"};
      CellStyle headerStyle = buildExcelHeaderStyle(workbook);
      CellStyle bodyStyle = buildExcelBodyStyle(workbook);

      XSSFRow headerRow = sheet.createRow(rowIndex++);
      for (int i = 0; i < headers.length; i++) {
        var cell = headerRow.createCell(i);
        cell.setCellValue(headers[i]);
        cell.setCellStyle(headerStyle);
      }

      for (OperacionTesoreriaResponse row : response.rows().content()) {
        XSSFRow dataRow = sheet.createRow(rowIndex++);
        createBodyCell(dataRow, 0, row.reference(), bodyStyle);
        createBodyCell(dataRow, 1, formatDate(row.fechaEmision()), bodyStyle);
        createBodyCell(dataRow, 2, row.colegiadoNombre(), bodyStyle);
        createBodyCell(dataRow, 3, row.conceptoResumen(), bodyStyle);
        createBodyCell(dataRow, 4, row.metodoPago(), bodyStyle);
        createBodyCell(
            dataRow,
            5,
            row.serie() + "-" + String.format("%07d", row.numeroComprobante()),
            bodyStyle);
        createBodyCell(dataRow, 6, row.estado(), bodyStyle);
        createBodyCell(dataRow, 7, formatMoney(row.total()), bodyStyle);
      }

      autosize(sheet, headers.length);
      workbook.write(outputStream);
      return outputStream.toByteArray();
    } catch (IOException exception) {
      throw new IllegalStateException("No se pudo generar el reporte Excel de historial.", exception);
    }
  }

  private byte[] buildComprobantesExcel(
      ComprobantesPageResponse response, String printStatus, String tipo) {
    try (XSSFWorkbook workbook = new XSSFWorkbook();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
      XSSFSheet sheet = workbook.createSheet("Comprobantes");
      insertLogo(workbook, sheet);

      int rowIndex = 6;
      rowIndex = addWorkbookHeading(sheet, rowIndex, "Comprobantes emitidos");
      rowIndex =
          addWorkbookSubheading(
              sheet,
              rowIndex,
              "Estado impresion: "
                  + safe(printStatus, "Todos")
                  + " | Tipo: "
                  + safe(tipo, "Todos"));
      rowIndex++;

      rowIndex = addKeyValueRow(sheet, rowIndex, "Boletas", String.valueOf(response.boletasEmitidas()), "Facturas", String.valueOf(response.facturasEmitidas()));
      rowIndex = addKeyValueRow(sheet, rowIndex, "No impresas", String.valueOf(response.noImpresas()), "Series activas", String.valueOf(response.seriesActivas().size()));
      rowIndex++;

      String[] headers = {"Tipo", "Referencia", "Origen", "Persona", "Fecha", "Estado", "Impreso", "Total"};
      CellStyle headerStyle = buildExcelHeaderStyle(workbook);
      CellStyle bodyStyle = buildExcelBodyStyle(workbook);

      XSSFRow headerRow = sheet.createRow(rowIndex++);
      for (int i = 0; i < headers.length; i++) {
        var cell = headerRow.createCell(i);
        cell.setCellValue(headers[i]);
        cell.setCellStyle(headerStyle);
      }

      for (ComprobanteListadoResponse row : response.rows().content()) {
        XSSFRow dataRow = sheet.createRow(rowIndex++);
        createBodyCell(dataRow, 0, row.tipoComprobante(), bodyStyle);
        createBodyCell(
            dataRow,
            1,
            row.serie() + "-" + String.format("%07d", row.numeroComprobante()),
            bodyStyle);
        createBodyCell(
            dataRow,
            2,
            "VENTA_PRODUCTO".equals(row.origenOperacion()) ? "Venta" : "Cobro",
            bodyStyle);
        createBodyCell(dataRow, 3, row.colegiadoNombre(), bodyStyle);
        createBodyCell(dataRow, 4, formatDate(row.fechaEmision()), bodyStyle);
        createBodyCell(dataRow, 5, row.estado(), bodyStyle);
        createBodyCell(dataRow, 6, row.impreso() ? "Si" : "No", bodyStyle);
        createBodyCell(dataRow, 7, formatMoney(row.total()), bodyStyle);
      }

      autosize(sheet, headers.length);
      workbook.write(outputStream);
      return outputStream.toByteArray();
    } catch (IOException exception) {
      throw new IllegalStateException("No se pudo generar el reporte Excel de comprobantes.", exception);
    }
  }

  private byte[] buildConceptosPdf(ConceptoCobroCatalogoResponse response) {
    try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
      Document document = new Document(PageSize.A4.rotate(), 28f, 28f, 28f, 28f);
      PdfWriter.getInstance(document, outputStream);
      document.open();

      addReportHeader(
          document,
          "Catalogo de conceptos de cobro",
          "Base operativa de conceptos, reglas y descuentos de tesoreria.",
          "Activos: "
              + response.activos()
              + "  |  Categorias: "
              + response.categorias()
              + "  |  Descuentos: "
              + response.descuentosConfigurados());
      addSummaryTable(
          document,
          List.of(
              new SummaryBox("Conceptos activos", String.valueOf(response.activos())),
              new SummaryBox("Categorias", String.valueOf(response.categorias())),
              new SummaryBox(
                  "Afectan habilitacion", String.valueOf(response.afectanHabilitacion())),
              new SummaryBox(
                  "Descuentos configurados",
                  String.valueOf(response.descuentosConfigurados()))));

      PdfPTable table =
          new PdfPTable(new float[] {1.3f, 2.7f, 1.6f, 1.2f, 1.2f, 1.2f});
      table.setWidthPercentage(100);

      addHeaderCell(table, "Codigo");
      addHeaderCell(table, "Concepto");
      addHeaderCell(table, "Categoria");
      addHeaderCell(table, "Monto");
      addHeaderCell(table, "Estado");
      addHeaderCell(table, "Tipo");

      for (ConceptoCobroResponse row : response.conceptos()) {
        table.addCell(buildBodyCell(row.codigo(), Element.ALIGN_CENTER));
        table.addCell(buildBodyCell(row.nombre()));
        table.addCell(buildBodyCell(row.categoria(), Element.ALIGN_CENTER));
        table.addCell(
            buildBodyCell(
                formatConceptAmount(row.tipoConcepto(), row.tipoDescuento(), row.valorDescuento(), row.montoBase()),
                Element.ALIGN_RIGHT));
        table.addCell(buildBodyCell(row.estado(), Element.ALIGN_CENTER));
        table.addCell(buildBodyCell(row.tipoConcepto(), Element.ALIGN_CENTER));
      }

      document.add(table);
      document.close();
      return outputStream.toByteArray();
    } catch (DocumentException | IOException exception) {
      throw new IllegalStateException("No se pudo generar el catalogo PDF de conceptos.", exception);
    }
  }

  private byte[] buildConceptosExcel(ConceptoCobroCatalogoResponse response) {
    try (XSSFWorkbook workbook = new XSSFWorkbook();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
      XSSFSheet sheet = workbook.createSheet("Conceptos");
      insertLogo(workbook, sheet);

      int rowIndex = 6;
      rowIndex = addWorkbookHeading(sheet, rowIndex, "Catalogo de conceptos de cobro");
      rowIndex =
          addWorkbookSubheading(
              sheet,
              rowIndex,
              "Activos: "
                  + response.activos()
                  + " | Categorias: "
                  + response.categorias()
                  + " | Descuentos: "
                  + response.descuentosConfigurados());
      rowIndex++;

      rowIndex = addKeyValueRow(sheet, rowIndex, "Conceptos activos", String.valueOf(response.activos()), "Categorias", String.valueOf(response.categorias()));
      rowIndex = addKeyValueRow(sheet, rowIndex, "Afectan habilitacion", String.valueOf(response.afectanHabilitacion()), "Descuentos configurados", String.valueOf(response.descuentosConfigurados()));
      rowIndex++;

      String[] headers = {"Codigo", "Concepto", "Categoria", "Monto", "Estado", "Tipo"};
      CellStyle headerStyle = buildExcelHeaderStyle(workbook);
      CellStyle bodyStyle = buildExcelBodyStyle(workbook);

      XSSFRow headerRow = sheet.createRow(rowIndex++);
      for (int i = 0; i < headers.length; i++) {
        var cell = headerRow.createCell(i);
        cell.setCellValue(headers[i]);
        cell.setCellStyle(headerStyle);
      }

      for (ConceptoCobroResponse row : response.conceptos()) {
        XSSFRow dataRow = sheet.createRow(rowIndex++);
        createBodyCell(dataRow, 0, row.codigo(), bodyStyle);
        createBodyCell(dataRow, 1, row.nombre(), bodyStyle);
        createBodyCell(dataRow, 2, row.categoria(), bodyStyle);
        createBodyCell(
            dataRow,
            3,
            formatConceptAmount(row.tipoConcepto(), row.tipoDescuento(), row.valorDescuento(), row.montoBase()),
            bodyStyle);
        createBodyCell(dataRow, 4, row.estado(), bodyStyle);
        createBodyCell(dataRow, 5, row.tipoConcepto(), bodyStyle);
      }

      autosize(sheet, headers.length);
      workbook.write(outputStream);
      return outputStream.toByteArray();
    } catch (IOException exception) {
      throw new IllegalStateException("No se pudo generar el catalogo Excel de conceptos.", exception);
    }
  }

  private void addReportHeader(Document document, String title, String subtitle, String filters)
      throws DocumentException, IOException {
    PdfPTable table = new PdfPTable(new float[] {1.1f, 4f});
    table.setWidthPercentage(100);
    table.setSpacingAfter(12f);

    PdfPCell logoCell = new PdfPCell();
    logoCell.setBorder(Rectangle.NO_BORDER);
    logoCell.setPadding(0f);

    Image logo = loadLogo();
    if (logo != null) {
      logo.scaleToFit(72f, 72f);
      logoCell.addElement(logo);
    }

    PdfPCell textCell = new PdfPCell();
    textCell.setBorder(Rectangle.NO_BORDER);
    textCell.setPadding(0f);
    textCell.addElement(new Paragraph(INSTITUTION_NAME, new Font(Font.HELVETICA, 14, Font.BOLD)));
    textCell.addElement(new Paragraph(INSTITUTION_SUBTITLE, new Font(Font.HELVETICA, 10, Font.NORMAL)));

    Paragraph titleParagraph = new Paragraph(title, new Font(Font.HELVETICA, 16, Font.BOLD));
    titleParagraph.setSpacingBefore(10f);
    textCell.addElement(titleParagraph);
    textCell.addElement(new Paragraph(subtitle, new Font(Font.HELVETICA, 10, Font.NORMAL)));
    textCell.addElement(new Paragraph("Generado: " + formatDate(LocalDate.now(appClock)), new Font(Font.HELVETICA, 9, Font.NORMAL)));
    textCell.addElement(new Paragraph(filters, new Font(Font.HELVETICA, 9, Font.NORMAL)));

    table.addCell(logoCell);
    table.addCell(textCell);
    document.add(table);
  }

  private void addSummaryTable(Document document, List<SummaryBox> summaries) throws DocumentException {
    PdfPTable table = new PdfPTable(summaries.size());
    table.setWidthPercentage(100);
    table.setSpacingAfter(14f);

    for (SummaryBox summary : summaries) {
      PdfPCell cell = new PdfPCell();
      cell.setPadding(10f);
      cell.setBorderColor(new java.awt.Color(203, 213, 225));
      cell.setBackgroundColor(new java.awt.Color(248, 250, 252));
      cell.addElement(new Paragraph(summary.label(), new Font(Font.HELVETICA, 9, Font.BOLD)));
      Paragraph valueParagraph = new Paragraph(summary.value(), new Font(Font.HELVETICA, 13, Font.BOLD));
      valueParagraph.setSpacingBefore(6f);
      cell.addElement(valueParagraph);
      table.addCell(cell);
    }

    document.add(table);
  }

  private void addHeaderCell(PdfPTable table, String label) {
    PdfPCell cell = new PdfPCell(new Phrase(label, new Font(Font.HELVETICA, 9, Font.BOLD)));
    cell.setHorizontalAlignment(Element.ALIGN_CENTER);
    cell.setBackgroundColor(new java.awt.Color(23, 57, 166));
    cell.setBorderColor(new java.awt.Color(23, 57, 166));
    cell.setPadding(8f);
    cell.setPhrase(new Phrase(label, new Font(Font.HELVETICA, 9, Font.BOLD, java.awt.Color.WHITE)));
    table.addCell(cell);
  }

  private PdfPCell buildBodyCell(String value) {
    return buildBodyCell(value, Element.ALIGN_LEFT);
  }

  private PdfPCell buildBodyCell(String value, int alignment) {
    PdfPCell cell = new PdfPCell(new Phrase(safe(value), new Font(Font.HELVETICA, 9, Font.NORMAL)));
    cell.setPadding(7f);
    cell.setHorizontalAlignment(alignment);
    cell.setBorderColor(new java.awt.Color(226, 232, 240));
    return cell;
  }

  private void insertLogo(XSSFWorkbook workbook, XSSFSheet sheet) throws IOException {
    byte[] logoBytes = loadLogoBytes();
    if (logoBytes == null) {
      return;
    }

    int pictureIndex = workbook.addPicture(logoBytes, XSSFWorkbook.PICTURE_TYPE_PNG);
    var drawing = sheet.createDrawingPatriarch();
    ClientAnchor anchor = workbook.getCreationHelper().createClientAnchor();
    anchor.setCol1(0);
    anchor.setRow1(0);
    anchor.setCol2(2);
    anchor.setRow2(4);
    drawing.createPicture(anchor, pictureIndex);
  }

  private int addWorkbookHeading(XSSFSheet sheet, int rowIndex, String title) {
    XSSFRow row = sheet.createRow(rowIndex);
    row.createCell(0).setCellValue(INSTITUTION_NAME);
    XSSFRow nextRow = sheet.createRow(rowIndex + 1);
    nextRow.createCell(0).setCellValue(title);
    return rowIndex + 2;
  }

  private int addWorkbookSubheading(XSSFSheet sheet, int rowIndex, String subtitle) {
    XSSFRow row = sheet.createRow(rowIndex);
    row.createCell(0).setCellValue(subtitle);
    return rowIndex + 1;
  }

  private int addKeyValueRow(
      XSSFSheet sheet,
      int rowIndex,
      String leftLabel,
      String leftValue,
      String rightLabel,
      String rightValue) {
    XSSFRow row = sheet.createRow(rowIndex);
    row.createCell(0).setCellValue(leftLabel);
    row.createCell(1).setCellValue(leftValue);
    row.createCell(3).setCellValue(rightLabel);
    row.createCell(4).setCellValue(rightValue);
    return rowIndex + 1;
  }

  private CellStyle buildExcelHeaderStyle(XSSFWorkbook workbook) {
    XSSFFont font = workbook.createFont();
    font.setBold(true);
    font.setColor(IndexedColors.WHITE.getIndex());

    CellStyle style = workbook.createCellStyle();
    style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
    style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
    style.setAlignment(HorizontalAlignment.CENTER);
    style.setFont(font);
    return style;
  }

  private CellStyle buildExcelBodyStyle(XSSFWorkbook workbook) {
    CellStyle style = workbook.createCellStyle();
    style.setAlignment(HorizontalAlignment.LEFT);
    return style;
  }

  private void createBodyCell(XSSFRow row, int columnIndex, String value, CellStyle style) {
    var cell = row.createCell(columnIndex);
    cell.setCellValue(value != null ? value : "");
    cell.setCellStyle(style);
  }

  private void autosize(XSSFSheet sheet, int columns) {
    for (int i = 0; i < columns; i++) {
      sheet.autoSizeColumn(i);
      sheet.setColumnWidth(i, Math.min(sheet.getColumnWidth(i) + 768, 16000));
    }
  }

  private Image loadLogo() throws IOException, DocumentException {
    byte[] logoBytes = loadLogoBytes();
    if (logoBytes == null) {
      return null;
    }

    return Image.getInstance(logoBytes);
  }

  private byte[] loadLogoBytes() throws IOException {
    ClassPathResource resource = new ClassPathResource("reports/logo-cpsp.png");
    if (!resource.exists()) {
      return null;
    }

    try (InputStream inputStream = resource.getInputStream()) {
      return inputStream.readAllBytes();
    }
  }

  private String buildFilename(String prefix, String extension) {
    return prefix + "-" + LocalDate.now(appClock).format(FILE_DATE_FORMAT) + "." + extension;
  }

  private String normalizeFormat(String format) {
    if (format == null || format.isBlank()) {
      return "pdf";
    }

    return format.trim().toLowerCase();
  }

  private String formatDate(LocalDate value) {
    return value != null ? value.format(DISPLAY_DATE_FORMAT) : "-";
  }

  private String formatMoney(BigDecimal value) {
    BigDecimal normalized = value != null ? value : BigDecimal.ZERO;
    return "S/ " + normalized.setScale(2, java.math.RoundingMode.HALF_UP);
  }

  private String formatConceptAmount(
      String tipoConcepto,
      String tipoDescuento,
      BigDecimal valorDescuento,
      BigDecimal montoBase) {
    if ("DESCUENTO".equalsIgnoreCase(tipoConcepto)) {
      if ("PORCENTAJE".equalsIgnoreCase(tipoDescuento)) {
        BigDecimal normalized = valorDescuento != null ? valorDescuento : BigDecimal.ZERO;
        return normalized.setScale(2, java.math.RoundingMode.HALF_UP) + "%";
      }

      return formatMoney(valorDescuento);
    }

    return formatMoney(montoBase);
  }

  private String safe(String value) {
    return safe(value, "-");
  }

  private String safe(String value, String fallback) {
    return value != null && !value.isBlank() ? value : fallback;
  }

  private record SummaryBox(String label, String value) {}

  public record ReportFile(String filename, String contentType, byte[] content) {}
}
