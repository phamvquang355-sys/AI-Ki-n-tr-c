
import React, { useState, useEffect } from 'react';
import { Tool } from './types';
import Header from './components/Header';
import Navigation from './components/Navigation';
import ImageGenerator from './components/ImageGenerator';
import VideoGenerator from './components/VideoGenerator';
import ImageEditor from './components/ImageEditor';
import ViewSync from './components/ViewSync';
import VirtualTour from './components/VirtualTour';
import Renovation from './components/Renovation';
import FloorPlan from './components/FloorPlan';
import UrbanPlanning from './components/UrbanPlanning';
import LandscapeRendering from './components/LandscapeRendering';
import MaterialSwapper from './components/MaterialSwapper';
import Staging from './components/Staging';
import Upscale from './components/Upscale';
import HistoryPanel from './components/HistoryPanel';
import InteriorGenerator from './components/InteriorGenerator';
import MoodboardGenerator from './components/MoodboardGenerator';
import PromptSuggester from './components/PromptSuggester';
import PromptEnhancer from './components/PromptEnhancer';
import AITechnicalDrawings from './components/AITechnicalDrawings';
import SketchConverter from './components/SketchConverter';
import FengShui from './components/FengShui';
import { initialToolStates, ToolStates } from './state/toolState';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool>(Tool.ArchitecturalRendering);
  const [toolStates, setToolStates] = useState<ToolStates>(initialToolStates);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark'); 
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Routing: Handle browser back/forward buttons
  useEffect(() => {
      const handlePopState = () => {
          const path = window.location.pathname;
          // Just reset URL to / if user navigates back
          if (path !== '/') {
              window.history.pushState({}, '', '/');
          }
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleThemeToggle = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const handleGoHome = () => {
      window.history.pushState({}, '', '/');
  };

  const handleOpenGallery = () => {
      setActiveTool(Tool.History);
      window.history.pushState({}, '', '/');
  };

  const handleToolStateChange = <T extends keyof ToolStates>(
    tool: T,
    newState: Partial<ToolStates[T]>
  ) => {
    setToolStates(prev => ({
      ...prev,
      [tool]: {
        ...prev[tool],
        ...newState,
      },
    }));
  };

  const handleSendToViewSync = (image: any) => {
     handleToolStateChange(Tool.ViewSync, {
        sourceImage: image,
        resultImages: [],
        error: null,
        customPrompt: '',
     });
    setActiveTool(Tool.ViewSync);
  };
  
  const handleSendToViewSyncWithPrompt = (image: any, prompt: string) => {
     handleToolStateChange(Tool.ViewSync, {
        sourceImage: image,
        customPrompt: prompt,
        resultImages: [],
        error: null,
        selectedPerspective: 'default',
        selectedAtmosphere: 'default',
        selectedFraming: 'none',
        sceneType: 'exterior'
     });
    setActiveTool(Tool.ViewSync);
  };

  const renderTool = () => {
    switch (activeTool) {
      case Tool.FloorPlan:
        return <FloorPlan 
            state={toolStates.FloorPlan}
            onStateChange={(newState) => handleToolStateChange(Tool.FloorPlan, newState)}
        />;
      case Tool.Renovation:
        return <Renovation 
            state={toolStates.Renovation}
            onStateChange={(newState) => handleToolStateChange(Tool.Renovation, newState)}
        />;
      case Tool.ArchitecturalRendering:
        return <ImageGenerator 
            state={toolStates.ArchitecturalRendering}
            onStateChange={(newState) => handleToolStateChange(Tool.ArchitecturalRendering, newState)}
            onSendToViewSync={handleSendToViewSync} 
        />;
      case Tool.InteriorRendering:
        return <InteriorGenerator
            state={toolStates.InteriorRendering}
            onStateChange={(newState) => handleToolStateChange(Tool.InteriorRendering, newState)}
            onSendToViewSync={handleSendToViewSync} 
        />;
      case Tool.UrbanPlanning:
        return <UrbanPlanning
            state={toolStates.UrbanPlanning}
            onStateChange={(newState) => handleToolStateChange(Tool.UrbanPlanning, newState)}
            onSendToViewSync={handleSendToViewSync}
        />;
      case Tool.LandscapeRendering:
        return <LandscapeRendering
            state={toolStates.LandscapeRendering}
            onStateChange={(newState) => handleToolStateChange(Tool.LandscapeRendering, newState)}
            onSendToViewSync={handleSendToViewSync}
        />;
      case Tool.AITechnicalDrawings:
        return <AITechnicalDrawings
            state={toolStates.AITechnicalDrawings}
            onStateChange={(newState) => handleToolStateChange(Tool.AITechnicalDrawings, newState)}
        />;
      case Tool.SketchConverter:
        return <SketchConverter
            state={toolStates.SketchConverter}
            onStateChange={(newState) => handleToolStateChange(Tool.SketchConverter, newState)}
        />;
      case Tool.FengShui:
        return <FengShui
            state={toolStates.FengShui}
            onStateChange={(newState) => handleToolStateChange(Tool.FengShui, newState)}
        />;
      case Tool.ViewSync:
        return <ViewSync 
            state={toolStates.ViewSync}
            onStateChange={(newState) => handleToolStateChange(Tool.ViewSync, newState)}
        />;
      case Tool.VirtualTour:
        return <VirtualTour
            state={toolStates.VirtualTour}
            onStateChange={(newState) => handleToolStateChange(Tool.VirtualTour, newState)}
        />;
      case Tool.PromptSuggester:
        return <PromptSuggester
            state={toolStates.PromptSuggester}
            onStateChange={(newState) => handleToolStateChange(Tool.PromptSuggester, newState)}
            onSendToViewSyncWithPrompt={handleSendToViewSyncWithPrompt}
        />;
       case Tool.PromptEnhancer:
        return <PromptEnhancer
            state={toolStates.PromptEnhancer}
            onStateChange={(newState) => handleToolStateChange(Tool.PromptEnhancer, newState)}
        />;
      case Tool.MaterialSwap:
        return <MaterialSwapper 
            state={toolStates.MaterialSwap}
            onStateChange={(newState) => handleToolStateChange(Tool.MaterialSwap, newState)}
        />;
      case Tool.Staging:
        return <Staging 
            state={toolStates.Staging}
            onStateChange={(newState) => handleToolStateChange(Tool.Staging, newState)}
        />;
      case Tool.Upscale:
        return <Upscale 
            state={toolStates.Upscale}
            onStateChange={(newState) => handleToolStateChange(Tool.Upscale, newState)}
        />;
      case Tool.Moodboard:
        return <MoodboardGenerator 
            state={toolStates.Moodboard}
            onStateChange={(newState) => handleToolStateChange(Tool.Moodboard, newState)}
        />;
      case Tool.VideoGeneration:
        return <VideoGenerator 
            state={toolStates.VideoGeneration}
            onStateChange={(newState) => handleToolStateChange(Tool.VideoGeneration, newState)}
        />;
      case Tool.ImageEditing:
        return <ImageEditor 
            state={toolStates.ImageEditing}
            onStateChange={(newState) => handleToolStateChange(Tool.ImageEditing, newState)}
        />;
      case Tool.History:
        return <HistoryPanel />;
        
      default:
        return <ImageGenerator 
            state={toolStates.ArchitecturalRendering}
            onStateChange={(newState) => handleToolStateChange(Tool.ArchitecturalRendering, newState)}
            onSendToViewSync={handleSendToViewSync}
        />;
    }
  };

  return (
      <div className="h-[100dvh] bg-main-bg dark:bg-[#121212] font-sans text-text-primary dark:text-[#EAEAEA] flex flex-col transition-colors duration-300 overflow-hidden">
          <Header 
              onGoHome={handleGoHome} 
              onThemeToggle={handleThemeToggle} 
              theme={theme} 
              onOpenGallery={handleOpenGallery} 
              onToggleNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
          />
          <div className="relative flex flex-col md:flex-row flex-grow overflow-hidden">
              <Navigation 
                  activeTool={activeTool} 
                  setActiveTool={(tool) => {
                      setActiveTool(tool);
                      setIsMobileNavOpen(false);
                  }} 
                  isMobileOpen={isMobileNavOpen}
                  onCloseMobile={() => setIsMobileNavOpen(false)}
              />
              
              <main 
                  className="flex-1 bg-surface/90 dark:bg-[#191919]/90 backdrop-blur-md md:m-6 md:ml-0 md:rounded-2xl shadow-lg border-t md:border border-border-color dark:border-[#302839] overflow-y-auto scrollbar-hide p-3 sm:p-6 lg:p-8 relative z-0 transition-colors duration-300"
                  style={{ WebkitOverflowScrolling: 'touch' }}
              >
                  {renderTool()}
              </main>
          </div>
      </div>
  );
};

export default App;
