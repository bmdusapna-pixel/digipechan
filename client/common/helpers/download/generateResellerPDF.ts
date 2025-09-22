import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { aboutData } from "@/data/about-data";

interface jsPDFWithAutoTable extends jsPDF {
    lastAutoTable: {
        finalY: number;
    };
}

export function generateResellerPDF() {
    const { resellerTerms } = aboutData;
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
    });

    let y = 15;
    const leftMargin = 14;
    const lineSpacing = 5;
    const sectionSpacing = 5;
    const contentWidth = 180;

    doc.setFont("helvetica");

    doc.setFontSize(16);
    doc.text("PahechanKaro", leftMargin, y);
    y += 8;
    doc.setFontSize(13);
    doc.text(resellerTerms.title, leftMargin, y);
    y += 6;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Generated on: ${dateStr}`, leftMargin, y);
    y += 10;

    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Introduction:", leftMargin, y);
    y += lineSpacing;
    doc.setFont("helvetica", "normal");
    const introText = `${resellerTerms.introduction} ${resellerTerms.website}`;
    const introLines = doc.splitTextToSize(introText, contentWidth);
    doc.text(introLines, leftMargin, y);
    y += introLines.length * lineSpacing + sectionSpacing;

    doc.setFont("helvetica", "bold");
    doc.text("Terms & Conditions:", leftMargin, y);
    y += lineSpacing;
    autoTable(doc, {
        startY: y,
        body: resellerTerms.terms.map((t) => [t]),
        theme: "plain",
        styles: {
            font: "helvetica",
            fontSize: 9,
            cellPadding: 1.5,
            textColor: [60, 60, 60],
        },
        margin: { left: leftMargin, right: 14 },
        columnStyles: {
            0: { cellWidth: contentWidth },
        },
    });

    y = (doc as jsPDFWithAutoTable).lastAutoTable.finalY + 10;

    doc.setFont("helvetica", "bold");
    doc.text("Our Commitment:", leftMargin, y);
    y += lineSpacing;
    doc.setFont("helvetica", "normal");
    const commitmentLines = doc.splitTextToSize(resellerTerms.commitment, contentWidth);
    doc.text(commitmentLines, leftMargin, y);
    y += commitmentLines.length * lineSpacing + sectionSpacing;

    doc.setFont("helvetica", "bold");
    doc.text("Closing Note:", leftMargin, y);
    y += lineSpacing;
    doc.setFont("helvetica", "normal");
    const closingLines = doc.splitTextToSize(resellerTerms.closing, contentWidth);
    doc.text(closingLines, leftMargin, y);
    y += closingLines.length * lineSpacing;

    doc.setFont("helvetica", "bold");
    doc.text(resellerTerms.founder, 200, y + 10, { align: "right" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(resellerTerms.founderTitle, 200, y + 15, { align: "right" });

    doc.save("Reseller_Terms_PahechanKaro.pdf");
}
