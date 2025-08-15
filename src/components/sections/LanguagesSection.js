import React, { useState, useEffect, useRef } from 'react';

const MAX_LEVEL = 5;
const ALIGNMENTS = ['left', 'center', 'right', 'justify'];
const SETTINGS_OPTIONS = [
  { key: 'language', label: 'Language' },
  { key: 'level',    label: 'Proficiency' },
  { key: 'rating',   label: 'Rating' },
];

const RATING_LABELS = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
  4: 'Proficient',
  5: 'Native',
};

export default function LanguagesSection({
  data = [],
  onEdit,
  itemsToRender, // Added itemsToRender prop
  onChangeAlignment,
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
  const refs = useRef({});
  const alignRef = useRef(null);
  const settingsRef = useRef(null);
  const blurTimeout = useRef(null);
  const popupRef = useRef(null);

  const defaultSettings  = SETTINGS_OPTIONS.reduce((acc, { key }) => ({ ...acc, [key]: true }), {});
  const defaultAlignment = 'left';

  useEffect(() => {
    const newSettingsMap = {};
    const newAlignMap    = {};

    data.forEach((item, i) => {
      const cleanedItem = {
        language: item.language || '',
        level: item.level || RATING_LABELS[3],
        rating: item.rating !== undefined ? item.rating : 3,
        settings: item.settings || { ...defaultSettings },
        align: item.align || defaultAlignment,
      };
      newSettingsMap[i] = cleanedItem.settings;
      newAlignMap[i] = cleanedItem.align;
    });

    if (JSON.stringify(newSettingsMap) !== JSON.stringify(settingsByIndex)) {
      setSettingsByIndex(newSettingsMap);
    }
    if (JSON.stringify(newAlignMap) !== JSON.stringify(alignByIndex)) {
      setAlignByIndex(newAlignMap);
    }
  }, [data]);


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

  const handleRatingChange = (idx, newRating) => {
    const updated = [...data];
    updated[idx] = {
      ...updated[idx],
      rating: newRating,
      level: RATING_LABELS[newRating]
    };
    updateData(updated);
  };

  const handleFocus = (idx) => {
    clearTimeout(blurTimeout.current);
    setFocusIdx(idx);
  };

  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => setFocusIdx(null), 150);
  };

  const addEntry = () => {
    const newEntry = {
      language: '',
      level: RATING_LABELS[3],
      rating: 3,
      settings: { ...defaultSettings },
      align: defaultAlignment,
    };
    const updated = [...data, newEntry];
    updateData(updated);
    setFocusIdx(updated.length - 1);
    setTimeout(() => {
      refs.current[`language-${updated.length - 1}`]?.focus();
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


  const handleAlignClick = () => setShowAlignOptions(s => !s);
  const handleSelectAlign = a => {
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
    const updatedData = data.map((lang, idx) =>
      idx === focusIdx
        ? { ...lang, settings: nextSettings }
        : lang
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
          ➕ Add Language
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
          language: item.language || '',
          level: item.level || RATING_LABELS[3],
          rating: item.rating !== undefined ? item.rating : 3,
        };

        return (
          <div
            key={idx} // FIX: Use stable index for the key
            style={{
              position: 'relative',
              backgroundColor: isFocused ? '#f9fafb' : 'transparent',
              padding: isFocused ? '0.5rem' : '0.25rem 0.25rem',
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
                  padding: '.25rem .5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  zIndex: 10
                }}
              >
                <button onClick={addEntry}>+ Entry</button>
                <button onClick={() => handleMoveEntryUp(idx)} disabled={idx === 0} style={{ opacity: idx === 0 ? 0.5 : 1, cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>⬆️</button>
                <button onClick={() => handleMoveEntryDown(idx)} disabled={idx === data.length - 1} style={{ opacity: idx === data.length - 1 ? 0.5 : 1, cursor: idx === data.length - 1 ? 'not-allowed' : 'pointer' }}>⬇️</button>
                <div ref={alignRef} style={{ position: 'relative' }}>
                  <button onClick={handleAlignClick}>T</button>
                  {showAlignOptions && (
                    <div style={{ position: 'absolute', top: '-4rem', right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', zIndex: 11 }}>
                      {ALIGNMENTS.map(a => (
                        <div key={a} style={{ padding:'0.25rem .5rem', cursor:'pointer' }} onClick={() => handleSelectAlign(a)}>{a}</div>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => removeEntry(idx)} style={{ color:'#dc2626' }}>🗑️</button>
                <div ref={settingsRef} style={{ position:'relative' }}>
                  <button onClick={() => setShowSettingsOptions(s => !s)}>⚙️</button>
                  {showSettingsOptions && (
                    <div style={{ position: 'absolute', top: '-4rem', right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '0.5rem', width: '200px' }}>
                      {SETTINGS_OPTIONS.map(({ key, label }) => (
                        <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', margin:'0.25rem 0' }}>
                          <span style={{ fontSize:'0.875rem' }}>{label}</span>
                          <input type="checkbox" checked={settings[key]} onChange={() => toggleSetting(key)} style={{ cursor:'pointer', width:'1.25rem', height:'1.25rem' }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div style={{ display:'flex', flexWrap:'wrap', alignItems:'baseline', gap:'0.5rem', marginBottom:'0.5rem' }}>
              {settings.language && (
                isFocused ? (
                  <textarea
                    id={`language-${idx}`}
                    rows={1}
                    value={currentItemData.language}
                    onChange={e => handleFieldChange(idx, 'language', e.target.value)}
                    onInput={e => { e.target.style.height='auto'; e.target.style.height=`${e.target.scrollHeight}px`; }}
                    onFocus={() => handleFocus(idx)}
                    onBlur={handleBlur}
                    placeholder="Language"
                    className="language-input"
                    style={{ flex:'1 1 120px', minWidth:'120px', fontSize: `${(0.75 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius:'.25rem', padding:'0.5rem', background:'#fff', outline:'none', textAlign:align, resize:'none', overflow:'hidden', boxSizing: 'border-box', color: design.titleColor }}
                    ref={el => (refs.current[`language-${idx}`] = el)}
                  />
                ) : (
                  <div className="language-input" style={{ flex:'1 1 120px', minWidth:'120px', fontSize: `${(0.75 + offset).toFixed(3)}rem`, textAlign:align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.25rem', color: currentItemData.language.trim() === '' ? '#a0a0a0' : design.titleColor, minHeight: '1.5rem' }} onClick={() => handleFocus(idx)}>
                    {currentItemData.language || 'Language'}
                  </div>
                )
              )}
              {settings.rating && (
                <div className="language-rating-dots"  style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', fontSize: `${(0.6 + offset).toFixed(3)}rem`,}}>
                  {[...Array(MAX_LEVEL)].map((_, i) => (
                    <span
                      key={i}
                      onMouseDown={e => { e.preventDefault(); handleRatingChange(idx, i + 1); }}
                      title={`Level ${i+1}`}
                      style={{ display: 'inline-block', width: '0.55rem', height: '0.55rem', borderRadius: '9999px', backgroundColor: i < currentItemData.rating ? design.titleColor : '#D1D5DB', cursor: 'pointer' }}
                    />
                  ))}
                </div>
              )}
            </div>
            {settings.level && (
              isFocused ? (
                <input
                  type="text"
                  value={currentItemData.level}
                  readOnly
                  placeholder="Proficiency"
                  className="language-input"
                  style={{ width: '100%', fontSize: `${(0.6 + offset).toFixed(3)}rem`, color: '#080808', border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.25rem', background: '#fff', outline: 'none', textAlign: align, boxSizing: 'border-box' }}
                  onFocus={() => handleFocus(idx)}
                  onBlur={handleBlur}
                />
              ) : (
                <div className="language-input" style={{ width: '100%', fontSize: `${(0.6 + offset).toFixed(3)}rem`, color: currentItemData.level.trim() === '' ? '#a0a0a0' : '#080808', textAlign: align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.25rem', minHeight: '1.5rem' }} onClick={() => handleFocus(idx)}>
                  {currentItemData.level || 'Proficiency'}
                </div>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}