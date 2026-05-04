package pe.cpsp.sistema.system.application;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
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
import java.util.List;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import pe.cpsp.sistema.system.api.DashboardUpcomingCeremonyResponse;

@Service
public class DashboardReportService {

  private static final String INSTITUTION_NAME = "COLEGIO DE PSICOLOGOS DE LIMA";
  private static final String INSTITUTION_SUBTITLE = "CENTRO DE REPORTES INSTITUCIONALES";
  private static final DateTimeFormatter FILE_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");
  private static final DateTimeFormatter DISPLAY_DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
  private static final java.awt.Color COBALT = new java.awt.Color(23, 57, 166);
  private static final java.awt.Color BORDER = new java.awt.Color(203, 213, 225);
  private static final java.awt.Color SOFT_BG = new java.awt.Color(244, 247, 255);
  private static final java.awt.Color STRIPE = new java.awt.Color(250, 252, 255);
  private static final Font TITLE_FONT = new Font(Font.HELVETICA, 17, Font.BOLD);
  private static final Font SUBTITLE_FONT = new Font(Font.HELVETICA, 10, Font.NORMAL);
  private static final Font SECTION_FONT = new Font(Font.HELVETICA, 9, Font.BOLD, COBALT);
  private static final Font HEADER_FONT = new Font(Font.HELVETICA, 9, Font.BOLD, java.awt.Color.WHITE);
  private static final Font BODY_FONT = new Font(Font.HELVETICA, 10, Font.NORMAL);
  private static final Font SMALL_FONT = new Font(Font.HELVETICA, 8, Font.NORMAL);
  private static final Font METRIC_VALUE_FONT = new Font(Font.HELVETICA, 16, Font.BOLD);
  private static final Font METRIC_LABEL_FONT = new Font(Font.HELVETICA, 8, Font.BOLD, new java.awt.Color(100, 116, 139));

  private final DashboardService dashboardService;
  private final Clock appClock;

  public DashboardReportService(DashboardService dashboardService, Clock appClock) {
    this.dashboardService = dashboardService;
    this.appClock = appClock;
  }

  public ReportFile exportUpcomingCeremonies(String format) {
    List<DashboardUpcomingCeremonyResponse> rows = dashboardService.getUpcomingCeremonies();
    String normalizedFormat = format == null ? "xlsx" : format.trim().toLowerCase();

    if ("pdf".equals(normalizedFormat)) {
      return new ReportFile(
          buildFilename("pdf"),
          "application/pdf",
          buildUpcomingCeremoniesPdf(rows));
    }

    return new ReportFile(
        buildFilename("xlsx"),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        buildUpcomingCeremoniesExcel(rows));
  }

  private String buildFilename(String extension) {
    return "proximos-juramentar-" + LocalDate.now(appClock).format(FILE_DATE_FORMAT) + "." + extension;
  }

  private byte[] buildUpcomingCeremoniesPdf(List<DashboardUpcomingCeremonyResponse> rows) {
    try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
      Document document = new Document();
      PdfWriter.getInstance(document, outputStream);
      document.setMargins(34f, 34f, 30f, 28f);
      document.open();

      addHeader(document, rows.size());
      addSummary(document, rows.size());

      PdfPTable table = new PdfPTable(new float[] {1.6f, 1.3f, 3.1f, 2.5f, 1.7f});
      table.setWidthPercentage(100);
      table.setSpacingBefore(6f);

      addHeaderCell(table, "Codigo");
      addHeaderCell(table, "DNI");
      addHeaderCell(table, "Nombre completo");
      addHeaderCell(table, "Especialidad");
      addHeaderCell(table, "Fecha tentativa");

      if (rows.isEmpty()) {
        PdfPCell emptyCell =
            new PdfPCell(new Phrase("No hay colegiados pendientes de juramentacion para mostrar.", BODY_FONT));
        emptyCell.setColspan(5);
        emptyCell.setPadding(14f);
        emptyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        emptyCell.setBorderColor(BORDER);
        table.addCell(emptyCell);
      } else {
        for (int index = 0; index < rows.size(); index++) {
          DashboardUpcomingCeremonyResponse row = rows.get(index);
          java.awt.Color background = index % 2 == 0 ? java.awt.Color.WHITE : STRIPE;
          table.addCell(buildBodyCell(row.codigo(), Element.ALIGN_CENTER, background));
          table.addCell(buildBodyCell(row.dni(), Element.ALIGN_CENTER, background));
          table.addCell(buildBodyCell(row.nombreCompleto(), Element.ALIGN_LEFT, background));
          table.addCell(buildBodyCell(row.especialidad(), Element.ALIGN_LEFT, background));
          table.addCell(buildBodyCell(formatDate(row.fechaTentativa()), Element.ALIGN_CENTER, background));
        }
      }

      document.add(table);
      addFooter(document);
      document.close();
      return outputStream.toByteArray();
    } catch (DocumentException | IOException exception) {
      throw new IllegalStateException("No se pudo generar el reporte PDF de juramentacion.", exception);
    }
  }

  private byte[] buildUpcomingCeremoniesExcel(List<DashboardUpcomingCeremonyResponse> rows) {
    try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
      XSSFSheet sheet = workbook.createSheet("Juramentacion");

      XSSFFont headerFont = workbook.createFont();
      headerFont.setBold(true);
      headerFont.setColor(IndexedColors.WHITE.getIndex());

      CellStyle headerStyle = workbook.createCellStyle();
      headerStyle.setFillForegroundColor(IndexedColors.BLUE.getIndex());
      headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
      headerStyle.setAlignment(HorizontalAlignment.CENTER);
      headerStyle.setFont(headerFont);

      String[] headers = {"Codigo", "DNI", "Nombre completo", "Especialidad", "Fecha tentativa"};
      Row headerRow = sheet.createRow(0);
      for (int column = 0; column < headers.length; column++) {
        var cell = headerRow.createCell(column);
        cell.setCellValue(headers[column]);
        cell.setCellStyle(headerStyle);
      }

      for (int index = 0; index < rows.size(); index++) {
        DashboardUpcomingCeremonyResponse rowData = rows.get(index);
        Row row = sheet.createRow(index + 1);
        row.createCell(0).setCellValue(rowData.codigo() != null ? rowData.codigo() : "");
        row.createCell(1).setCellValue(rowData.dni() != null ? rowData.dni() : "");
        row.createCell(2).setCellValue(rowData.nombreCompleto() != null ? rowData.nombreCompleto() : "");
        row.createCell(3).setCellValue(rowData.especialidad() != null ? rowData.especialidad() : "");
        row.createCell(4).setCellValue(formatDate(rowData.fechaTentativa()));
      }

      for (int column = 0; column < headers.length; column++) {
        sheet.autoSizeColumn(column);
      }

      workbook.write(outputStream);
      return outputStream.toByteArray();
    } catch (IOException exception) {
      throw new IllegalStateException("No se pudo generar el reporte Excel de juramentacion.", exception);
    }
  }

  private void addHeader(Document document, int totalRows) throws DocumentException, IOException {
    PdfPTable header = new PdfPTable(new float[] {1.15f, 3.4f});
    header.setWidthPercentage(100);
    header.getDefaultCell().setBorder(Rectangle.NO_BORDER);

    PdfPCell logoCell = new PdfPCell();
    logoCell.setBorder(Rectangle.NO_BORDER);
    logoCell.setPadding(0f);

    Image logo = loadLogo();
    if (logo != null) {
      logo.scaleToFit(82f, 82f);
      logoCell.addElement(logo);
    }

    PdfPCell titleCell = new PdfPCell();
    titleCell.setBorder(Rectangle.NO_BORDER);
    titleCell.setPaddingLeft(6f);

    Paragraph institution = new Paragraph(INSTITUTION_NAME, new Font(Font.HELVETICA, 18, Font.BOLD));
    institution.setSpacingBefore(4f);
    titleCell.addElement(institution);
    titleCell.addElement(new Paragraph(INSTITUTION_SUBTITLE, SUBTITLE_FONT));

    Paragraph chip = new Paragraph("REPORTE INSTITUCIONAL", SECTION_FONT);
    chip.setSpacingBefore(10f);
    titleCell.addElement(chip);

    Paragraph title = new Paragraph("Proximos Colegiados a Juramentar", TITLE_FONT);
    title.setSpacingBefore(8f);
    titleCell.addElement(title);

    titleCell.addElement(
        new Paragraph(
            "Expedientes aprobados y listos para coordinacion institucional y programacion de ceremonia.",
            SUBTITLE_FONT));
    titleCell.addElement(
        new Paragraph(
            "Generado: " + formatDate(LocalDate.now(appClock)) + "  |  Registros: " + totalRows,
            SMALL_FONT));

    header.addCell(logoCell);
    header.addCell(titleCell);

    document.add(header);
    document.add(new Paragraph(" "));
  }

  private void addSummary(Document document, int totalRows) throws DocumentException {
    PdfPTable summary = new PdfPTable(new float[] {1.1f, 1.3f, 1.5f});
    summary.setWidthPercentage(100);
    summary.setSpacingAfter(14f);

    summary.addCell(buildMetricCell("Pendientes", String.valueOf(totalRows)));
    summary.addCell(buildMetricCell("Fecha de emision", formatDate(LocalDate.now(appClock))));
    summary.addCell(buildMetricCell("Estado del corte", totalRows > 0 ? "Lista disponible" : "Sin pendientes"));

    document.add(summary);
  }

  private PdfPCell buildMetricCell(String label, String value) {
    PdfPCell cell = new PdfPCell();
    cell.setPadding(12f);
    cell.setBorderColor(BORDER);
    cell.setBackgroundColor(SOFT_BG);
    cell.addElement(new Paragraph(label.toUpperCase(), METRIC_LABEL_FONT));
    Paragraph valueParagraph = new Paragraph(value, METRIC_VALUE_FONT);
    valueParagraph.setSpacingBefore(8f);
    cell.addElement(valueParagraph);
    return cell;
  }

  private void addHeaderCell(PdfPTable table, String label) {
    PdfPCell cell = new PdfPCell(new Phrase(label, HEADER_FONT));
    cell.setHorizontalAlignment(Element.ALIGN_CENTER);
    cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
    cell.setBackgroundColor(COBALT);
    cell.setBorderColor(COBALT);
    cell.setPadding(9f);
    table.addCell(cell);
  }

  private PdfPCell buildBodyCell(String value, int alignment, java.awt.Color background) {
    PdfPCell cell = new PdfPCell(new Phrase(value != null && !value.isBlank() ? value : "-", BODY_FONT));
    cell.setPadding(9f);
    cell.setHorizontalAlignment(alignment);
    cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
    cell.setBorderColor(BORDER);
    cell.setBackgroundColor(background);
    return cell;
  }

  private void addFooter(Document document) throws DocumentException {
    Paragraph footer = new Paragraph(
        "Documento generado por el Sistema de Gestion Institucional del Colegio de Psicologos de Lima.",
        SMALL_FONT);
    footer.setSpacingBefore(12f);
    footer.setAlignment(Element.ALIGN_RIGHT);
    document.add(footer);
  }

  private Image loadLogo() throws IOException, DocumentException {
    ClassPathResource resource = new ClassPathResource("reports/logo-cpsp.png");
    if (!resource.exists()) {
      return null;
    }

    try (InputStream inputStream = resource.getInputStream()) {
      return Image.getInstance(inputStream.readAllBytes());
    }
  }

  private String formatDate(LocalDate value) {
    return value != null ? value.format(DISPLAY_DATE_FORMAT) : "-";
  }

  public record ReportFile(String filename, String contentType, byte[] content) {}
}
