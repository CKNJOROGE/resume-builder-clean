import React, { useState, useEffect, useRef } from 'react';

export default function PassionsSection({
  data = [],
  onEdit,
  itemsToRender,
  sectionStyle = {},
  headingStyle = {},
  design = {},
}) {
  const sliderPx = parseFloat(design.fontSize) || 0;
  const offset = sliderPx / 30;
  const [focusIdx, setFocusIdx] = useState(null);
  const blurTimeout = useRef(null);
  const popupRef = useRef();

  const addEntry = idx => {
    const updated = [...data];
    const pos = idx != null ? idx + 1 : 0;
    updated.splice(pos, 0, ''); // Adds an empty string
    onEdit(updated);
    setTimeout(() => {
      document.getElementById(`passion-${pos}`)?.focus();
    }, 0);
  };

  const removeEntry = idx => {
    const updated = [...data];
    updated.splice(idx, 1);
    onEdit(updated);
    setFocusIdx(null);
  };

  const moveUp = idx => {
    if (idx === 0) return;
    const updated = [...data];
    [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
    onEdit(updated);
    setFocusIdx(idx - 1);
  };

  const moveDown = idx => {
    if (idx === data.length - 1) return;
    const updated = [...data];
    [updated[idx + 1], updated[idx]] = [updated[idx], updated[idx + 1]];
    onEdit(updated);
    setFocusIdx(idx + 1);
  };

  const changeEntry = (idx, val) => {
    const updated = [...data];
    updated[idx] = val;
    onEdit(updated);
  };

  const handleFocus = (idx) => {
    clearTimeout(blurTimeout.current);
    setFocusIdx(idx);
  };

  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => {
      setFocusIdx(null);
    }, 150);
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        focusIdx != null &&
        popupRef.current &&
        !popupRef.current.contains(e.target) &&
        !e.target.classList.contains('passion-input')
      ) {
        setFocusIdx(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [focusIdx]);

  // FIX: Determine indices to render from itemsToRender (if provided) or data
  const renderIndices = itemsToRender && itemsToRender.length > 0 ? itemsToRender : data.map((_, i) => i);

  return (
    <div style={{ position: 'relative' }}>
      {!itemsToRender && data.length === 0 && (
        <button
          onClick={() => addEntry(null)}
          style={{
            fontSize: '1rem', color: '#2563EB', background: 'transparent',
            border: 'none', cursor: 'pointer', marginBottom: '1rem',
          }}
        >
          ➕ Entry
        </button>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {/* FIX: Map over the stable renderIndices array */}
        {renderIndices.map((idx) => {
          if (idx >= data.length) return null; // Safeguard

          // FIX: Access the passion string using the stable index
          const passion = data[idx];
          const isFocused = focusIdx === idx;
          const displayContent = (passion || '').trim() === '' ? 'Add your passion here...' : passion;

          return (
            <div key={idx} style={{ position: 'relative', breakInside: 'avoid', WebkitColumnBreakInside: 'avoid', pageBreakInside: 'avoid' }}>
              {isFocused && (
                <div
                  ref={popupRef}
                  onMouseDown={e => e.preventDefault()}
                  style={{ fontSize: '1rem', position: 'absolute', top: '-2.5rem', right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '0.25rem', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', display: 'flex', gap: '0.5rem', padding: '0.25rem', zIndex: 10 }}
                >
                  <button onClick={() => addEntry(idx)}>➕ Entry</button>
                  <button onClick={() => moveUp(idx)} disabled={idx === 0} style={{ opacity: idx === 0 ? 0.5 : 1, cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>⬆️</button>
                  <button onClick={() => moveDown(idx)} disabled={idx === data.length - 1} style={{ opacity: idx === data.length - 1 ? 0.5 : 1, cursor: idx === data.length - 1 ? 'not-allowed' : 'pointer' }}>⬇️</button>
                  <button onClick={() => removeEntry(idx)}>🗑️</button>
                  <button onClick={() => setFocusIdx(null)} style={{ marginLeft: 'auto' }}>×</button>
                </div>
              )}

              {isFocused ? (
                <textarea
                  id={`passion-${idx}`}
                  className="passion-input"
                  rows={1}
                  value={passion}
                  onChange={e => changeEntry(idx, e.target.value)}
                  onInput={e => {
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  onFocus={() => handleFocus(idx)}
                  onBlur={handleBlur}
                  placeholder="Describe your passion or interest..."
                  style={{ width: '100%', border: '1px solid #ccc', borderRadius: '.25rem', outline: 'none', resize: 'none', overflow: 'hidden', fontSize: `${(0.8 + offset).toFixed(3)}rem`, padding: '0.2rem', background: '#fff', marginBottom: '0.25rem', boxSizing: 'border-box', color: design.subtitleColor }}
                />
              ) : (
                <div
                  id={`passion-${idx}`}
                  className="passion-display"
                  style={{ width: '100%', border: 'none', whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', textAlign: sectionStyle.textAlign || 'left', fontSize: `${(0.7 + offset).toFixed(3)}rem`, padding: '0.2rem', minHeight: '2rem', color: (passion || '').trim() === '' ? '#a0a0a0' : design.subtitleColor }}
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