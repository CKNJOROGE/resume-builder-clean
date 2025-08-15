import React, { useState, useEffect, useRef } from 'react';

const ALIGNMENTS = ['left', 'center', 'right', 'justify'];
const SETTINGS_OPTIONS = [
  { key: 'title',       label: 'Project Title' },
  { key: 'description', label: 'Description' },
  { key: 'link',        label: 'Project URL' },
];

export default function ProjectsSection({
  data = [],
  onEdit,
  itemsToRender,
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
  
  const refs = useRef({});
  const alignRef = useRef(null);
  const settingsRef = useRef(null);
  const popupRef = useRef(null);
  const blurTimeout = useRef(null);

  const defaultSettings  = SETTINGS_OPTIONS.reduce((acc, { key }) => ({ ...acc, [key]: true }), {});
  const defaultAlignment = 'left';

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
    function handleClickOutside(e) {
      if (showAlignOptions && alignRef.current && !alignRef.current.contains(e.target)) setShowAlignOptions(false);
      if (showSettingsOptions && settingsRef.current && !settingsRef.current.contains(e.target)) setShowSettingsOptions(false);
      if (focusIdx != null && popupRef.current && !popupRef.current.contains(e.target)) {
        const isInputField = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        if (!isInputField) setFocusIdx(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAlignOptions, showSettingsOptions, focusIdx]);

  useEffect(() => {
    return () => clearTimeout(blurTimeout.current);
  }, []);

  const handleFieldChange = (idx, key, val) => {
    const updated = data.map((item, i) => i === idx ? { ...item, [key]: val } : item);
    onEdit(updated);
  };

  const handleFocus = (idx) => {
    clearTimeout(blurTimeout.current);
    setFocusIdx(idx);
  };

  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => setFocusIdx(null), 150);
  };

  const addEntry = () => {
    const newEntry = { title: '', description: '', link: '', settings: { ...defaultSettings }, align: defaultAlignment };
    const updated = [...data, newEntry];
    onEdit(updated);
    setFocusIdx(updated.length - 1);
    setTimeout(() => { refs.current[`title-${updated.length - 1}`]?.focus(); }, 0);
  };

  const removeEntry = idx => {
    const updated = data.filter((_, i) => i !== idx);
    onEdit(updated);
    setFocusIdx(null);
  };

  const handleMoveEntryUp = (idx) => {
    if (idx > 0) {
      const updated = [...data];
      [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
      onEdit(updated);
      setFocusIdx(idx - 1);
    }
  };

  const handleMoveEntryDown = (idx) => {
    if (idx < data.length - 1) {
      const updated = [...data];
      [updated[idx + 1], updated[idx]] = [updated[idx], updated[idx + 1]];
      onEdit(updated);
      setFocusIdx(idx + 1);
    }
  };

  const handleAlignClick = () => setShowAlignOptions(s => !s);

  const handleSelectAlign = a => {
    if (focusIdx != null) {
      const updatedData = data.map((item, index) => index === focusIdx ? { ...item, align: a } : item);
      onEdit(updatedData);
    }
    setShowAlignOptions(false);
    onChangeAlignment?.(a);
  };

  const toggleSetting = key => {
    if (focusIdx == null) return;
    const currentSettings = data[focusIdx].settings || defaultSettings;
    const nextSettings = { ...currentSettings, [key]: !currentSettings[key] };
    const updatedData = data.map((proj, idx) => idx === focusIdx ? { ...proj, settings: nextSettings } : proj);
    onEdit(updatedData);
  };
  
  // FIX: Determine indices to render from itemsToRender (if provided) or data
  const renderIndices = itemsToRender && itemsToRender.length > 0 ? itemsToRender : data.map((_, i) => i);

  return (
    <div onMouseDown={e => e.stopPropagation()}>
      {!itemsToRender && data.length === 0 && (
        <button onClick={addEntry} style={{ fontSize: '0.875rem', color: '#2563EB', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '1rem' }}>
          ➕ Add Project
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
          description: item.description || '',
          link: item.link || '',
        };

        return (
          <div key={idx} style={{ position: 'relative', backgroundColor: isFocused ? '#f9fafb' : 'transparent', padding: isFocused ? '0.5rem' : '0.25rem 0.5rem', breakInside: 'avoid', WebkitColumnBreakInside: 'avoid', pageBreakInside: 'avoid', borderRadius: '.375rem', border: isFocused ? '1px solid #e5e7eb' : 'none', ...sectionStyle }} onClick={isFocused ? undefined : () => handleFocus(idx)}>
            {isFocused && (
              <div ref={popupRef} onMouseDown={e => e.preventDefault()} style={{ fontSize: '1rem', position: 'absolute', top: '-3rem', right: 0, display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#fff', border: '1px solid #ddd', borderRadius: '.25rem', padding: '.25rem .5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', zIndex: 10 }}>
                <button onClick={addEntry}>+ Entry</button>
                <button onClick={() => handleMoveEntryUp(idx)} disabled={idx === 0} style={{ opacity: idx === 0 ? 0.5 : 1, cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>⬆️</button>
                <button onClick={() => handleMoveEntryDown(idx)} disabled={idx === data.length - 1} style={{ opacity: idx === data.length - 1 ? 0.5 : 1, cursor: idx === data.length - 1 ? 'not-allowed' : 'pointer' }}>⬇️</button>
                <div ref={alignRef} style={{ position: 'relative' }}><button onClick={handleAlignClick}>T</button>{showAlignOptions && (<div style={{ position: 'absolute', top: '-4rem', right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', zIndex: 11 }}>{ALIGNMENTS.map(a => (<div key={a} style={{ padding: '0.25rem .5rem', cursor: 'pointer' }} onClick={() => handleSelectAlign(a)}>{a}</div>))}</div>)}</div>
                <button onClick={() => removeEntry(idx)} style={{ color: '#dc2626' }}>🗑️</button>
                <div ref={settingsRef} style={{ position: 'relative' }}><button onClick={() => setShowSettingsOptions(s => !s)}>⚙️</button>{showSettingsOptions && (<div style={{ position: 'absolute', top: '-4rem', right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '0.5rem', width: '200px', zIndex: 11 }}>{SETTINGS_OPTIONS.map(({ key, label }) => (<div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.25rem 0' }}><span style={{ fontSize: '0.875rem' }}>{label}</span><input type="checkbox" checked={settings[key]} onChange={() => toggleSetting(key)} style={{ cursor: 'pointer', width: '1.25rem', height: '1.25rem' }} /></div>))}</div>)}</div>
              </div>
            )}
            {settings.title && (isFocused ? (<input id={`title-${idx}`} type="text" value={currentItemData.title} onChange={e => handleFieldChange(idx, 'title', e.target.value)} onFocus={() => handleFocus(idx)} onBlur={handleBlur} placeholder="Project Title" className="project-input" style={{ width: '100%', fontSize: `${(0.8 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.2rem', background: '#fff', outline: 'none', textAlign: align, boxSizing: 'border-box', color: design.titleColor, }} ref={el => (refs.current[`title-${idx}`] = el)} />) : (<div className="project-input" style={{ width: '100%', fontSize: `${(0.8 + offset).toFixed(3)}rem`, textAlign: align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem', color: currentItemData.title.trim() === '' ? '#a0a0a0' : design.titleColor, minHeight: '1.5rem', }} onClick={() => handleFocus(idx)}>{currentItemData.title || 'Project Title'}</div>))}
            {settings.description && (isFocused ? (<textarea ref={el => (refs.current[`desc-${idx}`] = el)} value={currentItemData.description} onChange={e => handleFieldChange(idx, 'description', e.target.value)} onInput={e => { e.target.style.height='auto'; e.target.style.height=`${e.target.scrollHeight}px`; }} onFocus={() => handleFocus(idx)} onBlur={handleBlur} placeholder="Description" className="project-input" style={{ width:'100%', border: '1px solid #ccc', borderRadius:'.25rem', padding:'0.2rem', resize:'none', overflow:'hidden', background:'#fff', outline:'none', fontSize: `${(0.6 + offset).toFixed(3)}rem`, textAlign:align, boxSizing: 'border-box', color: '#080808' }} />) : (<div className="project-input" style={{ width:'100%', fontSize: `${(0.6 + offset).toFixed(3)}rem`, textAlign:align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem', minHeight: '2rem', color: currentItemData.description.trim() === '' ? '#a0a0a0' : 'inherit' }} onClick={() => handleFocus(idx)}>{currentItemData.description || 'Description'}</div>))}
            {settings.link && (isFocused ? (<input type="text" value={currentItemData.link} onChange={e => handleFieldChange(idx, 'link', e.target.value)} onFocus={() => handleFocus(idx)} onBlur={handleBlur} placeholder="Project URL (optional)" className="project-input" style={{ width:'100%', fontSize: `${(0.55 + offset).toFixed(3)}rem`, color:'#2563EB', border: '1px solid #ccc', borderRadius:'.25rem', padding:'0.2rem', background:'#fff', outline:'none', textAlign:align, boxSizing: 'border-box' }} />) : (<div className="project-input" style={{ width:'100%', fontSize: `${(0.55 + offset).toFixed(3)}rem`, color: (currentItemData.link || '').trim() === '' ? '#a0a0a0' : '#2563EB', textAlign:align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem', minHeight: '1.5rem', textDecoration: currentItemData.link.trim() ? 'underline' : 'none' }} onClick={() => handleFocus(idx)}>{currentItemData.link || 'Project URL (optional)'}</div>))}
          </div>
        );
      })}
    </div>
  );
}