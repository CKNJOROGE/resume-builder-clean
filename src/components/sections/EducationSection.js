import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
  { key: 'degree',      label: 'Degree / Program' },
  { key: 'institution', label: 'Institution' },
  { key: 'dates',       label: 'Time Period' },
  { key: 'location',    label: 'Location' },
  { key: 'description', label: 'Description' },
];

export default function EducationSection({
  data = [],
  onEdit,
  itemsToRender,
  sectionStyle = {},
  headingStyle = {},
  onChangeAlignment,
  design = {}
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

  const refs = useRef({});
  const alignRef = useRef(null);
  const settingsRef = useRef(null);
  const blurTimeout = useRef(null);

  const defaultSettings  = SETTINGS_OPTIONS.reduce((acc, { key }) => ({ ...acc, [key]: true }), {});
  const defaultAlignment = 'left';

  useEffect(() => {
    const newSettings = {};
    const newAlignments = {};

    data.forEach((item, i) => {
      const currentSettings = item.settings ? { ...defaultSettings, ...item.settings } : { ...defaultSettings };
      newSettings[i] = currentSettings;
      newAlignments[i] = item.align || defaultAlignment;
    });

    if (!deepCompare(settingsByIndex, newSettings)) {
      setSettingsByIndex(newSettings);
    }
    if (!deepCompare(alignByIndex, newAlignments)) {
      setAlignByIndex(newAlignments);
    }
  }, [data, defaultSettings, defaultAlignment]);

  useEffect(() => {
    if (focusIdx !== null) {
      const descEl = refs.current[`desc-${focusIdx}`];
      if (descEl) {
        descEl.style.height = 'auto';
        descEl.style.height = `${descEl.scrollHeight}px`;
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
    const handleClickOutside = e => {
      if (showAlignOptions    && alignRef.current    && !alignRef.current.contains(e.target)) {
        setShowAlignOptions(false);
      }
      if (showSettingsOptions && settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettingsOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAlignOptions, showSettingsOptions]);

  useEffect(() => {
    return () => clearTimeout(blurTimeout.current);
  }, []);

  const updateData = updated => onEdit(updated);

  const handleFieldChange = (idx, key, value) => {
    const updated = [...data];
    updated[idx] = { ...updated[idx], [key]: value };
    updateData(updated);
  };

  const handleFocus = (idx) => {
    clearTimeout(blurTimeout.current);
    setFocusIdx(idx);
  };

  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => setFocusIdx(null), 150);
  };

  const parseDatesForPicker = (dateString) => {
    let startDateObj = null, endDateObj = null, isPresent = false;
    if (dateString) {
      const parts = dateString.split(' – ');
      if (parts.length >= 1 && parts[0]) {
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
    let startDisplay = startDateObj instanceof Date && !isNaN(startDateObj) ? `${(startDateObj.getMonth() + 1).toString().padStart(2, '0')}/${startDateObj.getFullYear()}` : '';
    let endDisplay = isPresent ? 'Present' : (endDateObj instanceof Date && !isNaN(endDateObj) ? `${(endDateObj.getMonth() + 1).toString().padStart(2, '0')}/${endDateObj.getFullYear()}` : '');
    return startDisplay && endDisplay ? `${startDisplay} – ${endDisplay}` : startDisplay;
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
    const formattedDateString = formatDatesForStorage(localStartDate, null, newIsPresent);
    handleFieldChange(focusIdx, 'dates', formattedDateString);
  };

  const addEntry = () => {
    const newEntry = { degree: '', institution: '', dates: '', location: '', description: '', settings: { ...defaultSettings }, align: defaultAlignment };
    const updated = [...data, newEntry];
    updateData(updated);
    setFocusIdx(updated.length - 1);
    setTimeout(() => { refs.current[`degree-${updated.length - 1}`]?.focus(); }, 0);
  };

  const removeEntry = idx => {
    const updated = [...data];
    updated.splice(idx, 1);
    updateData(updated);
    setFocusIdx(null);
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
    const curr = settingsByIndex[focusIdx] || defaultSettings;
    const nextSettings = { ...curr, [key]: !curr[key] };
    const updatedData = data.map((item, idx) => idx === focusIdx ? { ...item, settings: nextSettings } : item);
    onEdit(updatedData);
    setSettingsByIndex(prev => ({ ...prev, [focusIdx]: nextSettings }));
  };

  // FIX: Determine indices to render from itemsToRender (if provided) or data
  const renderIndices = itemsToRender && itemsToRender.length > 0 ? itemsToRender : data.map((_, i) => i);

  return (
    <div style={{ position: 'relative' }} onMouseDown={e => e.stopPropagation()}>
      {!itemsToRender && data.length === 0 && (
        <button
          onClick={addEntry}
          style={{ fontSize: '0.875rem', color: '#2563EB', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '1rem' }}
        >
          ➕ Add Education
        </button>
      )}

      {/* FIX: Map over the stable renderIndices array */}
      {renderIndices.map((idx) => {
        if (idx >= data.length) return null; // Safeguard
        
        // FIX: Access the item data using the stable index
        const item = data[idx];
        const isFocused = focusIdx === idx;
        const settings = item.settings || defaultSettings;
        const align = item.align || defaultAlignment;

        const currentItemData = {
          degree: item.degree || '',
          institution: item.institution || '',
          dates: item.dates || '',
          location: item.location || '',
          description: item.description || '',
        };

        return (
          <div
            key={idx} // FIX: Use stable index for the key
            style={{ position: 'relative', padding: isFocused ? '0.5rem' : '0.1rem 0.5rem', background: isFocused ? '#f9fafb' : 'transparent', breakInside: 'avoid', WebkitColumnBreakInside: 'avoid', pageBreakInside: 'avoid', ...sectionStyle }}
            onClick={isFocused ? undefined : () => handleFocus(idx)}
            onMouseDown={e => e.stopPropagation()}
          >
            {isFocused && (
              <div style={{ fontSize: '1rem', position: 'absolute', top: '-3rem', right: 0, display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#fff', border: '1px solid #ddd', borderRadius: '.25rem', padding: '.25rem .5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', zIndex: 10 }} onMouseDown={e => e.preventDefault()}>
                <button style={{ backgroundColor: '#23ad17', color: '#ffffff', border: '0.1px solid #ddd', padding: '4px', borderTopLeftRadius: '.4rem', borderBottomLeftRadius: '.4rem' }} onClick={addEntry}>+ Entry</button>
                <button onClick={() => handleMoveEntryUp(idx)} disabled={idx === 0} style={{ opacity: idx === 0 ? 0.5 : 1, cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>⬆️</button>
                <button onClick={() => handleMoveEntryDown(idx)} disabled={idx === data.length - 1} style={{ opacity: idx === data.length - 1 ? 0.5 : 1, cursor: idx === data.length - 1 ? 'not-allowed' : 'pointer' }}>⬇️</button>
                <div ref={alignRef} style={{ position:'relative' }}><button onClick={handleAlignClick}>T</button>{showAlignOptions && (<div style={{ position: 'absolute', top: '-4rem', right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', zIndex: 11 }}>{ALIGNMENTS.map(a => (<div key={a} style={{ padding:'0.25rem .5rem', cursor:'pointer' }} onClick={() => handleSelectAlign(a)}>{a}</div>))}</div>)}</div>
                <button onClick={() => removeEntry(idx)} style={{ color:'#dc2626' }}>🗑️</button>
                <div ref={settingsRef} style={{ position:'relative' }}><button onClick={() => setShowSettingsOptions(s => !s)}>⚙️</button>{showSettingsOptions && (<div style={{ position: 'absolute', top: '-4rem', right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '0.5rem', width: '200px', zIndex: 11 }}>{SETTINGS_OPTIONS.map(({ key, label }) => (<div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', margin:'0.25rem 0' }}><span style={{ fontSize:'0.875rem' }}>{label}</span><input type="checkbox" checked={settings[key]} onChange={() => toggleSetting(key)} style={{ cursor:'pointer', width:'1.25rem', height:'1.25rem' }} /></div>))}</div>)}</div>
              </div>
            )}

            {settings.degree && (isFocused ? (<input id={`degree-${idx}`} type="text" value={currentItemData.degree} onChange={e => handleFieldChange(idx, 'degree', e.target.value)} onFocus={() => handleFocus(idx)} onBlur={handleBlur} placeholder="Degree / Program" style={{ width:'100%', fontSize: `${(0.7 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius:'.25rem', padding:'0.2rem', background:'#fff', outline:'none', textAlign:align, boxSizing: 'border-box', color: design.titleColor }} ref={el => (refs.current[`degree-${idx}`] = el)} />) : (<div style={{ width:'100%', fontSize: `${(0.7 + offset).toFixed(3)}rem`, textAlign:align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem', color: design.titleColor, minHeight: '1.5rem' }} onClick={() => handleFocus(idx)}>{currentItemData.degree || 'Degree / Program'}</div>))}
            <div style={{ display:'flex', flexWrap:'wrap', marginBottom:'0.5rem' }}>
              {settings.institution && (isFocused ? (<input type="text" value={currentItemData.institution} onChange={e => handleFieldChange(idx, 'institution', e.target.value)} onFocus={() => handleFocus(idx)} onBlur={handleBlur} placeholder="Institution" style={{ flex:'1 1 auto', minWidth:'120px', fontWeight:500, fontSize: `${(0.6 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius:'.25rem', padding:'0.2rem', background:'#fff', outline:'none', textAlign:align, boxSizing: 'border-box' }} />) : (<div style={{ flex:'1 1 auto', minWidth:'120px', fontWeight:500, fontSize: `${(0.6 + offset).toFixed(3)}rem`, textAlign:align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem', color: (currentItemData.institution || '').trim() === '' ? '#a0a0a0' : 'inherit', minHeight: '1.5rem' }} onClick={() => handleFocus(idx)}>{currentItemData.institution || 'Institution'}</div>))}
              {settings.dates && (isFocused ? (<div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}><DatePicker selectsRange={true} startDate={localStartDate} endDate={localEndDate} onChange={handleDateRangeChange} dateFormat="MM/yyyy" showMonthYearPicker isClearable={true} onFocus={() => handleFocus(idx)} onBlur={handleBlur} placeholderText="MM/YYYY – MM/YYYY" customInput={ <input style={{ color: '#080808', flex:'1 1 auto', minWidth:'100px', fontSize: `${(0.55 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius:'.25rem', padding:'0.2rem', background:'#fff', outline:'none', textAlign:align, boxSizing: 'border-box', cursor: 'pointer' }} /> } /><label style={{ display: 'flex', alignItems: 'center', fontSize: `${(0.55 + offset).toFixed(3)}rem`, color: '#080808' }}><input type="checkbox" checked={localIsPresent} onChange={handlePresentToggle} onFocus={() => handleFocus(idx)} onBlur={handleBlur} style={{ marginRight: '0.25rem', width: '1rem', height: '1rem' }} />Present</label></div>) : (<div style={{ flex:'1 1 auto', minWidth:'100px', fontSize: `${(0.55 + offset).toFixed(3)}rem`, textAlign:align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem', color: '#080808', minHeight: '1.5rem' }} onClick={() => handleFocus(idx)}>{currentItemData.dates || '2004 – 2008'}</div>))}
              {settings.location && (isFocused ? (<input type="text" value={currentItemData.location} onChange={e => handleFieldChange(idx, 'location', e.target.value)} onFocus={() => handleFocus(idx)} onBlur={handleBlur} placeholder="Location" style={{ flex:'1 1 auto', minWidth:'100px', fontSize: `${(0.55 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius:'.25rem', padding:'0.2rem', background:'#fff', outline:'none', textAlign:align, boxSizing: 'border-box', color: '#080808' }} />) : (<div style={{ flex:'1 1 auto', minWidth:'100px', fontSize: `${(0.55 + offset).toFixed(3)}rem`, textAlign:align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem', color: '#080808', minHeight: '1.5rem' }} onClick={() => handleFocus(idx)}>{currentItemData.location || 'Location'}</div>))}
            </div>
            {settings.description && (isFocused ? (<textarea ref={el => (refs.current[`desc-${idx}`] = el)} value={currentItemData.description} onChange={e => handleFieldChange(idx, 'description', e.target.value)} onInput={e => { e.target.style.height='auto'; e.target.style.height=`${e.target.scrollHeight}px`; }} onFocus={() => handleFocus(idx)} onBlur={handleBlur} placeholder="e.g. Major in Business with a focus on entrepreneurship" style={{ width:'100%', border: '1px solid #ccc', borderRadius:'.25rem', padding:'0.2rem', marginBottom:'0.75rem', resize:'none', overflow:'hidden', background:'#fff', outline:'none', fontSize: `${(0.6 + offset).toFixed(3)}rem`, textAlign:align, boxSizing: 'border-box', color: '#080808' }} />) : (<div style={{ width:'100%', marginBottom:'0.75rem', fontSize: `${(0.6 + offset).toFixed(3)}rem`, textAlign:align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem', minHeight: '2rem', color: '#080808' }} onClick={() => handleFocus(idx)}>{currentItemData.description || 'e.g. Major in Business with a focus on entrepreneurship'}</div>))}
          </div>
        );
      })}
    </div>
  );
}