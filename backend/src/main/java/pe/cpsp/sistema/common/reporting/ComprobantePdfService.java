package pe.cpsp.sistema.common.reporting;

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
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Objects;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import pe.cpsp.sistema.inventario.api.dto.InventarioVentaItemResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioVentaResponse;
import pe.cpsp.sistema.tesoreria.api.dto.CobroItemResponse;
import pe.cpsp.sistema.tesoreria.api.dto.RegistrarCobroResponse;

@Service
public class ComprobantePdfService {

  private static final String INSTITUTION_NAME = "COLEGIO DE PSICOLOGOS DE LIMA";
  private static final String INSTITUTION_SUBTITLE = "SISTEMA DE GESTION INSTITUCIONAL";
  private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
  private static final Font TITLE_FONT = new Font(Font.HELVETICA, 13, Font.BOLD);
  private static final Font BODY_FONT = new Font(Font.HELVETICA, 10, Font.NORMAL);
  private static final Font SMALL_FONT = new Font(Font.HELVETICA, 8, Font.NORMAL);
  private static final Font HEADER_FONT = new Font(Font.HELVETICA, 9, Font.BOLD);
  private static final Font BOX_TITLE_FONT = new Font(Font.HELVETICA, 10, Font.BOLD);

  public byte[] buildCobroPdf(RegistrarCobroResponse receipt) {
    try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
      Document document = new Document();
      PdfWriter.getInstance(document, outputStream);
      document.setMargins(32f, 32f, 28f, 28f);
      document.open();

      addHeader(
          document,
          receipt.tipoComprobante(),
          buildReference(receipt.serie(), receipt.numeroComprobante()));

      addMetadataTable(
          document,
          "Fecha de emision", formatDate(receipt.fechaEmision()),
          "Metodo de pago", safe(receipt.metodoPago()));

      addCustomerTable(
          document,
          "Cliente",
          safe(receipt.colegiadoNombre()),
          "Codigo",
          safe(receipt.codigoColegiatura()),
          "Documento",
          receipt.tipoComprobante().equals("FACTURA") && hasText(receipt.ruc())
              ? "RUC " + receipt.ruc()
              : "DNI " + safe(receipt.dni()));

      addCobroItemsTable(document, receipt);
      addTotalsBlock(document, receipt.subtotal(), receipt.descuentoTotal(), receipt.moraTotal(), receipt.total());
      addFooter(document, receipt.observacion());

      document.close();
      return outputStream.toByteArray();
    } catch (DocumentException | IOException exception) {
      throw new IllegalStateException("No se pudo generar el comprobante PDF.", exception);
    }
  }

  public byte[] buildVentaPdf(InventarioVentaResponse receipt) {
    try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
      Document document = new Document();
      PdfWriter.getInstance(document, outputStream);
      document.setMargins(32f, 32f, 28f, 28f);
      document.open();

      addHeader(
          document,
          receipt.tipoComprobante(),
          buildReference(receipt.serie(), receipt.numeroComprobante()));

      addMetadataTable(
          document,
          "Fecha de emision", formatDate(receipt.fechaVenta()),
          "Metodo de pago", safe(receipt.metodoPago()));

      addCustomerTable(
          document,
          "Cliente",
          safe(receipt.clienteNombre()),
          "Codigo",
          safe(receipt.clienteCodigo()),
          "Documento",
          safe(receipt.clienteDocumento()));

      addVentaItemsTable(document, receipt);
      addTotalsBlock(document, receipt.total(), BigDecimal.ZERO, BigDecimal.ZERO, receipt.total());
      addFooter(document, receipt.observacion());

      document.close();
      return outputStream.toByteArray();
    } catch (DocumentException | IOException exception) {
      throw new IllegalStateException("No se pudo generar la boleta PDF.", exception);
    }
  }

  private void addHeader(Document document, String tipoComprobante, String reference)
      throws DocumentException, IOException {
    PdfPTable header = new PdfPTable(new float[] {2.8f, 1.55f});
    header.setWidthPercentage(100);
    header.getDefaultCell().setBorder(Rectangle.NO_BORDER);

    PdfPCell institutionCell = new PdfPCell();
    institutionCell.setBorder(Rectangle.NO_BORDER);
    institutionCell.setPadding(0f);

    Image logo = loadLogo();
    if (logo != null) {
      logo.scaleToFit(84f, 84f);
      institutionCell.addElement(logo);
    }

    Paragraph title = new Paragraph(INSTITUTION_NAME, TITLE_FONT);
    title.setSpacingBefore(6f);
    institutionCell.addElement(title);
    institutionCell.addElement(new Paragraph(INSTITUTION_SUBTITLE, BODY_FONT));

    PdfPCell documentCell = new PdfPCell();
    documentCell.setBorderColor(new java.awt.Color(23, 57, 166));
    documentCell.setBorderWidth(1.2f);
    documentCell.setPadding(12f);
    documentCell.setHorizontalAlignment(Element.ALIGN_CENTER);
    documentCell.addElement(new Paragraph(tipoComprobante + " ELECTRONICA", BOX_TITLE_FONT));
    Paragraph referenceParagraph = new Paragraph(reference, new Font(Font.HELVETICA, 16, Font.BOLD));
    referenceParagraph.setSpacingBefore(10f);
    documentCell.addElement(referenceParagraph);

    header.addCell(institutionCell);
    header.addCell(documentCell);

    document.add(header);
    document.add(new Paragraph(" "));
  }

  private void addMetadataTable(
      Document document,
      String labelLeft,
      String valueLeft,
      String labelRight,
      String valueRight)
      throws DocumentException {
    PdfPTable table = new PdfPTable(new float[] {1f, 1f});
    table.setWidthPercentage(100);
    table.setSpacingAfter(10f);
    table.addCell(buildInfoCell(labelLeft, valueLeft));
    table.addCell(buildInfoCell(labelRight, valueRight));
    document.add(table);
  }

  private void addCustomerTable(
      Document document,
      String customerLabel,
      String customerValue,
      String codeLabel,
      String codeValue,
      String documentLabel,
      String documentValue)
      throws DocumentException {
    PdfPTable table = new PdfPTable(new float[] {1.6f, 1.1f, 1.1f});
    table.setWidthPercentage(100);
    table.setSpacingAfter(12f);
    table.addCell(buildInfoCell(customerLabel, customerValue));
    table.addCell(buildInfoCell(codeLabel, codeValue));
    table.addCell(buildInfoCell(documentLabel, documentValue));
    document.add(table);
  }

  private void addCobroItemsTable(Document document, RegistrarCobroResponse receipt)
      throws DocumentException {
    PdfPTable table = new PdfPTable(new float[] {3.2f, 1.3f, 0.85f, 1.15f, 1.2f});
    table.setWidthPercentage(100);
    addTableHeader(table, "Descripcion");
    addTableHeader(table, "Referencia");
    addTableHeader(table, "Cant.");
    addTableHeader(table, "P. unit.");
    addTableHeader(table, "Importe");

    for (CobroItemResponse item : receipt.items()) {
      table.addCell(buildBodyCell(item.concepto()));
      table.addCell(buildBodyCell(safe(item.periodoReferencia(), "-")));
      table.addCell(buildBodyCell(String.valueOf(item.cantidad()), Element.ALIGN_CENTER));
      table.addCell(buildBodyCell(formatMoney(item.montoUnitario()), Element.ALIGN_RIGHT));
      table.addCell(buildBodyCell(formatMoney(item.totalLinea()), Element.ALIGN_RIGHT));
    }

    document.add(table);
  }

  private void addVentaItemsTable(Document document, InventarioVentaResponse receipt)
      throws DocumentException {
    PdfPTable table = new PdfPTable(new float[] {3.1f, 1.15f, 0.85f, 1.15f, 1.2f});
    table.setWidthPercentage(100);
    addTableHeader(table, "Producto");
    addTableHeader(table, "Codigo");
    addTableHeader(table, "Cant.");
    addTableHeader(table, "P. unit.");
    addTableHeader(table, "Importe");

    for (InventarioVentaItemResponse item : receipt.items()) {
      table.addCell(buildBodyCell(item.nombre()));
      table.addCell(buildBodyCell(item.codigo()));
      table.addCell(buildBodyCell(String.valueOf(item.cantidad()), Element.ALIGN_CENTER));
      table.addCell(buildBodyCell(formatMoney(item.precioUnitario()), Element.ALIGN_RIGHT));
      table.addCell(buildBodyCell(formatMoney(item.totalLinea()), Element.ALIGN_RIGHT));
    }

    document.add(table);
  }

  private void addTotalsBlock(
      Document document,
      BigDecimal subtotal,
      BigDecimal descuento,
      BigDecimal mora,
      BigDecimal total)
      throws DocumentException {
    PdfPTable table = new PdfPTable(new float[] {1.4f, 1f});
    table.setWidthPercentage(42);
    table.setHorizontalAlignment(Element.ALIGN_RIGHT);
    table.setSpacingBefore(14f);

    table.addCell(buildTotalsLabelCell("Subtotal"));
    table.addCell(buildTotalsValueCell(formatMoney(subtotal)));
    table.addCell(buildTotalsLabelCell("Descuento"));
    table.addCell(buildTotalsValueCell(formatMoney(descuento)));
    table.addCell(buildTotalsLabelCell("Mora"));
    table.addCell(buildTotalsValueCell(formatMoney(mora)));
    table.addCell(buildTotalsLabelCell("TOTAL", true));
    table.addCell(buildTotalsValueCell(formatMoney(total), true));

    document.add(table);
  }

  private void addFooter(Document document, String observation) throws DocumentException {
    document.add(new Paragraph(" "));
    document.add(new Paragraph("Observacion: " + safe(observation, "Sin observaciones registradas."), SMALL_FONT));
    document.add(new Paragraph("Gracias por su preferencia.", SMALL_FONT));
  }

  private PdfPCell buildInfoCell(String label, String value) {
    PdfPCell cell = new PdfPCell();
    cell.setPadding(10f);
    cell.setBorderColor(new java.awt.Color(203, 213, 225));
    cell.addElement(new Paragraph(label.toUpperCase(), HEADER_FONT));
    Paragraph valueParagraph = new Paragraph(value, BODY_FONT);
    valueParagraph.setSpacingBefore(6f);
    cell.addElement(valueParagraph);
    return cell;
  }

  private void addTableHeader(PdfPTable table, String label) {
    PdfPCell cell = new PdfPCell(new Phrase(label, HEADER_FONT));
    cell.setBackgroundColor(new java.awt.Color(233, 240, 255));
    cell.setPadding(8f);
    cell.setHorizontalAlignment(Element.ALIGN_CENTER);
    table.addCell(cell);
  }

  private PdfPCell buildBodyCell(String value) {
    return buildBodyCell(value, Element.ALIGN_LEFT);
  }

  private PdfPCell buildBodyCell(String value, int alignment) {
    PdfPCell cell = new PdfPCell(new Phrase(safe(value, "-"), BODY_FONT));
    cell.setPadding(8f);
    cell.setHorizontalAlignment(alignment);
    return cell;
  }

  private PdfPCell buildTotalsLabelCell(String label) {
    return buildTotalsLabelCell(label, false);
  }

  private PdfPCell buildTotalsLabelCell(String label, boolean highlight) {
    PdfPCell cell = new PdfPCell(new Phrase(label, highlight ? HEADER_FONT : BODY_FONT));
    cell.setBorder(Rectangle.NO_BORDER);
    cell.setPadding(6f);
    cell.setHorizontalAlignment(Element.ALIGN_LEFT);
    return cell;
  }

  private PdfPCell buildTotalsValueCell(String value) {
    return buildTotalsValueCell(value, false);
  }

  private PdfPCell buildTotalsValueCell(String value, boolean highlight) {
    PdfPCell cell =
        new PdfPCell(new Phrase(value, highlight ? new Font(Font.HELVETICA, 11, Font.BOLD) : BODY_FONT));
    cell.setBorder(Rectangle.NO_BORDER);
    cell.setPadding(6f);
    cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
    return cell;
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

  private String buildReference(String serie, Long numeroComprobante) {
    return safe(serie) + "-" + String.format("%07d", numeroComprobante == null ? 0L : numeroComprobante);
  }

  private String formatDate(LocalDate value) {
    return value != null ? value.format(DATE_FORMAT) : "-";
  }

  private String formatMoney(BigDecimal value) {
    BigDecimal normalized = Objects.requireNonNullElse(value, BigDecimal.ZERO);
    return "S/ " + normalized.setScale(2, java.math.RoundingMode.HALF_UP);
  }

  private boolean hasText(String value) {
    return value != null && !value.isBlank();
  }

  private String safe(String value) {
    return safe(value, "-");
  }

  private String safe(String value, String fallback) {
    return hasText(value) ? value : fallback;
  }
}
