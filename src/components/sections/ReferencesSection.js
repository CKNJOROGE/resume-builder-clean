import React, { useState, useEffect, useRef } from 'react';

const ALIGNMENTS = ['left', 'center', 'right', 'justify'];
const SETTINGS_OPTIONS = [
    { key: 'name',    label: 'Referee Name' },
    { key: 'title',   label: 'Position / Relationship' },
    { key: 'contact', label: 'Contact Info' },
];

export default function ReferencesSection({
    data = [],
    onEdit,
    itemsToRender,
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
    
    // NEW STATE FOR FIXED TOOLBAR POSITION
    const [fixedToolbarPosition, setFixedToolbarPosition] = useState(null);

    const refs = useRef({}); // Input/Textarea refs
    const cardRefs = useRef({}); // Card container refs
    const alignRef = useRef(null);
    const settingsRef = useRef(null);
    const blurTimeout = useRef(null);
    const popupRef = useRef(null); // Main toolbar ref

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
        const newSettingsMap = {};
        const newAlignMap    = {};

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
            // Update position after potential content resize
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
            if (showAlignOptions     && alignRef.current     && !alignRef.current.contains(e.target)) {
                setShowAlignOptions(false);
            }
            if (showSettingsOptions && settingsRef.current && !settingsRef.current.contains(e.target)) {
                setShowSettingsOptions(false);
            }

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

    const updateData = updated => onEdit(updated);

    const handleFieldChange = (idx, key, value) => {
        const updated = [...data];
        updated[idx] = { ...updated[idx], [key]: value };
        updateData(updated);
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
        const newEntry = {
            name: '',
            title: '',
            contact: '',
            settings: { ...defaultSettings },
            align: defaultAlignment,
        };
        const updated = [...data, newEntry];
        updateData(updated);
        const newIdx = updated.length - 1;
        setFocusIdx(newIdx);
        setTimeout(() => {
            calculateFixedPosition(newIdx);
            refs.current[`name-${newIdx}`]?.focus();
        }, 0);
    };

    const removeEntry = idx => {
        const updated = [...data];
        updated.splice(idx, 1);
        updateData(updated);
        setFocusIdx(null);
        setFixedToolbarPosition(null);
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
    
    const renderIndices = itemsToRender && itemsToRender.length > 0 ? itemsToRender : data.map((_, i) => i);
    const focusedItem = focusIdx !== null ? data[focusIdx] : null;

    return (
        <div style={{ position: 'relative' }} onMouseDown={e => e.stopPropagation()}>
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

            {renderIndices.map((idx) => {
                if (idx >= data.length) return null;

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

            {/* NEW: Fixed Position Toolbar Container */}
            {focusIdx !== null && fixedToolbarPosition && focusedItem && (
                <div
                    ref={popupRef}
                    onMouseDown={e => e.preventDefault()}
                    style={{
                        fontSize: '1rem',
                        position: 'fixed', // Use fixed positioning
                        top: fixedToolbarPosition.top - 90, // Position above the element (approx 3rem + padding)
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
                                    <div key={a} style={{ padding:'0.25rem .5rem', cursor:'pointer' }} onClick={() => handleSelectAlign(a)}>{a}</div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button onClick={() => removeEntry(focusIdx)} style={{ color:'#dc2626' }}>🗑️</button>
                    
                    {/* Settings Popup */}
                    <div ref={settingsRef} style={{ position:'relative' }}>
                        <button onClick={() => setShowSettingsOptions(s => !s)}>⚙️</button>
                        {showSettingsOptions && (
                            <div style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: '0.5rem', background: '#fff', border: '1px solid #ddd', borderRadius: '.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '0.5rem', width: '200px', zIndex: 101 }}>
                                {SETTINGS_OPTIONS.map(({ key, label }) => (
                                    <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', margin:'0.25rem 0' }}>
                                        <span style={{ fontSize:'0.875rem' }}>{label}</span>
                                        <input 
                                            type="checkbox" 
                                            checked={focusedItem.settings ? focusedItem.settings[key] : defaultSettings[key]} 
                                            onChange={() => toggleSetting(key)} 
                                            style={{ cursor:'pointer', width:'1.25rem', height:'1.25rem' }} 
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
