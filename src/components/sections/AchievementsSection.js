import React, { useState, useEffect, useRef } from 'react';
import { Gem, Trophy, Star, Medal, Award } from 'lucide-react';

const ICON_MAP = { Gem, Trophy, Star, Medal, Award };
// An array of the available icon names
const ICONS = Object.keys(ICON_MAP);

const ALIGNMENTS = ['left', 'center', 'right', 'justify'];
const SETTINGS_OPTIONS = [
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
];

export default function AchievementsSection({
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
  const [showSettings, setShowSettings] = useState(false);
  const [settingsByIndex, setSettingsByIndex] = useState({});
  const [alignByIndex, setAlignByIndex] = useState({});
  const refs = useRef({});
  const alignRef = useRef(null);
  const settingsRef = useRef(null);
  const blurTimeout = useRef(null);
  const popupRef = useRef(null);

  const defaultSettings = SETTINGS_OPTIONS.reduce(
    (acc, { key }) => ({ ...acc, [key]: true }),
    {}
  );
  const defaultAlignment = 'left';
  const defaultIcon = ICONS[0];

  useEffect(() => {
    const newSettingsMap = {};
    const newAlignMap = {};

    data.forEach((item, i) => {
      const itemSettings = item.settings ? { ...item.settings } : { ...defaultSettings };
      newSettingsMap[i] = itemSettings;

      const itemAlign = item.align || defaultAlignment;
      newAlignMap[i] = itemAlign;
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
      const descEl = refs.current[`desc-${focusIdx}`];

      [titleEl, descEl].forEach(el => {
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
      if (showSettings && settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
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
  }, [showAlignOptions, showSettings, focusIdx]);

  const update = arr => onEdit(arr);

  const handleField = (idx, key, val) => {
    const arr = data.map((it, i) => (i === idx ? { ...it, [key]: val } : it));
    update(arr);
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
      title: '',
      description: '',
      icon: defaultIcon,
      showIcon: true,
      settings: { ...defaultSettings },
      align: defaultAlignment,
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
    setSettingsByIndex(prev => ({
      ...prev,
      [focusIdx]: { ...prev[focusIdx], showIcon: !currentItem.showIcon }
    }));
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
      idx === focusIdx
        ? { ...ach, settings: nextSettings }
        : ach
    );
    onEdit(updatedData);
    setSettingsByIndex(prev => ({
      ...prev,
      [focusIdx]: nextSettings
    }));
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
  
  // FIX: Determine indices to render from itemsToRender (if provided) or data
  const renderIndices = itemsToRender && itemsToRender.length > 0 ? itemsToRender : data.map((_, i) => i);

  return (
    <div style={{ position: 'relative' }} onMouseDown={e => e.stopPropagation()}>
      {/* FIX: Removed H2 title and HR */}

      {!itemsToRender && data.length === 0 && (
        <button
          onClick={addEntry}
          style={{
            fontSize: '0.875rem', color: '#2563EB',
            background: 'transparent', border: 'none',
            cursor: 'pointer', marginBottom: '1rem'
          }}
        >
          ➕ Add Achievement
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
          title: item.title || '',
          description: item.description || '',
          icon: item.icon || defaultIcon,
          showIcon: item.showIcon !== undefined ? item.showIcon : true,
        };

        return (
          <div
            key={idx} // FIX: Use stable index for the key
            style={{
              position: 'relative',
              padding: isFocused ? '0.5rem' : '0.25rem 0.5rem',
              background: isFocused ? '#f9fafb' : 'transparent',
              borderRadius: '.375rem',
              border: isFocused ? '1px solid #e5e7eb' : 'none',
              marginBottom: '0.5rem',
              breakInside: 'avoid',
              WebkitColumnBreakInside: 'avoid',
              pageBreakInside: 'avoid',
              ...sectionStyle
            }}
            onClick={isFocused ? undefined : () => handleFocus(idx)}
            onMouseDown={e => e.stopPropagation()}
          >
            {isFocused && (
              <div
                ref={popupRef}
                onMouseDown={e => e.preventDefault()}
                style={{
                  fontSize: '1rem',
                  position: 'absolute', top: '-3rem', right: 0,
                  display: 'flex', gap: '0.5rem', alignItems: 'center',
                  background: '#fff', border: '1px solid #ddd',
                  borderRadius: '.25rem', padding: '.25rem .5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)', zIndex: 10
                }}
              >
                <button onClick={addEntry}>➕ Entry</button>
                <button onClick={() => handleMoveEntryUp(idx)} disabled={idx === 0} style={{ opacity: idx === 0 ? 0.5 : 1, cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>⬆️</button>
                <button onClick={() => handleMoveEntryDown(idx)} disabled={idx === data.length - 1} style={{ opacity: idx === data.length - 1 ? 0.5 : 1, cursor: idx === data.length - 1 ? 'not-allowed' : 'pointer' }}>⬇️</button>
                <div ref={alignRef} style={{ position: 'relative' }}>
                  <button onClick={handleAlignClick}>T</button>
                  {showAlignOptions && (
                    <div style={{ position: 'absolute', top: '-4rem', right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      {ALIGNMENTS.map(a => (
                        <div key={a} style={{ padding: '.25rem .5rem', cursor: 'pointer' }} onClick={() => selectAlign(a)}>{a}</div>
                      ))}
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
                            return (
                              <IconComponent
                                key={iconName}
                                onClick={() => selectIcon(iconName)}
                                className="w-6 h-6 cursor-pointer text-gray-500"
                                style={{ opacity: currentItemData.icon === iconName ? 1 : 0.5 }}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* START: Code changes are here */}
            {/* 1. Changed alignItems from 'baseline' to 'flex-start' */}
            <div style={{ display: 'flex', gap: '.2rem', marginBottom: currentItemData.description.trim() ? '.5rem' : '0', alignItems: 'flex-start' }}>
                {currentItemData.showIcon && (() => {
                  const IconComponent = ICON_MAP[currentItemData.icon];
                  return IconComponent ? (
                    // 2. Wrapped the IconComponent in the pdf-icon-wrapper div
                    <div className="pdf-icon-wrapper">
                      {/* 3. Removed relative positioning classes */}
                      <IconComponent className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" />
                    </div>
                  ) : null;
                })()}
              {/* END: Code changes are here */}
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '.2rem' }}>
                {settings.title && (
                  isFocused ? (
                    <textarea
                      id={`title-${idx}`}
                      rows={1}
                      value={currentItemData.title}
                      onChange={e => handleField(idx, 'title', e.target.value)}
                      onInput={e => { e.target.style.height='auto'; e.target.style.height=`${e.target.scrollHeight}px`; }}
                      onFocus={() => handleFocus(idx)}
                      onBlur={handleBlur}
                      placeholder="Achievement Title"
                      className="achievement-input"
                      style={{ width: '100%', fontSize: `${(0.8 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.2rem', background: '#fff', outline: 'none', textAlign: align, resize: 'none', overflow: 'hidden', boxSizing: 'border-box', color: design.titleColor }}
                      ref={el => (refs.current[`title-${idx}`] = el)}
                    />
                  ) : (
                    <div className="achievement-input" style={{ width: '100%', fontSize: `${(0.8 + offset).toFixed(3)}rem`, textAlign: align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem', color: currentItemData.title.trim() === '' ? '#a0a0a0' : design.titleColor, minHeight: '1.5rem' }} onClick={() => handleFocus(idx)}>
                      {currentItemData.title || 'Achievement Title'}
                    </div>
                  )
                )}
                {settings.description && (
                  isFocused ? (
                    <textarea
                      ref={el => (refs.current[`desc-${idx}`] = el)}
                      value={currentItemData.description}
                      onChange={e => handleField(idx, 'description', e.target.value)}
                      onInput={e => {
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      onFocus={() => handleFocus(idx)}
                      onBlur={handleBlur}
                      placeholder="Brief description..."
                      className="achievement-input"
                      style={{ width: '100%', resize: 'none', overflow: 'hidden', border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.2rem', background: '#fff', outline: 'none', fontSize: `${(0.60 + offset).toFixed(3)}rem`, textAlign: align, boxSizing: 'border-box', color: '#080808' }}
                    />
                  ) : (
                    <div className="achievement-input" style={{ width: '100%', fontSize: `${(0.60 + offset).toFixed(3)}rem`, textAlign: align, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.2rem', color: currentItemData.description.trim() === '' ? '#a0a0a0' : '#080808', minHeight: '2rem' }} onClick={() => handleFocus(idx)}>
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