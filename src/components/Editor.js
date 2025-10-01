import React, { useState, useEffect, useContext, useRef, useMemo, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import MyResumePDF from './MyResumePDF';
import html2pdf from 'html2pdf.js';
import { ArrowLeft, CreditCard } from 'lucide-react'; // Added CreditCard icon

import TemplateModern from '../templates/TemplateModern';
import TemplateClassic from '../templates/TemplateClassic';
import TemplateATS from '../templates/TemplateATS';
import DesignSettingsPanel from './DesignSettingsPanel';
import SectionTogglePanel from './SectionTogglePanel';
import LayoutManager from './LayoutManager';
import authFetch from './authFetch';

const DEFAULT_SECTION_ENTRY = {
  experience: { title: '', company: '', dates: '', location: '', description: '', bullets: [''] },
  education: { degree: '', institution: '', dates: '', location: '', description: '' },
  projects: { title: '', description: '', link: '' },
  skills: 'Enter skill here',
  summary: [''],
  courses: { title: '', provider: '', date: '' },
  achievements: { title: '', description: '', icon: 'Gem', showIcon: true },
  additionalExperience: { title: '', company: '', dates: '', location: '', description: '', bullets: [''] },
  awards: { name: '', icon: 'Gem', showIcon: true, showDescription: false, description: '' },
  books: { cover: '', title: '', author: '' },
  hobbies: { icon: 'Gem', title: '', description: '', showIcon: true, showTitle: true, showDescription: true, alignment: 'left' },
  industrialExpertise: { skill: '', level: 0, showSlider: false, sliderStyle: 'gradient', alignment: 'left' },
  languages: { language: '', level: 'Advanced', rating: 3 },
  passions: [''],
  professionalStrengths: { title: '', description: '', icon: 'Gem', uppercase: false, showIcon: true, showDescription: true },
  references: { name: '', title: '', contact: '' },
  myTime: { label: 'New Activity', value: 100, alignment: 'left' },
  volunteering: { title: '', organization: '', location: '', dates: '', description: '', bullets: [''] },
};

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
  const { authToken, logout, user, updateUserCredits } = useContext(AuthContext);
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [liveResume, setLiveResume] = useState(null);
  const [debouncedResume, setDebouncedResume] = useState(null);

  const [showSettings, setShowSettings] = useState(false);
  const [showSections, setShowSections] = useState(false);
  const [showLayoutManager, setShowLayoutManager] = useState(false);
  const [isDeducting, setIsDeducting] = useState(false);
  const resumeContentRef = useRef(null);

  useEffect(() => {
    const isGuest = resumeId?.startsWith('guest-');

    if (isGuest) {
      const guestResumeData = localStorage.getItem(resumeId);
      if (guestResumeData) {
        const parsedData = JSON.parse(guestResumeData);
        setLiveResume(parsedData);
        setDebouncedResume(parsedData);
      }
    } else if (authToken) {
      const fetchResume = async () => {
        try {
          const res = await authFetch(`${process.env.REACT_APP_API_URL}/api/resumes/${resumeId}/`);
          if (res.ok) {
            const foundResume = await res.json();
            setLiveResume(foundResume);
            setDebouncedResume(foundResume);
          } else {
             navigate('/select-template');
          }
        } catch (err) {
          console.error('Error fetching resume:', err);
        }
      };
      fetchResume();
    } else if (!authToken && !isGuest) {
        navigate('/login', { state: { from: location.pathname } });
    }
  }, [authToken, resumeId, navigate, location.pathname]);
  
  const saveResume = useCallback(async (resumeToSave) => {
    if (!resumeToSave) return;
    const isGuest = typeof resumeToSave.id === 'string' && resumeToSave.id.startsWith('guest-');
    if (isGuest) {
      localStorage.setItem(resumeToSave.id, JSON.stringify(resumeToSave));
    } else if (authToken) {
      try {
        await fetch(`${process.env.REACT_APP_API_URL}/api/resumes/${resumeToSave.id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ data: resumeToSave.data }),
        });
      } catch (err) {
        console.error('Error saving resume:', err);
      }
    }
  }, [authToken]);
  
  const updateDebouncedStateAndSave = useMemo(() => debounce((newResume) => {
    setDebouncedResume(newResume);
    saveResume(newResume);
  }, 500), [saveResume]);
  
  const updateField = useCallback((key, value) => {
    setLiveResume(currentResume => {
      if (!currentResume) return null;
      const newResume = { ...currentResume, data: { ...currentResume.data, [key]: value } };
      updateDebouncedStateAndSave(newResume);
      return newResume;
    });
  }, [updateDebouncedStateAndSave]);

  const updateDesign = useCallback((newDesign) => {
    setLiveResume(currentResume => {
        if (!currentResume) return null;
        const newResume = { ...currentResume, data: { ...currentResume.data, design: { ...(currentResume.data.design || {}), ...newDesign } } };
        updateDebouncedStateAndSave(newResume);
        return newResume;
    });
  }, [updateDebouncedStateAndSave]);
  
  const uploadProfileImage = async (file) => {
    if (!file || !authToken || resumeId.startsWith('guest-')) {
      if (resumeId.startsWith('guest-')) {
        alert('Please sign up or log in to save an image.');
      }
      return;
    }
    const formData = new FormData();
    formData.append('profile_image', file);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/resumes/${resumeId}/`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: formData,
      });
      if (res.ok) {
        const updatedResumeFromServer = await res.json();
        const newImageUrl = updatedResumeFromServer.profile_image;
        setLiveResume(currentResume => {
          const newResumeState = {
            ...currentResume,
            data: {
              ...currentResume.data,
              header: { ...currentResume.data.header, profileImage: newImageUrl }
            }
          };
          updateDebouncedStateAndSave(newResumeState);
          return newResumeState;
        });
      } else {
        alert('Image upload failed. The file may be too large or not a valid image.');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('A network error occurred during the image upload.');
    }
  };

  const deductCredits = async () => {
    if (isDeducting) return false;
    
    setIsDeducting(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/deduct-credits/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ amount: 100 }),
      });
      
      if (res.ok) {
        const data = await res.json();
        updateUserCredits(data.new_credits);
        return true; // Indicate success
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || 'Could not process download. Please try again.'}`);
        return false; // Indicate failure
      }
    } catch (err) {
      alert("A network error occurred. Please check your connection.");
      return false; // Indicate failure
    } finally {
      setIsDeducting(false);
    }
  };

  const generatePdfFromHtml = () => {
    const element = resumeContentRef.current;
    if (!element) return;
    document.body.classList.add('pdf-generating');
    setTimeout(() => {
      const opt = {
        margin: 0, filename: 'my_resume.pdf', image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'], after: '.resume-page' }
      };
      html2pdf().from(element).set(opt).toPdf().get('pdf').then(pdf => {
        if (pdf.internal.getNumberOfPages() > 1) pdf.deletePage(pdf.internal.getNumberOfPages());
        pdf.save();
      }).catch(err => console.error("PDF generation failed:", err)
      ).finally(() => document.body.classList.remove('pdf-generating'));
    }, 800);
  };

  const handleDownloadClick = async () => {
    if (!authToken || resumeId.startsWith('guest-')) {
      return navigate('/login', { state: { from: location.pathname } });
    }
    if (user?.credits < 100) {
      alert("You need at least 100 credits to download.");
      return navigate('/paywall');
    }
    const success = await deductCredits();
    if (success) {
      generatePdfFromHtml();
    }
  };
  
  const handleAdvancedDownloadClick = async (e) => {
    if (!authToken || resumeId.startsWith('guest-')) {
      e.preventDefault();
      return navigate('/login', { state: { from: location.pathname } });
    }
    if (user?.credits < 100) {
      e.preventDefault();
      alert("You need at least 100 credits to download.");
      return navigate('/paywall');
    }
    const success = await deductCredits();
    if (!success) {
      e.preventDefault(); // Stop download if credit deduction fails
    }
  };
  
  const handleVisibilityChange = (newVisibleSections) => {
    setLiveResume(currentResume => {
      if (!currentResume) return null;
      const newResumeData = { ...currentResume.data, visibleSections: newVisibleSections };
      const oldVisibleSections = currentResume.data.visibleSections || {};
      Object.keys(newVisibleSections).forEach(key => {
        const wasVisible = oldVisibleSections[key];
        const isNowVisible = newVisibleSections[key];
        const sectionData = newResumeData[key];
        if (isNowVisible && !wasVisible && Array.isArray(sectionData) && sectionData.length === 0) {
          const defaultEntry = DEFAULT_SECTION_ENTRY[key];
          if (defaultEntry) newResumeData[key] = Array.isArray(defaultEntry) ? defaultEntry : [defaultEntry];
        }
      });
      const newResume = { ...currentResume, data: newResumeData };
      updateDebouncedStateAndSave(newResume);
      return newResume;
    });
  };
  
  const changeSummaryAlignment = useCallback((alignment) => {
    updateDesign({ summaryAlign: alignment });
  }, [updateDesign]);
  
  const templateProps = useMemo(() => ({
    resumeData: liveResume ? liveResume.data : {},
    visibleSections: liveResume?.data?.visibleSections || {},
    handleEdit: updateField,
    design: liveResume?.data?.design || {},
    changeSummaryAlignment: changeSummaryAlignment,
  }), [liveResume, updateField, changeSummaryAlignment]);

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
      {showSections && (<SectionTogglePanel visibleSections={liveResume?.data?.visibleSections} onChange={handleVisibilityChange} onClose={() => setShowSections(false)} templateName={liveResume?.template} />)}
      {showSettings && (<DesignSettingsPanel design={liveResume?.data?.design} handleEdit={updateDesign} onClose={() => setShowSettings(false)} />)}
      {showLayoutManager && (<LayoutManager layout={getReorderableLayout()} onLayoutChange={(newLayout) => updateField('layout', newLayout)} onClose={() => setShowLayoutManager(false)} />)}
      <div className="flex-1 overflow-auto min-h-0">
        <div className="flex justify-between items-center p-4 shadow bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Link to="/select-template" className="text-gray-600 hover:text-black">
              <ArrowLeft size={24} />
            </Link>
            <h2 className="text-xl font-semibold">Resume Editor</h2>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-1 bg-green-100 text-green-800 text-sm font-semibold px-2 py-1 rounded-full">
                <CreditCard size={16} />
                <span>{user.credits || 0} Credits</span>
              </div>
            )}
            <button onClick={() => setShowLayoutManager(true)} className="px-3 py-1 bg-purple-600 text-white rounded">Layout</button>
            <button onClick={() => setShowSettings(true)} className="px-3 py-1 bg-gray-700 text-white rounded">Design</button>
            <button onClick={() => setShowSections(true)} className="px-3 py-1 bg-indigo-600 text-white rounded">Sections</button>
            <button onClick={handleDownloadClick} disabled={isDeducting} className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50">
              {isDeducting ? 'Processing...' : 'Download as PDF'}
            </button>
            
            {authToken && (<button onClick={logout} className="px-3 py-1 bg-red-600 text-white rounded">Logout</button>)}
          </div>
        </div>
        {debouncedResume && (
          <div className="paged-editor-container" style={{ padding: '5px 0', margin: '0 auto' }}>
            <div id="resume-canvas" ref={resumeContentRef}>
               {templateName === 'classic' && <TemplateClassic {...templateProps} uploadProfileImage={uploadProfileImage} />}
               {templateName === 'ats' && <TemplateATS {...templateProps} uploadProfileImage={uploadProfileImage} />}
               {(!templateName || templateName === 'modern') && <TemplateModern {...templateProps} uploadProfileImage={uploadProfileImage} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;
