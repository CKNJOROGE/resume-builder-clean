import React, { useState, useRef, useEffect } from 'react';

export default function SkillsSection({
  data = [],
  onEdit,
  itemsToRender,
  isMeasuring,
  sectionStyle = {},
  headingStyle = {},
  design={}
}) {
  const sliderPx = parseFloat(design.fontSize) || 0;
  const offset = sliderPx / 30;
  const [focusIdx, setFocusIdx] = useState(null);
  const blurTimeout = useRef(null);
  const popupRef = useRef();
  const refs = useRef({});

  // FIX: All state updates are wrapped in a setTimeout to prevent race conditions.
  const addEntry = (idx) => {
    const updated = [...data];
    const pos = idx != null ? idx + 1 : 0;
    updated.splice(pos, 0, '');
    onEdit(updated);

    setTimeout(() => {
      setFocusIdx(pos);
      refs.current[`skill-${pos}`]?.focus();
    }, 0);
  };

  const removeEntry = (idx) => {
    const updated = [...data];
    updated.splice(idx, 1);
    onEdit(updated);
    setFocusIdx(null);
  };

  const moveUp = (idx) => {
    if (idx === 0) return;
    const updated = [...data];
    [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
    onEdit(updated);
    setFocusIdx(idx - 1);
  };

  const moveDown = (idx) => {
    if (idx === data.length - 1) return;
    const updated = [...data];
    [updated[idx + 1], updated[idx]] = [updated[idx], updated[idx + 1]];
    onEdit(updated);
    setFocusIdx(idx + 1);
  };

  const changeEntry = (idx, value) => {
    const updated = [...data];
    updated[idx] = value;
    onEdit(updated);
  };

  useEffect(() => {
    if (focusIdx !== null) {
      const el = refs.current[`skill-${focusIdx}`];
      if (el) {
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
      }
    }
  }, [data, focusIdx]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (focusIdx != null && popupRef.current && !popupRef.current.contains(e.target) && !e.target.classList.contains('skill-input')) {
        setFocusIdx(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [focusIdx]);

  const handleFocus = (idx) => {
    clearTimeout(blurTimeout.current);
    setFocusIdx(idx);
  };

  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => setFocusIdx(null), 150);
  };

  const renderIndices = (itemsToRender && itemsToRender.length > 0)
    ? itemsToRender
    : data.map((_, i) => i);

  return (
    <div>
      {!itemsToRender && data.length === 0 && (
        <button
          onClick={() => addEntry(null)}
          style={{ fontSize: '0.875rem', color: '#2563EB', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '1rem' }}
        >
          ➕ Entry
        </button>
      )}

      <div>
        {renderIndices.map((idx) => {
          if (idx >= data.length) return null;
          
          const skill = data[idx];
          const isFocused = focusIdx === idx;
          const displayContent = (skill || '').trim() === '' ? 'Add your skill here...' : skill;

          return (
            <div
              key={idx}
              style={{
                ...sectionStyle,
                position: 'relative',
              }}
            >
              {!isMeasuring && isFocused && (
                <div ref={popupRef} onMouseDown={e => e.preventDefault()} style={{ fontSize: '1rem', position: 'absolute', top: '-2.5rem', right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '0.5rem', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', display: 'flex', gap: '0.5rem', padding: '0.25rem', zIndex: 10 }}>
                  <button style={{ backgroundColor: '#23ad17', color: '#ffffff', border: '0.1px solid #ddd', padding: '4px', borderTopLeftRadius: '.4rem', borderBottomLeftRadius: '.4rem' }} onClick={() => addEntry(idx)}>➕ Entry</button>
                  <button onClick={() => moveUp(idx)} disabled={idx === 0} style={{ opacity: idx === 0 ? 0.5 : 1, cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>⬆️</button>
                  <button onClick={() => moveDown(idx)} disabled={idx === data.length - 1} style={{ opacity: idx === data.length - 1 ? 0.5 : 1, cursor: idx === data.length - 1 ? 'not-allowed' : 'pointer' }}>⬇️</button>
                  <button onClick={() => removeEntry(idx)}>🗑️</button>
                  <button onClick={() => setFocusIdx(null)} style={{ marginLeft: 'auto' }}>×</button>
                </div>
              )}
              {isFocused ? (
                <textarea
                  id={`skill-${idx}`}
                  className="skill-input"
                  rows={1}
                  value={skill}
                  onChange={e => changeEntry(idx, e.target.value)}
                  onInput={e => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }}
                  onFocus={() => handleFocus(idx)}
                  onBlur={handleBlur}
                  placeholder="Skill"
                  style={{ width: '100%', border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.2rem', marginBottom: '0.2rem', resize: 'none', overflow: 'hidden', background: '#fff', outline: 'none', fontSize: `${(0.6 + offset).toFixed(3)}rem`, boxSizing: 'border-box' }}
                  ref={el => (refs.current[`skill-${idx}`] = el)}
                />
              ) : (
                <div
                  id={`skill-${idx}`}
                  className="skill-display"
                  style={{ width: '100%', border: 'none', whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', fontSize: `${(0.6 + offset).toFixed(3)}rem`, padding: '0.2rem', minHeight: '1.5rem', color: displayContent === 'Add your skill here...' ? '#a0a0a0' : 'inherit' }}
                  onClick={() => handleFocus(idx)}
                >
                  {displayContent}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}