import React, { useState, useEffect, useRef } from 'react';

const ALIGNMENTS = ['left', 'center', 'right', 'justify'];
const SETTINGS_OPTIONS = [
  { key: 'name',    label: 'Referee Name' },
  { key: 'title',   label: 'Position / Relationship' },
  { key: 'contact', label: 'Contact Info' },
];

export default function ReferencesSection({
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
        name: item.name || '',
        title: item.title || '',
        contact: item.contact || '',
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
    if (focusIdx !== null) {
      const titleEl = refs.current[`title-${focusIdx}`];
      const nameEl = refs.current[`name-${focusIdx}`];
      const contactEl = refs.current[`contact-${focusIdx}`];

      [titleEl, nameEl, contactEl].forEach(el => {
        if (el && el.tagName === 'TEXTAREA') {
          el.style.height = 'auto';
          el.style.height = `${el.scrollHeight}px`;
        }
      });
    }
  }, [data, focusIdx]);


  useEffect(() => {
    function handleClickOutside(e) {
      if (showAlignOptions     && alignRef.current     && !alignRef.current.contains(e.target)) {
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

  const addEntry = () => {
    const newEntry = {
      name: '',
      title: '',
      contact: '',
      settings: { ...defaultSettings },
      align: defaultAlignment,
    };
    const updated = [...data, newEntry];
    updateData(updated);
    setFocusIdx(updated.length - 1);
    setTimeout(() => {
      refs.current[`name-${updated.length - 1}`]?.focus();
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
    const updatedData = data.map((refItem, idx) =>
      idx === focusIdx
        ? { ...refItem, settings: nextSettings }
        : refItem
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
          ➕ Add Reference
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
          name: item.name || '',
          title: item.title || '',
          contact: item.contact || '',
        };

        return (
          <div
            key={idx} // FIX: Use stable index for the key
            style={{
              position: 'relative',
              backgroundColor: isFocused ? '#f9fafb' : 'transparent',
              padding: isFocused ? '0.5rem' : '0.25rem 0.5rem',
              breakInside: 'avoid',
              WebkitColumnBreakInside: 'avoid',
              pageBreakInside: 'avoid',
              borderRadius: '.375rem',
              border: isFocused ? '1px solid #e5e7eb' : 'none',
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
                    <div style={{ position: 'absolute', top: '-4rem', right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
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

            {settings.name && (
              isFocused ? (
                <textarea
                  id={`name-${idx}`}
                  rows={1}
                  value={currentItemData.name}
                  onChange={e => handleFieldChange(idx, 'name', e.target.value)}
                  onInput={e => { e.target.style.height='auto'; e.target.style.height=`${e.target.scrollHeight}px`; }}
                  onFocus={() => handleFocus(idx)}
                  onBlur={handleBlur}
                  placeholder="Referee Name"
                  className="reference-input"
                  style={{ width: '100%', fontSize: `${(0.8 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.5rem', marginBottom: '0.5rem', background: '#fff', outline: 'none', textAlign: align, resize: 'none', overflow: 'hidden', boxSizing: 'border-box' }}
                  ref={el => (refs.current[`name-${idx}`] = el)}
                />
              ) : (
                <div className="reference-input" style={{ width: '100%', fontSize: `${(0.8 + offset).toFixed(3)}rem`, textAlign: align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', color: currentItemData.name.trim() === '' ? '#a0a0a0' : 'inherit', minHeight: '1.5rem' }} onClick={() => handleFocus(idx)}>
                  {currentItemData.name || 'Referee Name'}
                </div>
              )
            )}

            {settings.title && (
              isFocused ? (
                <textarea
                  id={`title-${idx}`}
                  rows={1}
                  value={currentItemData.title}
                  onChange={e => handleFieldChange(idx, 'title', e.target.value)}
                  onInput={e => { e.target.style.height='auto'; e.target.style.height=`${e.target.scrollHeight}px`; }}
                  onFocus={() => handleFocus(idx)}
                  onBlur={handleBlur}
                  placeholder="Position / Relationship"
                  className="reference-input"
                  style={{ width: '100%', fontSize: `${(0.675 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.5rem', marginBottom: '0.5rem', background: '#fff', outline: 'none', textAlign: align, resize: 'none', overflow: 'hidden', boxSizing: 'border-box', color: '#080808' }}
                  ref={el => (refs.current[`title-${idx}`] = el)}
                />
              ) : (
                <div className="reference-input" style={{ width: '100%', fontSize: `${(0.675 + offset).toFixed(3)}rem`, textAlign: align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', color: currentItemData.title.trim() === '' ? '#a0a0a0' : '#080808', minHeight: '1.5rem' }} onClick={() => handleFocus(idx)}>
                  {currentItemData.title || 'Position / Relationship'}
                </div>
              )
            )}

            {settings.contact && (
              isFocused ? (
                <textarea
                  value={currentItemData.contact}
                  onChange={e => handleFieldChange(idx, 'contact', e.target.value)}
                  onInput={e => { e.target.style.height='auto'; e.target.style.height=`${e.target.scrollHeight}px`; }}
                  onFocus={() => handleFocus(idx)}
                  onBlur={handleBlur}
                  placeholder="Email or Phone"
                  className="reference-input"
                  style={{ width: '100%', fontSize: `${(0.6 + offset).toFixed(3)}rem`, color: '#080808', border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.5rem', marginBottom: '0.5rem', background: '#fff', outline: 'none', textAlign: align, resize: 'none', overflow: 'hidden', boxSizing: 'border-box' }}
                  ref={el => (refs.current[`contact-${idx}`] = el)}
                />
              ) : (
                <div className="reference-input" style={{ width: '100%', fontSize: `${(0.6 + offset).toFixed(3)}rem`, color: currentItemData.contact.trim() === '' ? '#a0a0a0' : '#080808', textAlign: align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', minHeight: '1.5rem' }} onClick={() => handleFocus(idx)}>
                  {currentItemData.contact || 'Email or Phone'}
                </div>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}