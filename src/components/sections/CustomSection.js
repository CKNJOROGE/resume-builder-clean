import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Sparkles } from 'lucide-react';

const deepCompare = (obj1, obj2) => {
    if (obj1 === obj2) return true;
    if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) return false;
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;
    for (const key of keys1) {
        if (!keys2.includes(key) || !deepCompare(obj1[key], obj2[key])) return false;
    }
    return true;
};

const ALIGNMENTS = ['left', 'center', 'right', 'justify'];
const SETTINGS_OPTIONS = [
    { key: 'title', label: 'Title' },
    { key: 'company', label: 'Subtitle / Company' },
    { key: 'dates', label: 'Time Period' },
    { key: 'location', label: 'Location' },
    { key: 'description', label: 'Description' },
    { key: 'bullets', label: 'Bullet Points' },
];

export default function CustomSection({
    data = [], onEdit, itemsToRender, sectionStyle = {},
    headingStyle = {}, onChangeAlignment, design = {}, isFirstOnPage = false,
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
    const [localIsPresent, setLocalIsPresent] = useState(false);
    const [selectedText, setSelectedText] = useState('');
    const [popupPosition, setPopupPosition] = useState(null);
    const [suggestion, setSuggestion] = useState('');
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [activeTextarea, setActiveTextarea] = useState({ entryIndex: null, field: null, bulletIndex: null });
    
    // NEW STATE FOR FIXED TOOLBAR
    const [fixedToolbarPosition, setFixedToolbarPosition] = useState(null); 
    
    const refs = useRef({}); // Refs for input/textarea fields
    const cardRefs = useRef({}); // Refs for the main entry divs
    const toolbarRef = useRef(null); // Ref for the main fixed toolbar
    const alignRef = useRef(null);
    const settingsRef = useRef(null);
    const blurTimeout = useRef(null);
    const aiPopupRef = useRef(null); // Ref for the AI rephrase popup

    const defaultSettings = SETTINGS_OPTIONS.reduce((acc, { key }) => ({ ...acc, [key]: true }), {});
    const defaultAlignment = 'left';

    useEffect(() => {
        // Initialization/Cleanup
        const newSettings = {}, newAlignments = {};
        data.forEach((item, i) => {
            newSettings[i] = item.settings || { ...defaultSettings };
            newAlignments[i] = item.align || defaultAlignment;
        });
        if (!deepCompare(settingsByIndex, newSettings)) setSettingsByIndex(newSettings);
        if (!deepCompare(alignByIndex, newAlignments)) setAlignByIndex(newAlignments);
    }, [data, defaultSettings, defaultAlignment]);

    useEffect(() => {
        // Auto-resize textareas and update toolbar position on data change/focusIdx
        if (focusIdx !== null) {
            const descEl = refs.current[`desc-${focusIdx}`];
            if (descEl) {
                descEl.style.height = 'auto';
                descEl.style.height = `${descEl.scrollHeight}px`;
            }
            if (data[focusIdx] && data[focusIdx].bullets) {
                data[focusIdx].bullets.forEach((_, bIdx) => {
                    const bulletEl = refs.current[`${focusIdx}-bullet-${bIdx}`];
                    if (bulletEl) {
                        bulletEl.style.height = 'auto';
                        bulletEl.style.height = `${bulletEl.scrollHeight}px`;
                    }
                });
            }
            // Update fixed toolbar position after content resize
            const cardEl = cardRefs.current[focusIdx];
            if (cardEl) {
                const rect = cardEl.getBoundingClientRect();
                setFixedToolbarPosition({
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                });
            }
        }
    }, [data, focusIdx]);

    useEffect(() => {
        // Date Picker Management
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

    // UPDATED: Handle click outside logic to include the fixed toolbar
    useEffect(() => {
        function handleClickOutside(e) {
            if (focusIdx === null) return;
            
            const clickedOnToolbar = toolbarRef.current && toolbarRef.current.contains(e.target);
            const clickedOnCard = cardRefs.current[focusIdx] && cardRefs.current[focusIdx].contains(e.target);
            const clickedOnDatePicker = e.target.closest('.react-datepicker-popper') || e.target.closest('.react-datepicker');
            const clickedOnAIPopup = aiPopupRef.current && aiPopupRef.current.contains(e.target);

            // If click is outside the card, outside the fixed toolbar, outside date picker, and not on the AI popup
            if (!clickedOnCard && !clickedOnToolbar && !clickedOnDatePicker && !clickedOnAIPopup) {
                const isInputField = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON';
                if (!isInputField) {
                    setFocusIdx(null);
                    setShowAlignOptions(false);
                    setShowSettingsOptions(false);
                    setFixedToolbarPosition(null);
                    setPopupPosition(null); // Hide AI selection popup
                }
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [focusIdx]);

    useEffect(() => () => clearTimeout(blurTimeout.current), []);

    const updateData = updated => onEdit(updated);
    const handleFieldChange = (idx, key, val) => {
        const updated = [...data];
        updated[idx] = { ...updated[idx], [key]: val };
        updateData(updated);
    };
    const handleBulletChange = (idx, bIdx, val) => {
        const updated = [...data];
        if (updated[idx] && updated[idx].bullets) {
            updated[idx].bullets[bIdx] = val;
            updateData(updated);
        }
    };
    
    // UPDATED: handleFocusWithDelay to calculate fixed toolbar position
    const handleFocusWithDelay = (idx) => {
        clearTimeout(blurTimeout.current);
        setFocusIdx(idx);
        setShowAlignOptions(false);
        setShowSettingsOptions(false);
        setPopupPosition(null); // Hide AI selection popup on new focus

        // Calculate and set the fixed toolbar position
        setTimeout(() => {
            const cardEl = cardRefs.current[idx];
            if (cardEl) {
                const rect = cardEl.getBoundingClientRect();
                setFixedToolbarPosition({
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                });
            }
        }, 0);
    };
    
    const handleBlurWithDelay = () => {
        // We let the useEffect handleClickOutside manage actual blur/focusIdx reset
    };

    const parseDatesForPicker = (dateString) => {
        // (Implementation remains the same)
        let startDateObj = null, endDateObj = null, isPresent = false;
        if (dateString) {
            const parts = dateString.split(' - ');
            if (parts[0]) {
                const startParts = parts[0].trim().split('/');
                if (startParts.length === 2) startDateObj = new Date(parseInt(startParts[1], 10), parseInt(startParts[0], 10) - 1, 1);
                else if (startParts.length === 1 && startParts[0].length === 4) startDateObj = new Date(parseInt(startParts[0], 10), 0, 1);
            }
            if (parts.length === 2) {
                if (parts[1].trim().toLowerCase() === 'present') isPresent = true;
                else {
                    const endParts = parts[1].trim().split('/');
                    if (endParts.length === 2) endDateObj = new Date(parseInt(endParts[1], 10), parseInt(endParts[0], 10) - 1, 1);
                    else if (endParts.length === 1 && endParts[0].length === 4) endDateObj = new Date(parseInt(endParts[0], 10), 0, 1);
                }
            }
        }
        return { startDateObj, endDateObj, isPresent };
    };

    const formatDatesForStorage = (startDateObj, endDateObj, isPresent) => {
        let startDisplay = startDateObj ? `${(startDateObj.getMonth() + 1).toString().padStart(2, '0')}/${startDateObj.getFullYear()}` : '';
        let endDisplay = isPresent ? 'Present' : (endDateObj ? `${(endDateObj.getMonth() + 1).toString().padStart(2, '0')}/${endDateObj.getFullYear()}` : '');
        return startDisplay && endDisplay ? `${startDisplay} - ${endDisplay}` : startDisplay;
    };
    const handleDateRangeChange = (dates) => {
        const [start, end] = dates;
        setLocalStartDate(start);
        setLocalEndDate(end);
        let newIsPresent = (end === null) ? localIsPresent : false;
        if (end !== null) setLocalIsPresent(false);
        const formattedDateString = formatDatesForStorage(start, end, newIsPresent);
        handleFieldChange(focusIdx, 'dates', formattedDateString);
    };
    const handlePresentToggle = () => {
        const newIsPresent = !localIsPresent;
        setLocalIsPresent(newIsPresent);
        const endDate = newIsPresent ? null : localEndDate;
        if (newIsPresent) setLocalEndDate(null);
        const formattedDateString = formatDatesForStorage(localStartDate, endDate, newIsPresent);
        handleFieldChange(focusIdx, 'dates', formattedDateString);
    };
    const addEntry = () => {
        const updated = [...data, { title: '', company: '', dates: '', location: '', description: '', bullets: [''] }];
        updateData(updated);
        setTimeout(() => {
            handleFocusWithDelay(updated.length - 1); // Use the updated focus handler
            refs.current[`title-${updated.length - 1}`]?.focus();
        }, 0);
    };
    const removeEntry = idx => {
        const updated = [...data];
        updated.splice(idx, 1);
        updateData(updated);
        setFocusIdx(null);
        setFixedToolbarPosition(null); // Hide toolbar on remove
    };
    const addBulletAt = (idx, bIdx, content = '') => {
        const updated = [...data];
        updated[idx].bullets.splice(bIdx + 1, 0, content);
        updateData(updated);
        setTimeout(() => {
            refs.current[`${idx}-bullet-${bIdx + 1}`]?.focus();
            if (refs.current[`${idx}-bullet-${bIdx + 1}`]) {
                const newBulletEl = refs.current[`${idx}-bullet-${bIdx + 1}`];
                newBulletEl.selectionStart = newBulletEl.selectionEnd = 0;
            }
        }, 0);
    };
    const removeBullet = (idx, bIdx) => {
        const updated = [...data];
        if (updated[idx].bullets.length > 1) {
            updated[idx].bullets.splice(bIdx, 1);
            updateData(updated);
        } else {
            updated[idx].bullets[0] = '';
            updateData(updated);
        }
    };
    const handleMoveEntryUp = (idx) => {
        if (idx > 0) {
            const updated = [...data];
            [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
            updateData(updated);
            handleFocusWithDelay(idx - 1);
        }
    };
    const handleMoveEntryDown = (idx) => {
        if (idx < data.length - 1) {
            const updated = [...data];
            [updated[idx + 1], updated[idx]] = [updated[idx], updated[idx + 1]];
            updateData(updated);
            handleFocusWithDelay(idx + 1);
        }
    };
    const handleAlignClick = () => setShowAlignOptions(s => !s);
    const handleSelectAlign = a => {
        if (focusIdx != null) {
            const updatedData = data.map((item, index) => index === focusIdx ? { ...item, align: a } : item);
            updateData(updatedData);
            setAlignByIndex(prev => ({ ...prev, [focusIdx]: a }));
        }
        setShowAlignOptions(false);
        onChangeAlignment?.(a);
    };
    const toggleSetting = key => {
        if (focusIdx == null) return;
        const currSettings = settingsByIndex[focusIdx] || { ...defaultSettings };
        const nextSettings = { ...currSettings, [key]: !currSettings[key] };
        const updatedData = data.map((item, idx) => idx === focusIdx ? { ...item, settings: nextSettings } : item);
        onEdit(updatedData);
        setSettingsByIndex(prev => ({ ...prev, [focusIdx]: nextSettings }));
    };
    const handleTextSelect = (e, entryIndex, field, bulletIndex = null) => {
        const text = e.target.value.substring(e.target.selectionStart, e.target.selectionEnd);
        if (text.trim().length > 5) {
            const rect = e.target.getBoundingClientRect();
            // Position relative to the viewport
            setPopupPosition({ top: rect.top - 35, left: rect.left }); 
            setSelectedText(text);
            setActiveTextarea({ entryIndex, field, bulletIndex });
        } else {
            setPopupPosition(null);
        }
    };
    const handleRephraseClick = async () => {
        if (!selectedText) return;
        setIsLoadingAI(true);
        setSuggestion('');
        setPopupPosition(null); // Hide the selection popup immediately
        try {
            // ... (AI logic remains the same)
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/rephrase/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: selectedText }),
            });
            const data = await response.json();
            if (data.suggestion) setSuggestion(data.suggestion);
        } catch (error) {
            console.error("Error fetching AI suggestion:", error);
        } finally {
            setIsLoadingAI(false);
        }
    };
    const acceptSuggestion = () => {
        const { entryIndex, field, bulletIndex } = activeTextarea;
        const entryData = data[entryIndex];
        if (field === 'bullets') {
            const originalText = entryData.bullets[bulletIndex];
            const updatedText = originalText.replace(selectedText, suggestion);
            handleBulletChange(entryIndex, bulletIndex, updatedText);
        } else {
            const originalText = entryData[field];
            const updatedText = originalText.replace(selectedText, suggestion);
            handleFieldChange(entryIndex, field, updatedText);
        }
        setSuggestion('');
    };
    const renderIndices = itemsToRender && itemsToRender.length > 0 ? itemsToRender : data.map((_, i) => i);
    
    // Determine if the currently focused item should flip the toolbar
    const isFirstItemInChunk = focusIdx !== null && itemsToRender ? focusIdx === itemsToRender[0] : focusIdx === 0;
    const shouldFlipToolbar = focusIdx !== null && isFirstOnPage && isFirstItemInChunk;
    const TOOLBAR_HEIGHT = 40; // Approximate height of the toolbar

    return (
        <div style={{ position: 'relative' }}>
            {/* --- NEW: Fixed Toolbar Rendering --- */}
            {focusIdx !== null && fixedToolbarPosition && (
                <div
                    data-toolbar="fixed"
                    ref={toolbarRef}
                    style={{
                        fontSize: '1rem',
                        position: 'fixed',
                        // Calculate global Y position and offset for fixed positioning
                        top: shouldFlipToolbar 
                            ? fixedToolbarPosition.top - window.scrollY + fixedToolbarPosition.height + 8 // Below card
                            : fixedToolbarPosition.top - window.scrollY - TOOLBAR_HEIGHT - 8, // Above card
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
                    <button style={{ backgroundColor: '#23ad17', color: '#ffffff', border: '0.1px solid #ddd', padding: '4px', borderRadius: '.2rem' }} onClick={addEntry}>+ Entry</button>
                    <button onClick={() => handleMoveEntryUp(focusIdx)} disabled={focusIdx === 0} style={{ opacity: focusIdx === 0 ? 0.5 : 1, cursor: focusIdx === 0 ? 'not-allowed' : 'pointer' }}>⬆️</button>
                    <button onClick={() => handleMoveEntryDown(focusIdx)} disabled={focusIdx === data.length - 1} style={{ opacity: focusIdx === data.length - 1 ? 0.5 : 1, cursor: focusIdx === data.length - 1 ? 'not-allowed' : 'pointer' }}>⬇️</button>

                    <div ref={alignRef} style={{ position: 'relative' }}>
                        <button style={{ color: '#080808' }} onClick={handleAlignClick}>T</button>
                        {showAlignOptions && (
                            <div style={{ position: 'fixed', top: fixedToolbarPosition.top - window.scrollY + (shouldFlipToolbar ? TOOLBAR_HEIGHT + 8 : -160), right: window.innerWidth - fixedToolbarPosition.left - fixedToolbarPosition.width - 20, background: '#fff', border: '1px solid #ddd', borderRadius: '.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', zIndex: 110, minWidth: '80px' }}>
                                {ALIGNMENTS.map(a => (
                                    <div key={a} style={{ padding: '0.25rem .5rem', cursor: 'pointer', textAlign: a, background: (alignByIndex[focusIdx] || defaultAlignment) === a ? '#e5e7eb' : 'transparent' }} onClick={() => handleSelectAlign(a)}>{a}</div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <button onClick={() => removeEntry(focusIdx)} style={{ color: '#dc2626' }}>🗑️</button>
                    
                    <div ref={settingsRef} style={{ position: 'relative' }}>
                        <button onClick={() => setShowSettingsOptions(s => !s)}>⚙️</button>
                        {showSettingsOptions && (
                            <div style={{ position: 'fixed', top: fixedToolbarPosition.top - window.scrollY + (shouldFlipToolbar ? TOOLBAR_HEIGHT + 8 : -220), right: window.innerWidth - fixedToolbarPosition.left - fixedToolbarPosition.width - 20, background: '#fff', border: '1px solid #ddd', borderRadius: '.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '0.5rem', width: '220px', zIndex: 110 }}>
                                {SETTINGS_OPTIONS.map(({ key, label }) => (
                                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.25rem 0' }}>
                                        <span style={{ fontSize: '0.875rem' }}>{label}</span>
                                        <input type="checkbox" checked={(settingsByIndex[focusIdx] || defaultSettings)[key]} onChange={() => toggleSetting(key)} style={{ cursor: 'pointer', width: '1.25rem', height: '1.25rem' }} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={() => { setFocusIdx(null); setFixedToolbarPosition(null); }} style={{ marginLeft: 'auto' }}>✕</button>
                </div>
            )}
            {/* --- End of Fixed Toolbar Rendering --- */}
            
            {/* AI Rephrase Selection Popup (Fixed Position) */}
            {popupPosition && (
                <div ref={aiPopupRef} style={{ position: 'fixed', top: popupPosition.top, left: popupPosition.left, zIndex: 100 }}>
                    <button onMouseDown={handleRephraseClick} className="flex items-center gap-1 bg-purple-600 text-white px-2 py-1 rounded-md text-xs shadow-lg hover:bg-purple-700" disabled={isLoadingAI}>
                        <Sparkles size={14} className={isLoadingAI ? "animate-spin" : ""} />
                        {isLoadingAI ? 'Thinking...' : 'Improve'}
                    </button>
                </div>
            )}
            {/* AI Suggestion Modal (Remains Fixed/Modal) */}
            {suggestion && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md">
                        <h3 className="font-bold text-lg mb-2">AI Suggestion</h3>
                        <p className="text-sm text-gray-500 mb-1">Original:</p>
                        <blockquote className="bg-gray-100 p-3 rounded text-sm mb-4">"{selectedText}"</blockquote>
                        <p className="text-sm text-gray-500 mb-1">Suggestion:</p>
                        <blockquote className="bg-purple-100 p-3 rounded text-sm mb-6">{suggestion}</blockquote>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setSuggestion('')} className="px-4 py-2 rounded">Cancel</button>
                            <button onClick={acceptSuggestion} className="px-4 py-2 rounded bg-purple-600 text-white">Accept</button>
                        </div>
                    </div>
                </div>
            )}

            {!itemsToRender && data.length === 0 && (
                <button onClick={addEntry} style={{ fontSize: '0.875rem', color: '#2563EB' }}>
                    ➕ Add Entry
                </button>
            )}
            {renderIndices.map((idx) => {
                if (idx >= data.length) return null;
                const item = data[idx], isFocused = focusIdx === idx;
                const settings = item.settings || defaultSettings, align = item.align || defaultAlignment;

                return (
                    <div 
                        key={idx} 
                        ref={el => (cardRefs.current[idx] = el)} // NEW: Store ref for position calculation
                        style={{ 
                            position: 'relative', 
                            padding: isFocused ? '0.5rem' : '0.25rem 0.5rem', 
                            background: isFocused ? '#f9fafb' : 'transparent', 
                            borderRadius: '.375rem', 
                            border: isFocused ? '1px solid #e5e7eb' : 'none',
                            breakInside: 'avoid',
                            WebkitColumnBreakInside: 'avoid',
                            pageBreakInside: 'avoid',
                            ...sectionStyle 
                        }} 
                        onClick={isFocused ? undefined : () => handleFocusWithDelay(idx)}
                    >
                        {/* REMOVED INLINE TOOLBAR MARKUP */}
                        
                        <div style={{ breakInside: 'avoid' }}>
                            {settings.title && (isFocused ? (<textarea id={`title-${idx}`} rows={1} value={item.title} onChange={e => handleFieldChange(idx, 'title', e.target.value)} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} onFocus={() => handleFocusWithDelay(idx)} onBlur={handleBlurWithDelay} placeholder="Title" style={{ width: '100%', fontSize: `${(0.8 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.2rem', marginBottom: '0.5rem', background: '#fff', outline: 'none', textAlign: align, resize: 'none', overflow: 'hidden', whiteSpace: 'pre-wrap', wordBreak: 'break-word', boxSizing: 'border-box', color: design.titleColor }} ref={el => (refs.current[`title-${idx}`] = el)} onClick={e => e.stopPropagation()} />) : (<div style={{ width: '100%', fontSize: `${(0.8 + offset).toFixed(3)}rem`, textAlign: align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', padding: '0.2rem', minHeight: '1.5rem', color: design.titleColor }} onClick={() => handleFocusWithDelay(idx)}>{item.title || 'Title'}</div>))}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                {settings.company && (isFocused ? (<textarea id={`company-${idx}`} rows={1} value={item.company} onChange={e => handleFieldChange(idx, 'company', e.target.value)} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} onFocus={() => handleFocusWithDelay(idx)} onBlur={handleBlurWithDelay} placeholder="Subtitle / Company" style={{ flex: '1 1 auto', minWidth: '120px', fontSize: `${(0.675 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.2rem', background: '#fff', outline: 'none', textAlign: align, resize: 'none', overflow: 'hidden', whiteSpace: 'pre-wrap', wordBreak: 'break-word', boxSizing: 'border-box' }} ref={el => (refs.current[`company-${idx}`] = el)} onClick={e => e.stopPropagation()} />) : (<div style={{ flex: '1 1 auto', minWidth: '120px', fontSize: `${(0.675 + offset).toFixed(3)}rem`, textAlign: align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', padding: '0.2rem', minHeight: '1.5rem', color: item.company.trim() === '' ? '#a0a0a0' : 'inherit' }} onClick={() => handleFocusWithDelay(idx)}>{item.company || 'Subtitle / Company'}</div>))}
                                {settings.dates && (isFocused ? (<div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}><DatePicker selectsRange={true} startDate={localStartDate} endDate={localEndDate} onChange={handleDateRangeChange} dateFormat="MM/yyyy" showMonthYearPicker isClearable={true} onFocus={() => handleFocusWithDelay(idx)} onBlur={handleBlurWithDelay} placeholderText="MM/YYYY - MM/YYYY" customInput={<input style={{ color: '#080808', flex: '1 1 auto', minWidth: '100px', fontSize: `${(0.55 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.2rem', background: '#fff', outline: 'none', textAlign: align, boxSizing: 'border-box', cursor: 'pointer' }} />} /><label style={{ display: 'flex', alignItems: 'center', fontSize: `${(0.55 + offset).toFixed(3)}rem`, color: '#080808' }}><input type="checkbox" checked={localIsPresent} onChange={handlePresentToggle} onFocus={() => handleFocusWithDelay(idx)} onBlur={handleBlurWithDelay} style={{ marginRight: '0.25rem', width: '1rem', height: '1rem' }} />Present</label></div>) : (<div style={{ color: '#080808', flex: '1 1 auto', minWidth: '100px', fontSize: `${(0.55 + offset).toFixed(3)}rem`, textAlign: align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', padding: '0.2rem', minHeight: '1.5rem', color: item.dates.trim() === '' ? '#a0a0a0' : 'inherit' }} onClick={() => handleFocusWithDelay(idx)}>{item.dates || 'e.g. MM/YYYY - Present'}</div>))}
                                {settings.location && (isFocused ? (<textarea id={`location-${idx}`} rows={1} value={item.location} onChange={e => handleFieldChange(idx, 'location', e.target.value)} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} onFocus={() => handleFocusWithDelay(idx)} onBlur={handleBlurWithDelay} placeholder="Location" style={{ color: '#080808', flex: '1 1 auto', minWidth: '100px', fontSize: `${(0.55 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.2rem', background: '#fff', outline: 'none', textAlign: align, resize: 'none', overflow: 'hidden', whiteSpace: 'pre-wrap', wordBreak: 'break-word', boxSizing: 'border-box' }} ref={el => (refs.current[`location-${idx}`] = el)} onClick={e => e.stopPropagation()} />) : (<div style={{ color: '#080808', flex: '1 1 auto', minWidth: '100px', fontSize: `${(0.55 + offset).toFixed(3)}rem`, textAlign: align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', padding: '0.2rem', minHeight: '1.5rem', color: item.location.trim() === '' ? '#a0a0a0' : '#080808' }} onClick={() => handleFocusWithDelay(idx)}>{item.location || 'Location'}</div>))}
                            </div>
                        </div>
                        {settings.description && (isFocused ? (<textarea ref={el => (refs.current[`desc-${idx}`] = el)} value={item.description} onChange={e => handleFieldChange(idx, 'description', e.target.value)} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} onFocus={() => handleFocusWithDelay(idx)} onBlur={handleBlurWithDelay} onSelect={(e) => handleTextSelect(e, idx, 'description')} placeholder="Brief summary..." style={{ color: '#080808', width: '100%', border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.2rem', marginBottom: '0.75rem', resize: 'none', overflow: 'hidden', background: '#fff', outline: 'none', fontSize: `${(0.675 + offset).toFixed(3)}rem`, textAlign: align, boxSizing: 'border-box' }} />) : (<div style={{ width: '100%', marginBottom: '0.75rem', fontSize: `${(0.675 + offset).toFixed(3)}rem`, textAlign: align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', minHeight: '2rem', color: item.description.trim() === '' ? '#a0a0a0' : '#080808' }} onClick={() => handleFocusWithDelay(idx)}>{item.description || 'Brief summary...'}</div>))}
                        {settings.bullets && (
                            <ul style={{ listStyle: 'none', paddingLeft: '1.25rem', marginBottom: '0.5rem', color: '#080808' }}>
                                {item.bullets.map((bullet, bIdx) => (
                                    <li key={bIdx} style={{ marginBottom: '0.25rem', fontSize: `${(0.8 + offset).toFixed(3)}rem`, paddingLeft: '0', breakInside: 'avoid' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                            <span style={{ lineHeight: 1 }}>&bull;</span>
                                            {isFocused ? (
                                                <textarea ref={el => (refs.current[`${idx}-bullet-${bIdx}`] = el)} value={bullet} onChange={e => handleBulletChange(idx, bIdx, e.target.value)} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const currentBulletText = e.target.value, cursorPosition = e.target.selectionStart; const textBeforeCursor = currentBulletText.substring(0, cursorPosition), textAfterCursor = currentBulletText.substring(cursorPosition); handleBulletChange(idx, bIdx, textBeforeCursor); addBulletAt(idx, bIdx, textAfterCursor); } }} onFocus={() => handleFocusWithDelay(idx)} onBlur={handleBlurWithDelay} onSelect={(e) => handleTextSelect(e, idx, 'bullets', bIdx)} placeholder="Bullet point..." rows={1} style={{ flex: '1 1 auto', border: '1px solid #ccc', borderRadius: '.25rem', background: '#fff', outline: 'none', fontSize: `${(0.6 + offset).toFixed(3)}rem`, resize: 'none', overflow: 'hidden', padding: '0.25rem', textAlign: align, boxSizing: 'border-box' }} />
                                            ) : (
                                                <div style={{ flex: '1 1 auto', whiteSpace: 'pre-wrap', wordWrap: 'break-word', textAlign: align, fontSize: `${(0.6 + offset).toFixed(3)}rem`, padding: '0.25rem', minHeight: '1.5rem', color: bullet.trim() === '' ? '#a0a0a0' : 'inherit' }} onClick={() => handleFocusWithDelay(idx)}>{bullet || 'Bullet point...'}</div>
                                            )}
                                            {isFocused && (<button onMouseDown={e => { e.preventDefault(); removeBullet(idx, bIdx); }} style={{ fontSize: '0.75rem', color: '#dc2626', background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>)}
                                        </div>
                                    </li>
                                ))}
                                {isFocused && (<li><button onClick={() => addBulletAt(idx, item.bullets.length - 1)} style={{ fontSize: '0.875rem', color: '#2563EB', background: 'transparent', border: 'none', cursor: 'pointer', marginTop: '0.5rem', marginLeft: '-0.75rem' }}>➕ Bullet</button></li>)}
                            </ul>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
