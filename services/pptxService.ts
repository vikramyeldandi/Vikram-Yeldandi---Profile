import pptxgen from "pptxgenjs";
import { PresentationData, SlideType, ChartType } from "../types";

export const generatePptx = (data: PresentationData) => {
  const pres = new pptxgen();

  // Explicitly set Layout to 16x9 (Standard for Google Slides)
  // Dimensions are 10 inches x 5.625 inches
  pres.layout = 'LAYOUT_16x9';

  // Set Metadata
  pres.author = data.author;
  pres.company = "Gemini Resume AI";
  pres.subject = "Resume Presentation";
  pres.title = `${data.author} - Resume`;

  // NOTE: We avoid using `pres.defineSlideMaster` with complex shapes because 
  // Google Slides sometimes fails to import Master Slide background shapes correctly.
  // Instead, we explicitly add the header/footer shapes to every slide.

  data.slides.forEach((slideData, index) => {
    const slide = pres.addSlide();

    // ----------------------------------------
    // 1. Draw Static Layout Elements (Background)
    // ----------------------------------------

    // Header Bar (Dark Blue) - Top 1 inch
    slide.addShape(pres.shapes.RECTANGLE, { 
        x: 0, y: 0, w: "100%", h: 1.0, 
        fill: { color: "1E293B" } // Slate-900 hex
    });

    // Footer Bar (Light Grey) - Bottom area
    slide.addShape(pres.shapes.RECTANGLE, { 
        x: 0, y: 5.2, w: "100%", h: 0.45, 
        fill: { color: "F1F5F9" } // Slate-100 hex
    });

    // Footer Text (Author | Slide #)
    slide.addText(`${data.author} | Slide ${index + 1}`, {
        x: 0.3, y: 5.25, w: "60%", h: 0.3,
        fontSize: 10,
        color: "64748B" // Slate-500
    });

    // ----------------------------------------
    // 2. Add Dynamic Content
    // ----------------------------------------

    // If company Name exists, we adjust the layout of the title
    let titleY = 0.2;
    if (slideData.companyName) {
        // Add Company Name "Eyebrow" text
        slide.addText(slideData.companyName.toUpperCase(), {
            x: 0.3,
            y: 0.1,
            w: "80%",
            h: 0.25,
            fontSize: 10,
            fontFace: "Arial",
            color: "94A3B8", // Slate-400 (Lighter blue/grey)
            bold: true,
            charSpacing: 2
        });
        titleY = 0.35; // Move title down slightly
    }

    // Slide Title (White text on Dark Blue Header)
    slide.addText(slideData.title, {
      x: 0.3,
      y: titleY,
      w: "80%", // Leave room for logo
      h: 0.5,
      fontSize: 24,
      fontFace: "Arial",
      bold: true,
      color: "FFFFFF",
      valign: "top"
    });

    // Add Logo if domain exists
    if (slideData.companyDomain) {
        const logoUrl = `https://logo.clearbit.com/${slideData.companyDomain}`;
        // Add a white circle/bg behind the logo for better visibility
        slide.addShape(pres.shapes.ELLIPSE, { 
            x: 9.0, y: 0.15, w: 0.7, h: 0.7, 
            fill: { color: "FFFFFF" } 
        });
        
        // Add the image
        slide.addImage({
            path: logoUrl,
            x: 9.1, // Center in the circle
            y: 0.25,
            w: 0.5,
            h: 0.5,
            sizing: { type: 'contain' }
        });
    }

    // Content area start Y position
    let currentY = 1.2;

    // Subtitle (Company / Date / Role)
    if (slideData.subtitle) {
      slide.addText(slideData.subtitle, {
        x: 0.5,
        y: currentY,
        w: "90%",
        h: 0.4,
        fontSize: 16,
        fontFace: "Arial",
        color: "475569", // Slate-600
        italic: true,
      });
      currentY += 0.5;
    }

    // Handle Visualizations
    if (slideData.type === SlideType.VISUALIZATION && slideData.chart) {
        
        if (slideData.chart.type === ChartType.METRIC_GRID) {
            // Create a grid of shapes
            const items = slideData.chart.items;
            const cols = 2; // 2 columns
            const startX = 0.5;
            const gapX = 0.3;
            const gapY = 0.3;
            const boxW = 4.3;
            const boxH = 1.4;

            items.forEach((item, i) => {
                const row = Math.floor(i / cols);
                const col = i % cols;
                
                const xPos = startX + (col * (boxW + gapX));
                const yPos = currentY + (row * (boxH + gapY));

                // Box background
                slide.addShape(pres.shapes.RECTANGLE, {
                    x: xPos, y: yPos, w: boxW, h: boxH,
                    fill: { color: "F8FAFC" },
                    line: { color: "E2E8F0", width: 1 }
                });

                // Value Text (Big)
                slide.addText(item.value.toString(), {
                    x: xPos, y: yPos + 0.2, w: boxW, h: 0.5,
                    align: "center",
                    fontSize: 28,
                    bold: true,
                    color: "2563EB" // Blue-600
                });

                // Label Text (Small)
                slide.addText(item.label, {
                    x: xPos, y: yPos + 0.7, w: boxW, h: 0.4,
                    align: "center",
                    fontSize: 11,
                    color: "64748B" // Slate-500
                });
            });
            // Advance Y for any bullets below
            currentY += (Math.ceil(items.length / cols) * (boxH + gapY)) + 0.3;

        } else if (slideData.chart.type === ChartType.BAR_CHART) {
            // Render a native PowerPoint Bar Chart
            const chartData = [
                {
                    name: "Performance Metrics", // Series Name (shows in legend)
                    labels: slideData.chart.items.map(i => i.label),
                    values: slideData.chart.items.map(i => {
                         // Attempt to extract number for chart, default to 1 if purely qualitative
                         const num = parseFloat(i.value.toString().replace(/[^0-9.]/g, ''));
                         return isNaN(num) ? 10 : num;
                    })
                }
            ];

            slide.addChart(pres.charts.BAR, chartData, {
                x: 0.5, y: currentY, w: 9, h: 3.5,
                barDir: 'bar',
                chartColors: ['2563EB'],
                showValue: true,
                showLegend: true, // Legend enabled
                legendPos: 'b', // Bottom
                valAxisHidden: true,
                catAxisLabelColor: "475569",
                catAxisLabelFontSize: 10
            });
             currentY += 3.8;
             
        } else if (slideData.chart.type === ChartType.BUBBLE_CHART) {
            // Render simple colored circles with text
            const items = slideData.chart.items;
            const cols = 4; // 4 columns
            const startX = 0.5;
            const gapX = 0.2;
            const gapY = 0.2;
            const bubbleSize = 1.8; // Diameter roughly
            
            // Colors to cycle through
            const colors = ['DBEAFE', 'E0E7FF', 'E0F2FE', 'F1F5F9']; // Light Blue, Indigo, Sky, Slate
            const textColors = ['1E40AF', '3730A3', '075985', '334155'];

            items.forEach((item, i) => {
                const row = Math.floor(i / cols);
                const col = i % cols;
                
                const xPos = startX + (col * (bubbleSize + gapX));
                const yPos = currentY + (row * (1.2 + gapY)); // Height is smaller than width for text

                const colorIdx = i % colors.length;

                // Ellipse Shape
                slide.addShape(pres.shapes.ELLIPSE, {
                    x: xPos, y: yPos, w: bubbleSize, h: 1.2,
                    fill: { color: colors[colorIdx] },
                    line: { color: "CBD5E1", width: 1 }
                });

                // Text inside
                slide.addText(item.label, {
                    x: xPos, y: yPos + 0.3, w: bubbleSize, h: 0.6,
                    align: "center",
                    fontSize: 12,
                    bold: true,
                    color: textColors[colorIdx]
                });
            });
            currentY += (Math.ceil(items.length / cols) * 1.5) + 0.3;
        }

    }

    // Bullets (Standard text or additional text below charts)
    if (slideData.bullets && slideData.bullets.length > 0) {
      slideData.bullets.forEach((bullet) => {
        // Calculate dynamic height estimation
        const estimatedHeight = bullet.length > 100 ? 0.5 : 0.35;
        
        // If it's a visualization slide, make text smaller/lighter below the chart
        const isVis = slideData.type === SlideType.VISUALIZATION;
        
        slide.addText(bullet, {
            x: 0.5,
            y: currentY,
            w: "90%",
            h: estimatedHeight,
            fontSize: isVis ? 12 : 14,
            fontFace: "Arial",
            color: isVis ? "64748B" : "1E293B", // Slate-500 vs Slate-800
            bullet: true,
            paraSpaceBefore: 6,
            valign: "top"
        });
        currentY += estimatedHeight + 0.05;
      });
    }
  });

  pres.writeFile({ fileName: `${data.author.replace(/\s+/g, "_")}_Resume.pptx` });
};