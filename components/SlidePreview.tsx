import React, { useState } from 'react';
import { SlideData, SlideType, ChartType } from '../types';
import { Briefcase, BarChart3, PieChart, Users, TrendingUp, Award, GraduationCap, Cpu, X, MousePointerClick } from 'lucide-react';

interface SlidePreviewProps {
  slide: SlideData;
  index: number;
}

const SlidePreview: React.FC<SlidePreviewProps> = ({ slide, index }) => {
  const [activeBubble, setActiveBubble] = useState<{label: string, description: string} | null>(null);

  const renderChart = () => {
    if (!slide.chart) return null;

    if (slide.chart.type === ChartType.METRIC_GRID) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {slide.chart.items.map((item, i) => (
            <div key={i} className="bg-slate-50 p-6 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
              <span className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">{item.value}</span>
              <span className="text-sm text-slate-600 font-medium uppercase tracking-wide">{item.label}</span>
            </div>
          ))}
        </div>
      );
    }

    if (slide.chart.type === ChartType.BAR_CHART) {
      return (
        <div className="flex flex-col space-y-4 mt-6">
          <div className="flex justify-end mb-2">
            <div className="flex items-center text-xs text-slate-500">
               <span className="w-3 h-3 bg-blue-500 mr-2 rounded-sm"></span>
               Metric Performance
            </div>
          </div>
          {slide.chart.items.map((item, i) => {
            // Rough calculation for bar width visualization
            // In a real app we might parse the number, here we randomize slightly for visual effect if value is purely text
            const isPercentage = item.value.toString().includes('%');
            const numVal = parseInt(item.value.toString().replace(/[^0-9]/g, '')) || 50;
            const width = isPercentage ? Math.min(numVal, 100) : Math.min((numVal % 100) + 20, 100); 
            
            return (
              <div key={i} className="group">
                <div className="flex justify-between mb-1 text-sm font-semibold text-slate-700">
                  <span>{item.label}</span>
                  <span className="text-blue-600">{item.value}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-1000 ease-out group-hover:bg-blue-600"
                    style={{ width: `${width}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (slide.chart.type === ChartType.BUBBLE_CHART) {
        return (
            <div className="relative w-full">
                <div className="flex flex-wrap gap-4 justify-center items-center mt-6 p-4">
                    {slide.chart.items.map((item, i) => {
                        // Generate pseudo-random colors for bubbles based on index
                        const colors = [
                            'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
                            'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200',
                            'bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-200',
                            'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200',
                        ];
                        const colorClass = colors[i % colors.length];
                        const sizeClass = item.label.length > 15 ? 'px-6 py-4 text-base' : 'px-8 py-6 text-lg';

                        return (
                            <button 
                                key={i} 
                                onClick={() => setActiveBubble({ label: item.label, description: item.description || 'No detailed description available.' })}
                                className={`${colorClass} ${sizeClass} rounded-full border shadow-sm font-semibold flex items-center justify-center text-center transition-all hover:scale-105 active:scale-95 cursor-pointer`}
                            >
                                {item.label}
                            </button>
                        );
                    })}
                </div>
                
                {/* Interaction Hint */}
                <div className="text-center text-xs text-slate-400 mt-2 flex items-center justify-center">
                    <MousePointerClick className="w-3 h-3 mr-1" />
                    Click bubbles to see details
                </div>

                {/* Detailed Overlay Modal */}
                {activeBubble && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
                         <div 
                            className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] rounded-lg transition-all" 
                            onClick={(e) => {e.stopPropagation(); setActiveBubble(null);}}
                         ></div>
                         <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm border border-slate-200 relative animate-[fadeIn_0.2s_ease-out]">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setActiveBubble(null); }}
                                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full p-1 hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="flex items-center space-x-3 mb-3">
                                 <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <Cpu className="w-6 h-6" />
                                 </div>
                                 <h3 className="text-lg font-bold text-slate-800 leading-tight">{activeBubble.label}</h3>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-3">
                                {activeBubble.description}
                            </p>
                         </div>
                    </div>
                )}
            </div>
        );
    }
  };

  const getSlideIcon = () => {
    if (slide.type === SlideType.VISUALIZATION) {
        if (slide.title.toLowerCase().includes('impact') || slide.title.toLowerCase().includes('value')) return <TrendingUp className="w-6 h-6 text-white" />;
        if (slide.title.toLowerCase().includes('team') || slide.title.toLowerCase().includes('collaboration')) return <Users className="w-6 h-6 text-white" />;
        if (slide.title.toLowerCase().includes('ai') || slide.title.toLowerCase().includes('tools')) return <Cpu className="w-6 h-6 text-white" />;
        return <BarChart3 className="w-6 h-6 text-white" />;
    }
    if (slide.type === SlideType.LEADERSHIP) {
        return <Award className="w-6 h-6 text-white" />;
    }
    if (slide.type === SlideType.EDUCATION) {
        return <GraduationCap className="w-6 h-6 text-white" />;
    }
    return <Briefcase className="w-6 h-6 text-white" />;
  };

  return (
    <div className="bg-white aspect-video w-full rounded-lg shadow-lg overflow-hidden flex flex-col border border-slate-200 relative group transition-transform hover:scale-[1.01] duration-200">
        
      {/* Slide Header */}
      <div className="bg-slate-800 p-6 flex-shrink-0 flex justify-between items-center relative overflow-hidden">
        <div className="flex flex-col z-10 max-w-[85%]">
            {slide.companyName && (
                <span className="text-blue-200 text-xs sm:text-sm font-bold tracking-wider mb-1 uppercase">
                    {slide.companyName}
                </span>
            )}
            <h2 className={`text-white text-xl md:text-2xl font-bold truncate mr-4 ${slide.companyName ? 'mt-0' : 'mt-1'}`}>
            {slide.title}
            </h2>
        </div>
        
        <div className="flex items-center z-10">
            {/* Company Logo */}
            {slide.companyDomain && (
                <div className="w-10 h-10 bg-white rounded-full p-1 mr-3 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                    <img 
                        src={`https://logo.clearbit.com/${slide.companyDomain}`} 
                        alt={`${slide.companyName} Logo`} 
                        className="w-full h-full object-contain"
                        onError={(e) => e.currentTarget.style.display = 'none'} 
                    />
                </div>
            )}
            {getSlideIcon()}
        </div>
      </div>

      {/* Slide Body */}
      <div className="flex-1 p-8 bg-white flex flex-col justify-start overflow-y-auto relative">
        
        {/* Subtitle Section */}
        {slide.subtitle && (
          <div className="mb-6 pb-2 border-b border-slate-100 flex items-center text-slate-500 font-medium text-lg">
            <Briefcase className="w-5 h-5 mr-2" />
            {slide.subtitle}
          </div>
        )}

        {/* Visualization Content */}
        {slide.type === SlideType.VISUALIZATION && slide.chart ? (
            <div className="w-full">
                {renderChart()}
                {/* Optional description bullets below charts */}
                {slide.bullets && slide.bullets.length > 0 && (
                     <div className="mt-8 pt-4 border-t border-slate-100">
                        <ul className="space-y-2">
                        {slide.bullets.map((bullet, idx) => (
                            <li key={idx} className="flex items-start text-slate-600 text-sm">
                            <span className="mr-2 mt-1.5 block w-1.5 h-1.5 bg-slate-400 rounded-full flex-shrink-0"></span>
                            <span>{bullet}</span>
                            </li>
                        ))}
                        </ul>
                     </div>
                )}
            </div>
        ) : (
             /* Standard Bullet Content */
            <ul className="space-y-3">
            {slide.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start text-slate-700 text-base leading-relaxed">
                <span className="mr-3 mt-2 block w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                <span>{bullet}</span>
                </li>
            ))}
            </ul>
        )}
      </div>

      {/* Slide Footer */}
      <div className="h-8 bg-slate-50 border-t border-slate-100 px-6 flex items-center justify-between text-xs text-slate-400">
        <span>Generated Resume Deck</span>
        <span>Slide {index + 1}</span>
      </div>
      
    </div>
  );
};

export default SlidePreview;