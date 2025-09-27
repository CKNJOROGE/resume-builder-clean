import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react'; // Import the icon

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

  // --- STATE FOR THE AI FEATURE ---
  const [selectedText, setSelectedText] = useState('');
  const [popupPosition, setPopupPosition] = useState(null);
  const [suggestion, setSuggestion] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [activeTextarea, setActiveTextarea] = useState({ entryIndex: null });

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

  // --- HELPER FUNCTIONS FOR THE AI FEATURE ---
  const handleTextSelect = (e, entryIndex) => {
    const text = e.target.value.substring(e.target.selectionStart, e.target.selectionEnd);
    if (text.trim().length > 5) {
      const rect = e.target.getBoundingClientRect();
      setPopupPosition({
        top: rect.top + window.scrollY - 35,
        left: rect.left + window.scrollX,
      });
      setSelectedText(text);
      setActiveTextarea({ entryIndex });
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
    const { entryIndex } = activeTextarea;
    const originalText = local[entryIndex];
    const updatedText = originalText.replace(selectedText, suggestion);

    const newLocal = [...local];
    newLocal[entryIndex] = updatedText;
    commit(newLocal);

    setSuggestion('');
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
  const renderIndices = itemsToRender && itemsToRender.length > 0 ? itemsToRender : local.map((_, i) => i);

  return (
    <div
      style={{ position: 'relative', backgroundColor: focusIdx != null ? '#f9fafb' : 'transparent', padding: focusIdx != null ? '0.5rem' : 0 }}
    >
      {/* --- UI FOR THE AI FEATURE --- */}
      {popupPosition && (
        <div style={{ position: 'fixed', top: popupPosition.top, left: popupPosition.left, zIndex: 100 }}>
          <button
            onMouseDown={handleRephraseClick} // Using onMouseDown for reliability
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
      
      {renderIndices.map((idx) => {
        if (idx >= local.length) return null;
        const txt = local[idx];

        return focusIdx === idx ? (
          <textarea
            key={idx}
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
              blurTimeout.current = setTimeout(() => {
                setFocusIdx(null);
                setPopupPosition(null); // Hide AI button on blur
              }, 150);
            }}
            placeholder="Write your summary..."
            rows={1}
            onSelect={(e) => handleTextSelect(e, idx)} // Add the onSelect handler
          />
        ) : (
          <div
            key={idx}
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