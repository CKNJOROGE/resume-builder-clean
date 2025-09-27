import React, { useState, useRef, useEffect } from 'react';
import { Gem, Star, Trophy, Medal, Award } from 'lucide-react';

const ICON_MAP = { Gem, Star, Trophy, Medal, Award };
const ICONS = Object.keys(ICON_MAP);

// --- 1. ADD ALIGNMENT CONSTANTS ---
const ALIGNMENTS = ['left', 'center', 'right', 'justify'];

const DEFAULT = {
  title: '',
  description: '',
  icon: ICONS[0],
  uppercase: false,
  showIcon: true,
  showDescription: true,
  alignment: 'left', // --- 2. ADD DEFAULT ALIGNMENT ---
};

export default function ProfessionalStrengthsSection({
  data = [],
  onEdit,
  itemsToRender,
  sectionStyle = {},
  headingStyle = {},
  design = {},
}) {
  const { disableIcons = false } = design;
  const sliderPx = parseFloat(design.fontSize) || 0;
  const offset = sliderPx / 30;
  const [activeIdx, setActiveIdx] = useState(null);
  const [settingsMode, setSettingsMode] = useState(false);
  
  // --- 3. ADD STATE AND REF FOR ALIGNMENT DROPDOWN ---
  const [showAlignOptions, setShowAlignOptions] = useState(false);
  const alignRef = useRef(null);

  const cardRefs = useRef({});
  const popupRef = useRef();
  const inputRefs = useRef({});

  useEffect(() => {
    function handleClickOutside(e) {
      if (activeIdx == null) return;
      // --- 4. ADD LOGIC TO CLOSE ALIGNMENT DROPDOWN ON OUTSIDE CLICK ---
      if (showAlignOptions && alignRef.current && !alignRef.current.contains(e.target)) {
        setShowAlignOptions(false);
      }
      const card = cardRefs.current[activeIdx];
      const isInputField = e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT';
      if (
        card && !card.contains(e.target) &&
        popupRef.current && !popupRef.current.contains(e.target) &&
        !isInputField
      ) {
        setActiveIdx(null);
        setSettingsMode(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeIdx, showAlignOptions]);

  const commit = arr => onEdit(arr);

  const addAt = idx => {
    const copy = [...data];
    copy.splice(idx+1, 0, { ...DEFAULT });
    commit(copy);
    setActiveIdx(idx+1);
    setSettingsMode(false);
    setTimeout(() => {
      inputRefs.current[`title-${idx + 1}`]?.focus();
    }, 0);
  };
  
  const removeAt = idx => {
    const copy = [...data];
    copy.splice(idx,1);
    commit(copy);
    setActiveIdx(null);
    setSettingsMode(false);
  };
  
  const moveUp = idx => {
    if (idx === 0) return;
    const copy = [...data];
    [copy[idx-1], copy[idx]] = [copy[idx], copy[idx-1]];
    commit(copy);
    setActiveIdx(idx-1);
  };

  const moveDown = idx => {
    if (idx === data.length - 1) return;
    const copy = [...data];
    [copy[idx + 1], copy[idx]] = [copy[idx], copy[idx + 1]];
    commit(copy);
    setActiveIdx(idx + 1);
  };

  const changeAt = (idx, key, val) => {
    const copy = data.map((it,i)=> i===idx ? {...it,[key]:val} : it);
    commit(copy);
  };
  
  const toggleCard = idx => {
    if (activeIdx === idx) {
      setActiveIdx(null);
      setSettingsMode(false);
    } else {
      setActiveIdx(idx);
      setSettingsMode(false);
      setTimeout(() => {
        inputRefs.current[`title-${idx}`]?.focus();
      }, 0);
    }
  };

  // --- 5. ADD HANDLER FUNCTIONS FOR ALIGNMENT ---
  const handleAlignClick = () => setShowAlignOptions(s => !s);

  const handleSelectAlign = (align) => {
    if (activeIdx != null) {
      changeAt(activeIdx, 'alignment', align);
    }
    setShowAlignOptions(false);
  };
  
  const renderIndices = itemsToRender && itemsToRender.length > 0 ? itemsToRender : data.map((_, i) => i);

  return (
    <div>
      {!itemsToRender && data.length===0 && (
        <button
          onClick={()=>{ commit([{...DEFAULT}]); setActiveIdx(0); }}
          style={{ ...sectionStyle, fontSize:'0.875rem', color:'#2563EB', background:'transparent', border:'none', cursor:'pointer', marginBottom:'1rem' }}
        >➕ Entry</button>
      )}

      {renderIndices.map((idx)=> {
        if (idx >= data.length) return null;
        const item = data[idx];
        const isActive = idx === activeIdx;
        
        return (
          <div
            key={idx}
            ref={el=>cardRefs.current[idx]=el}
            style={{
              ...sectionStyle, position:'relative', padding:'0.25rem',
              background: isActive?'#f3f4f6': 'transparent', borderRadius:'0.375rem',
              marginBottom:'0.25rem', breakInside: 'avoid', WebkitColumnBreakInside: 'avoid',
              pageBreakInside: 'avoid', cursor:'pointer',
            }}
          >
            <div style={{ display:'flex', alignItems:'flex-start', gap:'0.2rem' }}>
              {item.showIcon && !disableIcons && (() => {
                const IconComponent = ICON_MAP[item.icon];
                return IconComponent ? (
                  <div className="pdf-icon-wrapper">
                    <IconComponent
                      className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0"
                      style={{ position: 'relative', top: '2px' }}
                    />
                  </div>
                ) : null;
              })()}
              <div style={{ flex:1 }} onClick={() => toggleCard(idx)}>
                {isActive ? (
                  <textarea
                    rows={1}
                    value={ item.uppercase ? item.title.toUpperCase() : item.title }
                    onChange={e=>{ e.stopPropagation(); changeAt(idx,'title',e.target.value); }}
                    onInput={e=>{ e.target.style.height='auto'; e.target.style.height=e.target.scrollHeight+'px'; }}
                    onFocus={()=>{ setActiveIdx(idx); setSettingsMode(false); }}
                    placeholder="Your Strength"
                    style={{
                      width:'100%', border:'none', borderBottom: isActive?'1px solid #ccc':'none',
                      background:'transparent', outline:'none', fontSize: `${(0.8 + offset).toFixed(3)}rem`,
                      marginBottom:'0.25rem', resize:'none', overflow:'hidden', whiteSpace:'pre-wrap',
                      wordBreak:'break-word', color: design.titleColor,
                      textAlign: item.alignment || 'left', // --- 6. APPLY ALIGNMENT STYLE ---
                    }}
                    onClick={e=>e.stopPropagation()}
                    ref={el => (inputRefs.current[`title-${idx}`] = el)}
                  />
                ) : (
                  <div
                    style={{
                      width:'100%', fontSize: `${(0.8 + offset).toFixed(3)}rem`, marginBottom:'0.25rem',
                      whiteSpace:'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word',
                      wordBreak:'break-word', minHeight: '1.5rem',
                      color: (item.title || '').trim() === '' ? '#a0a0a0' : design.titleColor,
                      textAlign: item.alignment || 'left', // --- 6. APPLY ALIGNMENT STYLE ---
                    }}
                  >
                    {(item.uppercase ? item.title.toUpperCase() : item.title) || 'Your Strength'}
                  </div>
                )}

                {item.showDescription && (
                  isActive ? (
                    <textarea
                      rows={1} value={item.description}
                      onChange={e=>{ e.stopPropagation(); changeAt(idx,'description',e.target.value); }}
                      onInput={e=>{ e.target.style.height='auto'; e.target.style.height=e.target.scrollHeight+'px'; }}
                      onFocus={()=>{ setActiveIdx(idx); setSettingsMode(false); }}
                      placeholder="Explain how it benefits your work."
                      style={{
                        width:'100%', border: isActive?'1px solid #ccc':'none',
                        borderRadius: isActive?'0.25rem':0, padding: isActive?'0.5rem':0,
                        outline:'none', fontSize: `${(0.675 + offset).toFixed(3)}rem`,
                        background:'transparent', resize:'none', overflow:'hidden',
                        whiteSpace:'pre-wrap', wordBreak:'break-word', color: '#080808',
                        textAlign: item.alignment || 'left', // --- 6. APPLY ALIGNMENT STYLE ---
                      }}
                      onClick={e=>e.stopPropagation()}
                      ref={el => (inputRefs.current[`description-${idx}`] = el)}
                    />
                  ) : (
                    <div
                      style={{
                        width:'100%', fontSize: `${(0.675 + offset).toFixed(3)}rem`,
                        whiteSpace:'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word',
                        wordBreak:'break-word', minHeight: '1.5rem',
                        color: (item.description || '').trim() === '' ? '#a0a0a0' : '#080808',
                        textAlign: item.alignment || 'left', // --- 6. APPLY ALIGNMENT STYLE ---
                      }}
                    >
                      {item.description || 'Explain how it benefits your work.'}
                    </div>
                  )
                )}
              </div>
            </div>

            {isActive && (
              <div
                ref={popupRef}
                onClick={e=>e.stopPropagation()}
                style={{
                  fontSize: '1rem', position:'absolute', top:'-3rem', right:'0.5rem',
                  background:'#fff', border:'1px solid #ccc', borderRadius:'0.375rem',
                  boxShadow:'0 2px 6px rgba(0,0,0,0.1)', zIndex:10, minWidth:'200px',
                }}
              >
                {!settingsMode ? (
                  <div style={{display:'flex',gap:'0.5rem',padding:'0.25rem',alignItems:'center'}}>
                    <button style={{ backgroundColor: '#23ad17', color: '#ffffff', border: '0.1px solid #ddd', padding: '4px', borderTopLeftRadius: '.4rem', borderBottomLeftRadius: '.4rem' }} onClick={()=>addAt(idx)}>+ Entry</button>
                    <button onClick={() => moveUp(idx)} disabled={idx === 0} style={{ opacity: idx === 0 ? 0.5 : 1, cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>⬆️</button>
                    <button onClick={() => moveDown(idx)} disabled={idx === data.length - 1} style={{ opacity: idx === data.length - 1 ? 0.5 : 1, cursor: idx === data.length - 1 ? 'not-allowed' : 'pointer' }}>⬇️</button>
                    
                    {/* --- 7. ADD ALIGNMENT BUTTON AND DROPDOWN TO TOOLBAR --- */}
                    <div ref={alignRef} style={{ position: 'relative' }}>
                        <button onClick={handleAlignClick}>T</button>
                        {showAlignOptions && (
                            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '5px', background: '#fff', border: '1px solid #ddd', borderRadius: '.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', zIndex: 11 }}>
                                {ALIGNMENTS.map(a => (
                                    <div key={a} style={{ padding: '0.25rem .5rem', cursor: 'pointer', textTransform: 'capitalize' }} onClick={() => handleSelectAlign(a)}>
                                        {a}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button style={{border: '0.1px solid #ddd', padding: '4px'   }} onClick={()=>removeAt(idx)}>🗑️</button>
                    <button style={{border: '0.1px solid #ddd', padding: '4px'  }} onClick={()=>setSettingsMode(true)}>⚙️</button>
                    <button onClick={()=>{ setActiveIdx(null); setSettingsMode(false); }} style={{border: '0.1px solid #ddd', marginLeft:'auto', padding: '4px', borderTopRightRadius: '0.4rem', borderBottomRightRadius: '0.4rem' }}>×</button>
                  </div>
                ) : (
                  <div style={{padding:'0.5rem'}}>
                    <label style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                      <input type="checkbox" checked={item.uppercase} onChange={e=>changeAt(idx,'uppercase',e.target.checked)} />
                      Uppercase Title
                    </label>
                    <label style={{display:'flex',alignItems:'center',gap:'0.5rem',marginTop:'0.5rem'}}>
                      <input type="checkbox" checked={item.showIcon} onChange={e=>changeAt(idx,'showIcon',e.target.checked)} />
                      Show Icon
                    </label>
                    {item.showIcon && (
                      <div style={{ marginTop: '0.5rem', display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '0.25rem' }}>
                        {ICONS.map(iconName => {
                          const IconComponent = ICON_MAP[iconName];
                          return (
                            <IconComponent key={iconName} onClick={() => changeAt(idx, 'icon', iconName)} className="w-6 h-6 cursor-pointer text-gray-500" style={{ opacity: item.icon === iconName ? 1 : 0.5 }} 
                            />
                          );
                        })}
                      </div>
                    )}
                    <label style={{display:'flex',alignItems:'center',gap:'0.5rem',marginTop:'0.5rem'}}>
                      <input type="checkbox" checked={item.showDescription} onChange={e=>changeAt(idx,'showDescription',e.target.checked)} />
                      Show Description
                    </label>
                    <button onClick={()=>setSettingsMode(false)} style={{marginTop:'0.5rem',fontSize:'0.75rem',color:'#2563EB'}} >← Back</button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}