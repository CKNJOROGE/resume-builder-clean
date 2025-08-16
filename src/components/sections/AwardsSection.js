import React, { useState, useRef, useEffect } from 'react';
import { Award, Star, Trophy, Medal, Gem } from 'lucide-react';

const ICON_MAP = { Gem, Star, Trophy, Medal, Award };

// An array of the available icon names
const ICONS = Object.keys(ICON_MAP); // ['Gem', 'Star', 'Trophy', 'Medal', 'Award']

const DEFAULT = {
  name: '',
  icon: ICONS[0], // The default icon is now the string 'Gem'
  showIcon: true,
  showDescription: false,
  description: '',
};

export default function AwardsSection({
  data = [],
  onEdit,
  itemsToRender,
  sectionStyle = {},
  headingStyle = {},
  design = {},
}) {
  const sliderPx = parseFloat(design.fontSize) || 0;
  const offset = sliderPx / 30;
  const [activeIdx, setActiveIdx] = useState(null);
  const [settingsMode, setSettingsMode] = useState(false);
  const cardRefs = useRef({});
  const popupRef = useRef(null);
  const refs = useRef({});
  const blurTimeout = useRef(null);

  useEffect(() => {
    const initialData = data.length === 0 ? [{ ...DEFAULT }] : data;
    const cleanedData = initialData.map(item => ({
      ...DEFAULT,
      ...item,
      name: item.name || '',
      description: item.description || '',
      icon: item.icon || DEFAULT.icon,
      showIcon: item.showIcon !== undefined ? item.showIcon : DEFAULT.showIcon,
      showDescription: item.showDescription !== undefined ? item.showDescription : DEFAULT.showDescription,
    }));
    if (JSON.stringify(cleanedData) !== JSON.stringify(data)) {
        onEdit(cleanedData);
    }
  }, [data, onEdit]);

  useEffect(() => {
    if (activeIdx !== null) {
      const nameEl = refs.current[`name-${activeIdx}`];
      const descEl = refs.current[`desc-${activeIdx}`];
      [nameEl, descEl].forEach(el => {
        if (el && el.tagName === 'TEXTAREA') {
          el.style.height = 'auto';
          el.style.height = `${el.scrollHeight}px`;
        }
      });
    }
  }, [data, activeIdx]);

  useEffect(() => {
    const handleClickOutside = e => {
      if (activeIdx == null) return;
      const cardEl = cardRefs.current[activeIdx];
      const clickedInsideCardOrToolbar = (cardEl && cardEl.contains(e.target)) || (popupRef.current && popupRef.current.contains(e.target));

      if (!clickedInsideCardOrToolbar) {
        const isInputField = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        if (!isInputField) {
          setActiveIdx(null);
          setSettingsMode(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeIdx]);

  const commit = arr => onEdit(arr);

  const addAt = idx => {
    const copy = [...data];
    copy.splice(idx + 1, 0, { ...DEFAULT });
    commit(copy);
    setActiveIdx(idx + 1);
    setSettingsMode(false);
    setTimeout(() => {
      refs.current[`name-${idx + 1}`]?.focus();
    }, 0);
  };

  const removeAt = idx => {
    const copy = [...data];
    copy.splice(idx, 1);
    commit(copy);
    setActiveIdx(null);
    setSettingsMode(false);
  };

  const moveUp = idx => {
    if (idx === 0) return;
    const copy = [...data];
    [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
    commit(copy);
    setActiveIdx(idx - 1);
  };

  const moveDown = idx => {
    if (idx === data.length - 1) return;
    const copy = [...data];
    [copy[idx + 1], copy[idx]] = [copy[idx], copy[idx + 1]];
    commit(copy);
    setActiveIdx(idx + 1);
  };

  const changeAt = (idx, key, val) => {
    const copy = data.map((it, i) => i === idx ? { ...it, [key]: val } : it);
    commit(copy);
  };

  const toggleCard = idx => {
    if (activeIdx === idx) {
      setActiveIdx(null);
      setSettingsMode(false);
    } else {
      setActiveIdx(idx);
      setSettingsMode(false);
    }
  };

  const handleFocus = (idx) => {
    clearTimeout(blurTimeout.current);
    setActiveIdx(idx);
  };

  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => setActiveIdx(null), 150);
  };

  // FIX: Determine indices to render from itemsToRender (if provided) or data
  const renderIndices = itemsToRender && itemsToRender.length > 0 ? itemsToRender : data.map((_, i) => i);

  return (
    <div>
      {!itemsToRender && data.length === 0 && (
        <button
          onClick={() => { commit([{ ...DEFAULT }]); setActiveIdx(0); }}
          style={{
            ...sectionStyle,
            fontSize: '0.875rem', color: '#2563EB', background: 'transparent',
            border: 'none', cursor: 'pointer', marginBottom: '1rem',
          }}
        >
          ➕ Entry
        </button>
      )}

      {/* FIX: Map over the stable renderIndices array */}
      {renderIndices.map((idx) => {
        if (idx >= data.length) return null; // Safeguard

        // FIX: Access the item data using the stable index
        const item = data[idx];
        const isActive = idx === activeIdx;
        const {
          icon, name, description,
          showIcon, showDescription,
        } = {
          ...DEFAULT, ...item,
          name: item.name || '',
          description: item.description || '',
          icon: item.icon || DEFAULT.icon,
          showIcon: item.showIcon !== undefined ? item.showIcon : DEFAULT.showIcon,
          showDescription: item.showDescription !== undefined ? item.showDescription : DEFAULT.showDescription,
        };

        return (
          <div
            key={idx} // FIX: Use stable index for the key
            ref={el => (cardRefs.current[idx] = el)}
            onClick={isActive ? undefined : () => toggleCard(idx)}
            style={{
              ...sectionStyle,
              position: 'relative',
              padding: isActive ? '0.5rem 0.5rem' : '0.5rem 0.5rem',
              cursor: 'pointer',
              background: isActive ? '#f9fafb' : 'transparent',
              breakInside: 'avoid',
              WebkitColumnBreakInside: 'avoid',
              pageBreakInside: 'avoid',
              borderBottom: idx < data.length - 1 ? '1px solid #e5e7eb' : 'none',
              borderRadius: isActive ? '0.375rem' : '0',
            }}
          >
            {isActive && (
              <div ref={popupRef} onMouseDown={e => e.preventDefault()} style={{ fontSize: '1rem', position: 'absolute', top: '-3rem', right: 0, display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#fff', border: '1px solid #ccc', borderRadius: '0.25rem', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '160px' }}>
                {!settingsMode ? (
                  <div style={{ display: 'flex', gap: '0.5rem', padding: '0.25rem', alignItems: 'center' }}>
                    <button onClick={() => addAt(idx)}>➕ Entry</button>
                    <button onClick={() => moveUp(idx)} disabled={idx === 0} style={{ opacity: idx === 0 ? 0.5 : 1, cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>⬆️</button>
                    <button onClick={() => moveDown(idx)} disabled={idx === data.length - 1} style={{ opacity: idx === data.length - 1 ? 0.5 : 1, cursor: idx === data.length - 1 ? 'not-allowed' : 'pointer' }}>⬇️</button>
                    <button onClick={() => removeAt(idx)}>🗑️</button>
                    <button onClick={() => setSettingsMode(true)}>⚙️</button>
                    <button onClick={() => { setActiveIdx(null); setSettingsMode(false); }} style={{ marginLeft: 'auto' }}>✕</button>
                  </div>
                ) : (
                  <div style={{ padding: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><input type="checkbox" checked={showIcon} onChange={e => {e.stopPropagation(); changeAt(idx, 'showIcon', e.target.checked);}} /> Show Icon</label>
                    {showIcon && (<div style={{ marginTop: '0.5rem', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.25rem' }}>
                      {ICONS.map(iconName => {
                        const IconComponent = ICON_MAP[iconName];
                        return (
                          <div className="pdf-icon-wrapper">
                          <IconComponent
                            key={iconName}
                            onClick={() => changeAt(idx, 'icon', iconName)}
                            className="w-6 h-6 cursor-pointer text-gray-500"
                            style={{ opacity: icon === iconName ? 1 : 0.5 }}
                          />
                          </div>
                        );
                      })}
                    </div>)}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}><input type="checkbox" checked={showDescription} onChange={e => {e.stopPropagation(); changeAt(idx, 'showDescription', e.target.checked);}} /> Show Description</label>
                    <button onClick={() => setSettingsMode(false)} style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#2563EB', background: 'transparent', border: 'none', cursor: 'pointer' }}>← Back</button>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
              {showIcon && (() => {
                const IconComponent = ICON_MAP[icon];
                return IconComponent ? <IconComponent className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0 relative top-2" /> : null;
              })()}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                {isActive ? (
                  <textarea
                    id={`name-${idx}`} rows={1} value={name} onChange={e => { e.stopPropagation(); changeAt(idx, 'name', e.target.value); }} onInput={e => { e.target.style.height='auto'; e.target.style.height=`${e.target.scrollHeight}px`; }} onFocus={() => handleFocus(idx)} onBlur={() => handleBlur()} placeholder="Award Name" className="award-input" style={{ width: '100%', fontSize: `${(0.8 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius: '.25rem', padding:'.1rem', background:'#fff', outline:'none', textAlign: (item.alignment || 'left'), resize:'none', overflow:'hidden', boxSizing: 'border-box', color: design.titleColor }} ref={el => (refs.current[`name-${idx}`] = el)}
                  />
                ) : (
                  <div className="award-input" style={{ width: '100%', fontSize: `${(0.8 + offset).toFixed(3)}rem`, textAlign: (item.alignment || 'left'), whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.1rem', color: (name || '').trim() === '' ? '#a0a0a0' : design.titleColor, minHeight: '1.5rem' }} onClick={() => handleFocus(idx)}>
                    {name || 'Award Name'}
                  </div>
                )}
                {showDescription && (isActive ? (
                  <textarea
                    ref={el => (refs.current[`desc-${idx}`] = el)} value={description} onChange={e => { e.stopPropagation(); changeAt(idx, 'description', e.target.value); }} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} onFocus={() => handleFocus(idx)} onBlur={() => handleBlur()} placeholder="Add a description..." className="award-input" style={{ width: '100%', border: isActive ? '1px solid #ccc' : 'none', borderRadius: '.25rem', padding: '0.1rem', fontSize: `${(0.6 + offset).toFixed(3)}rem`, resize: 'vertical', minHeight: '40px', background: '#fff', outline: 'none', textAlign: (item.alignment || 'left'), boxSizing: 'border-box', color: '#080808' }}
                  />
                ) : (
                  <div className="award-input" style={{ width: '100%', fontSize: `${(0.6 + offset).toFixed(3)}rem`, textAlign: (item.alignment || 'left'), whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.1rem', color: (description || '').trim() === '' ? '#a0a0a0' : '#080808', minHeight: '2rem' }} onClick={() => handleFocus(idx)}>
                    {description || 'Add a description...'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}