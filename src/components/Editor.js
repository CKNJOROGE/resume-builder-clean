import React, { useState, useEffect, useContext, useRef, useMemo, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { useParams } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { PDFDownloadLink } from '@react-pdf/renderer';
import MyResumePDF from './MyResumePDF'; // Adjust path if needed

import TemplateModern from '../templates/TemplateModern';
import TemplateClassic from '../templates/TemplateClassic';
import TemplateATS from '../templates/TemplateATS';
import DesignSettingsPanel from './DesignSettingsPanel';
import SectionTogglePanel from './SectionTogglePanel';
import LayoutManager from './LayoutManager';

// Defines the "blank" entry for each section that uses a list format
const DEFAULT_SECTION_ENTRY = {
  experience: { title: '', company: '', dates: '', location: '', description: '', bullets: [''] },
  education: { degree: '', institution: '', dates: '', location: '', description: '' },
  projects: { title: '', description: '', link: '' },
  skills: '',
  courses: { title: '', provider: '', date: '' },
  achievements: { title: '', description: '', icon: 'Gem', showIcon: true },
  additionalExperience: { title: '', company: '', dates: '', location: '', description: '', bullets: [''] },
  awards: { name: '', icon: 'Gem', showIcon: true, showDescription: false, description: '' },
  books: { cover: '', title: '', author: '' },
  hobbies: { icon: 'Gem', title: '', description: '', showIcon: true, showTitle: true, showDescription: true, alignment: 'left' },
  industrialExpertise: { skill: '', level: 0, showSlider: false, sliderStyle: 'gradient', alignment: 'left' },
  keyAchievements: { title: '', description: '', icon: '💎', uppercase: false, showIcon: true, showDescription: true },
  languages: { language: '', level: 'Advanced', rating: 3 },
  passions: '',
  professionalStrengths: { title: '', description: '', icon: 'Gem', uppercase: false, showIcon: true, showDescription: true },
  references: { name: '', title: '', contact: '' },
  volunteering: { title: '', organization: '', location: '', dates: '', description: '', bullets: [''] },
};

// Debounce utility function to delay execution
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
};

const Editor = () => {
  const { authToken, logout } = useContext(AuthContext);
  const { resumeId } = useParams();
  const desiredId = resumeId && parseInt(resumeId, 10);

  // State for instant UI updates (typing)
  const [liveResume, setLiveResume] = useState(null);
  // State for heavy operations like pagination, updated after a delay
  const [debouncedResume, setDebouncedResume] = useState(null);

  const [showSettings, setShowSettings] = useState(false);
  const [showSections, setShowSections] = useState(false);
  const [showLayoutManager, setShowLayoutManager] = useState(false);
  const resumeContentRef = useRef(null);

  const fetchResumes = async () => {
    if (!authToken) return;
    try {
      const res = await fetch('${process.env.REACT_APP_API_URL}/api/resumes/', {
        headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      const enriched = data.map((resume) => JSON.parse(JSON.stringify(resume)));
      enriched.sort((a, b) => new Date(b.created) - new Date(a.created));

      let foundResume = desiredId ? enriched.find((r) => r.id === desiredId) : enriched[0];
      
      if (foundResume) {
        setLiveResume(foundResume);
        setDebouncedResume(foundResume); // Initialize both states
      }
    } catch (err) {
      console.error('Error fetching resumes:', err);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchResumes();
    }
  }, [authToken, desiredId]);
  
  const saveResume = useCallback(async (resumeToSave) => {
    if (!resumeToSave) return;
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/resumes/${resumeToSave.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ data: resumeToSave.data }),
      });
    } catch (err) {
      console.error('Error saving resume:', err);
    }
  }, [authToken]);
  
  // Create a debounced function that updates the paginated view and saves the resume
  const updateDebouncedStateAndSave = useMemo(
    () => debounce((newResume) => {
      setDebouncedResume(newResume);
      saveResume(newResume);
    }, 500), // 500ms delay after user stops typing
    [saveResume]
  );
  
  const updateField = useCallback((key, value) => {
    setLiveResume(currentResume => {
      if (!currentResume) return null;
      const newResume = {
        ...currentResume,
        data: { ...currentResume.data, [key]: value }
      };
      // Update the debounced state and save after a delay
      updateDebouncedStateAndSave(newResume);
      // Return the new state immediately for responsive input fields
      return newResume;
    });
  }, [updateDebouncedStateAndSave]);

  const updateDesign = useCallback((newDesign) => {
    setLiveResume(currentResume => {
        if (!currentResume) return null;
        const newResume = {
            ...currentResume,
            data: { ...currentResume.data, design: { ...(currentResume.data.design || {}), ...newDesign } }
        };
        updateDebouncedStateAndSave(newResume);
        return newResume;
    });
  }, [updateDebouncedStateAndSave]);

  // The updated function to post-process the PDF and remove blank pages
// In Editor.js

const handleDownloadPdf = async () => {
  const element = resumeContentRef.current;
  if (!element) return;

  // Add a class to the body to prepare for PDF generation
  document.body.classList.add('pdf-generating');

  // Introduce a short delay to allow the browser to fully render the page
  setTimeout(() => {
    try {
      const clone = element.cloneNode(true);
      const canvases = element.querySelectorAll('canvas');
      const clonedCanvases = clone.querySelectorAll('canvas');
      canvases.forEach((canvas, index) => {
        const dataUrl = canvas.toDataURL('image/png');
        const img = document.createElement('img');
        img.src = dataUrl;
        img.style.width = canvas.style.width;
        img.style.height = canvas.style.height;
        clonedCanvases[index]?.parentNode?.replaceChild(img, clonedCanvases[index]);
      });

      const opt = {
        margin: 0,
        filename: 'my_resume.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'], after: '.resume-page' }
      };

      html2pdf().from(clone).set(opt).toPdf().get('pdf').then(pdf => {
        const totalPages = pdf.internal.getNumberOfPages();
        const blankPages = [];

        for (let i = totalPages; i >= 1; i--) {
          const page = pdf.internal.pages[i];
          if (page && page.length <= 1) {
            blankPages.push(i);
          }
        }

        blankPages.forEach(pageNum => {
          pdf.deletePage(pageNum);
        });

        pdf.save('my_resume.pdf');

      }).catch(err => {
        console.error("PDF generation failed:", err);
      }).finally(() => {
        document.body.classList.remove('pdf-generating');
      });

    } catch (error) {
      console.error("Failed to generate PDF:", error);
      document.body.classList.remove('pdf-generating');
    }
  }, 800); // A 200-millisecond delay
};
  
  const handleVisibilityChange = (newVisibleSections) => {
    setLiveResume(currentResume => {
      if (!currentResume) return null;
      
      const newResumeData = { ...currentResume.data, visibleSections: newVisibleSections };
      const oldVisibleSections = currentResume.data.visibleSections || {};

      // Check for newly enabled sections that have empty array data
      Object.keys(newVisibleSections).forEach(key => {
        const wasVisible = oldVisibleSections[key];
        const isNowVisible = newVisibleSections[key];
        const sectionData = newResumeData[key];

        // If section is newly toggled ON and its data is an empty array...
        if (isNowVisible && !wasVisible && Array.isArray(sectionData) && sectionData.length === 0) {
          const defaultEntry = DEFAULT_SECTION_ENTRY[key];
          if (defaultEntry) {
            newResumeData[key] = [defaultEntry]; // ...preload it with one blank entry.
          }
        }
      });
      
      const newResume = { ...currentResume, data: newResumeData };

      updateDebouncedStateAndSave(newResume);
      return newResume;
    });
  };
  
  // Props for the templates now use the appropriate state
  const templateProps = {
    // Paginated view uses the DEBOUNCED data to prevent re-calculating on every keystroke
    resumeData: liveResume ? liveResume.data : {},
    // UI elements use the LIVE data for instant feedback
    visibleSections: liveResume?.data?.visibleSections || {},
    handleEdit: updateField,
    design: liveResume?.data?.design || {},
    changeSummaryAlignment: (alignment) => updateDesign({ summaryAlign: alignment }),
  };

  const getReorderableLayout = () => {
    const layout = liveResume?.data?.layout || { left: [], right: [] };
    return {
      left: (layout.left || []).filter(key => key !== 'header'),
      right: layout.right || [],
    };
  };
  
  const templateName = liveResume?.template?.toLowerCase();

  return (
    <div className="relative flex h-screen bg-gray-100">
      {showSections && (
        <SectionTogglePanel
          visibleSections={liveResume?.data?.visibleSections}
          onChange={handleVisibilityChange}
          onClose={() => setShowSections(false)}
        />
      )}
      {showSettings && (
        <DesignSettingsPanel
          design={liveResume?.data?.design}
          handleEdit={updateDesign}
          onClose={() => setShowSettings(false)}
        />
      )}
      {showLayoutManager && (
        <LayoutManager
          layout={getReorderableLayout()}
          onLayoutChange={(newLayout) => updateField('layout', newLayout)}
          onClose={() => setShowLayoutManager(false)}
        />
      )}
      <div className="flex-1 overflow-auto min-h-0">
        <div className="flex justify-between items-center p-4 shadow bg-white sticky top-0 z-10">
          <h2 className="text-xl font-semibold">Resume Editor</h2>
          <div className="flex gap-2">
            <button onClick={() => setShowLayoutManager(true)} className="px-3 py-1 bg-purple-600 text-white rounded">Layout</button>
            <button onClick={() => setShowSettings(true)} className="px-3 py-1 bg-gray-700 text-white rounded">Design</button>
            <button onClick={() => setShowSections(true)} className="px-3 py-1 bg-indigo-600 text-white rounded">Sections</button>
            <button onClick={handleDownloadPdf} className="px-3 py-1 bg-green-600 text-white rounded">Download as PDF</button>
              <PDFDownloadLink
                document={<MyResumePDF resumeData={liveResume?.data} />}
                fileName="resume.pdf"
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                {({ blob, url, loading, error }) =>
                  loading ? 'Loading...' : 'Download PDF'
                }
              </PDFDownloadLink>
            <button onClick={logout} className="px-3 py-1 bg-red-600 text-white rounded">Logout</button>
          </div>
        </div>

        {debouncedResume && (
          <div className="paged-editor-container" style={{ padding: '5px 0', margin: '0 auto' }}>
            <div id="resume-canvas" ref={resumeContentRef}>
               {templateName === 'classic' && <TemplateClassic {...templateProps} />}
               {templateName === 'ats' && <TemplateATS {...templateProps} />}
               {(!templateName || templateName === 'modern') && <TemplateModern {...templateProps} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;