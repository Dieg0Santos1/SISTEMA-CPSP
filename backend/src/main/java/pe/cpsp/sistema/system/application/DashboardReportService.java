package pe.cpsp.sistema.system.application;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
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
import org.springframework.stereotype.Service;
import pe.cpsp.sistema.system.api.DashboardUpcomingCeremonyResponse;

@Service
public class DashboardReportService {

  private static final DateTimeFormatter FILE_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");
  private static final DateTimeFormatter DISPLAY_DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

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
      document.open();

      Font titleFont = new Font(Font.HELVETICA, 16, Font.BOLD);
      Font subtitleFont = new Font(Font.HELVETICA, 10, Font.NORMAL);
      Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD);

      document.add(new Paragraph("Proximos Colegiados a Juramentar", titleFont));
      document.add(new Paragraph("Expedientes aprobados y listos para coordinacion institucional.", subtitleFont));
      document.add(new Paragraph(" "));

      PdfPTable table = new PdfPTable(new float[] {2.2f, 1.8f, 4.2f, 3.1f, 2.2f});
      table.setWidthPercentage(100);

      addHeaderCell(table, "Codigo", headerFont);
      addHeaderCell(table, "DNI", headerFont);
      addHeaderCell(table, "Nombre completo", headerFont);
      addHeaderCell(table, "Especialidad", headerFont);
      addHeaderCell(table, "Fecha tentativa", headerFont);

      for (DashboardUpcomingCeremonyResponse row : rows) {
        table.addCell(new Phrase(row.codigo() != null ? row.codigo() : "-"));
        table.addCell(new Phrase(row.dni() != null ? row.dni() : "-"));
        table.addCell(new Phrase(row.nombreCompleto() != null ? row.nombreCompleto() : "-"));
        table.addCell(new Phrase(row.especialidad() != null ? row.especialidad() : "-"));
        table.addCell(new Phrase(formatDate(row.fechaTentativa())));
      }

      document.add(table);
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

  private void addHeaderCell(PdfPTable table, String label, Font font) {
    PdfPCell cell = new PdfPCell(new Phrase(label, font));
    cell.setHorizontalAlignment(Element.ALIGN_CENTER);
    cell.setBackgroundColor(new java.awt.Color(23, 57, 166));
    cell.setPadding(8f);
    table.addCell(cell);
  }

  private String formatDate(LocalDate value) {
    return value != null ? value.format(DISPLAY_DATE_FORMAT) : "-";
  }

  public record ReportFile(String filename, String contentType, byte[] content) {}
}
