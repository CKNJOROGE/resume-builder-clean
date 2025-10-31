import React, { useState, useEffect, useRef } from 'react';

const MAX_LEVEL = 5;
const ALIGNMENTS = ['left', 'center', 'right', 'justify'];
const SETTINGS_OPTIONS = [
    { key: 'language', label: 'Language' },
    { key: 'level',    label: 'Proficiency' },
    { key: 'rating',   label: 'Rating' },
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

    // NEW STATE FOR FIXED TOOLBAR
    const [fixedToolbarPosition, setFixedToolbarPosition] = useState(null);

    const refs = useRef({});
    // Keep these refs for click-outside on sub-popups (align/settings)
    const alignRef = useRef(null);
    const settingsRef = useRef(null); 
    // This ref will be for the main fixed toolbar container
    const popupRef = useRef(null); 
    const blurTimeout = useRef(null);
    const cardRefs = useRef({}); // New ref to store card elements

    const defaultSettings  = SETTINGS_OPTIONS.reduce((acc, { key }) => ({ ...acc, [key]: true }), {});
    const defaultAlignment = 'left';

    useEffect(() => {
        // Initialization/Cleanup
        const newSettingsMap = {};
        const newAlignMap    = {};

        data.forEach((item, i) => {
            const cleanedItem = {
                language: item.language || '',
                level: item.level || RATING_LABELS[3],
                rating: item.rating !== undefined ? item.rating : 3,
                // Ensure settings object is clean and complete
                settings: { ...defaultSettings, ...(item.settings || {}) },
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
    }, [data, onEdit]);
    
    // Auto-resize textarea on content change or focus change
    useEffect(() => {
        if (focusIdx !== null) {
            const skillEl = refs.current[`language-${focusIdx}`];
            if (skillEl && skillEl.tagName === 'TEXTAREA') {
                skillEl.style.height = 'auto';
                skillEl.style.height = `${skillEl.scrollHeight}px`;
            }
            // Update fixed toolbar position after content resize
            const cardEl = cardRefs.current[focusIdx];
            if (cardEl) {
                const rect = cardEl.getBoundingClientRect();
                setFixedToolbarPosition(prev => ({
                    ...prev,
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    height: rect.height,
                }));
            }
        }
    }, [data, focusIdx]);


    // UPDATED: Handle click outside logic for fixed toolbar and popups
    useEffect(() => {
        function handleClickOutside(e) {
            if (focusIdx == null) return;

            const cardEl = cardRefs.current[focusIdx];
            const clickedInsideCard = cardEl && cardEl.contains(e.target);
            const clickedInsideToolbar = popupRef.current && popupRef.current.contains(e.target);
            
            // If click is outside the card AND the entire fixed toolbar/popup group
            if (!clickedInsideCard && !clickedInsideToolbar) {
                const isInputField = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
                if (!isInputField) {
                    setFocusIdx(null);
                    setShowAlignOptions(false);
                    setShowSettingsOptions(false);
                    setFixedToolbarPosition(null);
                }
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [focusIdx]);

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

    // UPDATED: handleFocus to calculate fixed toolbar position
    const handleFocus = (idx) => {
        clearTimeout(blurTimeout.current);
        setFocusIdx(idx);
        setShowAlignOptions(false);
        setShowSettingsOptions(false);
        
        // Calculate and set the fixed toolbar position
        setTimeout(() => {
            const cardEl = cardRefs.current[idx];
            if (cardEl) {
                const rect = cardEl.getBoundingClientRect();
                setFixedToolbarPosition({
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    height: rect.height,
                });
            }
        }, 0);
    };

    const handleBlur = () => {
        blurTimeout.current = setTimeout(() => {
            // Check if focus is still outside after timeout, but let handleClickOutside handle the final state change
        }, 150);
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
        handleFocus(updated.length - 1); // Use updated focus handler
        setTimeout(() => {
            refs.current[`language-${updated.length - 1}`]?.focus();
        }, 0);
    };

    const removeEntry = idx => {
        const updated = [...data];
        updated.splice(idx, 1);
        updateData(updated);
        setFocusIdx(null);
        setFixedToolbarPosition(null); // Hide toolbar on remove
    };

    const handleMoveEntryUp = (idx) => {
        if (idx > 0) {
            const updated = [...data];
            [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
            updateData(updated);
            handleFocus(idx - 1); // Use updated focus handler
        }
    };

    const handleMoveEntryDown = (idx) => {
        if (idx < data.length - 1) {
            const updated = [...data];
            [updated[idx + 1], updated[idx]] = [updated[idx], updated[idx + 1]];
            updateData(updated);
            handleFocus(idx + 1); // Use updated focus handler
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

    const renderIndices = itemsToRender && itemsToRender.length > 0 ? itemsToRender : data.map((_, i) => i);
    const currentItemData = focusIdx !== null ? data[focusIdx] : null;

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
                    ➕ Add Language
                </button>
            )}

            {renderIndices.map((idx) => {
                if (idx >= data.length) return null;

                const item = data[idx];
                const isFocused = focusIdx === idx;
                const settings  = item.settings || defaultSettings;
                const align     = item.align    || defaultAlignment;

                const displayData = {
                    language: item.language || '',
                    level: item.level || RATING_LABELS[3],
                    rating: item.rating !== undefined ? item.rating : 3,
                };

                return (
                    <div
                        key={idx}
                        ref={el => (cardRefs.current[idx] = el)}
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
                        <div style={{ display:'flex', flexWrap:'wrap', alignItems:'baseline', gap:'0.5rem', marginBottom:'0.5rem' }}>
                            {settings.language && (
                                isFocused ? (
                                    <textarea
                                        id={`language-${idx}`}
                                        rows={1}
                                        value={displayData.language}
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
                                    <div className="language-input" style={{ flex:'1 1 120px', minWidth:'120px', fontSize: `${(0.75 + offset).toFixed(3)}rem`, textAlign:align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.25rem', color: displayData.language.trim() === '' ? '#a0a0a0' : design.titleColor, minHeight: '1.5rem' }} onClick={() => handleFocus(idx)}>
                                        {displayData.language || 'Language'}
                                    </div>
                                )
                            )}
                            {settings.rating && (
                                <div className="language-rating-dots"  style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', fontSize: `${(0.6 + offset).toFixed(3)}rem`,}}>
                                    {[...Array(MAX_LEVEL)].map((_, i) => (
                                        <span
                                            key={i}
                                            onMouseDown={e => { e.preventDefault(); handleRatingChange(idx, i + 1); }}
                                            title={`Level ${i+1}`}
                                            style={{ display: 'inline-block', width: '0.55rem', height: '0.55rem', borderRadius: '9999px', backgroundColor: i < displayData.rating ? design.titleColor : '#D1D5DB', cursor: 'pointer' }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        {settings.level && (
                            isFocused ? (
                                <input
                                    type="text"
                                    value={displayData.level}
                                    readOnly
                                    placeholder="Proficiency"
                                    className="language-input"
                                    style={{ width: '100%', fontSize: `${(0.6 + offset).toFixed(3)}rem`, color: '#080808', border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.25rem', background: '#fff', outline: 'none', textAlign: align, boxSizing: 'border-box' }}
                                    onFocus={() => handleFocus(idx)}
                                    onBlur={handleBlur}
                                />
                            ) : (
                                <div className="language-input" style={{ width: '100%', fontSize: `${(0.6 + offset).toFixed(3)}rem`, color: displayData.level.trim() === '' ? '#a0a0a0' : '#080808', textAlign: align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.25rem', minHeight: '1.5rem' }} onClick={() => handleFocus(idx)}>
                                    {displayData.level || 'Proficiency'}
                                </div>
                            )
                        )}
                    </div>
                );
            })}

            {/* NEW: Fixed Position Toolbar Container */}
            {focusIdx !== null && fixedToolbarPosition && currentItemData && (
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
                                            checked={currentItemData.settings[key]} 
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
