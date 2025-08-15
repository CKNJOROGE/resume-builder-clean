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
  { key: 'title',    label: 'Course Title' },
  { key: 'provider', label: 'Provider / Institution' },
  { key: 'date',     label: 'Completion Date' },
];

export default function CoursesSection({
  data = [],
  onEdit,
  itemsToRender, // Added itemsToRender prop
  onChangeAlignment,
  sectionStyle = {},
  headingStyle = {},
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

  const refs = useRef({});
  const alignRef = useRef(null);
  const settingsRef = useRef(null);
  const blurTimeout = useRef(null);
  const popupRef = useRef(null);

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
  }, [data, defaultSettings, defaultAlignment, settingsByIndex, alignByIndex]);

  useEffect(() => {
    if (focusIdx !== null) {
      const titleEl = refs.current[`title-${focusIdx}`];
      const providerEl = refs.current[`provider-${focusIdx}`];

      [titleEl, providerEl].forEach(el => {
        if (el && el.tagName === 'TEXTAREA') {
          el.style.height = 'auto';
          el.style.height = `${el.scrollHeight}px`;
        }
      });
    }
  }, [data, focusIdx]);

  useEffect(() => {
    if (focusIdx !== null && data[focusIdx]) {
      const { startDateObj, endDateObj } = parseDatesForPicker(data[focusIdx].date);
      setLocalStartDate(startDateObj);
      setLocalEndDate(endDateObj);
    } else {
      setLocalStartDate(null);
      setLocalEndDate(null);
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
      if (
        focusIdx != null &&
        popupRef.current &&
        !popupRef.current.contains(e.target)
      ) {
        const isInputField = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        if (!isInputField) {
          setFocusIdx(null);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAlignOptions, showSettingsOptions, focusIdx]);

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
    let startDateObj = null;
    let endDateObj = null;

    if (dateString) {
      const parts = dateString.split(' - ');
      if (parts.length === 2) {
        const startParts = parts[0].trim().split('/');
        const endParts = parts[1].trim().split('/');

        if (startParts.length === 2) {
          const month = parseInt(startParts[0], 10) - 1;
          const year = parseInt(startParts[1], 10);
          if (!isNaN(month) && !isNaN(year)) startDateObj = new Date(year, month, 1);
        }
        if (endParts.length === 2) {
          const month = parseInt(endParts[0], 10) - 1;
          const year = parseInt(endParts[1], 10);
          if (!isNaN(month) && !isNaN(year)) endDateObj = new Date(year, month, 1);
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
    return { startDateObj, endDateObj };
  };

  const formatDateForStorage = (startDateObj, endDateObj) => {
    let startDisplay = '';
    if (startDateObj instanceof Date && !isNaN(startDateObj)) {
      startDisplay = `${(startDateObj.getMonth() + 1).toString().padStart(2, '0')}/${startDateObj.getFullYear()}`;
    }

    let endDisplay = '';
    if (endDateObj instanceof Date && !isNaN(endDateObj)) {
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

    const formattedDateString = formatDateForStorage(start, end);
    handleFieldChange(focusIdx, 'date', formattedDateString);
  };

  const addEntry = () => {
    const newEntry = {
      title: '',
      provider: '',
      date: '',
      settings: { ...defaultSettings },
      align: defaultAlignment,
    };
    const updated = [...data, newEntry];
    updateData(updated);
    setFocusIdx(updated.length - 1);
    setTimeout(() => {
      refs.current[`title-${updated.length - 1}`]?.focus();
    }, 0);
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

  const handleAlignClick   = () => setShowAlignOptions(s => !s);
  const handleSelectAlign  = a => {
    if (focusIdx != null) {
      const updatedData = data.map((item, index) =>
        index === focusIdx ? { ...item, align: a } : item
      );
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
    const updatedData = data.map((course, idx) =>
      idx === focusIdx
        ? { ...course, settings: nextSettings }
        : course
    );
    onEdit(updatedData);
    setSettingsByIndex(prev => ({
      ...prev,
      [focusIdx]: nextSettings
    }));
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
          ➕ Add Course
        </button>
      )}

      {/* FIX: Map over the stable renderIndices array */}
      {renderIndices.map((idx) => {
        if (idx >= data.length) return null; // Safeguard

        // FIX: Access the item data using the stable index
        const item = data[idx];
        const isFocused = focusIdx === idx;
        const settings  = item.settings || defaultSettings;
        const align     = item.align    || defaultAlignment;

        const currentItemData = {
          title: item.title || '',
          provider: item.provider || '',
          date: item.date || '',
        };

        return (
          <div
            key={idx} // FIX: Use stable index for the key
            style={{
              position: 'relative',
              backgroundColor: isFocused ? '#f9fafb' : 'transparent',
              padding: isFocused ? '0.5rem' : '0.25rem 0.5rem',
              borderRadius: '.375rem',
              border: isFocused ? '1px solid #e5e7eb' : 'none',
              breakInside: 'avoid',
              WebkitColumnBreakInside: 'avoid',
              pageBreakInside: 'avoid',
              ...sectionStyle
            }}
            onClick={isFocused ? undefined : () => handleFocus(idx)}
          >
            {isFocused && (
              <div
                ref={popupRef}
                onMouseDown={e => e.preventDefault()}
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
                  zIndex: 10
                }}
              >
                <button style={{ backgroundColor: '#23ad17', color: '#ffffff', border: '0.1px solid #ddd', padding: '4px', borderTopLeftRadius: '.4rem', borderBottomLeftRadius: '.4rem' }} onClick={addEntry}>+ Entry</button>
                <button onClick={() => handleMoveEntryUp(idx)} disabled={idx === 0} style={{ opacity: idx === 0 ? 0.5 : 1, cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>⬆️</button>
                <button onClick={() => handleMoveEntryDown(idx)} disabled={idx === data.length - 1} style={{ opacity: idx === data.length - 1 ? 0.5 : 1, cursor: idx === data.length - 1 ? 'not-allowed' : 'pointer' }}>⬇️</button>
                <div ref={alignRef} style={{ position: 'relative' }}>
                  <button style={{ color: '#080808', fontSize: '' }} onClick={handleAlignClick}>T</button>
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
                    <div style={{ position: 'absolute', top: '-4rem', right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '0.5rem', width: '200px', zIndex: 11 }}>
                      {SETTINGS_OPTIONS.map(({ key, label }) => (
                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.25rem 0' }}>
                          <span style={{ fontSize: '0.875rem' }}>{label}</span>
                          <input type="checkbox" checked={settings[key]} onChange={() => toggleSetting(key)} style={{ cursor: 'pointer', width: '1.25rem', height: '1.25rem' }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {settings.title && (
              isFocused ? (
                <input
                  id={`title-${idx}`}
                  type="text"
                  value={currentItemData.title}
                  onChange={e => handleFieldChange(idx, 'title', e.target.value)}
                  onFocus={() => handleFocus(idx)}
                  onBlur={handleBlur}
                  placeholder="Course Title"
                  className="course-input"
                  style={{ width: '100%', fontSize: `${(0.8 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.2rem', marginBottom: '0.5rem', background: '#fff', outline: 'none', textAlign: align, boxSizing: 'border-box' }}
                  ref={el => (refs.current[`title-${idx}`] = el)}
                />
              ) : (
                <div className="course-input" style={{ width: '100%', fontSize: `${(0.8 + offset).toFixed(3)}rem`, textAlign: align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem', color: currentItemData.title.trim() === '' ? '#a0a0a0' : 'inherit', minHeight: '1.5rem' }} onClick={() => handleFocus(idx)}>
                  {currentItemData.title || 'Course Title'}
                </div>
              )
            )}
            {settings.provider && (
              isFocused ? (
                <input
                  type="text"
                  value={currentItemData.provider}
                  onChange={e => handleFieldChange(idx, 'provider', e.target.value)}
                  onFocus={() => handleFocus(idx)}
                  onBlur={handleBlur}
                  placeholder="Provider / Institution"
                  className="course-input"
                  style={{ width: '100%', fontSize: `${(0.675 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.2rem', marginBottom: '0.5rem', background: '#fff', outline: 'none', textAlign: align, boxSizing: 'border-box' }}
                />
              ) : (
                <div className="course-input" style={{ width: '100%', fontSize: `${(0.675 + offset).toFixed(3)}rem`, marginBottom: '0.5rem', textAlign: align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem', color: currentItemData.provider.trim() === '' ? '#a0a0a0' : 'inherit', minHeight: '1.5rem' }} onClick={() => handleFocus(idx)}>
                  {currentItemData.provider || 'Provider / Institution'}
                </div>
              )
            )}
            {settings.date && (
              isFocused ? (
                <DatePicker
                  selectsRange={true}
                  startDate={localStartDate}
                  endDate={localEndDate}
                  onChange={handleDateRangeChange}
                  dateFormat="MM/yyyy"
                  showMonthYearPicker
                  isClearable={true}
                  onFocus={() => handleFocus(idx)}
                  onBlur={handleBlur}
                  placeholderText="MM/YYYY - MM/YYYY (optional)"
                  customInput={
                    <input style={{ width: '100%', fontSize: `${(0.55 + offset).toFixed(3)}rem`, color: '#080808', border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.2rem', marginBottom: '0.5rem', background: '#fff', outline: 'none', textAlign: align, boxSizing: 'border-box', cursor: 'pointer' }}/>
                  }
                />
              ) : (
                <div className="course-input" style={{ width: '100%', fontSize: `${(0.55 + offset).toFixed(3)}rem`, color: currentItemData.date.trim() === '' ? '#a0a0a0' : '#080808', textAlign: align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem', minHeight: '1.5rem' }} onClick={() => handleFocus(idx)}>
                  {currentItemData.date || 'Completion Date (optional)'}
                </div>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}