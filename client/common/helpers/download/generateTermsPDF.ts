import jsPDF from "jspdf";
import { aboutData } from "@/data/about-data";

export function generateTermsPDF() {
    const { termsAndConditions: terms } = aboutData;
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();

    const leftMargin = 15;
    const rightMargin = 15;
    const topMargin = 20;
    const bottomMargin = 20;
    const contentWidth = pageWidth - leftMargin - rightMargin;
    const lineSpacing = 6;
    const sectionSpacing = 10;

    let y = topMargin;

    const checkAndAddPage = (spaceNeeded: number) => {
        if (y + spaceNeeded > pageHeight - bottomMargin) {
            doc.addPage();
            y = topMargin;
        }
    };


    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text("PahechanKaro", pageWidth / 2, y, { align: "center" });
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(terms.title, pageWidth / 2, y, { align: "center" });
    y += lineSpacing * 1.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Last Updated: ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: "center" });
    y += sectionSpacing * 2;

    doc.setTextColor(0);

    terms.sections.forEach(section => {
        checkAndAddPage(lineSpacing * 2);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(section.title, leftMargin, y);
        y += lineSpacing * 1.5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        section.content.forEach(paragraph => {
            const lines = doc.splitTextToSize(paragraph, contentWidth);
            const paragraphHeight = lines.length * lineSpacing;

            checkAndAddPage(paragraphHeight);

            doc.text(lines, leftMargin, y);
            y += paragraphHeight + (lineSpacing / 2);
        });

        y += sectionSpacing;
    });

    doc.save("Terms_and_Conditions_DigiPehchan.pdf");
}
