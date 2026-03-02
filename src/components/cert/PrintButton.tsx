'use client';

import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

export default function PrintButton() {
  const handleSaveAsPDF = async () => {
    const element = document.getElementById('certificate-node');
    if (!element) return;

    const scale = 4;

    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png', 1.0); // lossless PNG

    // Convert logical CSS pixels → PDF points (72 DPI)
    const pdfWidth = (element.offsetWidth * 72) / 96;
    const pdfHeight = (element.offsetHeight * 72) / 96;

    const orientation = pdfWidth > pdfHeight ? 'landscape' : 'portrait';

    const pdf = new jsPDF({
      orientation,
      unit: 'pt',
      format: [pdfWidth, pdfHeight],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('certificate.pdf');
  };

  return (
    <button
      onClick={handleSaveAsPDF}
      className="px-6 py-2 bg-slate-800 text-white rounded hover:bg-slate-900 shadow-lg"
    >
      Save as PDF
    </button>
  );
}