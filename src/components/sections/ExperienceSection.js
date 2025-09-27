import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Sparkles } from 'lucide-react'; // An icon for our AI button

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
  { key: 'title',       label: 'Job Title' },
  { key: 'company',     label: 'Company Name' },
  { key: 'dates',       label: 'Time Period' },
  { key: 'location',    label: 'Location' },
  { key: 'description', label: 'Description' },
  { key: 'bullets',     label: 'Bullet Points' },
];

export default function ExperienceSection({
  data = [],
  onEdit,
  itemsToRender,
  sectionStyle = {},
  headingStyle = {},
  onChangeAlignment,
  design = {},
  isFirstOnPage = false,
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

  // --- NEW: State for the AI Rephrasing Feature ---
  const [selectedText, setSelectedText] = useState('');
  const [popupPosition, setPopupPosition] = useState(null);
  const [suggestion, setSuggestion] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [activeTextarea, setActiveTextarea] = useState({ entryIndex: null, field: null, bulletIndex: null });

  const refs = useRef({});
  const alignRef = useRef(null);
  const settingsRef = useRef(null);
  const blurTimeout = useRef(null);

  const defaultSettings = SETTINGS_OPTIONS.reduce(
    (acc, { key }) => ({ ...acc, [key]: true }),
    {}
  );
  const defaultAlignment = 'left';

  useEffect(() => {
    const newSettings = {};
    const newAlignments = {};
    data.forEach((item, i) => {
      newSettings[i] = item.settings || { ...defaultSettings };
      newAlignments[i] = item.align || defaultAlignment;
    });
    if (!deepCompare(settingsByIndex, newSettings)) setSettingsByIndex(newSettings);
    if (!deepCompare(alignByIndex, newAlignments)) setAlignByIndex(newAlignments);
  }, [data, defaultSettings, defaultAlignment, settingsByIndex, alignByIndex]);


  useEffect(() => {
    if (focusIdx !== null) {
      const descEl = refs.current[`desc-${focusIdx}`];
      if (descEl) {
        descEl.style.height = 'auto';
        descEl.style.height = `${descEl.scrollHeight}px`;
      }
      if (data[focusIdx] && data[focusIdx].bullets) {
        data[focusIdx].bullets.forEach((_, bIdx) => {
          const bulletEl = refs.current[`${focusIdx}-bullet-${bIdx}`];
          if (bulletEl) {
            bulletEl.style.height = 'auto';
            bulletEl.style.height = `${bulletEl.scrollHeight}px`;
          }
        });
      }
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

  useEffect(() => {
    function handleClickOutside(e) {
      if (showAlignOptions    && alignRef.current    && !alignRef.current.contains(e.target)) {
        setShowAlignOptions(false);
      }
      if (showSettingsOptions && settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettingsOptions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAlignOptions, showSettingsOptions]);

  useEffect(() => {
    return () => clearTimeout(blurTimeout.current);
  }, []);

  const updateData = updated => onEdit(updated);

  const handleFieldChange  = (idx, key, val) => {
    const updated = [...data];
    updated[idx] = { ...updated[idx], [key]: val };
    updateData(updated);
  };
  
  const handleBulletChange = (idx, bIdx, val) => {
    const updated = [...data];
    if (updated[idx] && updated[idx].bullets) {
        updated[idx].bullets[bIdx] = val;
        updateData(updated);
    }
  };

  const handleFocusWithDelay = (idx) => {
    clearTimeout(blurTimeout.current);
    setFocusIdx(idx);
  };

  const handleBlurWithDelay = () => {
    blurTimeout.current = setTimeout(() => {
        setFocusIdx(null);
        setPopupPosition(null); // Hide AI button on blur
    }, 150);
  };

  const parseDatesForPicker = (dateString) => {
    let startDateObj = null, endDateObj = null, isPresent = false;
    if (dateString) {
      const parts = dateString.split(' - ');
      if (parts[0]) {
        const startParts = parts[0].trim().split('/');
        if (startParts.length === 2) {
          startDateObj = new Date(parseInt(startParts[1], 10), parseInt(startParts[0], 10) - 1, 1);
        } else if (startParts.length === 1 && startParts[0].length === 4) {
          startDateObj = new Date(parseInt(startParts[0], 10), 0, 1);
        }
      }
      if (parts.length === 2) {
        if (parts[1].trim().toLowerCase() === 'present') {
          isPresent = true;
        } else {
          const endParts = parts[1].trim().split('/');
          if (endParts.length === 2) {
            endDateObj = new Date(parseInt(endParts[1], 10), parseInt(endParts[0], 10) - 1, 1);
          } else if (endParts.length === 1 && endParts[0].length === 4) {
            endDateObj = new Date(parseInt(endParts[0], 10), 0, 1);
          }
        }
      }
    }
    return { startDateObj, endDateObj, isPresent };
  };

  const formatDatesForStorage = (startDateObj, endDateObj, isPresent) => {
    let startDisplay = startDateObj ? `${(startDateObj.getMonth() + 1).toString().padStart(2, '0')}/${startDateObj.getFullYear()}` : '';
    let endDisplay = isPresent ? 'Present' : (endDateObj ? `${(endDateObj.getMonth() + 1).toString().padStart(2, '0')}/${endDateObj.getFullYear()}` : '');
    return startDisplay && endDisplay ? `${startDisplay} - ${endDisplay}` : startDisplay;
  };

  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setLocalStartDate(start);
    setLocalEndDate(end);
    let newIsPresent = (end === null) ? localIsPresent : false;
    if (end !== null) setLocalIsPresent(false);
    const formattedDateString = formatDatesForStorage(start, end, newIsPresent);
    handleFieldChange(focusIdx, 'dates', formattedDateString);
  };

  const handlePresentToggle = () => {
    const newIsPresent = !localIsPresent;
    setLocalIsPresent(newIsPresent);
    const endDate = newIsPresent ? null : localEndDate;
    if (newIsPresent) setLocalEndDate(null);
    const formattedDateString = formatDatesForStorage(localStartDate, endDate, newIsPresent);
    handleFieldChange(focusIdx, 'dates', formattedDateString);
  };

  const addEntry = () => {
    const updated = [ ...data, { title:'', company:'', dates:'', location:'', description:'', bullets:[''] } ];
    updateData(updated);
    setTimeout(() => {
        setFocusIdx(updated.length - 1);
        refs.current[`title-${updated.length - 1}`]?.focus();
    }, 0);
  };

  const removeEntry  = idx => {
    const updated = [...data];
    updated.splice(idx, 1);
    updateData(updated);
    setFocusIdx(null);
  };

  const addBulletAt  = (idx, bIdx, content = '') => {
    const updated = [...data];
    updated[idx].bullets.splice(bIdx + 1, 0, content);
    updateData(updated);
    setTimeout(() => {
      refs.current[`${idx}-bullet-${bIdx+1}`]?.focus();
      if (refs.current[`${idx}-bullet-${bIdx+1}`]) {
          const newBulletEl = refs.current[`${idx}-bullet-${bIdx+1}`];
          newBulletEl.selectionStart = newBulletEl.selectionEnd = 0;
      }
    }, 0);
  };

  const removeBullet = (idx, bIdx) => {
    const updated = [...data];
    if (updated[idx].bullets.length > 1) {
        updated[idx].bullets.splice(bIdx, 1);
        updateData(updated);
    } else {
        updated[idx].bullets[0] = '';
        updateData(updated);
    }
  };

  const handleMoveEntryUp = (idx) => {
    if (idx > 0) {
      const updated = [...data];
      [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
      updateData(updated);
      setFocusIdx(idx - 1);
    }
  };

  const handleMoveEntryDown = (idx) => {
    if (idx < data.length - 1) {
      const updated = [...data];
      [updated[idx + 1], updated[idx]] = [updated[idx], updated[idx + 1]];
      updateData(updated);
      setFocusIdx(idx + 1);
    }
  };

  const handleAlignClick = () => setShowAlignOptions(s => !s);
  const handleSelectAlign = a => {
    if (focusIdx != null) {
      const updatedData = data.map((item, index) => index === focusIdx ? { ...item, align: a } : item);
      updateData(updatedData);
      setAlignByIndex(prev => ({ ...prev, [focusIdx]: a }));
    }
    setShowAlignOptions(false);
    onChangeAlignment?.(a);
  };

  const toggleSetting = key => {
    if (focusIdx == null) return;
    const currSettings = settingsByIndex[focusIdx] || { ...defaultSettings };
    const nextSettings = { ...currSettings, [key]: !currSettings[key] };
    const updatedData = data.map((item, idx) => idx === focusIdx ? { ...item, settings: nextSettings } : item);
    onEdit(updatedData);
    setSettingsByIndex(prev => ({ ...prev, [focusIdx]: nextSettings }));
  };
  
  // --- NEW: AI Feature Handlers ---
  const handleTextSelect = (e, entryIndex, field, bulletIndex = null) => {
    const text = e.target.value.substring(e.target.selectionStart, e.target.selectionEnd);
    if (text.trim().length > 5) {
      const rect = e.target.getBoundingClientRect();
      setPopupPosition({
        top: rect.top + window.scrollY - 35,
        left: rect.left + window.scrollX,
      });
      setSelectedText(text);
      setActiveTextarea({ entryIndex, field, bulletIndex });
    } else {
      setPopupPosition(null);
    }
  };

const handleRephraseClick = async () => {
  console.log("1. 'Improve' button clicked. The handler started.");

  if (!selectedText) {
    console.log("2. FAILED: No selected text. Aborting.");
    return;
  }

  console.log("3. PASSED: Selected text is:", selectedText);
  setIsLoadingAI(true);
  setSuggestion('');

  try {
    console.log("4. Attempting to fetch from: ${process.env.REACT_APP_API_URL}/api/rephrase/");

    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/rephrase/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: selectedText }),
    });

    console.log("5. Fetch request completed. Response status:", response.status);

    const data = await response.json();
    console.log("6. Response JSON parsed:", data);

    if (data.suggestion) {
      setSuggestion(data.suggestion);
    }
  } catch (error) {
    console.error("7. CATCH BLOCK: An error occurred during fetch.", error);
  } finally {
    console.log("8. FINALLY BLOCK: Request finished.");
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

  const renderIndices = itemsToRender && itemsToRender.length > 0 ? itemsToRender : data.map((_, i) => i);

  return (
    <div >
      {/* --- NEW: AI Button and Suggestion Modal --- */}
      {popupPosition && (
        <div style={{ position: 'fixed', top: popupPosition.top, left: popupPosition.left, zIndex: 100 }}>
          <button
            onMouseDown={handleRephraseClick}
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
        <button
          onClick={addEntry}
          style={{
            fontSize: '0.875rem', color: '#2563EB', background: 'transparent',
            border: 'none', cursor: 'pointer', marginBottom: '1rem',
          }}
        >
          ➕ Add Experience
        </button>
      )}

      {renderIndices.map((idx) => {
        if (idx >= data.length) return null;

        const item = data[idx];
        const isFocused = focusIdx === idx;
        const settings  = item.settings || defaultSettings;
        const align     = item.align    || defaultAlignment;
        
        const isFirstItemInChunk = itemsToRender ? idx === itemsToRender[0] : idx === 0;
        const shouldFlipToolbar = isFirstOnPage && isFirstItemInChunk;

        const toolbarStyle = {
          fontSize: '1rem',
          position: 'absolute',
          right: 0,
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: '.25rem',
          padding: '.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          zIndex: 10,
          ...(shouldFlipToolbar
            ? { top: '100%', marginTop: '0.5rem' }
            : { top: '-3rem' }
          ),
        };

        return (
          <div
            key={idx}
            style={{
              position: 'relative',
              padding: isFocused ? '0.5rem' : '0.25rem 0.5rem',
              background: isFocused ? '#f9fafb' : 'transparent',
              marginBottom: '0.5rem',
              ...sectionStyle,
            }}
            onClick={isFocused ? undefined : () => handleFocusWithDelay(idx)}
          >
            {isFocused && (
              <div
                style={toolbarStyle}
                onMouseDown={e => e.preventDefault()}
              >
                <button style={{ backgroundColor: '#23ad17', color: '#ffffff', border: '0.1px solid #ddd', padding: '4px', borderTopLeftRadius: '.4rem', borderBottomLeftRadius: '.4rem' }} onClick={addEntry}>+ Entry</button>
                <button onClick={() => handleMoveEntryUp(idx)} disabled={idx === 0} style={{ opacity: idx === 0 ? 0.5 : 1, cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>⬆️</button>
                <button onClick={() => handleMoveEntryDown(idx)} disabled={idx === data.length - 1} style={{ opacity: idx === data.length - 1 ? 0.5 : 1, cursor: idx === data.length - 1 ? 'not-allowed' : 'pointer' }}>⬇️</button>
                <div ref={alignRef} style={{ position:'relative' }}>
                  <button style={{ color: '#080808' }} onClick={handleAlignClick}>T</button>
                  {showAlignOptions && (
                    <div style={{ position: 'absolute', top: '-4rem', right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', zIndex: 11 }}>
                      {ALIGNMENTS.map(a => (<div key={a} style={{ padding:'0.25rem .5rem', cursor:'pointer' }} onClick={() => handleSelectAlign(a)}>{a}</div>))}
                    </div>
                  )}
                </div>
                <button onClick={() => removeEntry(idx)} style={{ color:'#dc2626' }}>🗑️</button>
                <div ref={settingsRef} style={{ position:'relative' }}>
                  <button onClick={() => setShowSettingsOptions(s => !s)}>⚙️</button>
                  {showSettingsOptions && (
                    <div style={{ position: 'absolute', top: '-4rem', right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '0.5rem', width: '220px', zIndex: 11 }}>
                      {SETTINGS_OPTIONS.map(({ key, label }) => (<div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', margin:'0.25rem 0' }}><span style={{ fontSize:'0.875rem' }}>{label}</span><input type="checkbox" checked={settings[key]} onChange={() => toggleSetting(key)} style={{ cursor:'pointer', width:'1.25rem', height:'1.25rem' }} /></div>))}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div style={{ breakInside: 'avoid', WebkitColumnBreakInside: 'avoid', pageBreakInside: 'avoid' }}>
              {settings.title && (isFocused ? (<input id={`title-${idx}`} type="text" value={item.title} onChange={e => handleFieldChange(idx, 'title', e.target.value)} onFocus={() => handleFocusWithDelay(idx)} onBlur={handleBlurWithDelay} placeholder="Job Title" style={{ width:'100%', fontSize: `${(0.8 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius:'.25rem', padding:'0rem', background:'#fff', outline:'none', textAlign:align, boxSizing: 'border-box', color: design.titleColor }} ref={el => (refs.current[`title-${idx}`] = el)} />) : (<div style={{ width:'100%', fontSize: `${(0.8 + offset).toFixed(3)}rem`, border: '1px', textAlign:align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0rem', color: design.titleColor }} onClick={() => handleFocusWithDelay(idx)}>{item.title || 'Job Title'}</div>))}
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.1rem', marginBottom:'0.5rem' }}>
                {settings.company && (isFocused ? (<input type="text" value={item.company} onChange={e => handleFieldChange(idx, 'company', e.target.value)} onFocus={() => handleFocusWithDelay(idx)} onBlur={handleBlurWithDelay} placeholder="Company Name" style={{ flex:'1 1 auto', minWidth:'120px', fontSize: `${(0.675 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius:'.25rem', padding:'0.2rem', background:'#fff', outline:'none', textAlign:align, boxSizing: 'border-box' }} />) : (<div style={{ flex:'1 1 auto', minWidth:'120px', fontSize: `${(0.675 + offset).toFixed(3)}rem`, textAlign:align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem', color: item.company.trim() === '' ? '#a0a0a0' : 'inherit' }} onClick={() => handleFocusWithDelay(idx)}>{item.company || 'Company Name'}</div>))}
                {settings.dates && (isFocused ? (<div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}><DatePicker selectsRange={true} startDate={localStartDate} endDate={localEndDate} onChange={handleDateRangeChange} dateFormat="MM/yyyy" showMonthYearPicker isClearable={true} onFocus={() => handleFocusWithDelay(idx)} onBlur={handleBlurWithDelay} placeholderText="MM/YYYY - MM/YYYY" customInput={ <input style={{ color: '#080808', flex:'1 1 auto', minWidth:'100px', fontSize: `${(0.55 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius:'.25rem', padding:'0.2rem', background:'#fff', outline:'none', textAlign:align, boxSizing: 'border-box', cursor: 'pointer' }} /> } /><label style={{ display: 'flex', alignItems: 'center', fontSize: `${(0.55 + offset).toFixed(3)}rem`, color: '#080808' }}><input type="checkbox" checked={localIsPresent} onChange={handlePresentToggle} onFocus={() => handleFocusWithDelay(idx)} onBlur={handleBlurWithDelay} style={{ marginRight: '0.25rem', width: '1rem', height: '1rem' }} />Present</label></div>) : (<div style={{ color: '#080808', flex:'1 1 auto', minWidth:'100px', fontSize: `${(0.55 + offset).toFixed(3)}rem`, textAlign:align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem' }} onClick={() => handleFocusWithDelay(idx)}>{item.dates || 'e.g. MM/YYYY - Present'}</div>))}
                {settings.location && (isFocused ? (<input type="text" value={item.location} onChange={e => handleFieldChange(idx, 'location', e.target.value)} onFocus={() => handleFocusWithDelay(idx)} onBlur={handleBlurWithDelay} placeholder="Location" style={{ color: '#080808', flex:'1 1 auto', minWidth:'100px', fontSize: `${(0.55 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius:'.25rem', padding:'0.2rem', background:'#fff', outline:'none', textAlign:align, boxSizing: 'border-box' }} />) : (<div style={{ color: '#080808', flex:'1 1 auto', minWidth:'100px', fontSize: `${(0.55 + offset).toFixed(3)}rem`, textAlign:align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem' }} onClick={() => handleFocusWithDelay(idx)}>{item.location || 'Location'}</div>))}
              </div>
            </div>
            {settings.description && (isFocused ? (
              <textarea 
                ref={el => (refs.current[`desc-${idx}`] = el)} 
                value={item.description} 
                onChange={e => handleFieldChange(idx, 'description', e.target.value)} 
                onInput={e => { e.target.style.height='auto'; e.target.style.height=`${e.target.scrollHeight}px`; }} 
                onFocus={() => handleFocusWithDelay(idx)} 
                onBlur={handleBlurWithDelay} 
                onSelect={(e) => handleTextSelect(e, idx, 'description')}
                placeholder="Brief company/role summary..." 
                style={{ color: '#080808', width:'100%', border: '1px solid #ccc', borderRadius:'.25rem', padding:'0.2rem', marginBottom:'0.75rem', resize:'none', overflow:'hidden', background:'#fff', outline:'none', fontSize: `${(0.675 + offset).toFixed(3)}rem`, textAlign:align, boxSizing: 'border-box' }} 
              />
            ) : (<div style={{ color: '#080808', width:'100%', marginBottom:'0.75rem', fontSize: `${(0.675 + offset).toFixed(3)}rem`, textAlign:align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem', minHeight: '2rem', color: item.description.trim() === '' ? '#a0a0a0' : 'inherit' }} onClick={() => handleFocusWithDelay(idx)}>{item.description || 'Brief company/role summary...'}</div>))}
            {settings.bullets && (
              <ul style={{ listStyle:'none', paddingLeft:'1.25rem', marginBottom:'0.5rem', color: '#080808' }}>
                {item.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} style={{ marginBottom:'0rem', fontSize: `${(0.8 + offset).toFixed(3)}rem`, paddingLeft: '0' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:'0.5rem' }}>
                      <span style={{lineHeight:1, }}>&bull;</span>
                      {isFocused ? (
                        <textarea 
                          ref={el => (refs.current[`${idx}-bullet-${bIdx}`] = el)} 
                          value={bullet} 
                          onChange={e => handleBulletChange(idx, bIdx, e.target.value)} 
                          onInput={e => { e.target.style.height='auto'; e.target.style.height=`${e.target.scrollHeight}px`; }} 
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const currentBulletText = e.target.value; const cursorPosition = e.target.selectionStart; const textBeforeCursor = currentBulletText.substring(0, cursorPosition); const textAfterCursor = currentBulletText.substring(cursorPosition); handleBulletChange(idx, bIdx, textBeforeCursor); addBulletAt(idx, bIdx, textAfterCursor); } }} 
                          onFocus={() => handleFocusWithDelay(idx)} 
                          onBlur={handleBlurWithDelay} 
                          onSelect={(e) => handleTextSelect(e, idx, 'bullets', bIdx)}
                          placeholder="Bullet point..." 
                          rows={1} 
                          style={{ flex:'1 1 auto', border:'1px solid #ccc', borderRadius:'.25rem', background:'#fff', outline:'none', fontSize: `${(0.6 + offset).toFixed(3)}rem`, resize:'none', overflow:'hidden', padding:'0.25rem', textAlign:align, boxSizing: 'border-box' }} 
                        />
                      ) : (
                        <div style={{ flex:'1 1 auto', whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', textAlign:align, fontSize: `${(0.6 + offset).toFixed(3)}rem`, padding:'0', minHeight: '1.5rem', color: bullet.trim() === '' ? '#a0a0a0' : 'inherit' }} onClick={() => handleFocusWithDelay(idx)}>{bullet || 'Bullet point...'}</div>
                      )}
                      {isFocused && ( <button onMouseDown={e => { e.preventDefault(); removeBullet(idx, bIdx); }} style={{ fontSize:'0.75rem', color:'#dc2626', background:'transparent', border:'none', cursor:'pointer' }}> ✕ </button> )}
                    </div>
                  </li>
                ))}
                {isFocused && (<li><button onClick={() => addBulletAt(idx, item.bullets.length -1)} style={{ fontSize: '0.875rem', color: '#2563EB', background: 'transparent', border: 'none', cursor: 'pointer', marginTop: '0.5rem', marginLeft: '-0.75rem' }}>➕ Bullet</button></li>)}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}