import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export const generateBundlePDF = async (bundle: any) => {
  const { qrTypeId: qrType, qrIds: qrs } = bundle;

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  const qrsPerPage = 4; // 2x2 layout
  const columnsPerPage = 2;
  const totalPages = Math.ceil(qrs.length / qrsPerPage);

  // Try loading template image
  let templateImage: any;
  try {
    const templatePath = path.join(__dirname, "template.png");
    const buffer = fs.readFileSync(templatePath);
    templateImage = await pdfDoc.embedPng(buffer);
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.warn("Template image not found:", e.message);
    } else {
      console.warn("Template image not found:", String(e));
    }
  }

  // Try loading QR type icon
  let qrTypeIcon: any;
  try {
    if (qrType?.qrName === "Test") {
      const iconPath = path.join(__dirname, "policeTag.png");
      const buffer = fs.readFileSync(iconPath);
      qrTypeIcon = await pdfDoc.embedPng(buffer);
    } else if (qrType?.qrIcon) {
      const resp = await fetch(qrType.qrIcon);
      if (resp.ok) {
        const buffer = await resp.arrayBuffer();
        qrTypeIcon = await pdfDoc.embedPng(buffer);
      }
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.warn("QR type icon not found:", e.message);
    } else {
      console.warn("QR type icon not found:", String(e));
    }
  }

  for (let pageNum = 0; pageNum < totalPages; pageNum++) {
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    // Header
    page.drawText(`Bundle: ${bundle.bundleId}`, {
      x: margin,
      y: height - margin,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(`QR Type: ${qrType?.qrName}`, {
      x: margin,
      y: height - margin - 25,
      size: 12,
      font,
    });

    page.drawText(`Total QRs: ${qrs.length}`, {
      x: margin,
      y: height - margin - 40,
      size: 12,
      font,
    });

    page.drawText(
      `Created by: ${bundle.createdBy?.firstName || ""} ${
        bundle.createdBy?.lastName || ""
      }`,
      {
        x: margin,
        y: height - margin - 55,
        size: 12,
        font,
      }
    );

    page.drawText(`Page ${pageNum + 1} of ${totalPages}`, {
      x: margin,
      y: height - margin - 70,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Layout settings
    const headerHeight = 80;
    const availableHeight = height - 2 * margin - headerHeight;
    const availableWidth = width - 2 * margin;

    const templateSize = 250;
    const qrSize = 80;
    const qrTypeIconSize = 50;
    const columnSpacing = 50;
    const rowSpacing = 60;

    const totalWidth =
      columnsPerPage * templateSize + (columnsPerPage - 1) * columnSpacing;
    const startX = margin + (availableWidth - totalWidth) / 2;
    const startY = height - margin - headerHeight + 60;

    // Draw QRs
    for (let i = 0; i < qrsPerPage; i++) {
      const qrIndex = pageNum * qrsPerPage + i;
      if (qrIndex >= qrs.length) break;

      const qr = qrs[qrIndex];
      const row = Math.floor(i / columnsPerPage);
      const col = i % columnsPerPage;

      const x = startX + col * (templateSize + columnSpacing);
      const y =
        startY - row * (templateSize + rowSpacing) - templateSize / 2 + 20;

      // Template background
      if (templateImage) {
        page.drawImage(templateImage, {
          x,
          y: y - templateSize,
          width: templateSize,
          height: templateSize,
        });
      }

        // Draw first part of serial (before '-') at top of the template
        try {
          const serialFull = (qr.serialNumber || "").toString();
          const firstPart = serialFull.split("-")[0] || "";
          if (firstPart) {
            const maxTextWidth = templateSize - 20;
            const textWidthAt1 = font.widthOfTextAtSize(firstPart, 1);
            let textSize = textWidthAt1 > 0 ? Math.min(8, maxTextWidth / textWidthAt1) : 8;
            if (textSize < 5) textSize = 5;
            const textWidth = font.widthOfTextAtSize(firstPart, textSize);
            const textX = x + (templateSize - textWidth) / 2;
            // position 10px above the QR image
            const yQR = y - templateSize + (templateSize - qrSize) / 2 - 40;
            let textY = yQR + qrSize + 5;
            if (textY > height - 20) textY = height - 20;
            page.drawText(firstPart, {
              x: textX,
              y: textY,
              size: textSize,
              font: boldFont,
              color: rgb(0, 0, 0),
            });
          }
        } catch (err) {
          // ignore
        }

      // QR type icon
      if (qrTypeIcon) {
        page.drawImage(qrTypeIcon, {
          x: x + (templateSize - qrTypeIconSize) / 2,
          y: y - templateSize + (templateSize - qrSize) / 2 + qrSize - 20,
          width: qrTypeIconSize,
          height: qrTypeIconSize,
        });
      }

      // QR image
      try {
        const resp = await fetch(qr.qrUrl);
        if (resp.ok) {
          const buffer = await resp.arrayBuffer();
          const qrImage = await pdfDoc.embedPng(buffer);
          page.drawImage(qrImage, {
            x: x + (templateSize - qrSize) / 2,
            y: y - templateSize + (templateSize - qrSize) / 2 - 40,
            width: qrSize,
            height: qrSize,
          });
          // Draw last 5 characters of serial centered below QR (reduced gap)
          try {
            const serialFull = (qr.serialNumber || "").toString();
            const last5 = serialFull.slice(-5) || "";
            if (last5) {
              const xQR = x + (templateSize - qrSize) / 2;
              const yQR = y - templateSize + (templateSize - qrSize) / 2 - 40;
              const maxTextWidth = qrSize;
              const textWidthAt1 = font.widthOfTextAtSize(last5, 1);
                let textSize = textWidthAt1 > 0 ? Math.min(6, maxTextWidth / textWidthAt1) : 6;
                if (textSize < 3) textSize = 3;
              const textWidth = font.widthOfTextAtSize(last5, textSize);
              const textX = xQR + (qrSize - textWidth) / 2;
              const textY = yQR - 8; // decreased gap
              page.drawText(last5, {
                x: textX,
                y: textY,
                size: textSize,
                font: boldFont,
                color: rgb(0, 0, 0),
              });
            }
          } catch (err) {
            // ignore
          }
        }
      } catch (e) {
        // fallback placeholder and serial parts
        try {
          const serialFull = (qr.serialNumber || "").toString();
          const firstPart = serialFull.split("-")[0] || serialFull;
          page.drawText(`QR ${firstPart}`, {
            x: x + templateSize / 2 - 30,
            y: y - templateSize / 2,
            size: 12,
            font: boldFont,
            color: rgb(0.7, 0.7, 0.7),
          });
          const last5 = serialFull.slice(-5) || "";
          if (last5) {
            const xQR = x + (templateSize - qrSize) / 2;
            const yQR = y - templateSize + (templateSize - qrSize) / 2 - 40;
            const maxTextWidth = qrSize;
            const textWidthAt1 = font.widthOfTextAtSize(last5, 1);
            let textSize = textWidthAt1 > 0 ? Math.min(6, maxTextWidth / textWidthAt1) : 6;
            if (textSize < 3) textSize = 3;
            const textWidth = font.widthOfTextAtSize(last5, textSize);
            const textX = xQR + (qrSize - textWidth) / 2;
            const textY = yQR - 5;
            page.drawText(last5, {
              x: textX,
              y: textY,
              size: textSize,
              font: boldFont,
              color: rgb(0.7, 0.7, 0.7),
            });
          }
        } catch (err) {
          // ignore
        }
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

export const generateQRPDF = async (qr: any, qrType: any) => {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;

  // Try loading template image
  let templateImage: any;
  try {
    const templatePath = path.join(__dirname, "template.png");
    const buffer = fs.readFileSync(templatePath);
    templateImage = await pdfDoc.embedPng(buffer);
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.warn("Template image not found:", e.message);
    } else {
      console.warn("Template image not found:", String(e));
    }
  }

  // Try loading QR type icon
  let qrTypeIcon: any;
  try {
    if (qrType?.qrName === "Test") {
      const iconPath = path.join(__dirname, "policeTag.png");
      const buffer = fs.readFileSync(iconPath);
      qrTypeIcon = await pdfDoc.embedPng(buffer);
    } else if (qrType?.qrIcon) {
      const resp = await fetch(qrType.qrIcon);
      if (resp.ok) {
        const buffer = await resp.arrayBuffer();
        qrTypeIcon = await pdfDoc.embedPng(buffer);
      }
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.warn("QR type icon not found:", e.message);
    } else {
      console.warn("QR type icon not found:", String(e));
    }
  }

  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();

  // Header label
  page.drawText(`QR`, {
    x: margin,
    y: height - margin,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(`QR Type: ${qrType?.qrName}`, {
    x: margin,
    y: height - margin - 25,
    size: 12,
    font,
  });

  page.drawText(`Status: ${qr.qrStatus}`, {
    x: margin,
    y: height - margin - 40,
    size: 12,
    font,
  });

  page.drawText(`Created by: ${qr.createdBy?.firstName || ""} ${qr.createdBy?.lastName || ""}`, {
    x: margin,
    y: height - margin - 55,
    size: 12,
    font,
  });

  // Layout settings
  const headerHeight = 80;
  const availableHeight = height - 2 * margin - headerHeight;
  const availableWidth = width - 2 * margin;

  const templateSize = 250;
  const qrSize = 80;
  const qrTypeIconSize = 50;

  const startX = margin + (availableWidth - templateSize) / 2;
  const startY = height - margin - headerHeight + 60;

  // Template background
  if (templateImage) {
    page.drawImage(templateImage, {
      x: startX,
      y: startY - templateSize,
      width: templateSize,
      height: templateSize,
    });
  }

  // Draw first part of serial (before '-') at top of the QR template (not top of page)
  try {
    const serialFull = (qr.serialNumber || "").toString();
    const firstPart = serialFull.split("-")[0] || "";
    if (firstPart) {
      const maxTextWidth = templateSize - 20;
      const textWidthAt1 = font.widthOfTextAtSize(firstPart, 1);
      let textSize = textWidthAt1 > 0 ? Math.min(8, maxTextWidth / textWidthAt1) : 8;
      if (textSize < 5) textSize = 5;
      const textWidth = font.widthOfTextAtSize(firstPart, textSize);
      const textX = startX + (templateSize - textWidth) / 2;
      // position 10px above the QR image for single-QR page
      const yQR = startY - templateSize + (templateSize - qrSize) / 2 - 40;
      let textY = yQR + qrSize + 5;
      if (textY > height - 20) textY = height - 20;
      page.drawText(firstPart, {
        x: textX,
        y: textY,
        size: textSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
    }
  } catch (err) {
    // ignore
  }

  // QR type icon
  if (qrTypeIcon) {
    page.drawImage(qrTypeIcon, {
      x: startX + (templateSize - qrTypeIconSize) / 2,
      y: startY - templateSize + (templateSize - qrSize) / 2 + qrSize - 20,
      width: qrTypeIconSize,
      height: qrTypeIconSize,
    });
  }

  // QR image
  try {
    const resp = await fetch(qr.qrUrl);
    if (resp.ok) {
      const buffer = await resp.arrayBuffer();
      const qrImage = await pdfDoc.embedPng(buffer);
      page.drawImage(qrImage, {
        x: startX + (templateSize - qrSize) / 2,
        y: startY - templateSize + (templateSize - qrSize) / 2 - 40,
        width: qrSize,
        height: qrSize,
      });
      // Draw serial number centered below the QR image and scaled to fit QR width
      try {
        const serialFull = (qr.serialNumber || "").toString();
        const last5 = serialFull.slice(-5) || "";
        if (last5) {
          const xQR = startX + (templateSize - qrSize) / 2;
          const yQR = startY - templateSize + (templateSize - qrSize) / 2 - 40;
          const maxTextWidth = qrSize;
          const textWidthAt1 = font.widthOfTextAtSize(last5, 1);
          let textSize = textWidthAt1 > 0 ? Math.min(6, maxTextWidth / textWidthAt1) : 6;
          if (textSize < 3) textSize = 3;
          const textWidth = font.widthOfTextAtSize(last5, textSize);
          const textX = xQR + (qrSize - textWidth) / 2;
          const textY = yQR - 5; // decreased gap
          page.drawText(last5, {
            x: textX,
            y: textY,
            size: textSize,
            font: boldFont,
            color: rgb(0, 0, 0),
          });
        }
      } catch (e) {
        // ignore text drawing errors
      }
    }
  } catch (e) {
    // fallback placeholder and serial parts
    try {
      const serialFull = (qr.serialNumber || "").toString();
      const firstPart = serialFull.split("-")[0] || serialFull;
      page.drawText(`QR ${firstPart}`, {
        x: startX + templateSize / 2 - 30,
        y: startY - templateSize / 2,
        size: 12,
        font: boldFont,
        color: rgb(0.7, 0.7, 0.7),
      });
      const last5 = serialFull.slice(-5) || "";
      if (last5) {
        const xQR = startX + (templateSize - qrSize) / 2;
        const yQR = startY - templateSize + (templateSize - qrSize) / 2 - 40;
        const maxTextWidth = qrSize;
        const textWidthAt1 = font.widthOfTextAtSize(last5, 1);
        let textSize = textWidthAt1 > 0 ? Math.min(6, maxTextWidth / textWidthAt1) : 6;
        if (textSize < 3) textSize = 3;
        const textWidth = font.widthOfTextAtSize(last5, textSize);
        const textX = xQR + (qrSize - textWidth) / 2;
        const textY = yQR - 5;
        page.drawText(last5, {
          x: textX,
          y: textY,
          size: textSize,
          font: boldFont,
          color: rgb(0.7, 0.7, 0.7),
        });
      }
    } catch (err) {
      // ignore
    }
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};
