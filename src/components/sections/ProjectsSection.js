import React, { useState, useEffect, useRef } from 'react';

const ALIGNMENTS = ['left', 'center', 'right', 'justify'];
const SETTINGS_OPTIONS = [
    { key: 'title',       label: 'Project Title' },
    { key: 'description', label: 'Description' },
    { key: 'link',        label: 'Project URL' },
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
    
    // NEW STATE FOR FIXED TOOLBAR POSITION
    const [fixedToolbarPosition, setFixedToolbarPosition] = useState(null);

    const refs = useRef({}); // Input/Textarea refs
    const cardRefs = useRef({}); // Card container refs
    const alignRef = useRef(null);
    const settingsRef = useRef(null);
    const popupRef = useRef(null); // Main toolbar ref
    const blurTimeout = useRef(null);

    const defaultSettings  = SETTINGS_OPTIONS.reduce((acc, { key }) => ({ ...acc, [key]: true }), {});
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
        if (focusIdx !== null) {
            const descEl = refs.current[`desc-${focusIdx}`];
            if (descEl) {
                descEl.style.height = 'auto';
                descEl.style.height = `${descEl.scrollHeight}px`;
            }
            // Update position after content resize
            calculateFixedPosition(focusIdx);
        }
    }, [data, focusIdx]);

    // UPDATED: Handle click outside logic for fixed toolbar and popups
    useEffect(() => {
        function handleClickOutside(e) {
            if (focusIdx == null) return;

            const card = cardRefs.current[focusIdx];
            const clickedInsideCard = card && card.contains(e.target);
            const clickedInsideToolbar = popupRef.current && popupRef.current.contains(e.target);

            // Close sub-popups first if click is outside them but inside the main toolbar
            if (showAlignOptions && alignRef.current && !alignRef.current.contains(e.target)) setShowAlignOptions(false);
            if (showSettingsOptions && settingsRef.current && !settingsRef.current.contains(e.target)) setShowSettingsOptions(false);
            
            // If click is outside the card AND the entire fixed toolbar/popup group
            if (!clickedInsideCard && !clickedInsideToolbar) {
                const isInputField = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
                if (!isInputField) {
                    setFocusIdx(null);
                    setFixedToolbarPosition(null);
                    setShowAlignOptions(false);
                    setShowSettingsOptions(false);
                }
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
             // Let handleClickOutside manage the final state change
        }, 150);
    };

    const addEntry = () => {
        const newEntry = { title: '', description: '', link: '', settings: { ...defaultSettings }, align: defaultAlignment };
        const updated = [...data, newEntry];
        onEdit(updated);
        const newIdx = updated.length - 1;
        setFocusIdx(newIdx);
        setTimeout(() => { 
            calculateFixedPosition(newIdx);
            refs.current[`title-${newIdx}`]?.focus(); 
        }, 0);
    };

    const removeEntry = idx => {
        const updated = data.filter((_, i) => i !== idx);
        onEdit(updated);
        setFocusIdx(null);
        setFixedToolbarPosition(null);
    };

    const handleMoveEntryUp = (idx) => {
        if (idx > 0) {
            const updated = [...data];
            [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
            onEdit(updated);
            setFocusIdx(idx - 1);
            setTimeout(() => calculateFixedPosition(idx - 1), 0);
        }
    };

    const handleMoveEntryDown = (idx) => {
        if (idx < data.length - 1) {
            const updated = [...data];
            [updated[idx + 1], updated[idx]] = [updated[idx], updated[idx + 1]];
            onEdit(updated);
            setFocusIdx(idx + 1);
            setTimeout(() => calculateFixedPosition(idx + 1), 0);
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
    
    const renderIndices = itemsToRender && itemsToRender.length > 0 ? itemsToRender : data.map((_, i) => i);
    const focusedItem = focusIdx !== null ? data[focusIdx] : null;

    return (
        <div onMouseDown={e => e.stopPropagation()}>
            {!itemsToRender && data.length === 0 && (
                <button onClick={addEntry} style={{ fontSize: '0.875rem', color: '#2563EB', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '1rem' }}>
                    ➕ Add Project
                </button>
            )}

            {renderIndices.map((idx) => {
                if (idx >= data.length) return null;

                const item = data[idx];
                const isFocused = focusIdx === idx;
                const settings  = item.settings || defaultSettings;
                const align     = item.align    || defaultAlignment;

                const currentItemData = {
                    title: item.title || '',
                    description: item.description || '',
                    link: item.link || '',
                };

                return (
                    <div 
                        key={idx} 
                        ref={el => (cardRefs.current[idx] = el)} // Attach card ref here
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
                        {settings.title && (isFocused ? (
                            <input 
                                id={`title-${idx}`} 
                                type="text" 
                                value={currentItemData.title} 
                                onChange={e => handleFieldChange(idx, 'title', e.target.value)} 
                                onFocus={() => handleFocus(idx)} 
                                onBlur={handleBlur} 
                                placeholder="Project Title" 
                                className="project-input" 
                                style={{ width: '100%', fontSize: `${(0.8 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.2rem', background: '#fff', outline: 'none', textAlign: align, boxSizing: 'border-box', color: design.titleColor, }} 
                                ref={el => (refs.current[`title-${idx}`] = el)} 
                            />
                        ) : (
                            <div className="project-input" style={{ width: '100%', fontSize: `${(0.8 + offset).toFixed(3)}rem`, textAlign: align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem', color: currentItemData.title.trim() === '' ? '#a0a0a0' : design.titleColor, minHeight: '1.5rem', }} onClick={() => handleFocus(idx)}>{currentItemData.title || 'Project Title'}</div>
                        ))}
                        {settings.description && (isFocused ? (
                            <textarea 
                                ref={el => (refs.current[`desc-${idx}`] = el)} 
                                value={currentItemData.description} 
                                onChange={e => handleFieldChange(idx, 'description', e.target.value)} 
                                onInput={e => { e.target.style.height='auto'; e.target.style.height=`${e.target.scrollHeight}px`; }} 
                                onFocus={() => handleFocus(idx)} 
                                onBlur={handleBlur} 
                                placeholder="Description" 
                                className="project-input" 
                                style={{ width:'100%', border: '1px solid #ccc', borderRadius:'.25rem', padding:'0.2rem', resize:'none', overflow:'hidden', background:'#fff', outline:'none', fontSize: `${(0.6 + offset).toFixed(3)}rem`, textAlign:align, boxSizing: 'border-box', color: '#080808' }} 
                            />
                        ) : (
                            <div className="project-input" style={{ width:'100%', fontSize: `${(0.6 + offset).toFixed(3)}rem`, textAlign:align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem', minHeight: '2rem', color: currentItemData.description.trim() === '' ? '#a0a0a0' : 'inherit' }} onClick={() => handleFocus(idx)}>{currentItemData.description || 'Description'}</div>
                        ))}
                        {settings.link && (isFocused ? (
                            <input 
                                type="text" 
                                value={currentItemData.link} 
                                onChange={e => handleFieldChange(idx, 'link', e.target.value)} 
                                onFocus={() => handleFocus(idx)} 
                                onBlur={handleBlur} 
                                placeholder="Project URL (optional)" 
                                className="project-input" 
                                style={{ width:'100%', fontSize: `${(0.55 + offset).toFixed(3)}rem`, color:'#2563EB', border: '1px solid #ccc', borderRadius:'.25rem', padding:'0.2rem', background:'#fff', outline:'none', textAlign:align, boxSizing: 'border-box' }} 
                            />
                        ) : (
                            <div className="project-input" style={{ width:'100%', fontSize: `${(0.55 + offset).toFixed(3)}rem`, color: (currentItemData.link || '').trim() === '' ? '#a0a0a0' : '#2563EB', textAlign:align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem', minHeight: '1.5rem', textDecoration: currentItemData.link.trim() ? 'underline' : 'none' }} onClick={() => handleFocus(idx)}>{currentItemData.link || 'Project URL (optional)'}</div>
                        ))}
                    </div>
                );
            })}

            {/* NEW: Fixed Position Toolbar Container */}
            {focusIdx !== null && fixedToolbarPosition && focusedItem && (
                <div 
                    ref={popupRef} 
                    onMouseDown={e => e.preventDefault()} 
                    style={{ 
                        fontSize: '1rem', 
                        position: 'fixed', // Use fixed positioning
                        top: fixedToolbarPosition.top - 48, // Position above the element (approx 3rem + padding)
                        right: window.innerWidth - (fixedToolbarPosition.left + fixedToolbarPosition.width), // Align to the right edge of the card
                        display: 'flex', 
                        gap: '0.5rem', 
                        alignItems: 'center', 
                        background: '#fff', 
                        border: '1px solid #ddd', 
                        borderRadius: '.25rem', 
                        padding: '.25rem .5rem', 
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
                        zIndex: 100 // High z-index to be on top of everything
                    }}
                >
                    <button onClick={addEntry}>+ Entry</button>
                    <button onClick={() => handleMoveEntryUp(focusIdx)} disabled={focusIdx === 0} style={{ opacity: focusIdx === 0 ? 0.5 : 1, cursor: focusIdx === 0 ? 'not-allowed' : 'pointer' }}>⬆️</button>
                    <button onClick={() => handleMoveEntryDown(focusIdx)} disabled={focusIdx === data.length - 1} style={{ opacity: focusIdx === data.length - 1 ? 0.5 : 1, cursor: focusIdx === data.length - 1 ? 'not-allowed' : 'pointer' }}>⬇️</button>
                    
                    {/* Alignment Popup */}
                    <div ref={alignRef} style={{ position: 'relative' }}>
                        <button onClick={handleAlignClick}>T</button>
                        {showAlignOptions && (
                            <div style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: '0.5rem', background: '#fff', border: '1px solid #ddd', borderRadius: '.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', zIndex: 101 }}>
                                {ALIGNMENTS.map(a => (
                                    <div key={a} style={{ padding: '0.25rem .5rem', cursor: 'pointer' }} onClick={() => handleSelectAlign(a)}>{a}</div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button onClick={() => removeEntry(focusIdx)} style={{ color: '#dc2626' }}>🗑️</button>

                    {/* Settings Popup */}
                    <div ref={settingsRef} style={{ position: 'relative' }}>
                        <button onClick={() => setShowSettingsOptions(s => !s)}>⚙️</button>
                        {showSettingsOptions && (
                            <div style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: '0.5rem', background: '#fff', border: '1px solid #ddd', borderRadius: '.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '0.5rem', width: '200px', zIndex: 101 }}>
                                {SETTINGS_OPTIONS.map(({ key, label }) => (
                                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.25rem 0' }}>
                                        <span style={{ fontSize: '0.875rem' }}>{label}</span>
                                        <input 
                                            type="checkbox" 
                                            checked={focusedItem.settings ? focusedItem.settings[key] : defaultSettings[key]} 
                                            onChange={() => toggleSetting(key)} 
                                            style={{ cursor: 'pointer', width: '1.25rem', height: '1.25rem' }} 
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
