package pe.cpsp.sistema.reportes.application;

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
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
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
import org.springframework.transaction.annotation.Transactional;
import pe.cpsp.sistema.colegiados.api.dto.ColegiadoResponse;
import pe.cpsp.sistema.colegiados.application.ColegiadoService;
import pe.cpsp.sistema.colegiados.domain.model.Colegiado;
import pe.cpsp.sistema.colegiados.infrastructure.persistence.repository.ColegiadoRepository;
import pe.cpsp.sistema.common.exception.InvalidRequestException;
import pe.cpsp.sistema.inventario.domain.model.InventarioVenta;
import pe.cpsp.sistema.inventario.domain.model.InventarioVentaDetalle;
import pe.cpsp.sistema.inventario.infrastructure.persistence.repository.InventarioVentaRepository;
import pe.cpsp.sistema.tesoreria.domain.model.Cobro;
import pe.cpsp.sistema.tesoreria.domain.model.CobroDetalle;
import pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository.CobroRepository;

@Service
@Transactional(readOnly = true)
public class ReportesService {

  private static final String INSTITUTION_NAME = "COLEGIO DE PSICOLOGOS DE LIMA";
  private static final String INSTITUTION_SUBTITLE = "CENTRO DE REPORTES INSTITUCIONALES";
  private static final DateTimeFormatter FILE_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");
  private static final DateTimeFormatter DISPLAY_DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
  private static final Locale LOCALE = Locale.forLanguageTag("es-PE");
  private static final String ESTADO_HABILITADO = "HABILITADO";

  private final ColegiadoRepository colegiadoRepository;
  private final ColegiadoService colegiadoService;
  private final CobroRepository cobroRepository;
  private final InventarioVentaRepository inventarioVentaRepository;
  private final Clock appClock;

  public ReportesService(
      ColegiadoRepository colegiadoRepository,
      ColegiadoService colegiadoService,
      CobroRepository cobroRepository,
      InventarioVentaRepository inventarioVentaRepository,
      Clock appClock) {
    this.colegiadoRepository = colegiadoRepository;
    this.colegiadoService = colegiadoService;
    this.cobroRepository = cobroRepository;
    this.inventarioVentaRepository = inventarioVentaRepository;
    this.appClock = appClock;
  }

  public ReportFile exportColegiadosPorPeriodo(LocalDate from, LocalDate to, String format) {
    validateRange(from, to);
    List<ColegiadoPeriodoRow> rows = loadColegiadosPorPeriodo(from, to);
    String normalizedFormat = normalizeFormat(format);

    if ("pdf".equals(normalizedFormat)) {
      return new ReportFile(
          buildFilename("colegiados-periodo", "pdf"),
          "application/pdf",
          buildColegiadosPdf(rows, from, to));
    }

    return new ReportFile(
        buildFilename("colegiados-periodo", "xlsx"),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        buildColegiadosExcel(rows, from, to));
  }

  public ReportFile exportIngresosPorPeriodo(LocalDate from, LocalDate to, String format) {
    validateRange(from, to);
    List<IngresoPeriodoRow> rows = loadIngresosPorPeriodo(from, to);
    String normalizedFormat = normalizeFormat(format);

    if ("pdf".equals(normalizedFormat)) {
      return new ReportFile(
          buildFilename("ingresos-periodo", "pdf"),
          "application/pdf",
          buildIngresosPdf(rows, from, to));
    }

    return new ReportFile(
        buildFilename("ingresos-periodo", "xlsx"),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        buildIngresosExcel(rows, from, to));
  }

  private List<ColegiadoPeriodoRow> loadColegiadosPorPeriodo(LocalDate from, LocalDate to) {
    return colegiadoService.listAll().stream()
        .filter(colegiado -> colegiado.fechaIniciacion() != null)
        .filter(
            colegiado ->
                !colegiado.fechaIniciacion().isBefore(from)
                    && !colegiado.fechaIniciacion().isAfter(to))
        .map(
            colegiado ->
                new ColegiadoPeriodoRow(
                    colegiado.codigoColegiatura(),
                    colegiado.dni(),
                    buildNombreCompleto(colegiado),
                    safe(colegiado.estado()),
                    colegiado.fechaIniciacion(),
                    colegiado.especialidades().isEmpty()
                        ? "Sin especialidad registrada"
                        : String.join(", ", colegiado.especialidades())))
        .toList();
  }

  private List<IngresoPeriodoRow> loadIngresosPorPeriodo(LocalDate from, LocalDate to) {
    List<IngresoPeriodoRow> cobros =
        cobroRepository.findAllWithDetails().stream()
            .filter(cobro -> cobro.getFechaEmision() != null)
            .filter(cobro -> !cobro.getFechaEmision().isBefore(from) && !cobro.getFechaEmision().isAfter(to))
            .map(
                cobro ->
                    new IngresoPeriodoRow(
                        "Cobro",
                        cobro.getSerie() + "-" + String.format("%07d", cobro.getNumeroComprobante()),
                        cobro.getFechaEmision(),
                        buildNombreCompleto(cobro.getColegiado()),
                        buildCobroDetail(cobro),
                        cobro.getMetodoPago().name(),
                        cobro.getTotal()))
            .toList();

    List<IngresoPeriodoRow> ventas =
        inventarioVentaRepository.findAllByOrderByFechaVentaDescIdDesc().stream()
            .filter(venta -> venta.getFechaVenta() != null)
            .filter(venta -> !venta.getFechaVenta().isBefore(from) && !venta.getFechaVenta().isAfter(to))
            .map(
                venta ->
                    new IngresoPeriodoRow(
                        "Venta",
                        venta.getSerie() + "-" + String.format("%07d", venta.getNumeroComprobante()),
                        venta.getFechaVenta(),
                        venta.getClienteNombre(),
                        buildVentaDetail(venta),
                        venta.getMetodoPago(),
                        venta.getTotal()))
            .toList();

    return java.util.stream.Stream.concat(cobros.stream(), ventas.stream())
        .sorted(Comparator.comparing(IngresoPeriodoRow::fecha).reversed().thenComparing(IngresoPeriodoRow::referencia))
        .toList();
  }

  private byte[] buildColegiadosPdf(
      List<ColegiadoPeriodoRow> rows, LocalDate from, LocalDate to) {
    long habilitados = rows.stream().filter(row -> ESTADO_HABILITADO.equalsIgnoreCase(row.estado())).count();
    long noHabilitados = Math.max(0, rows.size() - habilitados);

    try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
      Document document = new Document(PageSize.A4.rotate(), 28f, 28f, 28f, 28f);
      PdfWriter.getInstance(document, outputStream);
      document.open();

      addReportHeader(
          document,
          "Psicologos colegiados por periodo",
          "Listado de incorporaciones institucionales dentro del rango solicitado.",
          buildRangeLabel(from, to));
      addSummaryTable(
          document,
          List.of(
              new SummaryBox("Total colegiados", String.valueOf(rows.size())),
              new SummaryBox("Habilitados", String.valueOf(habilitados)),
              new SummaryBox("No habilitados", String.valueOf(noHabilitados))));

      PdfPTable table = new PdfPTable(new float[] {1.35f, 1.1f, 2.8f, 1.25f, 1.2f, 2f});
      table.setWidthPercentage(100);

      addHeaderCell(table, "Codigo");
      addHeaderCell(table, "DNI");
      addHeaderCell(table, "Nombre completo");
      addHeaderCell(table, "Estado");
      addHeaderCell(table, "Fecha inicio");
      addHeaderCell(table, "Especialidades");

      for (ColegiadoPeriodoRow row : rows) {
        table.addCell(buildBodyCell(row.codigo(), Element.ALIGN_CENTER));
        table.addCell(buildBodyCell(row.dni(), Element.ALIGN_CENTER));
        table.addCell(buildBodyCell(row.nombreCompleto()));
        table.addCell(buildBodyCell(row.estado(), Element.ALIGN_CENTER));
        table.addCell(buildBodyCell(formatDate(row.fechaIniciacion()), Element.ALIGN_CENTER));
        table.addCell(buildBodyCell(row.especialidades()));
      }

      document.add(table);
      document.close();
      return outputStream.toByteArray();
    } catch (DocumentException | IOException exception) {
      throw new IllegalStateException("No se pudo generar el reporte PDF de colegiados.", exception);
    }
  }

  private byte[] buildColegiadosExcel(
      List<ColegiadoPeriodoRow> rows, LocalDate from, LocalDate to) {
    long habilitados = rows.stream().filter(row -> ESTADO_HABILITADO.equalsIgnoreCase(row.estado())).count();
    long noHabilitados = Math.max(0, rows.size() - habilitados);

    try (XSSFWorkbook workbook = new XSSFWorkbook();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
      XSSFSheet sheet = workbook.createSheet("Colegiados");
      insertLogo(workbook, sheet);

      int rowIndex = 6;
      rowIndex = addWorkbookHeading(sheet, rowIndex, "Psicologos colegiados por periodo");
      rowIndex = addWorkbookSubheading(sheet, rowIndex, buildRangeLabel(from, to));
      rowIndex++;

      rowIndex = addKeyValueRow(sheet, rowIndex, "Total colegiados", String.valueOf(rows.size()), "Habilitados", String.valueOf(habilitados));
      rowIndex = addKeyValueRow(sheet, rowIndex, "No habilitados", String.valueOf(noHabilitados), "Generado", formatDate(LocalDate.now(appClock)));
      rowIndex++;

      String[] headers = {"Codigo", "DNI", "Nombre completo", "Estado", "Fecha inicio", "Especialidades"};
      CellStyle headerStyle = buildExcelHeaderStyle(workbook);
      CellStyle bodyStyle = buildExcelBodyStyle(workbook);

      XSSFRow headerRow = sheet.createRow(rowIndex++);
      for (int column = 0; column < headers.length; column++) {
        var cell = headerRow.createCell(column);
        cell.setCellValue(headers[column]);
        cell.setCellStyle(headerStyle);
      }

      for (ColegiadoPeriodoRow row : rows) {
        XSSFRow dataRow = sheet.createRow(rowIndex++);
        createBodyCell(dataRow, 0, row.codigo(), bodyStyle);
        createBodyCell(dataRow, 1, row.dni(), bodyStyle);
        createBodyCell(dataRow, 2, row.nombreCompleto(), bodyStyle);
        createBodyCell(dataRow, 3, row.estado(), bodyStyle);
        createBodyCell(dataRow, 4, formatDate(row.fechaIniciacion()), bodyStyle);
        createBodyCell(dataRow, 5, row.especialidades(), bodyStyle);
      }

      autosize(sheet, headers.length);
      workbook.write(outputStream);
      return outputStream.toByteArray();
    } catch (IOException exception) {
      throw new IllegalStateException("No se pudo generar el reporte Excel de colegiados.", exception);
    }
  }

  private byte[] buildIngresosPdf(
      List<IngresoPeriodoRow> rows, LocalDate from, LocalDate to) {
    BigDecimal total = rows.stream().map(IngresoPeriodoRow::total).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
    BigDecimal totalCobros =
        rows.stream()
            .filter(row -> "Cobro".equals(row.origen()))
            .map(IngresoPeriodoRow::total)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    BigDecimal totalVentas =
        rows.stream()
            .filter(row -> "Venta".equals(row.origen()))
            .map(IngresoPeriodoRow::total)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
      Document document = new Document(PageSize.A4.rotate(), 28f, 28f, 28f, 28f);
      PdfWriter.getInstance(document, outputStream);
      document.open();

      addReportHeader(
          document,
          "Ingresos por periodo",
          "Consolidado de cobros institucionales y ventas de inventario.",
          buildRangeLabel(from, to));
      addSummaryTable(
          document,
          List.of(
              new SummaryBox("Ingresos totales", formatMoney(total)),
              new SummaryBox("Cobros", formatMoney(totalCobros)),
              new SummaryBox("Ventas", formatMoney(totalVentas)),
              new SummaryBox("Operaciones", String.valueOf(rows.size()))));

      PdfPTable table = new PdfPTable(new float[] {1f, 1.5f, 1.1f, 2.3f, 2.7f, 1.2f, 1.15f});
      table.setWidthPercentage(100);

      addHeaderCell(table, "Origen");
      addHeaderCell(table, "Referencia");
      addHeaderCell(table, "Fecha");
      addHeaderCell(table, "Persona");
      addHeaderCell(table, "Detalle");
      addHeaderCell(table, "Metodo");
      addHeaderCell(table, "Total");

      for (IngresoPeriodoRow row : rows) {
        table.addCell(buildBodyCell(row.origen(), Element.ALIGN_CENTER));
        table.addCell(buildBodyCell(row.referencia(), Element.ALIGN_CENTER));
        table.addCell(buildBodyCell(formatDate(row.fecha()), Element.ALIGN_CENTER));
        table.addCell(buildBodyCell(row.persona()));
        table.addCell(buildBodyCell(row.detalle()));
        table.addCell(buildBodyCell(row.metodoPago(), Element.ALIGN_CENTER));
        table.addCell(buildBodyCell(formatMoney(row.total()), Element.ALIGN_RIGHT));
      }

      document.add(table);
      document.close();
      return outputStream.toByteArray();
    } catch (DocumentException | IOException exception) {
      throw new IllegalStateException("No se pudo generar el reporte PDF de ingresos.", exception);
    }
  }

  private byte[] buildIngresosExcel(
      List<IngresoPeriodoRow> rows, LocalDate from, LocalDate to) {
    BigDecimal total = rows.stream().map(IngresoPeriodoRow::total).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
    BigDecimal totalCobros =
        rows.stream()
            .filter(row -> "Cobro".equals(row.origen()))
            .map(IngresoPeriodoRow::total)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    BigDecimal totalVentas =
        rows.stream()
            .filter(row -> "Venta".equals(row.origen()))
            .map(IngresoPeriodoRow::total)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    try (XSSFWorkbook workbook = new XSSFWorkbook();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
      XSSFSheet sheet = workbook.createSheet("Ingresos");
      insertLogo(workbook, sheet);

      int rowIndex = 6;
      rowIndex = addWorkbookHeading(sheet, rowIndex, "Ingresos por periodo");
      rowIndex = addWorkbookSubheading(sheet, rowIndex, buildRangeLabel(from, to));
      rowIndex++;

      rowIndex = addKeyValueRow(sheet, rowIndex, "Ingresos totales", formatMoney(total), "Cobros", formatMoney(totalCobros));
      rowIndex = addKeyValueRow(sheet, rowIndex, "Ventas", formatMoney(totalVentas), "Operaciones", String.valueOf(rows.size()));
      rowIndex++;

      String[] headers = {"Origen", "Referencia", "Fecha", "Persona", "Detalle", "Metodo", "Total"};
      CellStyle headerStyle = buildExcelHeaderStyle(workbook);
      CellStyle bodyStyle = buildExcelBodyStyle(workbook);

      XSSFRow headerRow = sheet.createRow(rowIndex++);
      for (int column = 0; column < headers.length; column++) {
        var cell = headerRow.createCell(column);
        cell.setCellValue(headers[column]);
        cell.setCellStyle(headerStyle);
      }

      for (IngresoPeriodoRow row : rows) {
        XSSFRow dataRow = sheet.createRow(rowIndex++);
        createBodyCell(dataRow, 0, row.origen(), bodyStyle);
        createBodyCell(dataRow, 1, row.referencia(), bodyStyle);
        createBodyCell(dataRow, 2, formatDate(row.fecha()), bodyStyle);
        createBodyCell(dataRow, 3, row.persona(), bodyStyle);
        createBodyCell(dataRow, 4, row.detalle(), bodyStyle);
        createBodyCell(dataRow, 5, row.metodoPago(), bodyStyle);
        createBodyCell(dataRow, 6, formatMoney(row.total()), bodyStyle);
      }

      autosize(sheet, headers.length);
      workbook.write(outputStream);
      return outputStream.toByteArray();
    } catch (IOException exception) {
      throw new IllegalStateException("No se pudo generar el reporte Excel de ingresos.", exception);
    }
  }

  private void validateRange(LocalDate from, LocalDate to) {
    if (from == null || to == null) {
      throw new InvalidRequestException("Debes indicar la fecha inicial y final del reporte.");
    }

    if (from.isAfter(to)) {
      throw new InvalidRequestException("La fecha inicial no puede ser mayor que la fecha final.");
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

  private CellStyle buildExcelHeaderStyle(XSSFWorkbook workbook) {
    CellStyle style = workbook.createCellStyle();
    style.setFillForegroundColor(IndexedColors.BLUE.getIndex());
    style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
    style.setAlignment(HorizontalAlignment.CENTER);

    XSSFFont font = workbook.createFont();
    font.setBold(true);
    font.setColor(IndexedColors.WHITE.getIndex());
    style.setFont(font);
    return style;
  }

  private CellStyle buildExcelBodyStyle(XSSFWorkbook workbook) {
    CellStyle style = workbook.createCellStyle();
    style.setWrapText(true);
    style.setAlignment(HorizontalAlignment.LEFT);
    return style;
  }

  private int addWorkbookHeading(XSSFSheet sheet, int rowIndex, String title) {
    XSSFRow row = sheet.createRow(rowIndex++);
    row.createCell(0).setCellValue(INSTITUTION_NAME);
    XSSFRow subtitleRow = sheet.createRow(rowIndex++);
    subtitleRow.createCell(0).setCellValue(title);
    return rowIndex;
  }

  private int addWorkbookSubheading(XSSFSheet sheet, int rowIndex, String subtitle) {
    XSSFRow row = sheet.createRow(rowIndex++);
    row.createCell(0).setCellValue(subtitle);
    return rowIndex;
  }

  private int addKeyValueRow(
      XSSFSheet sheet,
      int rowIndex,
      String leftLabel,
      String leftValue,
      String rightLabel,
      String rightValue) {
    XSSFRow row = sheet.createRow(rowIndex++);
    row.createCell(0).setCellValue(leftLabel);
    row.createCell(1).setCellValue(leftValue);
    row.createCell(3).setCellValue(rightLabel);
    row.createCell(4).setCellValue(rightValue);
    return rowIndex;
  }

  private void createBodyCell(XSSFRow row, int columnIndex, String value, CellStyle style) {
    var cell = row.createCell(columnIndex);
    cell.setCellValue(safe(value));
    cell.setCellStyle(style);
  }

  private void autosize(XSSFSheet sheet, int columns) {
    for (int i = 0; i < columns; i++) {
      sheet.autoSizeColumn(i);
      sheet.setColumnWidth(i, Math.min(sheet.getColumnWidth(i) + 900, 18000));
    }
  }

  private void insertLogo(XSSFWorkbook workbook, XSSFSheet sheet) {
    try (InputStream inputStream = new ClassPathResource("reports/logo-cpsp.png").getInputStream()) {
      byte[] bytes = inputStream.readAllBytes();
      int pictureIndex = workbook.addPicture(bytes, XSSFWorkbook.PICTURE_TYPE_PNG);
      var drawing = sheet.createDrawingPatriarch();
      ClientAnchor anchor = workbook.getCreationHelper().createClientAnchor();
      anchor.setCol1(0);
      anchor.setRow1(0);
      anchor.setCol2(1);
      anchor.setRow2(4);
      drawing.createPicture(anchor, pictureIndex);
    } catch (IOException ignored) {
      // Logo optional for export continuity.
    }
  }

  private Image loadLogo() throws IOException, DocumentException {
    ClassPathResource resource = new ClassPathResource("reports/logo-cpsp.png");
    if (!resource.exists()) {
      return null;
    }

    return Image.getInstance(resource.getURL());
  }

  private String buildFilename(String baseName, String extension) {
    return baseName + "-" + LocalDate.now(appClock).format(FILE_DATE_FORMAT) + "." + extension;
  }

  private String normalizeFormat(String format) {
    if (format == null || format.isBlank()) {
      return "pdf";
    }
    return format.trim().toLowerCase(LOCALE);
  }

  private String buildRangeLabel(LocalDate from, LocalDate to) {
    return "Rango: " + formatDate(from) + " al " + formatDate(to);
  }

  private String formatMoney(BigDecimal value) {
    return "S/ " + value.setScale(2, RoundingMode.HALF_UP);
  }

  private String formatDate(LocalDate value) {
    return value != null ? value.format(DISPLAY_DATE_FORMAT) : "-";
  }

  private String buildNombreCompleto(ColegiadoResponse colegiado) {
    return List.of(colegiado.nombre(), colegiado.apellidoPaterno(), colegiado.apellidoMaterno())
        .stream()
        .filter(Objects::nonNull)
        .map(String::trim)
        .filter(value -> !value.isBlank())
        .reduce((left, right) -> left + " " + right)
        .orElse("");
  }

  private String buildNombreCompleto(Colegiado colegiado) {
    return List.of(colegiado.getNombre(), colegiado.getApellidoPaterno(), colegiado.getApellidoMaterno())
        .stream()
        .filter(Objects::nonNull)
        .map(String::trim)
        .filter(value -> !value.isBlank())
        .reduce((left, right) -> left + " " + right)
        .orElse("");
  }

  private String buildCobroDetail(Cobro cobro) {
    List<String> conceptos =
        cobro.getDetalles().stream()
            .map(CobroDetalle::getConceptoCobro)
            .filter(Objects::nonNull)
            .map(concepto -> concepto.getNombre())
            .filter(Objects::nonNull)
            .filter(value -> !value.isBlank())
            .distinct()
            .toList();

    if (conceptos.isEmpty()) {
      return "Cobro institucional";
    }

    if (conceptos.size() == 1) {
      return conceptos.getFirst();
    }

    return conceptos.getFirst() + " +" + (conceptos.size() - 1) + " conceptos";
  }

  private String buildVentaDetail(InventarioVenta venta) {
    List<String> productos =
        venta.getDetalles().stream()
            .map(InventarioVentaDetalle::getProducto)
            .filter(Objects::nonNull)
            .map(producto -> producto.getNombre())
            .filter(Objects::nonNull)
            .filter(value -> !value.isBlank())
            .toList();

    if (productos.isEmpty()) {
      return "Venta de inventario";
    }

    if (productos.size() == 1) {
      return productos.getFirst();
    }

    return productos.getFirst() + " +" + (productos.size() - 1) + " items";
  }

  private String safe(String value) {
    return safe(value, "-");
  }

  private String safe(String value, String fallback) {
    return value == null || value.isBlank() ? fallback : value;
  }

  public record ReportFile(String filename, String contentType, byte[] content) {}

  private record SummaryBox(String label, String value) {}

  private record ColegiadoPeriodoRow(
      String codigo,
      String dni,
      String nombreCompleto,
      String estado,
      LocalDate fechaIniciacion,
      String especialidades) {}

  private record IngresoPeriodoRow(
      String origen,
      String referencia,
      LocalDate fecha,
      String persona,
      String detalle,
      String metodoPago,
      BigDecimal total) {}
}
