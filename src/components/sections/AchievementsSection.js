import React, { useState, useEffect, useRef } from 'react';
import { Gem, Trophy, Star, Medal, Award, Sparkles } from 'lucide-react';

const ICON_MAP = { Gem, Trophy, Star, Medal, Award };
const ICONS = Object.keys(ICON_MAP);

const ALIGNMENTS = ['left', 'center', 'right', 'justify'];
const SETTINGS_OPTIONS = [
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
];

export default function AchievementsSection({
  data = [],
  onEdit,
  itemsToRender,
  onChangeAlignment,
  sectionStyle = {},
  headingStyle = {},
  design = {},
}) {
  const { disableIcons = false } = design;
  const sliderPx = parseFloat(design.fontSize) || 0;
  const offset = sliderPx / 30;
  const [focusIdx, setFocusIdx] = useState(null);
  const [showAlignOptions, setShowAlignOptions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsByIndex, setSettingsByIndex] = useState({});
  const [alignByIndex, setAlignByIndex] = useState({});
  
  // --- STATE FOR THE AI FEATURE ---
  const [selectedText, setSelectedText] = useState('');
  const [popupPosition, setPopupPosition] = useState(null);
  const [suggestion, setSuggestion] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [activeTextarea, setActiveTextarea] = useState({ entryIndex: null, field: null });

  // --- NEW: Position-Aware Toolbar State ---
  const [fixedToolbarPosition, setFixedToolbarPosition] = useState(null);

  const refs = useRef({});
  const alignRef = useRef(null);
  const settingsRef = useRef(null);
  const blurTimeout = useRef(null);
  // popupRef is no longer needed to hide the toolbar on blur since we use the main entry ref/state.

  const defaultSettings = SETTINGS_OPTIONS.reduce((acc, { key }) => ({ ...acc, [key]: true }), {});
  const defaultAlignment = 'left';
  const defaultIcon = ICONS[0];

  useEffect(() => {
    const newSettingsMap = {};
    const newAlignMap = {};
    data.forEach((item, i) => {
      newSettingsMap[i] = item.settings ? { ...item.settings } : { ...defaultSettings };
      newAlignMap[i] = item.align || defaultAlignment;
    });
    if (JSON.stringify(newSettingsMap) !== JSON.stringify(settingsByIndex)) {
      setSettingsByIndex(newSettingsMap);
    }
    if (JSON.stringify(newAlignMap) !== JSON.stringify(alignByIndex)) {
      setAlignByIndex(newAlignMap);
    }
  }, [data, defaultAlignment, defaultSettings, settingsByIndex, alignByIndex]);

  useEffect(() => {
    if (focusIdx !== null) {
      // Auto-resize textareas
      const titleEl = refs.current[`title-${focusIdx}`];
      const descEl = refs.current[`desc-${focusIdx}`];
      [titleEl, descEl].forEach(el => {
        if (el && el.tagName === 'TEXTAREA') {
          el.style.height = 'auto';
          el.style.height = `${el.scrollHeight}px`;
        }
      });
      
      // Update fixed toolbar position after content resize
      const entryEl = refs.current[`entry-${focusIdx}`];
      if (entryEl) {
        const rect = entryEl.getBoundingClientRect();
        setFixedToolbarPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
      }
    }
  }, [data, focusIdx]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (showAlignOptions && alignRef.current && !alignRef.current.contains(e.target)) {
        setShowAlignOptions(false);
      }
      if (showSettings && settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAlignOptions, showSettings]);

  const update = arr => onEdit(arr);

  const handleField = (idx, key, val) => {
    const arr = data.map((it, i) => (i === idx ? { ...it, [key]: val } : it));
    update(arr);
  };

  // --- HELPER FUNCTIONS FOR THE AI FEATURE (Unchanged) ---
  const handleTextSelect = (e, entryIndex, field) => {
    const text = e.target.value.substring(e.target.selectionStart, e.target.selectionEnd);
    if (text.trim().length > 5) {
      const rect = e.target.getBoundingClientRect();
      setPopupPosition({
        top: rect.top + window.scrollY - 35,
        left: rect.left + window.scrollX,
      });
      setSelectedText(text);
      setActiveTextarea({ entryIndex, field });
    } else {
      setPopupPosition(null);
    }
  };

  const handleRephraseClick = async () => {
    if (!selectedText) return;
    setIsLoadingAI(true);
    setSuggestion('');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/rephrase/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedText }),
      });
      const data = await response.json();
      if (data.suggestion) {
        setSuggestion(data.suggestion);
      }
    } catch (error) {
      console.error("Error fetching AI suggestion:", error);
      alert("Could not get AI suggestion. Please try again.");
    } finally {
      setIsLoadingAI(false);
      setPopupPosition(null);
    }
  };

  const acceptSuggestion = () => {
    const { entryIndex, field } = activeTextarea;
    const entryData = data[entryIndex];
    const originalText = entryData[field];
    const updatedText = originalText.replace(selectedText, suggestion);
    handleField(entryIndex, field, updatedText);
    setSuggestion('');
  };
  // --- End of AI Feature Handlers ---

  // --- UPDATED Focus and Blur Handlers ---
  const handleFocus = (idx) => {
    clearTimeout(blurTimeout.current);
    setFocusIdx(idx);

    // Calculate and set the fixed toolbar position
    setTimeout(() => {
      const entryEl = refs.current[`entry-${idx}`];
      if (entryEl) {
        const rect = entryEl.getBoundingClientRect();
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
      setFocusIdx(null);
      setPopupPosition(null);
      setFixedToolbarPosition(null); // <-- Hide fixed toolbar
    }, 150);
  };
  // --- End of Focus/Blur Updates ---

  const addEntry = () => {
    const newEntry = {
      title: '', description: '', icon: defaultIcon, showIcon: true,
      settings: { ...defaultSettings }, align: defaultAlignment,
    };
    const updated = [...data, newEntry];
    update(updated);
    setFocusIdx(updated.length - 1);
    setTimeout(() => {
      refs.current[`title-${updated.length - 1}`]?.focus();
    }, 0);
  };

  const removeEntry = idx => {
    const arr = [...data];
    arr.splice(idx, 1);
    update(arr);
    setFocusIdx(null);
  };

  const handleMoveEntryUp = (idx) => {
    if (idx > 0) {
      const updated = [...data];
      [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
      update(updated);
      setFocusIdx(idx - 1);
    }
  };

  const handleMoveEntryDown = (idx) => {
    if (idx < data.length - 1) {
      const updated = [...data];
      [updated[idx + 1], updated[idx]] = [updated[idx], updated[idx + 1]];
      update(updated);
      setFocusIdx(idx + 1);
    }
  };

  const toggleShowIcon = () => {
    if (focusIdx == null) return;
    const currentItem = data[focusIdx];
    handleField(focusIdx, 'showIcon', !currentItem.showIcon);
  };

  const selectIcon = icon => {
    if (focusIdx == null) return;
    handleField(focusIdx, 'icon', icon);
  };

  const toggleSetting = key => {
    if (focusIdx == null) return;
    const curr = settingsByIndex[focusIdx] || defaultSettings;
    const nextSettings = { ...curr, [key]: !curr[key] };
    const updatedData = data.map((ach, idx) =>
      idx === focusIdx ? { ...ach, settings: nextSettings } : ach
    );
    onEdit(updatedData);
    setSettingsByIndex(prev => ({ ...prev, [focusIdx]: nextSettings }));
  };

  const handleAlignClick = () => setShowAlignOptions(s => !s);
  const selectAlign = a => {
    if (focusIdx != null) {
      const updatedData = data.map((item, index) =>
        index === focusIdx ? { ...item, align: a } : item
      );
      update(updatedData);
      setAlignByIndex(prev => ({ ...prev, [focusIdx]: a }));
    }
    setShowAlignOptions(false);
  };
  
  const renderIndices = itemsToRender && itemsToRender.length > 0 ? itemsToRender : data.map((_, i) => i);

  return (
    <div style={{ position: 'relative' }}>
      {/* --- UI FOR THE AI FEATURE (Unchanged) --- */}
      {popupPosition && (
        <div style={{ position: 'fixed', top: popupPosition.top, left: popupPosition.left, zIndex: 100 }}>
          <button
            onMouseDown={handleRephraseClick}
            className="flex items-center gap-1 bg-purple-600 text-white px-2 py-1 rounded-md text-xs shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-105"
            disabled={isLoadingAI}
          >
            <Sparkles size={14} className={isLoadingAI ? "animate-spin" : ""} />
            {isLoadingAI ? 'Thinking...' : 'Improve'}
          </button>
        </div>
      )}

      {suggestion && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md animate-fade-in-up">
            <h3 className="font-bold text-lg mb-2">AI Suggestion</h3>
            <p className="text-sm text-gray-500 mb-1">Original:</p>
            <blockquote className="bg-gray-100 p-3 rounded text-sm mb-4 border-l-4 border-gray-300">"{selectedText}"</blockquote>
            <p className="text-sm text-gray-500 mb-1">Suggestion:</p>
            <blockquote className="bg-purple-100 p-3 rounded text-sm mb-6 border-l-4 border-purple-400">{suggestion}</blockquote>
            <div className="flex justify-end gap-3">
              <button onClick={() => setSuggestion('')} className="px-4 py-2 rounded text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={acceptSuggestion} className="px-4 py-2 rounded bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700">Accept Suggestion</button>
            </div>
          </div>
        </div>
      )}

      {!itemsToRender && data.length === 0 && (
        <button onClick={addEntry} style={{ fontSize: '0.875rem', color: '#2563EB', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '1rem' }}>
          ➕ Add Achievement
        </button>
      )}

      {renderIndices.map((idx) => {
        if (idx >= data.length) return null;
        const item = data[idx];
        const isFocused = focusIdx === idx;
        const settings = item.settings || defaultSettings;
        const align = item.align || defaultAlignment;
        const currentItemData = {
          title: item.title || '', description: item.description || '',
          icon: item.icon || defaultIcon, showIcon: item.showIcon !== undefined ? item.showIcon : true,
        };

        return (
          <div
            key={idx}
            // --- NEW: Add the ref to the entry div ---
            ref={el => (refs.current[`entry-${idx}`] = el)} 
            style={{
              position: 'relative', padding: isFocused ? '0.25rem' : '0.15rem 0.15rem',
              background: isFocused ? '#f9fafb' : 'transparent', borderRadius: '.375rem',
              border: isFocused ? '1px solid #e5e7eb' : 'none', marginBottom: '0.15rem',
              breakInside: 'avoid', WebkitColumnBreakInside: 'avoid', pageBreakInside: 'avoid',
              ...sectionStyle
            }}
            onClick={isFocused ? undefined : () => handleFocus(idx)}
          >
            
            {/* --- NEW: Fixed Toolbar Rendering --- */}
            {isFocused && fixedToolbarPosition && idx === focusIdx && (
              <div
                onMouseDown={e => e.preventDefault()}
                style={{
                  fontSize: '1rem',
                  position: 'fixed', // Key change: fixed position
                  top: fixedToolbarPosition.top + fixedToolbarPosition.height + window.scrollY, // Position below the entry
                  left: fixedToolbarPosition.left + window.scrollX,
                  width: fixedToolbarPosition.width,
                  display: 'flex',
                  justifyContent: 'flex-start',
                  gap: '0.5rem',
                  alignItems: 'center',
                  background: '#fff',
                  border: '1px solid #ddd',
                  borderTop: 'none',
                  borderRadius: '0 0 .25rem .25rem',
                  padding: '.25rem .5rem',
                  boxShadow: '0 5px 10px rgba(0,0,0,0.1)',
                  zIndex: 10,
                }}
              >
                <button onClick={addEntry} style={{ backgroundColor: '#23ad17', color: '#ffffff', border: '0.1px solid #ddd', padding: '4px', borderTopLeftRadius: '.4rem', borderBottomLeftRadius: '.4rem' }}>➕ Entry</button>
                <button onClick={() => handleMoveEntryUp(idx)} disabled={idx === 0} style={{ opacity: idx === 0 ? 0.5 : 1, cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>⬆️</button>
                <button onClick={() => handleMoveEntryDown(idx)} disabled={idx === data.length - 1} style={{ opacity: idx === data.length - 1 ? 0.5 : 1, cursor: idx === data.length - 1 ? 'not-allowed' : 'pointer' }}>⬇️</button>
                <div ref={alignRef} style={{ position: 'relative' }}>
                  <button onClick={handleAlignClick}>T</button>
                  {showAlignOptions && (
                    <div style={{ position: 'absolute', top: '-4rem', right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      {ALIGNMENTS.map(a => (<div key={a} style={{ padding: '.25rem .5rem', cursor: 'pointer' }} onClick={() => selectAlign(a)}>{a}</div>))}
                    </div>
                  )}
                </div>
                <button onClick={() => removeEntry(idx)} style={{ color: '#dc2626' }}>🗑️</button>
                <div ref={settingsRef} style={{ position: 'relative' }}>
                  <button onClick={() => setShowSettings(s => !s)}>⚙️</button>
                  {showSettings && (
                    <div style={{ position: 'absolute', top: '-4rem', right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '.5rem', width: '220px' }}>
                      {SETTINGS_OPTIONS.map(({ key, label }) => (
                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '.25rem 0' }}>
                          <span style={{ fontSize: '.875rem' }}>{label}</span>
                          <input type="checkbox" checked={settings[key]} onChange={() => toggleSetting(key)} style={{ cursor: 'pointer', width: '1.25rem', height: '1.25rem' }} />
                        </div>
                      ))}
                      <hr style={{ margin: '.5rem 0', border: 'none', borderBottom: '1px solid #eee' }} />
                      <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
                        <input type="checkbox" checked={currentItemData.showIcon} onChange={toggleShowIcon} />
                        Show Icon
                      </label>
                      {currentItemData.showIcon && (
                        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                          {ICONS.map(iconName => {
                            const IconComponent = ICON_MAP[iconName];
                            return (<IconComponent key={iconName} onClick={() => selectIcon(iconName)} className="w-6 h-6 cursor-pointer text-gray-500" style={{ opacity: currentItemData.icon === iconName ? 1 : 0.5 }} />);
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* --- End of Fixed Toolbar Rendering --- */}

            <div style={{ display: 'flex', gap: '.2rem', marginBottom: currentItemData.description.trim() ? '.15rem' : '0', alignItems: 'flex-start' }}>
              {currentItemData.showIcon && !disableIcons && (() => {
                const IconComponent = ICON_MAP[currentItemData.icon];
                return IconComponent ? (<div className="pdf-icon-wrapper"><IconComponent className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" 
                style={{ position: 'relative', top: '2px' }}
                /></div>) : null;
              })()}
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '.2rem' }}>
                {settings.title && (
                  isFocused ? (
                    <textarea
                      id={`title-${idx}`} rows={1} value={currentItemData.title}
                      onChange={e => handleField(idx, 'title', e.target.value)}
                      onInput={e => { e.target.style.height='auto'; e.target.style.height=`${e.target.scrollHeight}px`; }}
                      onFocus={() => handleFocus(idx)} onBlur={handleBlur}
                      onSelect={(e) => handleTextSelect(e, idx, 'title')}
                      placeholder="Achievement Title" className="achievement-input"
                      style={{ width: '100%', fontSize: `${(0.8 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.2rem', background: '#fff', outline: 'none', textAlign: align, resize: 'none', overflow: 'hidden', boxSizing: 'border-box', color: design.titleColor }}
                      ref={el => (refs.current[`title-${idx}`] = el)}
                    />
                  ) : (
                    <div className="achievement-input" style={{ width: '100%', fontSize: `${(0.8 + offset).toFixed(3)}rem`, textAlign: align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', padding: '0.2rem', color: currentItemData.title.trim() === '' ? '#a0a0a0' : design.titleColor, minHeight: '1.5rem' }} onClick={() => handleFocus(idx)}>
                      {currentItemData.title || 'Achievement Title'}
                    </div>
                  )
                )}
                {settings.description && (
                  isFocused ? (
                    <textarea
                      ref={el => (refs.current[`desc-${idx}`] = el)} value={currentItemData.description}
                      onChange={e => handleField(idx, 'description', e.target.value)}
                      onInput={e => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }}
                      onFocus={() => handleFocus(idx)} onBlur={handleBlur}
                      onSelect={(e) => handleTextSelect(e, idx, 'description')}
                      placeholder="Brief description..." className="achievement-input"
                      style={{ width: '100%', resize: 'none', overflow: 'hidden', border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.2rem', background: '#fff', outline: 'none', fontSize: `${(0.60 + offset).toFixed(3)}rem`, textAlign: align, boxSizing: 'border-box', color: '#080808' }}
                    />
                  ) : (
                    <div className="achievement-input" style={{ width: '100%', fontSize: `${(0.60 + offset).toFixed(3)}rem`, textAlign: align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', padding: '0.2rem', color: currentItemData.description.trim() === '' ? '#a0a0a0' : '#080808', minHeight: '2rem' }} onClick={() => handleFocus(idx)}>
                      {currentItemData.description || 'Brief description...'}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
