"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBundlePDF = void 0;
const pdf_lib_1 = require("pdf-lib");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const generateBundlePDF = (bundle) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { qrTypeId: qrType, qrIds: qrs } = bundle;
    const pdfDoc = yield pdf_lib_1.PDFDocument.create();
    const font = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
    const boldFont = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
    const margin = 50;
    const qrsPerPage = 4; // 2x2 layout
    const columnsPerPage = 2;
    const totalPages = Math.ceil(qrs.length / qrsPerPage);
    // Try loading template image
    let templateImage;
    try {
        const templatePath = path_1.default.join(__dirname, "template.png");
        const buffer = fs_1.default.readFileSync(templatePath);
        templateImage = yield pdfDoc.embedPng(buffer);
    }
    catch (e) {
        if (e instanceof Error) {
            console.warn("Template image not found:", e.message);
        }
        else {
            console.warn("Template image not found:", String(e));
        }
    }
    // Try loading QR type icon
    let qrTypeIcon;
    try {
        if ((qrType === null || qrType === void 0 ? void 0 : qrType.qrName) === "Test") {
            const iconPath = path_1.default.join(__dirname, "policeTag.png");
            const buffer = fs_1.default.readFileSync(iconPath);
            qrTypeIcon = yield pdfDoc.embedPng(buffer);
        }
        else if (qrType === null || qrType === void 0 ? void 0 : qrType.qrIcon) {
            const resp = yield (0, node_fetch_1.default)(qrType.qrIcon);
            if (resp.ok) {
                const buffer = yield resp.arrayBuffer();
                qrTypeIcon = yield pdfDoc.embedPng(buffer);
            }
        }
    }
    catch (e) {
        if (e instanceof Error) {
            console.warn("QR type icon not found:", e.message);
        }
        else {
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
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        page.drawText(`QR Type: ${qrType === null || qrType === void 0 ? void 0 : qrType.qrName}`, {
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
        page.drawText(`Created by: ${((_a = bundle.createdBy) === null || _a === void 0 ? void 0 : _a.firstName) || ""} ${((_b = bundle.createdBy) === null || _b === void 0 ? void 0 : _b.lastName) || ""}`, {
            x: margin,
            y: height - margin - 55,
            size: 12,
            font,
        });
        page.drawText(`Page ${pageNum + 1} of ${totalPages}`, {
            x: margin,
            y: height - margin - 70,
            size: 10,
            font,
            color: (0, pdf_lib_1.rgb)(0.5, 0.5, 0.5),
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
        const totalWidth = columnsPerPage * templateSize + (columnsPerPage - 1) * columnSpacing;
        const startX = margin + (availableWidth - totalWidth) / 2;
        const startY = height - margin - headerHeight + 60;
        // Draw QRs
        for (let i = 0; i < qrsPerPage; i++) {
            const qrIndex = pageNum * qrsPerPage + i;
            if (qrIndex >= qrs.length)
                break;
            const qr = qrs[qrIndex];
            const row = Math.floor(i / columnsPerPage);
            const col = i % columnsPerPage;
            const x = startX + col * (templateSize + columnSpacing);
            const y = startY - row * (templateSize + rowSpacing) - templateSize / 2 + 20;
            // Template background
            if (templateImage) {
                page.drawImage(templateImage, {
                    x,
                    y: y - templateSize,
                    width: templateSize,
                    height: templateSize,
                });
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
                const resp = yield (0, node_fetch_1.default)(qr.qrUrl);
                if (resp.ok) {
                    const buffer = yield resp.arrayBuffer();
                    const qrImage = yield pdfDoc.embedPng(buffer);
                    page.drawImage(qrImage, {
                        x: x + (templateSize - qrSize) / 2,
                        y: y - templateSize + (templateSize - qrSize) / 2 - 40,
                        width: qrSize,
                        height: qrSize,
                    });
                }
            }
            catch (e) {
                page.drawText(`QR ${qr.serialNumber}`, {
                    x: x + templateSize / 2 - 30,
                    y: y - templateSize / 2,
                    size: 16,
                    font: boldFont,
                    color: (0, pdf_lib_1.rgb)(0.7, 0.7, 0.7),
                });
            }
        }
    }
    const pdfBytes = yield pdfDoc.save();
    return Buffer.from(pdfBytes);
});
exports.generateBundlePDF = generateBundlePDF;
