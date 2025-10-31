import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Sparkles } from 'lucide-react'; // Import the icon

const deepCompare = (obj1, obj2) => {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  for (const key of keys1) {
    if (!keys2.includes(key) || !deepCompare(obj1[key], obj2[key])) {
      return false;
    }
  }
  return true;
};

const ALIGNMENTS = ['left', 'center', 'right', 'justify'];
const SETTINGS_OPTIONS = [
  { key: 'title', label: 'Role / Title' },
  { key: 'organization', label: 'Organization' },
  { key: 'dates', label: 'Time Period' },
  { key: 'location', label: 'Location' },
  { key: 'description', label: 'Description' },
  { key: 'bullets', label: 'Bullet Points' },
];

export default function VolunteeringSection({
  data = [],
  onEdit,
  itemsToRender,
  sectionStyle = {},
  headingStyle = {},
  design = {},
}) {
  const sliderPx = parseFloat(design.fontSize) || 0;
  const offset = sliderPx / 30;
  const [focusIdx, setFocusIdx] = useState(null);
  const [showAlignOptions, setShowAlignOptions] = useState(false);
  const [showSettingsOptions, setShowSettingsOptions] = useState(false);
  const [settingsByIndex, setSettingsByIndex] = useState({});
  const [alignByIndex, setAlignByIndex] = useState({});
  const [localStartDate, setLocalStartDate] = useState(null);
  const [localEndDate, setLocalEndDate] = useState(null);
  const [localIsPresent, setLocalIsPresent] = useState(false);

  // --- STATE FOR THE AI FEATURE ---
  const [selectedText, setSelectedText] = useState('');
  const [popupPosition, setPopupPosition] = useState(null); // AI popup position
  const [suggestion, setSuggestion] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [activeTextarea, setActiveTextarea] = useState({ entryIndex: null, field: null, bulletIndex: null });

  // --- NEW STATE FOR FIXED TOOLBAR ---
  const [fixedToolbarPosition, setFixedToolbarPosition] = useState(null);

  const inputRefs = useRef({});
  const cardRefs = useRef({}); // Ref for the card container
  const alignRef = useRef(null);
  const settingsRef = useRef(null);
  const blurTimeout = useRef(null);
  const mainToolbarRef = useRef(null); // Ref for the main fixed toolbar

  const defaultSettings = SETTINGS_OPTIONS.reduce((acc, { key }) => ({ ...acc, [key]: true }), {});
  const defaultAlignment = 'left';
  
  // Function to calculate and set the fixed position
  const calculateFixedPosition = (idx) => {
    if (idx === null) {
        setFixedToolbarPosition(null);
        return;
    }
    const card = cardRefs.current[idx];
    if (card) {
        const rect = card.getBoundingClientRect();
        setFixedToolbarPosition({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
        });
    }
  };

  useEffect(() => {
    const newSettingsMap = {};
    const newAlignMap = {};
    data.forEach((item, i) => {
      newSettingsMap[i] = item.settings || { ...defaultSettings };
      newAlignMap[i] = item.alignment || defaultAlignment;
    });

    if (!deepCompare(settingsByIndex, newSettingsMap)) {
      setSettingsByIndex(newSettingsMap);
    }
    if (!deepCompare(alignByIndex, newAlignMap)) {
      setAlignByIndex(newAlignMap);
    }
  }, [data, defaultSettings, defaultAlignment, settingsByIndex, alignByIndex]);

  useEffect(() => {
    if (focusIdx !== null) {
      const elementsToResize = [
        inputRefs.current[`title-${focusIdx}`],
        inputRefs.current[`organization-${focusIdx}`],
        inputRefs.current[`location-${focusIdx}`],
        inputRefs.current[`description-${focusIdx}`],
      ];
      data[focusIdx]?.bullets?.forEach((_, bIdx) => {
        elementsToResize.push(inputRefs.current[`bullet-${focusIdx}-${bIdx}`]);
      });

      elementsToResize.forEach(el => {
        if (el && el.tagName === 'TEXTAREA') {
          el.style.height = 'auto';
          el.style.height = `${el.scrollHeight}px`;
        }
      });
      // Update position after content resize
      calculateFixedPosition(focusIdx);
    }
  }, [data, focusIdx]);

  useEffect(() => {
    if (focusIdx !== null && data[focusIdx]) {
      const { startDateObj, endDateObj, isPresent } = parseDatesForPicker(data[focusIdx].dates);
      setLocalStartDate(startDateObj);
      setLocalEndDate(endDateObj);
      setLocalIsPresent(isPresent);
    } else {
      setLocalStartDate(null);
      setLocalEndDate(null);
      setLocalIsPresent(false);
    }
  }, [focusIdx, data]);

  // UPDATED: Handle click outside logic for fixed toolbar and popups
  useEffect(() => {
    function handleClickOutside(e) {
      if (focusIdx === null) return;

      const card = cardRefs.current[focusIdx];
      const clickedInsideCard = card && card.contains(e.target);
      const clickedInsideToolbar = mainToolbarRef.current && mainToolbarRef.current.contains(e.target);
      const clickedOnAIPopup = e.target.closest('.fixed.inset-0'); // Catch the AI suggestion modal

      // Close sub-popups first if click is outside them but inside the main toolbar
      if (showAlignOptions && alignRef.current && !alignRef.current.contains(e.target)) {
        setShowAlignOptions(false);
      }
      if (showSettingsOptions && settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettingsOptions(false);
      }
      
      // If click is outside the card AND the entire fixed toolbar AND the AI popup
      if (!clickedInsideCard && !clickedInsideToolbar && !clickedOnAIPopup) {
        const isInputField = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        if (!isInputField) {
          setFocusIdx(null);
          setFixedToolbarPosition(null);
          setPopupPosition(null); // Hide AI button popup
          setShowAlignOptions(false);
          setShowSettingsOptions(false);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAlignOptions, showSettingsOptions, focusIdx]);

  // --- HELPER FUNCTIONS FOR THE AI FEATURE (Unchanged) ---
  const handleTextSelect = (e, entryIndex, field, bulletIndex = null) => {
    const text = e.target.value.substring(e.target.selectionStart, e.target.selectionEnd);
    if (text.trim().length > 5) {
      const rect = e.target.getBoundingClientRect();
      setPopupPosition({
        top: rect.top + window.scrollY - 35,
        left: rect.left + window.scrollX + e.target.selectionStart * 6, // Estimate based on selection start
      });
      setSelectedText(text);
      setActiveTextarea({ entryIndex, field, bulletIndex });
    } else {
      setPopupPosition(null);
    }
  };

  const handleRephraseClick = async () => {
    if (!selectedText) return;
    setIsLoadingAI(true);
    setSuggestion('');
    try {
      // NOTE: Placeholder for API call
      // const response = await fetch(`${process.env.REACT_APP_API_URL}/api/rephrase/`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ text: selectedText }),
      // });
      // const data = await response.json();

      // MOCK API RESPONSE
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      const mockData = { suggestion: `AI-Improved: ${selectedText.toUpperCase().slice(0, 50)}...` };

      if (mockData.suggestion) {
        setSuggestion(mockData.suggestion);
      }
    } catch (error) {
      console.error("Error fetching AI suggestion:", error);
      alert("Could not get AI suggestion. Please try again.");
    } finally {
      setIsLoadingAI(false);
      setPopupPosition(null);
    }
  };

  const acceptSuggestion = () => {
    const { entryIndex, field, bulletIndex } = activeTextarea;
    const entryData = data[entryIndex];
    if (field === 'bullets') {
      const originalText = entryData.bullets[bulletIndex];
      const updatedText = originalText.replace(selectedText, suggestion);
      handleBulletChange(entryIndex, bulletIndex, updatedText);
    } else {
      const originalText = entryData[field];
      const updatedText = originalText.replace(selectedText, suggestion);
      handleFieldChange(entryIndex, field, updatedText);
    }
    setSuggestion('');
  };
  // --- END AI HELPER FUNCTIONS ---


  const updateData = updated => onEdit(updated);
  
  const handleFieldChange = (idx, key, value) => {
    const updated = [...data];
    updated[idx] = { ...updated[idx], [key]: value };
    updateData(updated);
  };

  const handleBulletChange = (idx, bIdx, value) => {
    const updated = [...data];
    updated[idx].bullets[bIdx] = value;
    updateData(updated);
  };
  
  const parseDatesForPicker = (dateString) => {
    let startDateObj = null, endDateObj = null, isPresent = false;
    if (dateString) {
      const parts = dateString.split(' - ');
      if (parts.length >= 1 && parts[0]) {
        const startParts = parts[0].trim().split('/');
        if (startParts.length === 2) {
            const month = parseInt(startParts[0], 10) - 1;
            const year = parseInt(startParts[1], 10);
            if (!isNaN(month) && !isNaN(year)) startDateObj = new Date(year, month, 1);
        } else if (startParts.length === 1 && startParts[0].length === 4) {
            const year = parseInt(startParts[0], 10);
            if (!isNaN(year)) startDateObj = new Date(year, 0, 1);
        }
      }
      if (parts.length === 2) {
        if (parts[1].trim().toLowerCase() === 'present') {
          isPresent = true;
          endDateObj = null;
        } else {
          const endParts = parts[1].trim().split('/');
          if (endParts.length === 2) {
              const month = parseInt(endParts[0], 10) - 1;
              const year = parseInt(endParts[1], 10);
              if (!isNaN(month) && !isNaN(year)) endDateObj = new Date(year, month, 1);
          } else if (endParts.length === 1 && endParts[0].length === 4) {
              const year = parseInt(endParts[0], 10);
              if (!isNaN(year)) endDateObj = new Date(year, 0, 1);
          }
        }
      }
    }
    return { startDateObj, endDateObj, isPresent };
  };

  const formatDatesForStorage = (startDateObj, endDateObj, isPresent) => {
    let startDisplay = startDateObj instanceof Date && !isNaN(startDateObj) ? `${(startDateObj.getMonth() + 1).toString().padStart(2, '0')}/${startDateObj.getFullYear()}` : '';
    let endDisplay = isPresent ? 'Present' : (endDateObj instanceof Date && !isNaN(endDateObj) ? `${(endDateObj.getMonth() + 1).toString().padStart(2, '0')}/${endDateObj.getFullYear()}` : '');
    return startDisplay && endDisplay ? `${startDisplay} - ${endDisplay}` : startDisplay;
  };

  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setLocalStartDate(start);
    setLocalEndDate(end);
    let newIsPresent = localIsPresent;
    if (end !== null) {
      newIsPresent = false;
      setLocalIsPresent(false);
    }
    const formattedDateString = formatDatesForStorage(start, end, newIsPresent);
    handleFieldChange(focusIdx, 'dates', formattedDateString);
  };

  const handlePresentToggle = () => {
    const newIsPresent = !localIsPresent;
    setLocalIsPresent(newIsPresent);
    if (newIsPresent) {
      setLocalEndDate(null);
    }
    const formattedDateString = formatDatesForStorage(localStartDate, newIsPresent ? null : localEndDate, newIsPresent);
    handleFieldChange(focusIdx, 'dates', formattedDateString);
  };

  const addEntry = () => {
    const updated = [ ...data, { title: '', organization: '', location: '', dates: '', description: '', bullets: [''], settings: { ...defaultSettings }, alignment: defaultAlignment },];
    updateData(updated);
    const newIdx = updated.length - 1;
    setFocusIdx(newIdx);
    setTimeout(() => {
        calculateFixedPosition(newIdx);
        inputRefs.current[`title-${newIdx}`]?.focus();
    }, 0);
  };

  const removeEntry = idx => {
    const updated = [...data];
    updated.splice(idx, 1);
    updateData(updated);
    setFocusIdx(null);
    setFixedToolbarPosition(null);
  };
  
  const addBulletAt = (idx, bIdx, content = '') => {
    const updated = [...data];
    updated[idx].bullets.splice(bIdx + 1, 0, content);
    updateData(updated);
    setTimeout(() => {
        const newBulletEl = inputRefs.current[`bullet-${idx}-${bIdx + 1}`];
        if (newBulletEl) {
            newBulletEl.focus();
            newBulletEl.selectionStart = newBulletEl.selectionEnd = 0;
        }
    }, 0);
  };

  const removeBullet = (idx, bIdx) => {
    const updated = [...data];
    if (updated[idx].bullets.length > 1) {
      updated[idx].bullets.splice(bIdx, 1);
    } else {
      updated[idx].bullets[0] = '';
    }
    updateData(updated);
  };

  const handleMoveEntryUp = (idx) => {
    if (idx > 0) {
      const updated = [...data];
      [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
      updateData(updated);
      setFocusIdx(idx - 1);
      setTimeout(() => calculateFixedPosition(idx - 1), 0);
    }
  };

  const handleMoveEntryDown = (idx) => {
    if (idx < data.length - 1) {
      const updated = [...data];
      [updated[idx + 1], updated[idx]] = [updated[idx], updated[idx + 1]];
      updateData(updated);
      setFocusIdx(idx + 1);
      setTimeout(() => calculateFixedPosition(idx + 1), 0);
    }
  };

  const handleAlignClick = () => setShowAlignOptions(s => !s);
  const handleSelectAlign = align => {
    if (focusIdx != null) {
      const updated = data.map((item, idx) =>
        idx === focusIdx ? { ...item, alignment: align } : item
      );
      updateData(updated);
      setAlignByIndex(prev => ({ ...prev, [focusIdx]: align }));
    }
    setShowAlignOptions(false);
  };

  const toggleSetting = key => {
    const curr = settingsByIndex[focusIdx] || defaultSettings;
    const nextSettings = { ...curr, [key]: !curr[key] };
    const updated = data.map((item, idx) =>
      idx === focusIdx ? { ...item, settings: nextSettings } : item
    );
    updateData(updated);
    setSettingsByIndex(prev => ({ ...prev, [focusIdx]: nextSettings }));
  };

  // UPDATED: handleFocus to calculate fixed toolbar position
  const handleFocus = (idx) => {
    clearTimeout(blurTimeout.current);
    setFocusIdx(idx);
    setShowAlignOptions(false);
    setShowSettingsOptions(false);
    setTimeout(() => calculateFixedPosition(idx), 0);
  };

  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => {
      // Let handleClickOutside handle the final state change
    }, 150);
  };
  
  const renderIndices = itemsToRender && itemsToRender.length > 0 ? itemsToRender : data.map((_, i) => i);
  const focusedItemSettings = focusIdx !== null ? (settingsByIndex[focusIdx] || defaultSettings) : null;


  return (
    <div style={{ position: 'relative' }} onMouseDown={e => e.stopPropagation()}>
      {/* --- UI FOR THE AI FEATURE (Unchanged) --- */}
      {popupPosition && (
        <div style={{ position: 'fixed', top: popupPosition.top, left: popupPosition.left, zIndex: 100 }}>
          <button
            onMouseDown={(e) => {
              e.stopPropagation(); // Stop event from reaching the parent div
              handleRephraseClick();
            }}
            className="flex items-center gap-1 bg-purple-600 text-white px-2 py-1 rounded-md text-xs shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-105"
            disabled={isLoadingAI}
          >
            <Sparkles size={14} className={isLoadingAI ? "animate-spin" : ""} />
            {isLoadingAI ? 'Thinking...' : 'Improve'}
          </button>
        </div>
      )}

      {suggestion && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md animate-fade-in-up">
            <h3 className="font-bold text-lg mb-2">AI Suggestion</h3>
            <p className="text-sm text-gray-500 mb-1">Original:</p>
            <blockquote className="bg-gray-100 p-3 rounded text-sm mb-4 border-l-4 border-gray-300">"{selectedText}"</blockquote>
            <p className="text-sm text-gray-500 mb-1">Suggestion:</p>
            <blockquote className="bg-purple-100 p-3 rounded text-sm mb-6 border-l-4 border-purple-400">{suggestion}</blockquote>
            <div className="flex justify-end gap-3">
              <button onClick={() => setSuggestion('')} className="px-4 py-2 rounded text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={acceptSuggestion} className="px-4 py-2 rounded bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700">Accept Suggestion</button>
            </div>
          </div>
        </div>
      )}
      
      {!itemsToRender && data.length === 0 && (
        <button onClick={addEntry} style={{ fontSize: '0.875rem', color: '#2563EB', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '1rem' }}>
          ➕ Entry
        </button>
      )}

      {/* NEW: Fixed Position Toolbar Container */}
      {focusIdx !== null && fixedToolbarPosition && focusedItemSettings && (
        <div
          ref={mainToolbarRef}
          data-toolbar="true"
          style={{
            fontSize: '1rem', 
            position: 'fixed', // Use fixed positioning
            top: fixedToolbarPosition.top - 48, // Position above the element (approx 3rem + padding)
            right: window.innerWidth - (fixedToolbarPosition.left + fixedToolbarPosition.width), // Align to the right edge of the card
            display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#fff',
            border: '1px solid #ddd', borderRadius: '.25rem', padding: '.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', zIndex: 100,
          }}
          onMouseDown={e => e.preventDefault()}
        >
          <button style={{ backgroundColor: '#23ad17', color: '#ffffff', border: '0.1px solid #ddd', padding: '4px', borderTopLeftRadius: '.4rem', borderBottomLeftRadius: '.4rem' }} onClick={addEntry}>+ Entry</button>
          <button onClick={() => handleMoveEntryUp(focusIdx)} disabled={focusIdx === 0} style={{ opacity: focusIdx === 0 ? 0.5 : 1, cursor: focusIdx === 0 ? 'not-allowed' : 'pointer' }}>⬆️</button>
          <button onClick={() => handleMoveEntryDown(focusIdx)} disabled={focusIdx === data.length - 1} style={{ opacity: focusIdx === data.length - 1 ? 0.5 : 1, cursor: focusIdx === data.length - 1 ? 'not-allowed' : 'pointer' }}>⬇️</button>
          <div ref={alignRef} style={{ position: 'relative' }}>
            <button onClick={handleAlignClick}>T</button>
            {showAlignOptions && (
              <div style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: '0.5rem', background: '#fff', border: '1px solid #ddd', borderRadius: '.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', zIndex: 101 }}>
                {ALIGNMENTS.map(a => (<div key={a} style={{ padding: '0.25rem .5rem', cursor: 'pointer' }} onClick={() => handleSelectAlign(a)}>{a}</div>))}
              </div>
            )}
          </div>
          <button onClick={() => removeEntry(focusIdx)} style={{ color: '#dc2626' }}>🗑️</button>
          <div ref={settingsRef} style={{ position: 'relative' }}>
            <button onClick={() => setShowSettingsOptions(s => !s)}>⚙️</button>
            {showSettingsOptions && (
              <div style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: '0.5rem', background: '#fff', border: '1px solid #ddd', borderRadius: '.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '0.5rem', width: '220px', zIndex: 101 }}>
                {SETTINGS_OPTIONS.map(({ key, label }) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.25rem 0' }}>
                    <span style={{ fontSize: '0.875rem' }}>{label}</span>
                    <input type="checkbox" checked={focusedItemSettings[key]} onChange={() => toggleSetting(key)} style={{ cursor: 'pointer', width: '1.25rem', height: '1.25rem' }}/>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setFocusIdx(null)} style={{ marginLeft:'auto' }}>×</button>
        </div>
      )}


      {renderIndices.map((idx) => {
        if (idx >= data.length) return null;
        const item = data[idx];
        const isFocused = focusIdx === idx;
        const settings = settingsByIndex[idx] || defaultSettings;
        const align = alignByIndex[idx] || defaultAlignment;

        return (
          <div
            key={idx}
            data-entry-idx={idx}
            ref={el => (cardRefs.current[idx] = el)} // Attach card ref here
            onClick={isFocused ? undefined : () => handleFocus(idx)}
            style={{
              position: 'relative', padding: isFocused ? '0.5rem' : '0.25rem 0.5rem',
              backgroundColor: isFocused ? '#f9fafb' : 'transparent', borderRadius: '.375rem',
              border: isFocused ? '1px solid #e5e7eb' : 'none', ...sectionStyle,
            }}
            onMouseDown={e => e.stopPropagation()}
          >
            {/* Removed: Local Toolbar (now fixed) */}
            
            <div style={{ breakInside: 'avoid', WebkitColumnBreakInside: 'avoid', pageBreakInside: 'avoid' }}>
              {settings.title && (
                isFocused ? (
                  <textarea id={`title-${idx}`} rows={1} value={item.title} onChange={e => handleFieldChange(idx, 'title', e.target.value)} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} onFocus={() => handleFocus(idx)} onBlur={handleBlur} onSelect={(e) => handleTextSelect(e, idx, 'title')} placeholder="Role / Title" style={{ width: '100%', fontSize: `${(0.8 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius: '.25rem', padding: '0rem', marginBottom: '0.5rem', background: '#fff', outline: 'none', textAlign: align, resize: 'none', overflow: 'hidden', whiteSpace: 'pre-wrap', wordBreak: 'break-word', boxSizing: 'border-box', color: design.titleColor, }} ref={el => (inputRefs.current[`title-${idx}`] = el)} onClick={e => e.stopPropagation()} />
                ) : (
                  <div style={{ width: '100%', fontSize: `${(0.8 + offset).toFixed(3)}rem`, textAlign: align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0rem', minHeight: '1.5rem', color: design.titleColor }} onClick={() => handleFocus(idx)}>
                    {item.title || 'Role / Title'}
                  </div>
                )
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.1rem', marginBottom: '0.5rem' }}>
                {settings.organization && (
                  isFocused ? (
                    <textarea id={`organization-${idx}`} rows={1} value={item.organization} onChange={e => handleFieldChange(idx, 'organization', e.target.value)} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} onFocus={() => handleFocus(idx)} onBlur={handleBlur} onSelect={(e) => handleTextSelect(e, idx, 'organization')} placeholder="Organization Name" style={{ flex: '1 1 auto', minWidth: '120px', fontSize: `${(0.675 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.2rem', background: '#fff', outline: 'none', textAlign: align, resize: 'none', overflow: 'hidden', whiteSpace: 'pre-wrap', wordBreak: 'break-word', boxSizing: 'border-box' }} ref={el => (inputRefs.current[`organization-${idx}`] = el)} onClick={e => e.stopPropagation()} />
                  ) : (
                    <div style={{ flex: '1 1 auto', minWidth: '120px', fontSize: `${(0.675 + offset).toFixed(3)}rem`, textAlign: align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem', minHeight: '1.5rem', color: item.organization.trim() === '' ? '#a0a0a0' : 'inherit' }} onClick={() => handleFocus(idx)}>
                      {item.organization || 'Organization Name'}
                    </div>
                  )
                )}
                {settings.dates && (
                  isFocused ? (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <DatePicker selectsRange={true} startDate={localStartDate} endDate={localEndDate} onChange={handleDateRangeChange} dateFormat="MM/yyyy" showMonthYearPicker isClearable={true} onFocus={() => handleFocus(idx)} onBlur={handleBlur} placeholderText="MM/YYYY - MM/YYYY" customInput={ <input style={{ color: '#080808', flex:'1 1 auto', minWidth:'100px', fontSize: `${(0.55 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius:'.25rem', padding:'0.2rem', background:'#fff', outline:'none', textAlign:align, boxSizing: 'border-box', cursor: 'pointer' }} /> } />
                      <label style={{ display: 'flex', alignItems: 'center', fontSize: `${(0.55 + offset).toFixed(3)}rem`, color: '#080808' }}>
                        <input type="checkbox" checked={localIsPresent} onChange={handlePresentToggle} onFocus={() => handleFocus(idx)} onBlur={handleBlur} style={{ marginRight: '0.25rem', width: '1rem', height: '1rem' }} />
                        Present
                      </label>
                    </div>
                  ) : (
                    <div style={{ color: '#080808', flex:'1 1 auto', minWidth:'100px', fontSize: `${(0.55 + offset).toFixed(3)}rem`, textAlign:align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem', minHeight: '1.5rem', color: item.dates.trim() === '' ? '#a0a0a0' : 'inherit' }} onClick={() => handleFocus(idx)}>
                      {item.dates || 'e.g. MM/YYYY - Present'}
                    </div>
                  )
                )}
                {settings.location && (
                  isFocused ? (
                    <textarea id={`location-${idx}`} rows={1} value={item.location} onChange={e => handleFieldChange(idx, 'location', e.target.value)} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} onFocus={() => handleFocus(idx)} onBlur={handleBlur} placeholder="Location" style={{ flex: '1 1 auto', minWidth: '100px', fontSize: `${(0.55 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.2rem', background: '#fff', outline: 'none', textAlign: align, resize: 'none', overflow: 'hidden', whiteSpace: 'pre-wrap', wordBreak: 'break-word', boxSizing: 'border-box', color: '#080808' }} ref={el => (inputRefs.current[`location-${idx}`] = el)} onClick={e => e.stopPropagation()} />
                  ) : (
                    <div style={{ color: '#080808', flex:'1 1 auto', minWidth:'100px', fontSize: `${(0.55 + offset).toFixed(3)}rem`, textAlign:align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem', minHeight: '1.5rem', color: item.location.trim() === '' ? '#a0a0a0' : '#080808' }} onClick={() => handleFocus(idx)}>
                      {item.location || 'Location'}
                    </div>
                  )
                )}
              </div>
            </div>
            {settings.description && (
              isFocused ? (
                <textarea id={`description-${idx}`} ref={el => (inputRefs.current[`description-${idx}`] = el)} value={item.description} onChange={e => handleFieldChange(idx, 'description', e.target.value)} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} onFocus={() => handleFocus(idx)} onBlur={handleBlur} onSelect={(e) => handleTextSelect(e, idx, 'description')} placeholder="Brief organization/role summary..." style={{ width: '100%', border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.2rem', marginBottom: '0.75rem', resize: 'none', overflow: 'hidden', background: '#fff', outline: 'none', fontSize: `${(0.6 + offset).toFixed(3)}rem`, textAlign: align, whiteSpace: 'pre-wrap', wordBreak: 'break-word', boxSizing: 'border-box', color: '#080808' }} onClick={e => e.stopPropagation()} />
              ) : (
                <div style={{ width: '100%', marginBottom: '0.75rem', fontSize: `${(0.6 + offset).toFixed(3)}rem`, textAlign: align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem', minHeight: '2rem', color: item.description.trim() === '' ? '#a0a0a0' : '#080808' }} onClick={() => handleFocus(idx)}>
                  {item.description || 'Brief organization/role summary...'}
                </div>
              )
            )}
            {settings.bullets && (
              <ul style={{ listStyle: 'none', paddingLeft: '1.25rem', marginBottom: '0.5rem', listStylePosition: 'outside', color: '#080808', }}>
                {item.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} style={{ marginBottom: '0.25rem', fontSize: `${(0.8 + offset).toFixed(3)}rem`, paddingLeft: '0', breakInside: 'avoid', WebkitColumnBreakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <span style={{lineHeight:1}}>&bull;</span>
                      {isFocused ? (
                        <textarea id={`bullet-${idx}-${bIdx}`} rows={1} ref={el => (inputRefs.current[`bullet-${idx}-${bIdx}`] = el)} value={bullet} onChange={e => handleBulletChange(idx, bIdx, e.target.value)} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); const currentBulletText = e.target.value; const cursorPosition = e.target.selectionStart; const textBeforeCursor = currentBulletText.substring(0, cursorPosition); const textAfterCursor = currentBulletText.substring(cursorPosition); handleBulletChange(idx, bIdx, textBeforeCursor); addBulletAt(idx, bIdx, textAfterCursor); } }} onFocus={() => handleFocus(idx)} onBlur={handleBlur} onSelect={(e) => handleTextSelect(e, idx, 'bullets', bIdx)} placeholder="Bullet point..." style={{ flex: '1 1 auto', border: 'none', borderBottom: '1px solid #ccc', background: '#fff', outline: 'none', fontSize: `${(0.6 + offset).toFixed(3)}rem`, resize: 'none', overflow: 'hidden', textAlign: align, whiteSpace: 'pre-wrap', wordBreak: 'break-word', boxSizing: 'border-box', padding: '0.25rem', color: '#080808' }} onClick={e => e.stopPropagation()} />
                      ) : (
                        <div style={{ flex: '1 1 auto', fontSize: `${(0.6 + offset).toFixed(3)}rem`, textAlign: align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', minHeight: '1.5rem', color: '#080808', padding: '0rem' }} onClick={() => handleFocus(idx)}>
                          {bullet || 'Bullet point...'}
                        </div>
                      )}
                      {isFocused && (
                        <button onMouseDown={e => { e.preventDefault(); removeBullet(idx, bIdx); }} style={{ fontSize: '0.75rem', color: '#dc2626', background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
                      )}
                    </div>
                  </li>
                ))}
                {isFocused && (
                  <li>
                    <button onClick={() => addBulletAt(idx, item.bullets.length - 1)} style={{ fontSize: '0.875rem', color: '#2563EB', background: 'transparent', border: 'none', cursor: 'pointer', marginTop: '0.5rem', marginLeft: '-0.75rem' }}>➕ Bullet</button>
                  </li>
                )}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
