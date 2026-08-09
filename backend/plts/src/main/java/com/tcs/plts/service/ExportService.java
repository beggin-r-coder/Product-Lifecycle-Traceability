package com.tcs.plts.service;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import com.tcs.plts.dto.OrderDto;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class ExportService {

    public ByteArrayInputStream exportOrdersToExcel(List<OrderDto.Response> orders) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Orders Lifecycle Report");

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);

            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            String[] columns = { "Order Number", "Product Name", "Quantity", "Priority", "Status", "Organization",
                    "Manufacturer", "QA", "Packaging & Transport", "Retailer", "Created Date" };
            Row headerRow = sheet.createRow(0);

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (OrderDto.Response order : orders) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(order.getOrderNumber());
                row.createCell(1).setCellValue(order.getProductName());
                row.createCell(2).setCellValue(order.getQuantity());
                row.createCell(3).setCellValue(order.getPriority().name());
                row.createCell(4).setCellValue(order.getStatus().name());
                row.createCell(5).setCellValue(order.getOrganizationName());
                row.createCell(6)
                        .setCellValue(order.getManufacturer() != null ? order.getManufacturer().getCompanyName() : "-");
                row.createCell(7).setCellValue(order.getQa() != null ? order.getQa().getCompanyName() : "-");
                row.createCell(8).setCellValue(
                        order.getPackagingTransport() != null ? order.getPackagingTransport().getCompanyName() : "-");
                row.createCell(9)
                        .setCellValue(order.getRetailer() != null ? order.getRetailer().getCompanyName() : "-");
                row.createCell(10).setCellValue(order.getCreatedAt() != null ? order.getCreatedAt().toString() : "-");
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Failed to export Excel report", e);
        }
    }

    public ByteArrayInputStream exportOrderPdf(OrderDto.Response order) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, out);
            document.open();

            // Title
            com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20,
                    com.lowagie.text.Font.NORMAL, new java.awt.Color(30, 64, 175));
            Paragraph title = new Paragraph("Lifecycle Traceability Certificate", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph subTitle = new Paragraph("Order Number: " + order.getOrderNumber(),
                    FontFactory.getFont(FontFactory.HELVETICA, 12));
            subTitle.setAlignment(Element.ALIGN_CENTER);
            subTitle.setSpacingAfter(20);
            document.add(subTitle);

            // Table of Details
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);

            addTableRow(table, "Product Name", order.getProductName());
            addTableRow(table, "Quantity", String.valueOf(order.getQuantity()));
            addTableRow(table, "Current Status", order.getStatus().name());
            addTableRow(table, "Priority", order.getPriority().name());
            addTableRow(table, "Organization", order.getOrganizationName());
            addTableRow(table, "Manufacturer",
                    order.getManufacturer() != null ? order.getManufacturer().getCompanyName() : "N/A");
            addTableRow(table, "Quality Assurance", order.getQa() != null ? order.getQa().getCompanyName() : "N/A");
            addTableRow(table, "Packaging & Transport",
                    order.getPackagingTransport() != null ? order.getPackagingTransport().getCompanyName() : "N/A");
            addTableRow(table, "Retailer", order.getRetailer() != null ? order.getRetailer().getCompanyName() : "N/A");
            addTableRow(table, "Tracking Number",
                    order.getTrackingNumber() != null ? order.getTrackingNumber() : "N/A");

            document.add(table);

            document.close();
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Failed to export PDF report", e);
        }
    }

    private void addTableRow(PdfPTable table, String key, String value) {
        PdfPCell cellKey = new PdfPCell(new Phrase(key, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
        cellKey.setPadding(6);
        cellKey.setBackgroundColor(new java.awt.Color(241, 245, 249));

        PdfPCell cellValue = new PdfPCell(
                new Phrase(value != null ? value : "-", FontFactory.getFont(FontFactory.HELVETICA, 10)));
        cellValue.setPadding(6);

        table.addCell(cellKey);
        table.addCell(cellValue);
    }
}
