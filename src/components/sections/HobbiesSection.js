import React, { useState, useEffect, useRef } from 'react';
import { Gem, Paintbrush, Rocket, Target, Library, Music, Footprints, Mountain, Utensils, Gamepad2, Activity } from 'lucide-react';

const ICON_MAP = { Gem, Paintbrush, Rocket, Target, Library, Music, Footprints, Mountain, Utensils, Gamepad2, Activity };

// An array of the available icon names
const ICON_PALETTE = Object.keys(ICON_MAP);

const DEFAULT = {
    icon: ICON_PALETTE[0], // The default icon is now the string 'Gem'
    title: '',
    description: '',
    showIcon: true,
    showTitle: true,
    showDescription: true,
    alignment: 'left',
};
const ALIGNMENTS = ['left', 'center', 'right', 'justify'];


export default function HobbiesSection({
    data = [],
    onEdit,
    itemsToRender,
    sectionStyle = {},
    headingStyle = {},
    onChangeAlignment,
    design = {},
}) {
    const { disableIcons = false } = design;
    const sliderPx = parseFloat(design.fontSize) || 0;
    const offset = sliderPx / 30;
    const [focusIdx, setFocusIdx] = useState(null);
    const [showAlign, setShowAlign] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    
    // NEW STATE FOR FIXED TOOLBAR
    const [fixedToolbarPosition, setFixedToolbarPosition] = useState(null);
    
    const alignRef      = useRef(null);
    const settingsRef = useRef(null);
    const blurTimeout = useRef(null);
    const refs = useRef({}); // Refs for input/textarea fields
    const cardRefs = useRef({}); // Refs for the main entry divs
    const toolbarRef = useRef(null); // Ref for the main fixed toolbar

    useEffect(() => {
        // Initialization/Cleanup
        if (data.length === 0) {
            onEdit([ { ...DEFAULT } ]);
        }
        const cleanedData = data.map(item => ({
            ...DEFAULT,
            ...item,
            alignment: item.alignment || DEFAULT.alignment,
            showIcon: item.showIcon !== undefined ? item.showIcon : DEFAULT.showIcon,
            showTitle: item.showTitle !== undefined ? item.showTitle : DEFAULT.showTitle,
            showDescription: item.showDescription !== undefined ? item.showDescription : DEFAULT.showDescription,
        }));
        // Use deep comparison to avoid unnecessary re-renders/infinite loops
        if (JSON.stringify(cleanedData) !== JSON.stringify(data)) { 
            onEdit(cleanedData);
        }
    }, [data, onEdit]);

    const commit = updated => onEdit(updated);

    const addEntry = idx => {
        const pos = idx == null ? data.length : idx + 1;
        const updated = [...data];
        updated.splice(pos, 0, { ...DEFAULT });
        commit(updated);
        handleFocus(pos); // Use updated focus handler
        setTimeout(() => {
            refs.current[`title-${pos}`]?.focus();
        }, 0);
    };

    const removeEntry = idx => {
        const updated = data.filter((_,i) => i !== idx);
        commit(updated);
        setFocusIdx(null);
        setFixedToolbarPosition(null); // Hide toolbar on remove
    };

    const moveUp = idx => {
        if (idx === 0) return;
        const updated = [...data];
        [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
        commit(updated);
        handleFocus(idx - 1);
    };

    const moveDown = idx => {
        if (idx === data.length - 1) return;
        const updated = [...data];
        [updated[idx + 1], updated[idx]] = [updated[idx], updated[idx + 1]];
        commit(updated);
        handleFocus(idx + 1);
    };

    const changeField = (idx, key, val) => {
        const updated = data.map((it,i) => i === idx ? { ...it, [key]: val } : it);
        commit(updated);
    };

    const handleAlignClick = () => setShowAlign(a => !a);
    const handleSelectAlign = a => {
        if (focusIdx != null) {
            changeField(focusIdx, 'alignment', a);
            onChangeAlignment?.(a);
        }
        setShowAlign(false);
    };

    // UPDATED: handleFocus to calculate fixed toolbar position
    const handleFocus = (idx) => {
        clearTimeout(blurTimeout.current);
        setFocusIdx(idx);
        setShowAlign(false);
        setShowSettings(false);
        
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
        // We let the useEffect handleClickOutside manage actual blur/focusIdx reset
    };

    useEffect(() => {
        // Auto-resize textareas and update toolbar position on data change/focusIdx
        if (focusIdx !== null) {
            const titleEl = refs.current[`title-${focusIdx}`];
            const descriptionEl = refs.current[`desc-${focusIdx}`];
            [titleEl, descriptionEl].forEach(el => {
                if (el && el.tagName === 'TEXTAREA') {
                    el.style.height = 'auto';
                    el.style.height = `${el.scrollHeight}px`;
                }
            });
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

    // UPDATED: Handle click outside logic to include the fixed toolbar
    useEffect(() => {
        function onClickOutside(e) {
            if (focusIdx === null) return;
            
            const clickedOnToolbar = toolbarRef.current && toolbarRef.current.contains(e.target);
            const clickedOnCard = cardRefs.current[focusIdx] && cardRefs.current[focusIdx].contains(e.target);
            
            // If click is outside the card and outside the fixed toolbar
            if (!clickedOnCard && !clickedOnToolbar) {
                const isInputField = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON';
                if (!isInputField) {
                    setFocusIdx(null);
                    setShowAlign(false);
                    setShowSettings(false);
                    setFixedToolbarPosition(null);
                }
            }
        }
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, [focusIdx]);

    const renderIndices = itemsToRender && itemsToRender.length > 0 ? itemsToRender : data.map((_, i) => i);
    const TOOLBAR_HEIGHT = 40; // Approximate height of the toolbar
    const currentItemData = focusIdx !== null ? data[focusIdx] : null;


    return (
        <div onMouseDown={e=>e.stopPropagation()} style={{ position: 'relative' }}>
            
            {/* --- NEW: Fixed Toolbar Rendering --- */}
            {focusIdx !== null && fixedToolbarPosition && currentItemData && (
                <div
                    data-toolbar="fixed"
                    ref={toolbarRef}
                    style={{
                        fontSize: '1rem',
                        position: 'fixed',
                        // Calculate global Y position and offset for fixed positioning
                        top: fixedToolbarPosition.top - window.scrollY - TOOLBAR_HEIGHT - 8, // Always positioned above for this component
                        left: fixedToolbarPosition.left - window.scrollX,
                        width: fixedToolbarPosition.width,
                        display: 'flex',
                        justifyContent: 'flex-end', // ALIGNED TO THE RIGHT
                        gap: '0.5rem',
                        alignItems: 'center',
                        background: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: '.25rem',
                        padding: '.25rem .5rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        zIndex: 100,
                    }}
                    onMouseDown={e => e.preventDefault()}
                >
                    <button onClick={() => addEntry(focusIdx)}>➕ Entry</button>
                    <button onClick={() => moveUp(focusIdx)} disabled={focusIdx === 0} style={{ opacity: focusIdx === 0 ? 0.5 : 1, cursor: focusIdx === 0 ? 'not-allowed' : 'pointer' }}>⬆️</button>
                    <button onClick={() => moveDown(focusIdx)} disabled={focusIdx === data.length - 1} style={{ opacity: focusIdx === data.length - 1 ? 0.5 : 1, cursor: focusIdx === data.length - 1 ? 'not-allowed' : 'pointer' }}>⬇️</button>
                    
                    <div ref={alignRef} style={{ position: 'relative' }}>
                        <button onClick={handleAlignClick}>T</button>
                        {showAlign && (
                            <div style={{ 
                                position: 'fixed', 
                                top: fixedToolbarPosition.top - window.scrollY - TOOLBAR_HEIGHT - 120, 
                                right: window.innerWidth - fixedToolbarPosition.left - fixedToolbarPosition.width - 20, 
                                background: '#fff', border: '1px solid #ddd', borderRadius: '.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', zIndex: 110, minWidth: '80px' 
                            }}>
                                {ALIGNMENTS.map(a => (
                                    <div 
                                        key={a} 
                                        style={{ padding: '0.25rem .5rem', cursor: 'pointer', textTransform: 'capitalize', background: (currentItemData.alignment || DEFAULT.alignment) === a ? '#e5e7eb' : 'transparent' }} 
                                        onClick={() => handleSelectAlign(a)}
                                    >
                                        {a}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <button onClick={() => removeEntry(focusIdx)} style={{ color: '#dc2626' }}>🗑️</button>
                    
                    <div ref={settingsRef} style={{ position: 'relative' }}>
                        <button onClick={() => setShowSettings(s => !s)}>⚙️</button>
                        {showSettings && (
                            <div style={{ 
                                position: 'fixed', 
                                top: fixedToolbarPosition.top - window.scrollY - TOOLBAR_HEIGHT - 320, 
                                right: window.innerWidth - fixedToolbarPosition.left - fixedToolbarPosition.width - 20, 
                                background: '#fff', border: '1px solid #ddd', borderRadius: '.375rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '0.5rem', minWidth: '160px', zIndex: 110 
                            }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                    <input type="checkbox" checked={currentItemData.showIcon} onChange={e=>changeField(focusIdx,'showIcon',e.target.checked)} /> Icon
                                </label>
                                {currentItemData.showIcon && (
                                    <div style={{ marginTop:'0.25rem', display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'0.25rem' }}>
                                        {ICON_PALETTE.map(iconName => {
                                            const IconComponent = ICON_MAP[iconName];
                                            return (
                                                <IconComponent
                                                    key={iconName}
                                                    onClick={() => changeField(focusIdx, 'icon', iconName)}
                                                    className="w-6 h-6 cursor-pointer text-gray-500"
                                                    style={{ opacity: (currentItemData.icon || DEFAULT.icon) === iconName ? 1 : 0.5 }}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                                <label style={{ marginTop:'0.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                                    <input type="checkbox" checked={currentItemData.showTitle} onChange={e=>changeField(focusIdx,'showTitle',e.target.checked)} /> Title
                                </label>
                                <label style={{ marginTop:'0.5rem', display:'flex', alignItems:'center', gap:'.5rem' }}>
                                    <input type="checkbox" checked={currentItemData.showDescription} onChange={e=>changeField(focusIdx,'showDescription',e.target.checked)} /> Description
                                </label>
                            </div>
                        )}
                    </div>
                    <button onClick={() => { setFocusIdx(null); setFixedToolbarPosition(null); }} style={{ marginLeft: 'auto' }}>✕</button>
                </div>
            )}
            {/* --- End of Fixed Toolbar Rendering --- */}

            {!itemsToRender && data.length === 0 && (
                <button
                    onClick={() => addEntry(null)}
                    style={{
                        fontSize: '0.875rem', color: '#2563EB',
                        background: 'transparent', border: 'none',
                        cursor: 'pointer', marginBottom: '1rem'
                    }}
                >
                    ➕ Add Hobby
                </button>
            )}

            {renderIndices.map((idx) => {
                if (idx >= data.length) return null; 

                const item = data[idx];
                const isFocused = focusIdx === idx;
                const currentItemData = {
                    icon: item.icon || DEFAULT.icon,
                    title: item.title || '',
                    description: item.description || '',
                    showIcon: item.showIcon !== undefined ? item.showIcon : DEFAULT.showIcon,
                    showTitle: item.showTitle !== undefined ? item.showTitle : DEFAULT.showTitle,
                    showDescription: item.showDescription !== undefined ? item.showDescription : DEFAULT.showDescription,
                    alignment: item.alignment || DEFAULT.alignment,
                };

                return (
                    <div
                        key={idx}
                        ref={el => (cardRefs.current[idx] = el)} // NEW: Store ref for position calculation
                        style={{
                            position: 'relative',
                            padding: isFocused ? '0.75rem' : '0.5rem',
                            borderRadius: '0.375rem',
                            background: isFocused ? '#f9fafb' : 'transparent',
                            border: isFocused ? '1px solid #ddd' : '1px solid transparent',
                            breakInside: 'avoid',
                            WebkitColumnBreakInside: 'avoid',
                            pageBreakInside: 'avoid',
                            ...sectionStyle
                        }}
                        onClick={isFocused ? undefined : () => handleFocus(idx)}
                        onMouseDown={e=>e.stopPropagation()}
                    >
                        {/* INLINE TOOLBAR MARKUP REMOVED */}

                        <div style={{ display: 'flex', gap: '.2rem', marginBottom: currentItemData.description.trim() ? '.1rem' : '0', alignItems: 'flex-start' }}>
                            {currentItemData.showIcon && !disableIcons && (() => {
                                const IconComponent = ICON_MAP[currentItemData.icon];
                                return IconComponent ? (
                                    // 2. Wrap the icon in the pdf-icon-wrapper div
                                    <div className="pdf-icon-wrapper" style={{ flexShrink: 0 }}>
                                        {/* 3. Remove the relative positioning classes */}
                                        <IconComponent className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" />
                                    </div>
                                ) : null;
                            })()}

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                                {currentItemData.showTitle && (isFocused ? (<textarea id={`title-${idx}`} rows={1} value={currentItemData.title} onChange={e=>changeField(idx,'title',e.target.value)} onInput={e => { e.target.style.height='auto'; e.target.style.height=`${e.target.scrollHeight}px`; }} onFocus={() => handleFocus(idx)} onBlur={handleBlur} placeholder="Interest / Passion" className="hobby-input" style={{ width:'100%', fontSize: `${(0.8 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius:'.25rem', padding:'0.2rem', background:'#fff', outline:'none', textAlign:currentItemData.alignment, resize:'none', overflow:'hidden', boxSizing: 'border-box', color: design.titleColor, }} ref={el => (refs.current[`title-${idx}`] = el)} />) : (<div className="hobby-input" style={{ width:'100%', fontSize: `${(0.8 + offset).toFixed(3)}rem`, textAlign:currentItemData.alignment, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.1rem', color: currentItemData.title.trim() === '' ? '#a0a0a0' : design.titleColor, minHeight: '1.5rem' }} onClick={() => handleFocus(idx)}>{currentItemData.title || 'Interest / Passion'}</div>))}
                                {currentItemData.showDescription && (isFocused ? (<textarea ref={el => (refs.current[`desc-${idx}`] = el)} value={currentItemData.description} onChange={e=>changeField(idx,'description',e.target.value)} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} onFocus={() => handleFocus(idx)} onBlur={handleBlur} placeholder="Why it matters..." className="hobby-input" style={{ width:'100%', border:'1px solid #ccc', borderRadius:'.25rem', padding:'0.2rem', fontSize: `${(0.6 + offset).toFixed(3)}rem`, resize:'vertical', minHeight:'40px', background:'#fff', outline:'none', textAlign:currentItemData.alignment, boxSizing: 'border-box', color: '#080808' }} />) : (<div className="hobby-input" style={{ width:'100%', fontSize: `${(0.6 + offset).toFixed(3)}rem`, textAlign:currentItemData.alignment, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.1rem', color: currentItemData.description.trim() === '' ? '#a0a0a0' : '#080808', minHeight: '2rem' }} onClick={() => handleFocus(idx)}>{currentItemData.description || 'Why it matters...'}</div>))}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
