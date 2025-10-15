import React, { useState, useEffect } from 'react';

const fonts = ['Rubik', 'Open Sans', 'Lato', 'Roboto', 'Merriweather'];

// Define your color presets here
const COLOR_PRESETS = [
  { id: 'preset1', titleColor: '#000000', subtitleColor: '#1e90ff', label: 'Blue Shades' }, 
  { id: 'preset2', titleColor: '#000000', subtitleColor: '#6f7878', label: 'Brown & Grey' }, 
  { id: 'preset3', titleColor: '#002b7f', subtitleColor: '#56acf2', label: 'Green Shades' }, 
  { id: 'preset4', titleColor: '#19273c', subtitleColor: '#3c6df0', label: 'Red Shades' },   
  { id: 'preset5', titleColor: '#8a0202', subtitleColor: '#f96b07', label: 'Purple Shades' },
];

const DesignSettingsPanel = ({ design = {}, handleEdit, onClose }) => {
  // 1) Keep a local copy of design so inputs remain editable instantly.
  const [localDesign, setLocalDesign] = useState({
    font: 'Rubik',
    fontSize: 1,
    lineHeight: 1.6,
    margin: 1,
    spacing: 1.5,
    titleColor: '#000000',
    subtitleColor: '#444444',
    ...design,
  });

  // 2) Whenever the `design` prop changes (e.g. parent resets state), sync it into localDesign.
  useEffect(() => {
    setLocalDesign({
      font: design.font ?? 'Rubik',
      fontSize: design.fontSize ?? 3,
      lineHeight: design.lineHeight ?? 1.6,
      margin: design.margin ?? 1,
      spacing: design.spacing ?? 1.5,
      titleColor: design.titleColor ?? '#000000',
      subtitleColor: design.subtitleColor ?? '#444444',
    });
  }, [design]);

  // 3) Helper that updates localDesign & immediately notifies parent via handleEdit.
  //    Note: `handleEdit` expects an object containing the new design fields.
  const onFieldChange = (key, value) => {
    setLocalDesign(prev => {
      const next = { ...prev, [key]: value };
      return next;
    });
    // This immediately sends the updated field to the parent
    handleEdit({ [key]: value });
  };

  // New handler for selecting a color preset
  const onPresetSelect = (preset) => {
    setLocalDesign(prev => ({
      ...prev,
      titleColor: preset.titleColor,
      subtitleColor: preset.subtitleColor,
    }));
    // Send both updated colors to the parent simultaneously
    handleEdit({
      titleColor: preset.titleColor,
      subtitleColor: preset.subtitleColor,
    });
  };

  return (
    <div style={{ fontSize: '10px',   }}  className="fixed top-16 right-1 z-50 w-60  bg-white rounded-xl shadow-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Design Settings</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Font Family */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Font Family</label>
        <select
          value={localDesign.font}
          onChange={(e) => onFieldChange('font', e.target.value)}
          className="w-full border px-2 py-1 rounded"
        >
          {fonts.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size (in mm) */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Font Size (mm)</label>
        <input
          type="number"
          min="1"
          step="0.5"
          value={localDesign.fontSize}
          onChange={(e) =>
            onFieldChange('fontSize', parseFloat(e.target.value) || 0)
          }
          className="w-full border px-2 py-1 rounded"
        />
      </div>

      {/* Line Height */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Line Height</label>
        <input
          type="number"
          min="1"
          step="0.1"
          value={localDesign.lineHeight}
          onChange={(e) =>
            onFieldChange('lineHeight', parseFloat(e.target.value) || 0)
          }
          className="w-full border px-2 py-1 rounded"
        />
      </div>

      {/* Page Margin (cm) */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Page Margin (cm)</label>
        <input
          type="number"
          min="0"
          step="0.5"
          value={localDesign.margin}
          onChange={(e) =>
            onFieldChange('margin', parseFloat(e.target.value) || 0)
          }
          className="w-full border px-2 py-1 rounded"
        />
      </div>

      {/* Section Spacing */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Section Spacing (rem)</label>
        <input
          type="number"
          min="0"
          step="0.25"
          value={localDesign.spacing}
          onChange={(e) =>
            onFieldChange('spacing', parseFloat(e.target.value) || 0)
          }
          className="w-full border px-2 py-1 rounded"
        />
      </div>
    

      {/* Title Color */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Title Color</label>
        <input
          type="color"
          value={localDesign.titleColor}
          onChange={(e) => onFieldChange('titleColor', e.target.value)}
          className="w-full border px-2 py-1 rounded h-8"
        />
      </div>

      {/* Text Color (Subtitle Color) */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Text Color</label>
        <input
          type="color"
          value={localDesign.subtitleColor}
          onChange={(e) => onFieldChange('subtitleColor', e.target.value)}
          className="w-full border px-2 py-1 rounded h-8"
        />
      </div>

      {/* Color Presets */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Color Presets</label>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {COLOR_PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => onPresetSelect(preset)}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                border: '1px solid #ccc', // Outer circle border
                backgroundColor: preset.titleColor, // Outer circle color
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                flexShrink: 0, // Prevent shrinking
              }}
              title={preset.label} // Tooltip on hover
            >
              <div
                style={{
                  width: '18px', // Size of the inner circle
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: preset.subtitleColor, // Inner circle color
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DesignSettingsPanel;
