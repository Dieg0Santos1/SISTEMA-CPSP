package pe.cpsp.sistema.inventario.application;

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
import java.time.Clock;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
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
import pe.cpsp.sistema.inventario.api.dto.InventarioEntregaMemberResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioProductoDetailResponse;

@Service
public class InventarioReportService {

  private static final String INSTITUTION_NAME = "COLEGIO DE PSICOLOGOS DE LIMA";
  private static final String INSTITUTION_SUBTITLE = "SISTEMA DE GESTION INSTITUCIONAL";
  private static final DateTimeFormatter FILE_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");
  private static final DateTimeFormatter DISPLAY_DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

  private final InventarioService inventarioService;
  private final Clock appClock;

  public InventarioReportService(InventarioService inventarioService, Clock appClock) {
    this.inventarioService = inventarioService;
    this.appClock = appClock;
  }

  public ReportFile exportProducto(Long productoId, String format) {
    InventarioProductoDetailResponse producto = inventarioService.getProductoDetail(productoId);
    String normalizedFormat = format == null ? "pdf" : format.trim().toLowerCase();

    if ("pdf".equals(normalizedFormat)) {
      return new ReportFile(
          buildFilename(producto.nombre(), "pdf"),
          "application/pdf",
          buildProductoPdf(producto));
    }

    return new ReportFile(
        buildFilename(producto.nombre(), "xlsx"),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        buildProductoExcel(producto));
  }

  private byte[] buildProductoPdf(InventarioProductoDetailResponse producto) {
    try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
      Document document = new Document(PageSize.A4.rotate(), 28f, 28f, 28f, 28f);
      PdfWriter.getInstance(document, outputStream);
      document.open();

      addHeader(document, producto);
      addSummaryTable(document, producto);

      PdfPTable table = new PdfPTable(new float[] {1.3f, 2.7f, 2f, 1.4f, 1.2f});
      table.setWidthPercentage(100);

      addHeaderCell(table, "Codigo");
      addHeaderCell(table, "Colegiado");
      addHeaderCell(table, "Especialidad");
      addHeaderCell(table, "Estado");
      addHeaderCell(table, "Entrega");

      for (InventarioEntregaMemberResponse member : producto.colegiados()) {
        table.addCell(buildBodyCell(member.codigoColegiatura(), Element.ALIGN_CENTER));
        table.addCell(buildBodyCell(member.nombreCompleto()));
        table.addCell(buildBodyCell(member.especialidadPrincipal()));
        table.addCell(buildBodyCell(member.estado(), Element.ALIGN_CENTER));
        table.addCell(buildBodyCell(member.entregado() ? "Entregado" : "Pendiente", Element.ALIGN_CENTER));
      }

      document.add(table);
      document.close();
      return outputStream.toByteArray();
    } catch (DocumentException | IOException exception) {
      throw new IllegalStateException("No se pudo generar el reporte PDF del producto.", exception);
    }
  }

  private byte[] buildProductoExcel(InventarioProductoDetailResponse producto) {
    try (XSSFWorkbook workbook = new XSSFWorkbook();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
      XSSFSheet sheet = workbook.createSheet("Producto");
      insertLogo(workbook, sheet);

      int rowIndex = 6;
      rowIndex = addWorkbookHeading(sheet, rowIndex, producto.nombre());
      rowIndex = addWorkbookSubheading(sheet, rowIndex, "Codigo: " + safe(producto.codigo()) + " | Categoria: " + safe(producto.categoria()));
      rowIndex++;

      rowIndex = addKeyValueRow(sheet, rowIndex, "Stock actual", String.valueOf(producto.stockActual()), "Entregas", String.valueOf(producto.entregasRegistradas()));
      rowIndex = addKeyValueRow(sheet, rowIndex, "Ventas", String.valueOf(producto.ventasRegistradas()), "Precio referencia", formatMoney(producto.precioReferencia()));
      rowIndex++;

      String[] headers = {"Codigo", "Colegiado", "Especialidad", "Estado", "Entrega"};
      CellStyle headerStyle = buildExcelHeaderStyle(workbook);
      CellStyle bodyStyle = buildExcelBodyStyle(workbook);

      XSSFRow headerRow = sheet.createRow(rowIndex++);
      for (int i = 0; i < headers.length; i++) {
        var cell = headerRow.createCell(i);
        cell.setCellValue(headers[i]);
        cell.setCellStyle(headerStyle);
      }

      for (InventarioEntregaMemberResponse member : producto.colegiados()) {
        XSSFRow row = sheet.createRow(rowIndex++);
        createBodyCell(row, 0, member.codigoColegiatura(), bodyStyle);
        createBodyCell(row, 1, member.nombreCompleto(), bodyStyle);
        createBodyCell(row, 2, member.especialidadPrincipal(), bodyStyle);
        createBodyCell(row, 3, member.estado(), bodyStyle);
        createBodyCell(row, 4, member.entregado() ? "Entregado" : "Pendiente", bodyStyle);
      }

      autosize(sheet, headers.length);
      workbook.write(outputStream);
      return outputStream.toByteArray();
    } catch (IOException exception) {
      throw new IllegalStateException("No se pudo generar el reporte Excel del producto.", exception);
    }
  }

  private void addHeader(Document document, InventarioProductoDetailResponse producto)
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
    Paragraph titleParagraph = new Paragraph("Reporte de producto de inventario", new Font(Font.HELVETICA, 16, Font.BOLD));
    titleParagraph.setSpacingBefore(10f);
    textCell.addElement(titleParagraph);
    textCell.addElement(new Paragraph(producto.nombre(), new Font(Font.HELVETICA, 12, Font.BOLD)));
    textCell.addElement(new Paragraph("Generado: " + formatDate(LocalDate.now(appClock)), new Font(Font.HELVETICA, 9, Font.NORMAL)));

    table.addCell(logoCell);
    table.addCell(textCell);
    document.add(table);
  }

  private void addSummaryTable(Document document, InventarioProductoDetailResponse producto) throws DocumentException {
    PdfPTable table = new PdfPTable(4);
    table.setWidthPercentage(100);
    table.setSpacingAfter(14f);

    addSummaryCell(table, "Stock actual", String.valueOf(producto.stockActual()));
    addSummaryCell(table, "Entregas", String.valueOf(producto.entregasRegistradas()));
    addSummaryCell(table, "Ventas", String.valueOf(producto.ventasRegistradas()));
    addSummaryCell(table, "Precio", formatMoney(producto.precioReferencia()));

    document.add(table);
  }

  private void addSummaryCell(PdfPTable table, String label, String value) {
    PdfPCell cell = new PdfPCell();
    cell.setPadding(10f);
    cell.setBorderColor(new java.awt.Color(203, 213, 225));
    cell.setBackgroundColor(new java.awt.Color(248, 250, 252));
    cell.addElement(new Paragraph(label, new Font(Font.HELVETICA, 9, Font.BOLD)));
    Paragraph valueParagraph = new Paragraph(value, new Font(Font.HELVETICA, 13, Font.BOLD));
    valueParagraph.setSpacingBefore(6f);
    cell.addElement(valueParagraph);
    table.addCell(cell);
  }

  private void addHeaderCell(PdfPTable table, String label) {
    PdfPCell cell = new PdfPCell();
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

  private String buildFilename(String productName, String extension) {
    return slugify(productName)
        + "-inventario-"
        + LocalDate.now(appClock).format(FILE_DATE_FORMAT)
        + "."
        + extension;
  }

  private String formatDate(LocalDate value) {
    return value != null ? value.format(DISPLAY_DATE_FORMAT) : "-";
  }

  private String formatMoney(java.math.BigDecimal value) {
    java.math.BigDecimal normalized = value != null ? value : java.math.BigDecimal.ZERO;
    return "S/ " + normalized.setScale(2, java.math.RoundingMode.HALF_UP);
  }

  private String safe(String value) {
    return value != null && !value.isBlank() ? value : "-";
  }

  private String slugify(String value) {
    if (value == null || value.isBlank()) {
      return "producto";
    }

    return value
        .toLowerCase()
        .replaceAll("[^a-z0-9]+", "-")
        .replaceAll("(^-|-$)", "");
  }

  public record ReportFile(String filename, String contentType, byte[] content) {}
}
