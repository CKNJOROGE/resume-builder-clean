import React, { useState, useEffect, useRef } from 'react';

const ALIGNMENTS = ['left', 'center', 'right', 'justify'];

export default function SummarySection({
  data = [''],
  onEdit,
  itemsToRender,
  onChangeAlignment,
  onRemoveSection,
  sectionStyle = {},
  headingStyle = {},
  design = {}
}) {
  const sliderPx = parseFloat(design.fontSize) || 0;
  const offset = sliderPx / 30;

  const initialEntries = Array.isArray(data) ? data : (typeof data === 'string' ? data.split(/\n\s*\n/).filter(e => e !== '') : ['']);
  const [local, setLocal] = useState(initialEntries.length ? initialEntries : ['']);
  const [focusIdx, setFocusIdx] = useState(null);
  const [showAlignOptions, setShowAlignOptions] = useState(false);

  const refs = useRef([]);
  const alignRef = useRef(null);
  const blurTimeout = useRef(null);

  useEffect(() => {
    const newEntries = Array.isArray(data) ? data : (typeof data === 'string' ? data.split(/\n\s*\n/).filter(e => e !== '') : ['']);
    const normalized = newEntries.length ? newEntries : [''];
    if (JSON.stringify(normalized) !== JSON.stringify(local)) {
      setLocal(normalized);
    }
  }, [data, local]);

  useEffect(() => {
    if (focusIdx !== null) {
      const el = refs.current[focusIdx];
      if (el) {
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
      }
    }
  }, [local, focusIdx]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (showAlignOptions && alignRef.current && !alignRef.current.contains(e.target)) {
        setShowAlignOptions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAlignOptions]);

  const commit = arr => {
    setLocal(arr);
    onEdit(arr);
  };

  const handleChange = (i, e) => {
    const copy = [...local];
    copy[i] = e.target.value;
    commit(copy);
  };

  const handleAdd = () => {
    const i = focusIdx == null ? local.length - 1 : focusIdx;
    const copy = [...local];
    copy.splice(i + 1, 0, '');
    commit(copy);
    setTimeout(() => refs.current[i + 1]?.focus(), 0);
  };

  const handleAlignClick = () => setShowAlignOptions(show => !show);
  const handleSelectAlign = align => {
    onChangeAlignment(align);
    setShowAlignOptions(false);
  };

  const handleBullet = () => {
    if (focusIdx == null) return;
    const copy = [...local];
    const text = copy[focusIdx] || '';
    const lines = text.split('\n').map(line => line.replace(/^•\s*/, ''));
    copy[focusIdx] = lines.map(line => `• ${line}`).join('\n');
    commit(copy);
    setTimeout(() => refs.current[focusIdx]?.focus(), 0);
  };

  const handleRemoveEntry = () => {
    if (focusIdx == null) return;
    const copy = [...local];
    copy.splice(focusIdx, 1);
    if (copy.length === 0) {
      onRemoveSection();
    } else {
      commit(copy);
      setTimeout(() => {
        const newIdx = Math.min(focusIdx, copy.length - 1);
        refs.current[newIdx]?.focus();
      }, 0);
    }
  };

  const currentTextAlign = design.summaryAlign || 'left';

  // FIX: Determine which indices to render. Use itemsToRender if available, otherwise generate from local state.
  const renderIndices = itemsToRender && itemsToRender.length > 0 ? itemsToRender : local.map((_, i) => i);

  return (
    <div
      style={{ position: 'relative', backgroundColor: focusIdx != null ? '#f9fafb' : 'transparent', padding: focusIdx != null ? '0.5rem' : 0 }}
      onMouseDown={e => e.stopPropagation()}
    >
      {focusIdx != null && (
        <div
          style={{ fontSize: '1rem', position: 'absolute', top: '-3rem', right: 0, display: 'flex', gap: '0.5rem', background: '#fff', border: '1px solid #ddd', borderRadius: '.5rem', padding: '.25rem ', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', alignItems: 'center' }}
          onMouseDown={e => e.preventDefault()}
        >
          <button style={{ backgroundColor: '#23ad17', color: '#ffffff', border: '0.1px solid #ddd', padding: '4px', borderTopLeftRadius: '.4rem', borderBottomLeftRadius: '.4rem' }} onClick={handleAdd}>+ Entry</button>
          <div ref={alignRef} style={{ position: 'relative' }}>
            <button onClick={handleAlignClick}>T</button>
            {showAlignOptions && (
              <div style={{ position: 'absolute', top: '-4rem', right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                {ALIGNMENTS.map(a => (
                  <div key={a} style={{ padding: '0.25rem .5rem', cursor: 'pointer' }} onClick={() => handleSelectAlign(a)}>
                    {a}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleBullet}>•</button>
          <button onClick={handleRemoveEntry} style={{ color: '#dc2626' }}>🗑️</button>
        </div>
      )}
      
      {/* FIX: Map over the stable renderIndices array */}
      {renderIndices.map((idx) => {
        if (idx >= local.length) return null; // Safeguard
        
        // FIX: Get the summary text using the stable index
        const txt = local[idx];

        return focusIdx === idx ? (
          <textarea
            key={idx} // Use stable index for the key
            ref={el => (refs.current[idx] = el)}
            style={{ color: '#080808', fontSize: `${(0.6 + offset).toFixed(3)}rem`, width: '100%', border: focusIdx != null ? '1px solid #ccc' : 'none', borderRadius: '.25rem', padding: '0.5rem', resize: 'none', overflow: 'hidden', whiteSpace: 'pre-wrap', wordBreak: 'break-word', textAlign: currentTextAlign }}
            value={txt}
            onChange={e => handleChange(idx, e)}
            onFocus={() => {
              clearTimeout(blurTimeout.current);
              blurTimeout.current = null;
              setFocusIdx(idx);
            }}
            onBlur={() => {
              blurTimeout.current = setTimeout(() => setFocusIdx(null), 150);
            }}
            placeholder="Write your summary..."
            rows={1}
          />
        ) : (
          <div
            key={idx} // Use stable index for the key
            style={{ color: '#080808', fontSize: `${(0.6 + offset).toFixed(3)}rem`, width: '100%', whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', textAlign: currentTextAlign, padding: '0.5rem' }}
            onClick={() => setFocusIdx(idx)}
          >
            {txt || 'Write your summary...'}
          </div>
        )
      })}
    </div>
  );
}