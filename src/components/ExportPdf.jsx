// components/ExportPDF.jsx
import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '../supabase-client';

const ExportPdf = ({ elementRef, getDateRangeLabel }) => {
  const handleDownloadPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const scaleFactor = 2;

    // Add header info
    doc.setFontSize(16);
    doc.text("Time Tracking Report", 14, 20);

    doc.setFontSize(12);
    doc.text(`Filter: ${getDateRangeLabel()}`, 14, 30);

    const user = await supabase.auth.getUser();
    doc.text(`User: ${user?.data?.user?.email || 'anonymous'}`, 14, 38);

    // Get the element to export
    if (!elementRef?.current) return;

    const canvas = await html2canvas(elementRef.current, { scale: scaleFactor });
    const imgData = canvas.toDataURL('image/png');

    const pageWidth = doc.internal.pageSize.getWidth();
    const imgProps = doc.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

    doc.addImage(imgData, 'PNG', 0, 45, pageWidth, imgHeight);
    doc.save(`Report_${getDateRangeLabel().replace(/\s/g, '_')}.pdf`);
  };

  return (
    <button className="btn" onClick={handleDownloadPDF}>
      Export as PDF
    </button>
  );
};

export default ExportPdf;
