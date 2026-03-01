import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface TranscriptEntry {
    courseCode: string;
    courseTitle: string;
    creditUnits: number;
    grade: string;
    gradePoint: number;
    semester: string;
    academicYear: string;
}

export const generateTranscriptPDF = (studentName: string, matricNumber: string, data: TranscriptEntry[], cgpa: number) => {
    const doc = new jsPDF() as any;

    // Header
    doc.setFontSize(20);
    doc.text('OFFICIAL ACADEMIC TRANSCRIPT', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Student Name: ${studentName}`, 20, 35);
    doc.text(`Matric Number: ${matricNumber}`, 20, 42);
    doc.text(`Current CGPA: ${cgpa.toFixed(2)}`, 20, 49);
    doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`, 20, 56);

    // Table
    const tableColumn = ["Course Code", "Course Title", "Units", "Grade", "GP", "Semester"];
    const tableRows = data.map(entry => [
        entry.courseCode,
        entry.courseTitle,
        entry.creditUnits,
        entry.grade,
        entry.gradePoint.toFixed(1),
        `${entry.semester} ${entry.academicYear}`
    ]);

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 65,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillStyle: [33, 150, 243] }
    });

    doc.save(`${matricNumber}_transcript.pdf`);
};

export const generateReceiptPDF = (receiptData: any) => {
    const doc = new jsPDF() as any;

    doc.setFontSize(18);
    doc.text('OFFICIAL PAYMENT RECEIPT', 105, 20, { align: 'center' });

    const summary = [
        ['Reference:', receiptData.reference],
        ['Fee Type:', receiptData.feeType],
        ['Amount:', `NGN ${receiptData.amount.toLocaleString()}`],
        ['Date:', new Date(receiptData.date).toLocaleString()],
        ['Status:', 'SUCCESSFUL']
    ];

    doc.autoTable({
        body: summary,
        startY: 40,
        theme: 'plain',
        styles: { fontSize: 12 }
    });

    doc.text('Thank you for your payment.', 105, doc.lastAutoTable.finalY + 20, { align: 'center' });

    doc.save(`${receiptData.reference}_receipt.pdf`);
};
