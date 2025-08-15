import React, { useState, useRef, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE_BLUE_SHADES = ['#1f1f1fff', '#a3a3a3ff', '#93C5FD', '#BFDBFE', '#A5B4FC'];
const MAX_LEVEL = 100;

export default function MyTimeSection({
  data = [],
  onEdit,
  sectionStyle = {},
  headingStyle = {},
  design = {},
}) {
  const sliderPx = parseFloat(design.fontSize) || 0;
  const offset = sliderPx / 30;
  const [isEditing, setIsEditing] = useState(false);
  const sectionRef = useRef(null);
  const refs = useRef({});
  const blurTimeout = useRef(null);
  const popupRef = useRef(null);

  const segments = Array.isArray(data) ? data.map(s => ({
    label: s.label || '',
    value: s.value !== undefined ? Number(s.value) : 0,
    alignment: s.alignment || 'left',
  })) : [];

  const total = segments.reduce((sum, s) => sum + Number(s.value || 0), 0);
  const remaining = Math.max(0, MAX_LEVEL - total);

  useEffect(() => {
    function handleClick(e) {
      if (sectionRef.current && !sectionRef.current.contains(e.target)) {
        setIsEditing(false);
      } else if (sectionRef.current && isEditing === false) {
        setIsEditing(true);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isEditing]);

  useEffect(() => {
    if (isEditing) {
      segments.forEach((s, idx) => {
        const labelEl = refs.current[`label-${idx}`];
        if (labelEl && labelEl.tagName === 'TEXTAREA') {
          labelEl.style.height = 'auto';
          labelEl.style.height = `${labelEl.scrollHeight}px`;
        }
      });
    }
  }, [segments, isEditing]);

  useEffect(() => {
    return () => clearTimeout(blurTimeout.current);
  }, []);

  const handleChange = (index, key, value) => {
    const updated = [...segments];
    let numeric = key === 'value' ? parseFloat(value) : value;

    if (key === 'value') {
      const otherTotal = updated.reduce((sum, seg, i) =>
        i === index ? sum : sum + Number(seg.value || 0), 0
      );
      numeric = Math.min(numeric, MAX_LEVEL - otherTotal);
    }
    updated[index] = { ...updated[index], [key]: numeric };
    onEdit(updated);
  };

  const handleAdd = () => {
    onEdit([...segments, { label: '', value: remaining, alignment: 'left' }]);
  };

  const handleRemove = (index) => {
    const updated = [...segments];
    updated.splice(index, 1);
    onEdit(updated);
  };

  const handleFocus = (idx) => {
    clearTimeout(blurTimeout.current);
    setIsEditing(true);
  };

  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => {}, 150);
  };

  const chartData = {
    labels: segments.map((s, i) => s.label || `Activity ${String.fromCharCode(65 + i)}`),
    datasets: [{
      data: segments.map(s => Number(s.value) || 0),
      backgroundColor: segments.map((s, i) => {
        if (i === 0) return design.titleColor;
        if (i === 1) return design.subtitleColor;
        return PALETTE_BLUE_SHADES[(i - 2) % PALETTE_BLUE_SHADES.length];
      }),
      borderColor: '#ffffff',
      borderWidth: 2,
      hoverOffset: 4,
      cutout: '60%',
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: design.subtitleColor,
          font: { size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) label += ': ';
            if (context.parsed !== null) label += context.parsed + '%';
            return label;
          }
        }
      }
    }
  };

  return (
    <div
      ref={sectionRef}
      style={{
        backgroundColor: 'transparent',
        padding: '0.5rem',
        borderRadius: '0.375rem',
        // FIX: This CSS property prevents the component from being split across a page break
        breakInside: 'avoid',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem', width: '100%', maxWidth: '180px', margin: '0 auto 1.5rem auto', position: 'relative' }}>
        <div style={{ width: '100%', height: '250px', aspectRatio: '1 / 1' }}>
          <Doughnut data={chartData} options={chartOptions} />
        </div>
        {isEditing && (
          <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', fontWeight: 500, color: remaining === 0 ? '#16a34a' : '#4b5563', textAlign: 'center' }}>
            {remaining === 0 ? 'Perfect! All 100% allocated.' : `Remaining: ${remaining}%`}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {segments.map((s, idx) => {
          const otherTotal = segments.reduce((sum, seg, i) =>
            i === idx ? sum : sum + Number(seg.value || 0), 0
          );
          const maxForThis = Math.max(0, MAX_LEVEL - otherTotal);

          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', breakInside: 'avoid', WebkitColumnBreakInside: 'avoid', pageBreakInside: 'avoid' }} onClick={isEditing ? undefined : () => setIsEditing(true)}>
              <div style={{ width: '1.2rem', height: '1.2rem', fontSize: `${(0.675 + offset).toFixed(3)}rem`, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: '1.5rem', flexShrink: 0, color: design.titleColor }}>
                {String.fromCharCode(65 + idx)}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {isEditing ? (
                  <textarea
                    id={`label-${idx}`}
                    rows={1}
                    value={s.label}
                    onChange={e => handleChange(idx, 'label', e.target.value)}
                    onInput={e => { e.target.style.height='auto'; e.target.style.height=`${e.target.scrollHeight}px`; }}
                    onFocus={() => handleFocus(idx)}
                    onBlur={handleBlur}
                    placeholder="Activity"
                    className="mytime-input"
                    style={{ fontWeight: 500, fontSize: `${(0.8 + offset).toFixed(3)}rem`, border: '1px solid #ccc', borderRadius: '.25rem', padding: '0.5rem', background: '#fff', outline: 'none', width: '100%', resize: 'none', overflow: 'hidden', boxSizing: 'border-box', textAlign: s.alignment, color: design.subtitleColor }}
                    ref={el => (refs.current[`label-${idx}`] = el)}
                  />
                ) : (
                  <div className="mytime-input" style={{ fontWeight: 500, fontSize: `${(0.8 + offset).toFixed(3)}rem`, whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0.5rem', color: (s.label || '').trim() === '' ? '#a0a0a0' : design.subtitleColor, minHeight: '1.5rem', textAlign: s.alignment }} onClick={() => handleFocus(idx)}>
                    {s.label || 'Activity'}
                  </div>
                )}
                {isEditing && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="range" min="0" max={maxForThis} value={s.value} onChange={e => handleChange(idx, 'value', e.target.value)} style={{ flex: 1 }} className="mytime-input-range" />
                    <span style={{ fontSize: '0.875rem', width: '3rem', textAlign: 'right' }}>
                      {s.value}%
                    </span>
                  </div>
                )}
              </div>
              {isEditing && (
                <button onClick={() => handleRemove(idx)} style={{ fontSize: '0.875rem', color: '#dc2626', background: 'transparent', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>

      {isEditing && remaining > 0 && (
        <button onClick={handleAdd} style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: '#2563EB', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          ➕ Add Time Entry
        </button>
      )}
    </div>
  );
}