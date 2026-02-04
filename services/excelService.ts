import * as XLSX from 'xlsx';
import { PresentationData } from "../types";

export const generateExcel = (data: PresentationData) => {
  // Prepare data for the sheet
  const rows = data.slides.map((slide, index) => {
    // Format chart data nicely
    let chartData = '';
    if (slide.chart) {
       chartData = `Type: ${slide.chart.type}\n`;
       chartData += slide.chart.items.map(item => {
         let line = `• ${item.label}: ${item.value}`;
         if (item.description) line += `\n  (${item.description})`;
         return line;
       }).join('\n');
    }

    return {
      '#': index + 1,
      'Slide Type': slide.type,
      'Title': slide.title,
      'Subtitle': slide.subtitle || '',
      'Company': slide.companyName || '',
      'Key Points': slide.bullets.join('\n'),
      'Visualization / Data': chartData
    };
  });

  // Create worksheet from JSON data
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths for better readability in Google Sheets
  worksheet['!cols'] = [
    { wch: 5 },  // #
    { wch: 15 }, // Type
    { wch: 30 }, // Title
    { wch: 25 }, // Subtitle
    { wch: 20 }, // Company
    { wch: 60 }, // Key Points
    { wch: 40 }  // Visuals
  ];

  // Create a new workbook and append the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Presentation Slides");

  // Generate filename
  const fileName = `${data.author.replace(/\s+/g, "_")}_Presentation.xlsx`;

  // Write file (triggers download)
  XLSX.writeFile(workbook, fileName);
};