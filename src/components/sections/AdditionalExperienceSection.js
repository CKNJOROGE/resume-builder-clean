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
  { key: 'title',       label: 'Job Title' },
  { key: 'company',     label: 'Company Name' },
  { key: 'dates',       label: 'Time Period' },
  { key: 'location',    label: 'Location' },
  { key: 'description', label: 'Description' },
  { key: 'bullets',     label: 'Bullet Points' },
];

export default function AdditionalExperienceSection({
  data = [],
  onEdit,
  itemsToRender, // Added itemsToRender prop
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
  const inputRefs = useRef({});
  const alignRef = useRef(null);
  const settingsRef = useRef(null);
  const blurTimeout = useRef(null);
  const [localStartDate, setLocalStartDate] = useState(null);
  const [localEndDate, setLocalEndDate] = useState(null);
  const [localIsPresent, setLocalIsPresent] = useState(false);

  const defaultSettings  = SETTINGS_OPTIONS.reduce((acc, { key }) => ({ ...acc, [key]: true }), {});
  const defaultAlignment = 'left';

  useEffect(() => {
    const newSettingsMap = {};
    const newAlignMap    = {};
    data.forEach((item, i) => {
      newSettingsMap[i] = item.settings  || { ...defaultSettings };
      newAlignMap[i]    = item.alignment || defaultAlignment;
    });

    if (JSON.stringify(newSettingsMap) !== JSON.stringify(settingsByIndex)) {
      setSettingsByIndex(newSettingsMap);
    }
    if (JSON.stringify(newAlignMap) !== JSON.stringify(alignByIndex)) {
      setAlignByIndex(newAlignMap);
    }
  }, [data]);

  useEffect(() => {
    if (focusIdx !== null) {
      const elementsToResize = [
        inputRefs.current[`title-${focusIdx}`],
        inputRefs.current[`company-${focusIdx}`],
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
      if (focusIdx !== null) {
        const entryDiv = document.querySelector(`[data-entry-idx="${focusIdx}"]`);
        const clickedOnToolbar = e.target.closest('[data-toolbar="true"]');

        if (
            entryDiv && !entryDiv.contains(e.target) &&
            !clickedOnToolbar
        ) {
            setFocusIdx(null);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAlignOptions, showSettingsOptions, focusIdx]);


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
    let startDateObj = null;
    let endDateObj = null;
    let isPresent = false;

    if (dateString) {
      const parts = dateString.split(' - ');
      if (parts.length === 2) {
        const startParts = parts[0].trim().split('/');
        if (startParts.length === 2) {
            const month = parseInt(startParts[0], 10) - 1;
            const year = parseInt(startParts[1], 10);
            if (!isNaN(month) && !isNaN(year)) startDateObj = new Date(year, month, 1);
        } else if (startParts.length === 1 && startParts[0].length === 4) {
            const year = parseInt(startParts[0], 10);
            if (!isNaN(year)) startDateObj = new Date(year, 0, 1);
        }

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
      } else if (parts.length === 1) {
        const singleParts = parts[0].trim().split('/');
        if (singleParts.length === 2) {
            const month = parseInt(singleParts[0], 10) - 1;
            const year = parseInt(singleParts[1], 10);
            if (!isNaN(month) && !isNaN(year)) startDateObj = new Date(year, month, 1);
        } else if (singleParts.length === 1 && singleParts[0].length === 4) {
            const year = parseInt(singleParts[0], 10);
            if (!isNaN(year)) startDateObj = new Date(year, 0, 1);
        }
      }
    }
    return { startDateObj, endDateObj, isPresent };
  };

  const formatDatesForStorage = (startDateObj, endDateObj, isPresent) => {
    let startDisplay = '';
    if (startDateObj instanceof Date && !isNaN(startDateObj)) {
      startDisplay = `${(startDateObj.getMonth() + 1).toString().padStart(2, '0')}/${startDateObj.getFullYear()}`;
    }

    let endDisplay = '';
    if (isPresent) {
      endDisplay = 'Present';
    } else if (endDateObj instanceof Date && !isNaN(endDateObj)) {
      endDisplay = `${(endDateObj.getMonth() + 1).toString().padStart(2, '0')}/${endDateObj.getFullYear()}`;
    }

    if (startDisplay && endDisplay) {
      return `${startDisplay} - ${endDisplay}`;
    } else if (startDisplay) {
      return startDisplay;
    }
    return '';
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
    const updated = [
      ...data,
      { title: '', company: '', location: '', dates: '', description: '', bullets: [''], settings: { ...defaultSettings }, alignment: defaultAlignment },
    ];
    updateData(updated);
    setFocusIdx(updated.length - 1);
    setTimeout(() => {
      inputRefs.current[`title-${updated.length - 1}`]?.focus();
    }, 0);
  };

  const removeEntry = idx => {
    const updated = [...data];
    updated.splice(idx, 1);
    updateData(updated);
    setFocusIdx(null);
  };

  const addBulletAt = (idx, bIdx) => {
    const updated = [...data];
    updated[idx].bullets.splice(bIdx + 1, 0, '');
    updateData(updated);
    setTimeout(() => {
      inputRefs.current[`bullet-${idx}-${bIdx + 1}`]?.focus();
    }, 0);
  };

  const removeBullet = (idx, bIdx) => {
    const updated = [...data];
    if (updated[idx].bullets.length === 1 && updated[idx].bullets[0].trim() === '') {
      removeEntry(idx);
    } else {
      updated[idx].bullets.splice(bIdx, 1);
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
    const curr         = settingsByIndex[focusIdx] || defaultSettings;
    const nextSettings = { ...curr, [key]: !curr[key] };
    const updated = data.map((item, idx) =>
      idx === focusIdx
        ? { ...item, settings: nextSettings }
        : item
    );
    updateData(updated);
    setSettingsByIndex(prev => ({
      ...prev,
      [focusIdx]: nextSettings
    }));
  }

  const handleFocus = (idx) => {
    clearTimeout(blurTimeout.current);
    setFocusIdx(idx);
  };

  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => setFocusIdx(null), 150);
  };
  
  // FIX: Determine indices to render from itemsToRender (if provided) or data
  const renderIndices = itemsToRender && itemsToRender.length > 0 ? itemsToRender : data.map((_, i) => i);

  return (
    <div style={{ position: 'relative' }} onMouseDown={e => e.stopPropagation()}>
      {/* FIX: Removed H2 title and HR */}

      {!itemsToRender && data.length === 0 && (
        <button
          onClick={addEntry}
          style={{
            fontSize: '0.875rem',
            color: '#2563EB',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          ➕ Entry
        </button>
      )}

      {/* FIX: Map over the stable renderIndices array */}
      {renderIndices.map((idx) => {
        if (idx >= data.length) return null; // Safeguard
        
        // FIX: Access the item data using the stable index
        const item = data[idx];
        const isFocused = focusIdx === idx;
        const settings  = settingsByIndex[idx] || defaultSettings;
        const align     = alignByIndex[idx]    || defaultAlignment;

        return (
          <div
            key={idx} // FIX: Use stable index for the key
            data-entry-idx={idx}
            onClick={isFocused ? undefined : () => handleFocus(idx)}
            style={{
              position: 'relative',
              padding:    isFocused ? '0.25rem' : '0.25rem 0.25rem',
              backgroundColor: isFocused ? '#f9fafb' : 'transparent',
              borderRadius: '.375rem',
              border: isFocused ? '1px solid #e5e7eb' : 'none',
              ...sectionStyle,
            }}
            onMouseDown={e => e.stopPropagation()}
          >
            {isFocused && (
              <div
                data-toolbar="true"
                style={{
                  fontSize: '1rem',
                  position: 'absolute',
                  top: '-3rem',
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
                }}
                onMouseDown={e => e.preventDefault()}
              >
                <button style={{ backgroundColor: '#23ad17', color: '#ffffff', border: '0.1px solid #ddd', padding: '4px', borderTopLeftRadius: '.4rem', borderBottomLeftRadius: '.4rem' }} onClick={addEntry}>+ Entry</button>
                <button onClick={() => handleMoveEntryUp(idx)} disabled={idx === 0} style={{ opacity: idx === 0 ? 0.5 : 1, cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>⬆️</button>
                <button onClick={() => handleMoveEntryDown(idx)} disabled={idx === data.length - 1} style={{ opacity: idx === data.length - 1 ? 0.5 : 1, cursor: idx === data.length - 1 ? 'not-allowed' : 'pointer' }}>⬇️</button>
                <div ref={alignRef} style={{ position: 'relative' }}>
                  <button  onClick={handleAlignClick}>T</button>
                  {showAlignOptions && (
                    <div style={{ position: 'absolute', top: '-4rem', right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', zIndex: 11 }}>
                      {ALIGNMENTS.map(a => (
                        <div key={a} style={{ padding: '0.25rem .5rem', cursor: 'pointer' }} onClick={() => handleSelectAlign(a)}>{a}</div>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => removeEntry(idx)} style={{ color: '#dc2626' }}>🗑️</button>
                <div ref={settingsRef} style={{ position: 'relative' }}>
                  <button onClick={() => setShowSettingsOptions(s => !s)}>⚙️</button>
                  {showSettingsOptions && (
                    <div style={{ position: 'absolute', top: '-4rem', right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '0.5rem', width: '220px', zIndex: 11 }}>
                      {SETTINGS_OPTIONS.map(({ key, label }) => (
                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.25rem 0' }}>
                          <span style={{ fontSize: '0.875rem' }}>{label}</span>
                          <input type="checkbox" checked={settings[key]} onChange={() => toggleSetting(key)} style={{ cursor: 'pointer', width: '1.25rem', height: '1.25rem' }}/>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => setFocusIdx(null)} style={{ marginLeft:'auto' }}>×</button>
              </div>
            )}
            <div style={{ breakInside: 'avoid', WebkitColumnBreakInside: 'avoid', pageBreakInside: 'avoid' }}>
              {settings.title && (
                isFocused ? (
                  <textarea id={`title-${idx}`} rows={1} value={item.title} onChange={e => handleFieldChange(idx, 'title', e.target.value)} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} onFocus={() => handleFocus(idx)} onBlur={handleBlur} placeholder="Job Title" style={{ width: '100%', fontSize: `${(0.8 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.2rem', marginBottom: '0.5rem', background: '#fff', outline: 'none', textAlign: align, resize: 'none', overflow: 'hidden', whiteSpace: 'pre-wrap', wordBreak: 'break-word', boxSizing: 'border-box', color: design.titleColor }} ref={el => (inputRefs.current[`title-${idx}`] = el)} onClick={e => e.stopPropagation()} />
                ) : (
                  <div style={{ width: '100%', fontSize: `${(0.8 + offset).toFixed(3)}rem`, textAlign: align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem', minHeight: '1.5rem', color: design.titleColor }} onClick={() => handleFocus(idx)}>
                    {item.title || 'Job Title'}
                  </div>
                )
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.25rem' }}>
                {settings.company && (
                  isFocused ? (
                    <textarea id={`company-${idx}`} rows={1} value={item.company} onChange={e => handleFieldChange(idx, 'company', e.target.value)} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} onFocus={() => handleFocus(idx)} onBlur={handleBlur} placeholder="Company Name" style={{ flex: '1 1 auto', minWidth: '120px', fontSize: `${(0.675 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.2rem', background: '#fff', outline: 'none', textAlign: align, resize: 'none', overflow: 'hidden', whiteSpace: 'pre-wrap', wordBreak: 'break-word', boxSizing: 'border-box' }} ref={el => (inputRefs.current[`company-${idx}`] = el)} onClick={e => e.stopPropagation()} />
                  ) : (
                    <div style={{ flex: '1 1 auto', minWidth: '120px', fontSize: `${(0.675 + offset).toFixed(3)}rem`, textAlign: align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem', minHeight: '1.5rem', color: (item.company || '').trim() === '' ? '#a0a0a0' : 'inherit' }} onClick={() => handleFocus(idx)}>
                      {item.company || 'Company Name'}
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
                    <div style={{ color: '#080808', flex:'1 1 auto', minWidth:'100px', fontSize: `${(0.55 + offset).toFixed(3)}rem`, textAlign:align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem', minHeight: '1.5rem', color: (item.dates || '').trim() === '' ? '#a0a0a0' : 'inherit' }} onClick={() => handleFocus(idx)}>
                      {item.dates || 'e.g. MM/YYYY - Present'}
                    </div>
                  )
                )}
                {settings.location && (
                  isFocused ? (
                    <textarea id={`location-${idx}`} rows={1} value={item.location} onChange={e => handleFieldChange(idx, 'location', e.target.value)} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} onFocus={() => handleFocus(idx)} onBlur={handleBlur} placeholder="Location" style={{ flex: '1 1 auto', minWidth: '100px', fontSize: `${(0.55 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.2rem', background: '#fff', outline: 'none', textAlign: align, resize: 'none', overflow: 'hidden', whiteSpace: 'pre-wrap', wordBreak: 'break-word', boxSizing: 'border-box', color: '#080808' }} ref={el => (inputRefs.current[`location-${idx}`] = el)} onClick={e => e.stopPropagation()} />
                  ) : (
                    <div style={{ color: '#080808', flex:'1 1 auto', minWidth:'100px', fontSize: `${(0.55 + offset).toFixed(3)}rem`, textAlign:align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem', minHeight: '1.5rem', color: (item.location || '').trim() === '' ? '#a0a0a0' : '#080808' }} onClick={() => handleFocus(idx)}>
                      {item.location || 'Location'}
                    </div>
                  )
                )}
              </div>
            </div>
            {settings.description && (
              isFocused ? (
                <textarea id={`description-${idx}`} ref={el => (inputRefs.current[`description-${idx}`] = el)} value={item.description} onChange={e => handleFieldChange(idx, 'description', e.target.value)} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} onFocus={() => handleFocus(idx)} onBlur={handleBlur} placeholder="Brief company/role summary..." style={{ width: '100%', border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.2rem', marginBottom: '0.75rem', resize: 'none', overflow: 'hidden', background: '#fff', outline: 'none', fontSize: `${(0.6 + offset).toFixed(3)}rem`, textAlign: align, whiteSpace: 'pre-wrap', wordBreak: 'break-word', boxSizing: 'border-box', color: '#080808' }} onClick={e => e.stopPropagation()} />
              ) : (
                <div style={{ width: '100%', marginBottom: '0.75rem', fontSize: `${(0.6 + offset).toFixed(3)}rem`, textAlign: align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem', minHeight: '2rem', color: (item.description || '').trim() === '' ? '#a0a0a0' : '#080808' }} onClick={() => handleFocus(idx)}>
                  {item.description || 'Brief company/role summary...'}
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
                        <textarea id={`bullet-${idx}-${bIdx}`} rows={1} ref={el => (inputRefs.current[`bullet-${idx}-${bIdx}`] = el)} value={bullet} onChange={e => handleBulletChange(idx, bIdx, e.target.value)} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const currentBulletText = e.target.value; const cursorPosition = e.target.selectionStart; const textBeforeCursor = currentBulletText.substring(0, cursorPosition); const textAfterCursor = currentBulletText.substring(cursorPosition); handleBulletChange(idx, bIdx, textBeforeCursor); addBulletAt(idx, bIdx, textAfterCursor); } }} onFocus={() => handleFocus(idx)} onBlur={handleBlur} placeholder="Bullet point..." style={{ flex: '1 1 auto', border: 'none', borderBottom: '1px solid #ccc', background: '#fff', outline: 'none', fontSize: `${(0.6 + offset).toFixed(3)}rem`, resize: 'none', overflow: 'hidden', textAlign: align, whiteSpace: 'pre-wrap', wordBreak: 'break-word', boxSizing: 'border-box', padding: '0.25rem', color: '#080808' }} onClick={e => e.stopPropagation()} />
                      ) : (
                        <div style={{ flex: '1 1 auto', fontSize: `${(0.6 + offset).toFixed(3)}rem`, textAlign: align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', minHeight: '1.5rem', color: '#080808',  }} onClick={() => handleFocus(idx)}>
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
                    <button onClick={() => addBulletAt(idx, item.bullets.length -1)} style={{ fontSize: '0.875rem', color: '#2563EB', background: 'transparent', border: 'none', cursor: 'pointer', marginTop: '0.5rem', marginLeft: '-0.75rem' }}>➕ Bullet</button>
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