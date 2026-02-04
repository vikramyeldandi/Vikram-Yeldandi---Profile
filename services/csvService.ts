import { PresentationData } from "../types";

export const generateCsv = (data: PresentationData) => {
  // Define CSV Headers
  const headers = [
    'Slide Number', 
    'Slide Type', 
    'Title', 
    'Subtitle', 
    'Company', 
    'Bullet Points', 
    'Chart Type', 
    'Chart Data'
  ];
  
  // Map slides to rows
  const rows = data.slides.map((slide, index) => {
    // Helper to format bullets as a single cell with newlines
    const bullets = slide.bullets.join('\n');
    
    // Helper to format chart data
    let chartType = '';
    let chartData = '';
    
    if (slide.chart) {
      chartType = slide.chart.type;
      chartData = slide.chart.items.map(item => {
        let str = `${item.label}: ${item.value}`;
        if (item.description) str += ` (${item.description})`;
        return str;
      }).join('\n');
    }

    // Escape function for CSV (handles quotes, commas, newlines)
    const escape = (field: string | undefined | null) => {
      if (!field) return '';
      const stringField = String(field);
      // If contains comma, quote, or newline, wrap in quotes and escape existing quotes
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    return [
      index + 1,
      slide.type,
      escape(slide.title),
      escape(slide.subtitle),
      escape(slide.companyName),
      escape(bullets),
      escape(chartType),
      escape(chartData)
    ].join(',');
  });

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows].join('\n');
  
  // Create Blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${data.author.replace(/\s+/g, "_")}_Slides_Data.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};