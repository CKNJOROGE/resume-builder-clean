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
  const alignRef    = useRef(null);
  const settingsRef = useRef(null);
  const blurTimeout = useRef(null);
  const popupRef = useRef(null);
  const refs = useRef({});

  useEffect(() => {
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
    setFocusIdx(pos);
    setTimeout(() => {
      refs.current[`title-${pos}`]?.focus();
    }, 0);
  };

  const removeEntry = idx => {
    const updated = data.filter((_,i) => i !== idx);
    commit(updated);
    setFocusIdx(null);
  };

  const moveUp = idx => {
    if (idx === 0) return;
    const updated = [...data];
    [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
    commit(updated);
    setFocusIdx(idx - 1);
  };

  const moveDown = idx => {
    if (idx === data.length - 1) return;
    const updated = [...data];
    [updated[idx + 1], updated[idx]] = [updated[idx], updated[idx + 1]];
    commit(updated);
    setFocusIdx(idx + 1);
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

  const handleFocus = (idx) => {
    clearTimeout(blurTimeout.current);
    setFocusIdx(idx);
  };

  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => setFocusIdx(null), 150);
  };

  useEffect(() => {
    if (focusIdx !== null) {
      const titleEl = refs.current[`title-${focusIdx}`];
      const descriptionEl = refs.current[`desc-${focusIdx}`];
      [titleEl, descriptionEl].forEach(el => {
        if (el && el.tagName === 'TEXTAREA') {
          el.style.height = 'auto';
          el.style.height = `${el.scrollHeight}px`;
        }
      });
    }
  }, [data, focusIdx]);

  useEffect(() => {
    function onClickOutside(e) {
      if (showAlign && alignRef.current && !alignRef.current.contains(e.target)) {
        setShowAlign(false);
      }
      if (showSettings && settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
      }
      if (focusIdx != null && popupRef.current && !popupRef.current.contains(e.target)) {
        const isInputField = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        if (!isInputField) {
          setFocusIdx(null);
        }
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [showAlign, showSettings, focusIdx]);

  const renderIndices = itemsToRender && itemsToRender.length > 0 ? itemsToRender : data.map((_, i) => i);

  return (
    <div onMouseDown={e=>e.stopPropagation()}>
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
            {isFocused && (
              <div ref={popupRef} onMouseDown={e=>e.preventDefault()} style={{ fontSize: '1rem', position:'absolute', top:'-2.5rem', right:0, display:'flex', gap:'0.5rem', alignItems:'center', background:'#fff', border:'1px solid #ddd', borderRadius:'.375rem', padding:'.25rem', boxShadow:'0 1px 3px rgba(0,0,0,0.1)', zIndex:10 }}>
                <button onClick={()=>addEntry(idx)}>➕ Entry</button>
                <button onClick={() => moveUp(idx)} disabled={idx === 0} style={{ opacity: idx === 0 ? 0.5 : 1, cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>⬆️</button>
                <button onClick={() => moveDown(idx)} disabled={idx === data.length - 1} style={{ opacity: idx === data.length - 1 ? 0.5 : 1, cursor: idx === data.length - 1 ? 'not-allowed' : 'pointer' }}>⬇️</button>
                <div ref={alignRef} style={{ position:'relative' }}><button onClick={handleAlignClick}>T</button>{showAlign && (<div style={{ position:'absolute', top:'-3rem', right:0, background:'#fff', border:'1px solid #ddd', borderRadius:'.25rem', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>{ALIGNMENTS.map(a => (<div key={a} style={{ padding:'0.25rem .5rem', cursor:'pointer', textTransform:'capitalize' }} onClick={()=>handleSelectAlign(a)}>{a}</div>))}</div>)}</div>
                <button onClick={() => removeEntry(idx)} style={{ color: '#dc2626' }}>🗑️</button>
                <div ref={settingsRef} style={{ position:'relative' }}>
                  <button onClick={()=>setShowSettings(s=>!s)}>⚙️</button>
                  {showSettings && (
                    <div style={{ position:'absolute', top:'-4rem', right:0, background:'#fff', border:'1px solid #ddd', borderRadius:'.375rem', boxShadow:'0 1px 3px rgba(0,0,0,0.1)', padding:'0.5rem', minWidth:'160px', zIndex:11 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <input type="checkbox" checked={currentItemData.showIcon} onChange={e=>changeField(idx,'showIcon',e.target.checked)} /> Icon
                      </label>
                      {currentItemData.showIcon && (
                        <div style={{ marginTop:'0.25rem', display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'0.25rem' }}>
                          {ICON_PALETTE.map(iconName => {
                            const IconComponent = ICON_MAP[iconName];
                            return (
                              <IconComponent
                                key={iconName}
                                onClick={() => changeField(idx, 'icon', iconName)}
                                className="w-6 h-6 cursor-pointer text-gray-500"
                                style={{ opacity: currentItemData.icon === iconName ? 1 : 0.5 }}
                              />
                            );
                          })}
                        </div>
                      )}
                      <label style={{ marginTop:'0.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                        <input type="checkbox" checked={currentItemData.showTitle} onChange={e=>changeField(idx,'showTitle',e.target.checked)} /> Title
                      </label>
                      <label style={{ marginTop:'0.5rem', display:'flex', alignItems:'center', gap:'.5rem' }}>
                        <input type="checkbox" checked={currentItemData.showDescription} onChange={e=>changeField(idx,'showDescription',e.target.checked)} /> Description
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* START: Code changes are here */}
            <div style={{ display: 'flex', gap: '.2rem', marginBottom: currentItemData.description.trim() ? '.1rem' : '0', alignItems: 'flex-start' }}>
              {currentItemData.showIcon && !disableIcons && (() => {
                const IconComponent = ICON_MAP[currentItemData.icon];
                return IconComponent ? (
                  // 2. Wrap the icon in the pdf-icon-wrapper div
                  <div className="pdf-icon-wrapper">
                    {/* 3. Remove the relative positioning classes */}
                    <IconComponent className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" />
                  </div>
                ) : null;
              })()}
              {/* END: Code changes are here */}

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                {currentItemData.showTitle && (isFocused ? (<textarea id={`title-${idx}`} rows={1} value={currentItemData.title} onChange={e=>changeField(idx,'title',e.target.value)} onInput={e => { e.target.style.height='auto'; e.target.style.height=`${e.target.scrollHeight}px`; }} onFocus={() => handleFocus(idx)} onBlur={handleBlur} placeholder="Interest / Passion" className="hobby-input" style={{ width:'100%', fontSize: `${(0.8 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius:'.25rem', padding:'0.2rem', background:'#fff', outline:'none', textAlign:currentItemData.alignment, resize:'none', overflow:'hidden', boxSizing: 'border-box', color: design.titleColor, }} ref={el => (refs.current[`title-${idx}`] = el)} />) : (<div className="hobby-input" style={{ width:'100%', fontSize: `${(0.8 + offset).toFixed(3)}rem`, textAlign:currentItemData.alignment, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.1rem', color: currentItemData.title.trim() === '' ? '#a0a0a0' : design.titleColor, minHeight: '1.5rem' }} onClick={() => handleFocus(idx)}>{currentItemData.title || 'Interest / Passion'}</div>))}
                {currentItemData.showDescription && (isFocused ? (<textarea ref={el => (refs.current[`desc-${idx}`] = el)} value={currentItemData.description} onChange={e=>changeField(idx,'description',e.target.value)} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} onFocus={() => handleFocus(idx)} onBlur={handleBlur} placeholder="Why it matters..." className="hobby-input" style={{ width:'100%', border:isFocused?'1px solid #ccc':'none', borderRadius:'.25rem', padding:'0.2rem', fontSize: `${(0.6 + offset).toFixed(3)}rem`, resize:'vertical', minHeight:'40px', background:'#fff', outline:'none', textAlign:currentItemData.alignment, boxSizing: 'border-box', color: '#080808' }} />) : (<div className="hobby-input" style={{ width:'100%', fontSize: `${(0.6 + offset).toFixed(3)}rem`, textAlign:currentItemData.alignment, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.1rem', color: currentItemData.description.trim() === '' ? '#a0a0a0' : '#080808', minHeight: '2rem' }} onClick={() => handleFocus(idx)}>{currentItemData.description || 'Why it matters...'}</div>))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}