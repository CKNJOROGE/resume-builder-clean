import React, { useState, useEffect, useRef } from 'react';

const SETTINGS_OPTIONS = [
  { key: 'title',  label: 'Title'  },
  { key: 'author', label: 'Author' },
];
const defaultSettings = SETTINGS_OPTIONS.reduce(
  (acc, { key }) => ({ ...acc, [key]: true }),
  {}
);
const defaultAlignment = 'left';

const DEFAULT = {
  cover: '',
  title: '',
  author: '',
  settings: { ...defaultSettings },
  alignment: defaultAlignment,
};

const ALIGNMENTS = ['left', 'center', 'right', 'justify'];

export default function BooksSection({
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
  const [activeIdx, setActiveIdx]             = useState(null);
  const [showImageIdx, setShowImageIdx]       = useState(null);
  const [showToolbarAlign, setShowToolbarAlign] = useState(false);
  const [showToolbarSettings, setShowToolbarSettings] = useState(false);
  const [settingsByIndex, setSettingsByIndex]   = useState({});
  const [alignByIndex, setAlignByIndex]         = useState({});
  const popupRef    = useRef();
  const alignRef    = useRef(null);
  const settingsRef = useRef(null);
  const fileInputRef= useRef();
  const inputRefs = useRef({});

  useEffect(() => {
    const newSettingsMap = {};
    const newAlignMap    = {};
    data.forEach((item, i) => {
      newSettingsMap[i] = item.settings  || { ...defaultSettings };
      newAlignMap[i]    = item.alignment || defaultAlignment;
    });

    if (JSON.stringify(newSettingsMap) !== JSON.stringify(settingsByIndex)) {
      setSettingsByIndex(newSettingsMap);
    }
    if (JSON.stringify(newAlignMap) !== JSON.stringify(alignByIndex)) {
      setAlignByIndex(newAlignMap);
    }
  }, [data]);

  useEffect(() => {
    if (activeIdx !== null) {
      const titleEl = inputRefs.current[`title-${activeIdx}`];
      const authorEl = inputRefs.current[`author-${activeIdx}`];

      [titleEl, authorEl].forEach(el => {
        if (el && el.tagName === 'TEXTAREA') {
          el.style.height = 'auto';
          el.style.height = `${el.scrollHeight}px`;
        }
      });
    }
  }, [data, activeIdx]);


  useEffect(() => {
    function handleClickOutside(e) {
      if (showToolbarAlign     && alignRef.current     && !alignRef.current.contains(e.target)) {
        setShowToolbarAlign(false);
      }
      if (showToolbarSettings && settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowToolbarSettings(false);
      }
      if (
        activeIdx != null &&
        popupRef.current &&
        !popupRef.current.contains(e.target)
      ) {
        const isInputField = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        if (!isInputField) {
          setActiveIdx(null);
          setShowImageIdx(null);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showToolbarAlign, showToolbarSettings, activeIdx]);

  const updateAll = arr => onEdit(arr);

  const addAt     = idx => {
    const copy = [...data];
    copy.splice(idx + 1, 0, { ...DEFAULT });
    updateAll(copy);
    setActiveIdx(idx + 1);
    setTimeout(() => {
      inputRefs.current[`title-${idx + 1}`]?.focus();
    }, 0);
  };
  const removeAt = idx => {
    const copy = [...data];
    copy.splice(idx, 1);
    updateAll(copy);
    setActiveIdx(null);
  };
  const moveUp   = idx => {
    if (idx === 0) return;
    const copy = [...data];
    [copy[idx-1], copy[idx]] = [copy[idx], copy[idx-1]];
    updateAll(copy);
    setActiveIdx(idx-1);
  };

  const moveDown = idx => {
    if (idx === data.length - 1) return;
    const copy = [...data];
    [copy[idx + 1], copy[idx]] = [copy[idx], copy[idx + 1]];
    updateAll(copy);
    setActiveIdx(idx + 1);
  };

  const changeAt = (idx, key, val) => {
    const copy = data.map((it,i) => i===idx ? { ...it, [key]: val } : it);
    updateAll(copy);
  };

  const onFileChange = idx => e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => changeAt(idx, 'cover', reader.result);
    reader.readAsDataURL(file);
    setShowImageIdx(null);
  };

  const handleAlignToggle = () => setShowToolbarAlign(s => !s);
  const handleSelectAlign = a => {
    if (activeIdx != null) {
      const updatedData = data.map((item, index) =>
        index === activeIdx ? { ...item, alignment: a } : item
      );
      updateAll(updatedData);
      setAlignByIndex(prev => ({ ...prev, [activeIdx]: a }));
    }
    setShowToolbarAlign(false);
    onChangeAlignment?.(a);
  };

  const toggleSetting = key => {
    if (activeIdx == null) return;
    const curr         = settingsByIndex[activeIdx] || defaultSettings;
    const nextSettings = { ...curr, [key]: !curr[key] };
    const updatedData = data.map((item, idx) =>
      idx === activeIdx
        ? { ...item, settings: nextSettings }
        : item
    );
    onEdit(updatedData);
    setSettingsByIndex(prev => ({
      ...prev,
      [activeIdx]: nextSettings
    }));
  };
  
  // FIX: Determine indices to render from itemsToRender (if provided) or data
  const renderIndices = itemsToRender && itemsToRender.length > 0 ? itemsToRender : data.map((_, i) => i);

  return (
    <div>
      {/* FIX: Removed H2 title and HR */}

      {!itemsToRender && data.length === 0 && (
        <button
          onClick={() => { updateAll([{ ...DEFAULT }]); setActiveIdx(0); }}
          style={{
            ...sectionStyle,
            fontSize: '0.875rem',
            color: '#2563EB',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          ➕ Add Book
        </button>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, 110px)',
          justifyContent: 'start',
          gap: '0.5rem'
        }}
      >
        {/* FIX: Map over the stable renderIndices array */}
        {renderIndices.map((idx) => {
          if (idx >= data.length) return null; // Safeguard
          
          // FIX: Access the item data using the stable index
          const item = data[idx];
          const isActive = activeIdx === idx;
          const settingsState = settingsByIndex[idx] || defaultSettings;
          const align         = alignByIndex[idx]    || defaultAlignment;

          return (
            <div
              key={idx} // FIX: Use stable index for the key
              onClick={() => setActiveIdx(idx)}
              style={{
                width: '110px',
                ...sectionStyle,
                position: 'relative',
                padding: '0.5rem',
                borderRadius: '0.375rem',
                background: idx % 2 === 0 ? '#ffff' : '#fff',
                breakInside: 'avoid',
                WebkitColumnBreakInside: 'avoid',
                pageBreakInside: 'avoid',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '100%',
                  paddingBottom: '150%',
                  background: item.cover ? `url(${item.cover}) center/cover` : '#eee',
                  border: '1px solid #ddd',
                  marginBottom: '0.5rem',
                }}
              />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {settingsState.title && (
                  isActive ? (
                    <textarea
                      type="text"
                      value={item.title}
                      onChange={e => { e.stopPropagation(); changeAt(idx, 'title', e.target.value); }}
                      onInput={e => { e.target.style.height='auto'; e.target.style.height=`${e.target.scrollHeight}px`; }}
                      placeholder="Title"
                      rows={1}
                      style={{ border: 'none', borderBottom: '1px solid #ccc', outline: 'none', fontWeight: 600, fontSize: `${(0.675 + offset).toFixed(3)}rem`, textAlign: align, background: 'transparent', padding: 0, resize:'none', overflow:'hidden', whiteSpace:'pre-wrap', wordBreak:'break-word', color: '#080808' }}
                      onClick={e => e.stopPropagation()}
                      ref={el => (inputRefs.current[`title-${idx}`] = el)}
                    />
                  ) : (
                    <div style={{ fontWeight: 600, fontSize: `${(0.675 + offset).toFixed(3)}rem`, textAlign: align, whiteSpace:'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak:'break-word', minHeight: '1.5rem', color: (item.title || '').trim() === '' ? '#a0a0a0' : '#080808' }}>
                      {item.title || 'Title'}
                    </div>
                  )
                )}
                {settingsState.author && (
                  isActive ? (
                    <textarea
                      type="text"
                      value={item.author}
                      onChange={e => { e.stopPropagation(); changeAt(idx, 'author', e.target.value); }}
                      onInput={e => { e.target.style.height='auto'; e.target.style.height=`${e.target.scrollHeight}px`; }}
                      placeholder="Author(s)"
                      rows={1}
                      style={{ border: 'none', borderBottom: '1px solid #ccc', outline: 'none', fontSize: `${(0.55 + offset).toFixed(3)}rem`, color: 'inherit', textAlign: align, background: 'transparent', padding: 0, resize:'none', overflow:'hidden', whiteSpace:'pre-wrap', wordBreak:'break-word' }}
                      onClick={e => e.stopPropagation()}
                      ref={el => (inputRefs.current[`author-${idx}`] = el)}
                    />
                  ) : (
                    <div style={{ fontSize: `${(0.55 + offset).toFixed(3)}rem`, color: (item.author || '').trim() === '' ? '#a0a0a0' : 'inherit', textAlign: align, whiteSpace:'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak:'break-word', minHeight: '1.2rem' }}>
                      {item.author || 'Author(s)'}
                    </div>
                  )
                )}
              </div>

              {isActive && (
                <div
                  ref={popupRef}
                  onClick={e => e.stopPropagation()}
                  style={{ fontSize: '1rem', position: 'absolute', top: '-2.5rem', right: '0.5rem', background: '#fff', border: '1px solid #ddd', borderRadius: '0.375rem', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', padding: '0.25rem', display: 'flex', gap: '0.25rem', alignItems: 'center', zIndex: 10 }}
                >
                  <button onClick={() => addAt(idx)}>➕</button>
                  <button onClick={() => moveUp(idx)} disabled={idx === 0} style={{ opacity: idx === 0 ? 0.5 : 1, cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>⬆️</button>
                  <button onClick={() => moveDown(idx)} disabled={idx === data.length - 1} style={{ opacity: idx === data.length - 1 ? 0.5 : 1, cursor: idx === data.length - 1 ? 'not-allowed' : 'pointer' }}>⬇️</button>
                  <div ref={alignRef} style={{ position: 'relative' }}>
                    <button onClick={handleAlignToggle}>T</button>
                    {showToolbarAlign && (
                      <div style={{ position: 'absolute', top: '-4rem', right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '0.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        {ALIGNMENTS.map(a => (
                          <div key={a} style={{ padding: '0.25rem .5rem', cursor: 'pointer' }} onClick={() => handleSelectAlign(a)}>{a}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => setShowImageIdx(idx)}>🖼️</button>
                  <button onClick={() => removeAt(idx)}>🗑️</button>
                  <div ref={settingsRef} style={{ position: 'relative' }}>
                    <button onClick={() => setShowToolbarSettings(s => !s)}>⚙️</button>
                    {showToolbarSettings && (
                      <div style={{ position: 'absolute', top: '-4rem', right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '0.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '0.5rem', minWidth: '120px' }}>
                        {SETTINGS_OPTIONS.map(({ key, label }) => (
                          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <input type="checkbox" checked={settingsState[key]} onChange={() => toggleSetting(key)} />
                            {label}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => setActiveIdx(null)} style={{ marginLeft:'auto' }}>×</button>

                  {showImageIdx === idx && (
                    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.25rem', background: '#fff', border: '1px solid #ddd', borderRadius: '0.375rem', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', padding: '0.5rem', width: '160px' }}>
                      <button
                        onClick={() => fileInputRef.current.click()}
                        style={{ width: '100%', padding: '0.5rem', background: '#333', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                      >
                        Upload Cover
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display:'none' }}
                        onChange={onFileChange(idx)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}