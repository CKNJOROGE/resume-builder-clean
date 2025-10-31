import React, { useState, useRef, useEffect } from 'react';

const DEFAULT_ITEM = {
    skill: '',
    level: 0,
    showSlider: false,
    sliderStyle: 'gradient',
    alignment: 'left',
};
const SEGMENTS = 10;
const SLIDER_STYLES = ['segments', 'dashed', 'gradient', 'knob'];

export default function IndustrialExpertiseSection({
    data = [],
    onEdit,
    itemsToRender,
    isMeasuring,
    sectionStyle = {},
    headingStyle = {},
    design = {}
}) {
    const { disableSliders = false, horizontalFlow = false } = design;
    const sliderPx = parseFloat(design.fontSize) || 0;
    const offset = sliderPx / 30;
    const [activeIdx, setActiveIdx] = useState(null);
    const [settingsMode, setSettingsMode] = useState(false);
    
    // NEW STATE FOR FIXED TOOLBAR POSITION
    const [fixedToolbarPosition, setFixedToolbarPosition] = useState(null);

    const cardRefs = useRef({});
    const toolbarRef = useRef(null);
    const settingsRef = useRef(null);
    const refs = useRef({});
    const blurTimeout = useRef(null);
    
    // CONSTANTS for fixed toolbar positioning
    const TOOLBAR_HEIGHT = 40; 
    const SETTINGS_HEIGHT = 200; 

    useEffect(() => {
        if (!isMeasuring && data.length > 0) {
            const cleanedData = data.map(item => ({ ...DEFAULT_ITEM, ...item }));
            if (JSON.stringify(cleanedData) !== JSON.stringify(data)) {
                onEdit(cleanedData);
            }
        }
    }, [data, onEdit, isMeasuring]);

    // NEW/UPDATED: Function to calculate and set the fixed toolbar position
    const calculateToolbarPosition = (idx) => {
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

    // UPDATED: Handle click outside logic
    useEffect(() => {
        const handleClickOutside = e => {
            if (activeIdx == null) return;

            const cardEl = cardRefs.current[activeIdx];
            const clickedInsideCard = cardEl && cardEl.contains(e.target);
            const clickedInsideToolbar = toolbarRef.current && toolbarRef.current.contains(e.target);
            const clickedInsideSettings = settingsRef.current && settingsRef.current.contains(e.target);

            // If click is outside the card, outside the fixed toolbar, AND outside the fixed settings popup
            if (!clickedInsideCard && !clickedInsideToolbar && !clickedInsideSettings) {
                const isInputField = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON';
                if (!isInputField) {
                    setActiveIdx(null);
                    setSettingsMode(false);
                    setFixedToolbarPosition(null); // HIDE TOOLBAR
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeIdx]);

    useEffect(() => {
        // Auto-resize textareas and update toolbar position on data change/activeIdx
        if (activeIdx !== null) {
            const skillEl = refs.current[`skill-${activeIdx}`];
            if (skillEl && skillEl.tagName === 'TEXTAREA') {
                skillEl.style.height = 'auto';
                skillEl.style.height = `${skillEl.scrollHeight}px`;
            }
             // Update fixed toolbar position after content resize
            calculateToolbarPosition(activeIdx);
        }
    }, [data, activeIdx]);

    const commit = newArr => onEdit(newArr);

    const addAt = idx => {
        const copy = [...data];
        copy.splice(idx + 1, 0, { ...DEFAULT_ITEM });
        commit(copy);
        setActiveIdx(idx + 1);
        setSettingsMode(false);
        calculateToolbarPosition(idx + 1); // Calculate new position
        setTimeout(() => {
            refs.current[`skill-${idx + 1}`]?.focus();
        }, 0);
    };

    const removeAt = idx => {
        const copy = [...data];
        copy.splice(idx, 1);
        commit(copy);
        setActiveIdx(null);
        setSettingsMode(false);
        setFixedToolbarPosition(null); // Hide toolbar on remove
    };

    const changeAt = (idx, key, val) => {
        const copy = data.map((it, i) =>
            i === idx ? { ...it, [key]: val } : it
        );
        commit(copy);
    };

    // UPDATED: toggleCard to calculate fixed toolbar position
    const toggleCard = idx => {
        setActiveIdx(prev => {
            if (prev === idx) {
                setFixedToolbarPosition(null);
                setSettingsMode(false);
                return null;
            } else {
                calculateToolbarPosition(idx);
                return idx;
            }
        });
    };

    // UPDATED: handleFocus to also calculate fixed toolbar position
    const handleFocus = idx => {
        clearTimeout(blurTimeout.current);
        setActiveIdx(idx);
        calculateToolbarPosition(idx);
    };

    const handleBlur = () => {
        // Let useEffect manage the blur
    };

    const handleMoveEntryUp = idx => {
        if (idx > 0) {
            const updated = [...data];
            [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
            commit(updated);
            setActiveIdx(idx - 1);
            calculateToolbarPosition(idx - 1); // Update position
        }
    };

    const handleMoveEntryDown = idx => {
        if (idx < data.length - 1) {
            const updated = [...data];
            [updated[idx + 1], updated[idx]] = [updated[idx], updated[idx + 1]];
            commit(updated);
            setActiveIdx(idx + 1);
            calculateToolbarPosition(idx + 1); // Update position
        }
    };

    const renderIndices =
        itemsToRender && itemsToRender.length > 0
            ? itemsToRender
            : data.map((_, i) => i);

    const measurementStyle = isMeasuring
        ? { visibility: 'hidden', pointerEvents: 'none' }
        : {};
    
    const containerStyle = {
        ...sectionStyle,
        ...(horizontalFlow && {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
        })
    };
    
    const currentItem = activeIdx !== null ? data[activeIdx] : DEFAULT_ITEM;


    return (
        <div style={containerStyle} onMouseDown={e => e.stopPropagation()}>
            
            {/* --- NEW: Fixed Toolbar Rendering (Main) --- */}
            {activeIdx !== null && fixedToolbarPosition && !settingsMode && (
                <div
                    data-toolbar="fixed"
                    ref={toolbarRef}
                    style={{
                        fontSize: '1rem',
                        position: 'fixed',
                        // Calculate global Y position and offset for fixed positioning
                        top: fixedToolbarPosition.top - window.scrollY - TOOLBAR_HEIGHT - 8, // Positioned above the card
                        left: fixedToolbarPosition.left - window.scrollX,
                        width: fixedToolbarPosition.width,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '0.5rem',
                        alignItems: 'center',
                        background: '#fff',
                        border: '0.1px solid #ddd',
                        borderRadius: '.5rem',
                        padding: '0.25rem 0.5rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        zIndex: 100,
                    }}
                    onMouseDown={e => e.preventDefault()}
                >
                    <button
                        style={{
                            backgroundColor: '#23ad17',
                            color: '#ffffff',
                            border: '0.1px solid #ddd',
                            padding: '4px',
                            borderTopLeftRadius: '.4rem',
                            borderBottomLeftRadius: '.4rem',
                            flexShrink: 0
                        }}
                        onClick={() => addAt(activeIdx)}
                    >
                        + Entry
                    </button>
                    <button
                        onClick={() => handleMoveEntryUp(activeIdx)}
                        disabled={activeIdx === 0}
                        style={{ opacity: activeIdx === 0 ? 0.5 : 1, cursor: activeIdx === 0 ? 'not-allowed' : 'pointer' }}
                    >
                        ⬆️
                    </button>
                    <button
                        onClick={() => handleMoveEntryDown(activeIdx)}
                        disabled={activeIdx === data.length - 1}
                        style={{ opacity: activeIdx === data.length - 1 ? 0.5 : 1, cursor: activeIdx === data.length - 1 ? 'not-allowed' : 'pointer' }}
                    >
                        ⬇️
                    </button>
                    <button
                        style={{ border: '0.1px solid #ddd', padding: '4px' }}
                        onClick={() => removeAt(activeIdx)}
                    >
                        🗑️
                    </button>
                    <button
                        style={{ border: '0.1px solid #ddd', padding: '4px', flexShrink: 0 }}
                        onClick={() => setSettingsMode(true)}
                    >
                        ⚙️
                    </button>
                    <button
                        onClick={() => { setActiveIdx(null); setFixedToolbarPosition(null); }}
                        style={{
                            border: '0.1px solid #ddd',
                            marginLeft: 'auto',
                            padding: '4px',
                            borderTopRightRadius: '0.4rem',
                            borderBottomRightRadius: '0.4rem',
                            flexShrink: 0
                        }}
                    >
                        ×
                    </button>
                </div>
            )}
            {/* --- End of Fixed Toolbar Rendering (Main) --- */}
            
            {/* --- NEW: Fixed Toolbar Rendering (Settings) --- */}
            {activeIdx !== null && fixedToolbarPosition && settingsMode && (
                <div
                    data-settings="fixed"
                    ref={settingsRef}
                    style={{
                        position: 'fixed',
                        // Calculate global Y position and offset for fixed positioning
                        top: fixedToolbarPosition.top - window.scrollY - SETTINGS_HEIGHT - 8, // Positioned above the card
                        right: window.innerWidth - (fixedToolbarPosition.left - window.scrollX) - fixedToolbarPosition.width,
                        background: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: '.25rem',
                        padding: '0.5rem',
                        minWidth: '160px',
                        zIndex: 110,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                    onMouseDown={e => e.preventDefault()}
                >
                    <label
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.8rem',
                            color: '#080808'
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={currentItem.showSlider}
                            onChange={e => changeAt(activeIdx, 'showSlider', e.target.checked)}
                        />{' '}
                        Show Slider
                    </label>
                    {currentItem.showSlider && (
                        <div style={{ marginTop: '0.5rem' }}>
                            <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                Slider Style
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {SLIDER_STYLES.map(s => (
                                    <div
                                        key={s}
                                        onClick={() => changeAt(activeIdx, 'sliderStyle', s)}
                                        style={{
                                            width: '1rem',
                                            height: '1rem',
                                            borderRadius: '50%',
                                            backgroundColor:
                                                currentItem.sliderStyle === s
                                                    ? '#3B82F6'
                                                    : '#E5E7EB',
                                            cursor: 'pointer'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setSettingsMode(false)}
                        style={{
                            marginTop: '0.5rem',
                            fontSize: '0.75rem',
                            color: '#2563EB',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        ← Back
                    </button>
                </div>
            )}
            {/* --- End of Fixed Toolbar Rendering (Settings) --- */}


            {!itemsToRender && data.length === 0 && (
                <button
                    onClick={() => {
                        commit([{ ...DEFAULT_ITEM }]);
                        setActiveIdx(0);
                        calculateToolbarPosition(0);
                    }}
                    style={{
                        fontSize: '0.875rem',
                        color: '#2563EB',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        marginBottom: '1rem'
                    }}
                >
                    ➕ Entry
                </button>
            )}

            {renderIndices.map(idx => {
                if (idx >= data.length) return null;
                const item = data[idx];
                const isActive = activeIdx === idx;
                
                const itemStyle = {
                    position: 'relative',
                    padding: isActive ? '0.2rem 0.75rem' : '0.2rem 0.5rem',
                    cursor: 'pointer',
                    background: isActive ? '#f9fafb' : 'transparent',
                    borderBottom: horizontalFlow ? 'none' : '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    breakInside: 'avoid',
                    ...(horizontalFlow && {
                        border: '1px solid #e5e7eb',
                        flexGrow: 1,
                        minWidth: '150px',
                    })
                };

                return (
                    <div
                        key={idx}
                        ref={el => (cardRefs.current[idx] = el)}
                        onClick={isActive ? undefined : () => toggleCard(idx)}
                        style={itemStyle}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        {/* INLINE TOOLBAR MARKUP REMOVED */}

                        {isActive ? (
                            <textarea
                                id={`skill-${idx}`}
                                rows={1}
                                value={item.skill}
                                onChange={e => {
                                    e.stopPropagation();
                                    changeAt(idx, 'skill', e.target.value);
                                }}
                                onInput={e => {
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                }}
                                onFocus={() => handleFocus(idx)}
                                onBlur={() => handleBlur()}
                                placeholder="Skill name"
                                className="industrial-skill-input"
                                style={{
                                    fontSize: `${(0.6 + offset).toFixed(3)}rem`,
                                    border: '1px solid #ccc',
                                    borderRadius: '.25rem',
                                    padding: '0.2rem',
                                    background: '#fff',
                                    outline: 'none',
                                    width: '100%',
                                    resize: 'none',
                                    overflow: 'hidden',
                                    boxSizing: 'border-box',
                                    marginBottom: item.showSlider && !disableSliders ? '0.5rem' : 0
                                }}
                                ref={el => (refs.current[`skill-${idx}`] = el)}
                            />
                        ) : (
                            <div
                                className="industrial-skill-display"
                                style={{
                                    fontSize: `${(0.6 + offset).toFixed(3)}rem`,
                                    whiteSpace: 'pre-wrap',
                                    wordWrap: 'break-word',
                                    overflowWrap: 'break-word',
                                    wordBreak: 'break-word',
                                    padding: '0.2rem',
                                    color:
                                        (item.skill || '').trim() === ''
                                            ? '#a0a0a0'
                                            : 'inherit',
                                    minHeight: '24px',
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    marginBottom: item.showSlider && !disableSliders ? '0.5rem' : 0
                                }}
                            >
                                {item.skill || 'Skill name'}
                            </div>
                        )}

                        {/* SLIDER RENDERING REMAINS THE SAME */}
                        {item.showSlider && !disableSliders && item.sliderStyle === 'knob' && (
                            <input
                                type="range"
                                min={0}
                                max={SEGMENTS}
                                value={item.level}
                                onChange={e =>
                                    !isMeasuring && changeAt(idx, 'level', +e.target.value)
                                }
                                style={{
                                    width: '100%',
                                    marginBottom: isActive ? '0.5rem' : 0,
                                    ...measurementStyle
                                }}
                                onClick={e => !isMeasuring && e.stopPropagation()}
                            />
                        )}

                        {item.showSlider && !disableSliders && item.sliderStyle === 'segments' && (
                            <div
                                className="pdf-slider-container"
                                style={{
                                    display: 'flex',
                                    gap: '0.25rem',
                                    marginBottom: isActive ? '0.5rem' : 0,
                                    ...measurementStyle
                                }}
                                onClick={e => !isMeasuring && e.stopPropagation()}
                            >
                                {Array.from({ length: SEGMENTS }).map((_, i) => (
                                    <div
                                        key={i}
                                        onClick={() =>
                                            !isMeasuring && changeAt(idx, 'level', i + 1)
                                        }
                                        style={{
                                            flex: 1,
                                            height: '0.5rem',
                                            backgroundColor:
                                                i < item.level ? design.titleColor : '#E5E7EB',
                                            borderRadius: '0.125rem',
                                            cursor: isMeasuring ? 'default' : 'pointer'
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {item.showSlider && !disableSliders && item.sliderStyle === 'dashed' && (
                            <div
                                className="pdf-slider-container"
                                style={{
                                    display: 'flex',
                                    gap: '0.5rem',
                                    marginBottom: isActive ? '0.5rem' : 0,
                                    ...measurementStyle
                                }}
                                onClick={e => !isMeasuring && e.stopPropagation()}
                            >
                                {Array.from({ length: SEGMENTS }).map((_, i) => (
                                    <div
                                        key={i}
                                        onClick={() =>
                                            !isMeasuring && changeAt(idx, 'level', i + 1)
                                        }
                                        style={{
                                            flex: 1,
                                            height: '0.5rem',
                                            borderBottom:
                                                i < item.level
                                                    ? `4px solid ${design.titleColor}`
                                                    : '4px dashed #D1D5DB',
                                            cursor: isMeasuring ? 'default' : 'pointer'
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {item.showSlider && !disableSliders && item.sliderStyle === 'gradient' && (
                            <div
                                className="pdf-slider-container"
                                style={{
                                    position: 'relative',
                                    marginBottom: isActive ? '0.5rem' : 0,
                                    ...measurementStyle
                                }}
                                onClick={e => !isMeasuring && e.stopPropagation()}
                            >
                                <div
                                    style={{
                                        height: '0.5rem',
                                        background: `linear-gradient(to right, ${
                                            design.titleColor
                                        } ${(item.level / SEGMENTS) * 100}%, #E5E7EB ${
                                            (item.level / SEGMENTS) * 100
                                        }%)`,
                                        borderRadius: '0.25rem',
                                        cursor: isMeasuring ? 'default' : 'pointer'
                                    }}
                                    onClick={e => {
                                        if (isMeasuring) return;
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const pct = (e.clientX - rect.left) / rect.width;
                                        changeAt(idx, 'level', Math.round(pct * SEGMENTS));
                                    }}
                                />
                            </div>
                        )}

                        {/* INLINE SETTINGS MARKUP REMOVED */}
                    </div>
                );
            })}
        </div>
    );
}
