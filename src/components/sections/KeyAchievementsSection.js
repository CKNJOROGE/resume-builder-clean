import React, { useState, useRef, useEffect } from 'react';

const ICONS = ['💎','🏆','⭐','🎖️','🏅'];
const DEFAULT = {
  title: '',
  description: '',
  icon: ICONS[0],
  uppercase: false,
  showIcon: true,
  showDescription: true,
};

export default function KeyAchievementsSection({
  data = [],
  onEdit,
  sectionStyle = {},
  headingStyle = {},
  design = {},
}) {
  const sliderPx = parseFloat(design.fontSize) || 0;
  const offset = sliderPx / 30;
  const [activeIdx, setActiveIdx]       = useState(null);
  const [settingsMode, setSettingsMode] = useState(false);
  const cardRefs                        = useRef({});
  const popupRef                        = useRef();

  // Close toolbar/settings when clicking outside
  useEffect(() => {
    const handleClickOutside = e => {
      if (activeIdx == null) return;
      const cardEl = cardRefs.current[activeIdx];
      if (
        cardEl && !cardEl.contains(e.target) &&
        popupRef.current && !popupRef.current.contains(e.target)
      ) {
        setActiveIdx(null);
        setSettingsMode(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeIdx]);

  const commit = arr => onEdit(arr);

  const addAt = idx => {
    const copy = [...data];
    copy.splice(idx+1, 0, { ...DEFAULT });
    commit(copy);
    setActiveIdx(idx+1);
    setSettingsMode(false);
  };
  const removeAt = idx => {
    const copy = [...data];
    copy.splice(idx,1);
    commit(copy);
    setActiveIdx(null);
    setSettingsMode(false);
  };
  const moveUp = idx => {
    if(idx===0) return;
    const copy=[...data];
    [copy[idx-1],copy[idx]] = [copy[idx],copy[idx-1]];
    commit(copy);
    setActiveIdx(idx-1);
  };
  const changeAt = (idx,key,val) => {
    const copy = data.map((it,i)=> i===idx ? {...it,[key]:val} : it);
    commit(copy);
  };
  const toggleCard = idx => {
    if(activeIdx===idx) {
      setActiveIdx(null);
      setSettingsMode(false);
    } else {
      setActiveIdx(idx);
      setSettingsMode(false);
    }
  };

  return (
    <div>
      <h2 style={{...headingStyle, marginBottom:'0.5rem'}}>KEY ACHIEVEMENTS</h2>
      <hr style={{border:'none',borderBottom:'1px solid #ddd', marginBottom:'1rem'}} />

      {/* global “➕ Entry” only when empty */}
      {data.length===0 && (
        <button
          onClick={()=>{ commit([{...DEFAULT}]); setActiveIdx(0); }}
          style={{
            ...sectionStyle,
            fontSize:'0.875rem',
            color:'#2563EB',
            background:'transparent',
            border:'none',
            cursor:'pointer',
            marginBottom:'1rem'
          }}
        >➕ Entry</button>
      )}

      {data.map((item,idx)=> {
        const isActive = idx===activeIdx;
        return (
          <div
            key={idx}
            ref={el=>cardRefs.current[idx]=el}
            onClick={()=>toggleCard(idx)}
            style={{
              ...sectionStyle,
              position:'relative',
              padding:'0.75rem',
              background: isActive?'#f3f4f6': (idx%2===0?'#fafafb':'#fff'),
              borderRadius:'0.375rem',
              marginBottom:'0.5rem',
              cursor:'pointer',
            }}
          >
            <div style={{display:'flex',alignItems:'flex-start',gap:'0.75rem'}}>
              {item.showIcon && (
                <div style={{fontSize:'1.25rem',marginTop:'2px'}}>
                  {item.icon}
                </div>
              )}
              <div style={{flex:1}}>
                <input
                  type="text"
                  value={item.uppercase? item.title.toUpperCase() : item.title}
                  onChange={e=>{ e.stopPropagation(); changeAt(idx,'title',e.target.value); }}
                  onFocus={()=>{ setActiveIdx(idx); setSettingsMode(false); }}
                  placeholder="Your Achievement"
                  style={{
                    ...sectionStyle,
                    width:'100%',
                    border:'none',
                    borderBottom: isActive?'1px solid #ccc':'none',
                    background:'transparent',
                    outline:'none',
                    fontWeight:600,
                    fontSize:'1rem',
                    marginBottom:'0.25rem'
                  }}
                  onClick={e=>e.stopPropagation()}
                />
                {item.showDescription && (
                  <textarea
                    value={item.description}
                    onChange={e=>{ e.stopPropagation(); changeAt(idx,'description',e.target.value); }}
                    onFocus={()=>{ setActiveIdx(idx); setSettingsMode(false); }}
                    placeholder="Describe what you did and the impact it had."
                    style={{
                      ...sectionStyle,
                      width:'100%',
                      minHeight:'48px',
                      border: isActive?'1px solid #ccc':'none',
                      borderRadius: isActive?'0.25rem':0,
                      padding: isActive?'0.5rem':0,
                      outline:'none',
                      fontSize:'0.875rem',
                      background:'transparent',
                      resize:'vertical'
                    }}
                    onClick={e=>e.stopPropagation()}
                  />
                )}
              </div>
            </div>

            {/* inline toolbar */}
            {isActive && (
              <div
                ref={popupRef}
                onClick={e=>e.stopPropagation()}
                style={{
                  fontSize: '1rem',
                  position:'absolute',
                  top:'-3rem',
                  right:'0.5rem',
                  background:'#fff',
                  border:'1px solid #ccc',
                  borderRadius:'0.375rem',
                  boxShadow:'0 2px 6px rgba(0,0,0,0.1)',
                  zIndex:10,
                  minWidth:'200px'
                }}
              >
                {!settingsMode ? (
                  <div style={{display:'flex',gap:'0.5rem',padding:'0.25rem',alignItems:'center'}}>
                    <button onClick={()=>addAt(idx)}>➕ Entry</button>
                    <button onClick={()=>moveUp(idx)}>⬆️</button>
                    <button onClick={()=>removeAt(idx)}>🗑️</button>
                    <button onClick={()=>setSettingsMode(true)}>⚙️</button>
                    <button
                      onClick={()=>{ setActiveIdx(null); setSettingsMode(false); }}
                      style={{marginLeft:'auto'}}
                    >×</button>
                  </div>
                ) : (
                  <div style={{padding:'0.5rem'}}>
                    <label style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                      <input
                        type="checkbox"
                        checked={item.uppercase}
                        onChange={e=>changeAt(idx,'uppercase',e.target.checked)}
                      />
                      Uppercase Title
                    </label>
                    <label style={{display:'flex',alignItems:'center',gap:'0.5rem',marginTop:'0.5rem'}}>
                      <input
                        type="checkbox"
                        checked={item.showIcon}
                        onChange={e=>changeAt(idx,'showIcon',e.target.checked)}
                      />
                      Show Icon
                    </label>
                    {item.showIcon && (
                      <div style={{
                        marginTop:'0.5rem',
                        display:'grid',
                        gridTemplateColumns:'repeat(5,1fr)',
                        gap:'0.25rem'
                      }}>
                        {ICONS.map(ic=>(
                          <span
                            key={ic}
                            onClick={()=>changeAt(idx,'icon',ic)}
                            style={{fontSize:'1.25rem',cursor:'pointer'}}
                          >{ic}</span>
                        ))}
                      </div>
                    )}
                    <label style={{
                      display:'flex',alignItems:'center',gap:'0.5rem',marginTop:'0.5rem'
                    }}>
                      <input
                        type="checkbox"
                        checked={item.showDescription}
                        onChange={e=>changeAt(idx,'showDescription',e.target.checked)}
                      />
                      Show Description
                    </label>
                    <button
                      onClick={()=>setSettingsMode(false)}
                      style={{marginTop:'0.5rem',fontSize:'0.75rem',color:'#2563EB'}}
                    >← Back</button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* no bottom Add once there's at least one */}
    </div>
  );
}
