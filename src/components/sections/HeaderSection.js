import React, { useState, useEffect, useRef } from 'react'; // Added useState, useEffect, useRef
import { Phone, Mail, Link, MapPin } from 'lucide-react';

const SETTINGS_OPTIONS = [
  { key: 'showPhone', label: 'Phone Number' },
  { key: 'showEmail', label: 'Email' },
  { key: 'showLink', label: 'Link' },
  { key: 'showLocation', label: 'Location' },
  { key: 'showWebsite', label: 'Website' },
  { key: 'showProfileImage', label: 'Profile Image' },
];

const HeaderSection = ({
  data = {},
  onEdit,
  onUploadProfileImage,
  sectionStyle = {},
  headingStyle = {},
  design = {},
}) => {
  const sliderPx = parseFloat(design.fontSize) || 0;
  const offset = sliderPx / 30;

  const [isFocused, setIsFocused] = useState(false); // State to control toolbar visibility
  const [showSettingsOptions, setShowSettingsOptions] = useState(false); // State for settings dropdown
  const headerRef = useRef(null); // Ref for the main header div
  const popupRef = useRef(null); // Ref for the settings popup/toolbar
  const blurTimeout = useRef(null); // For managing blur delay

  // Initialize data.settings with default visibility if not present
  const defaultSettings = SETTINGS_OPTIONS.reduce(
    (acc, { key }) => ({ ...acc, [key]: true }),
    {}
  );
  // Merge default settings with existing ones from data
  // Ensure that `data.settings` exists and is merged correctly
  const currentSettings = { ...defaultSettings, ...(data.settings || {}) };

  // Function to update the parent's data prop
  const updateData = (newData) => {
    onEdit(newData);
  };

  // Handler for contentEditable fields
  const handleFieldEdit = (field) => (e) => {
    updateData({
      ...data,
      [field]: e.target.innerText,
    });
  };

  // Toggle visibility setting
  const toggleSetting = (key) => {
    const updatedSettings = {
      ...currentSettings,
      [key]: !currentSettings[key],
    };
    updateData({
      ...data,
      settings: updatedSettings, // Update the nested settings object
    });
  };

  // Centralized focus handler with delay
  const handleFocusWithDelay = () => {
    clearTimeout(blurTimeout.current);
    setIsFocused(true);
    setShowSettingsOptions(false); // Close settings when gaining focus
  };

  // Centralized blur handler with delay
  const handleBlurWithDelay = () => {
    blurTimeout.current = setTimeout(() => {
      setIsFocused(false);
      setShowSettingsOptions(false); // Also close settings on blur
    }, 150); // Small delay to allow clicks on toolbar/settings
  };

  // Close toolbar/settings when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target) &&
        popupRef.current &&
        !popupRef.current.contains(event.target)
      ) {
        setIsFocused(false);
        setShowSettingsOptions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearTimeout(blurTimeout.current); // Clear timeout on unmount
    };
  }, [isFocused]); // Dependency on isFocused to re-run effect

  // Extract values from data with default fallbacks
  const {
    name = 'Your Name',
    title = 'The role you are applying for?',
    email = 'email@example.com',
    phone = '+123456789',
    location = 'City, Country',
    website = '',
    link = '',
    profileImage = '',
  } = data;

  return (
    <div
      data-section="header"
      ref={headerRef} // Attach ref to the main div
      className="flex items-center justify-between header-section "
      style={{ ...sectionStyle, padding: '1px 1px', position: 'relative' }} // Added position: 'relative' for toolbar positioning
      onFocus={handleFocusWithDelay} // Handle focus when any child element receives focus
      onBlur={handleBlurWithDelay} // Handle blur when focus leaves the header section
      tabIndex={-1} // Make div focusable so it can receive blur events
    >
      {/* Toolbar */}
      {isFocused && !showSettingsOptions && ( // Show toolbar only when focused and settings not open
        <div
          ref={popupRef} // Attach ref for click outside detection
          onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking toolbar buttons
          style={{
            fontSize: '1rem',
            position: 'absolute',
            top: '-1rem', // Position above the header
            right: '20rem',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '.25rem',
            padding: '.25rem .5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            zIndex: 10,
          }}
        >
          <button onClick={() => setShowSettingsOptions(true)}>
            ⚙️ Settings
          </button>
          <button onClick={() => setIsFocused(false)} style={{ marginLeft: 'auto' }}>
            ×
          </button>
        </div>
      )}

      {/* Settings Overlay */}
      {isFocused && showSettingsOptions && ( // Show settings overlay only when focused and settings are open
        <div
          ref={popupRef} // Attach ref for click outside detection (reusing for simplicity)
          onMouseDown={(e) => e.preventDefault()}
          style={{
            position: 'absolute',
            top: '-3rem', // Adjust as needed, positioned relative to parent
            right: 0,
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '0.5rem',
            width: '200px',
            zIndex: 11, // Higher z-index than toolbar if they overlap
          }}
        >
          {SETTINGS_OPTIONS.map(({ key, label }) => (
            <div
              key={key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: '0.25rem 0',
              }}
            >
              <span style={{ fontSize: '0.875rem' }}>{label}</span>
              <input
                type="checkbox"
                checked={currentSettings[key]} // Use currentSettings
                onChange={() => toggleSetting(key)}
                style={{
                  cursor: 'pointer',
                  width: '1.25rem',
                  height: '1.25rem',
                }}
              />
            </div>
          ))}
          <button
            onClick={() => setShowSettingsOptions(false)}
            style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#2563EB' }}
          >
            ← Back
          </button>
        </div>
      )}

      {/* LEFT: Name, Title, Contacts */}
      <div className="flex flex-col items-start text-left w-full">
        <h1
          className="text-3xl font-bold"
          contentEditable
          suppressContentEditableWarning
          onBlur={handleFieldEdit('name')}
          style={{
            ...headingStyle,
            fontSize: `${(1.8 + offset).toFixed(3)}rem`,
          }}
        >
          {name}
        </h1>

        <p
          className="text-base text-blue-500 mb-2"
          contentEditable
          suppressContentEditableWarning
          onBlur={handleFieldEdit('title')}
          style={{
            ...sectionStyle,
            fontSize: `${(0.8 + offset).toFixed(3)}rem`,
          }}
        >
          {title}
        </p>

        <div
          className="flex flex-wrap gap-2 text-gray-700"
          style={{
            fontSize: `${(0.5 + offset).toFixed(3)}rem`,
          }}
        >
          {/* Dynamically render contact items and separators */}
          {(() => {
            const contactItems = [];

            if (currentSettings.showPhone) {
              contactItems.push(
                <React.Fragment key="phone">
                  <div className="pdf-icon-wrapper">
                  <Phone className="w-3 h-3 mr-1 inline-block" />
                  </div>
                  <span contentEditable suppressContentEditableWarning onBlur={handleFieldEdit('phone')}>
                    {phone}
                  </span>
                </React.Fragment>
              );
            }
            if (currentSettings.showEmail) {
              contactItems.push(
                <React.Fragment key="email">
                  <div className="pdf-icon-wrapper">
                  <Mail className="w-3 h-3 mr-1 inline-block" />
                  </div>
                  <span contentEditable suppressContentEditableWarning onBlur={handleFieldEdit('email')}>
                    {email}
                  </span>
                </React.Fragment>
              );
            }
            if (currentSettings.showLink && link) { // Only show link if link value exists
              contactItems.push(
                <React.Fragment key="link">
                  <div className="pdf-icon-wrapper">
                  <Link className="w-3 h-3 mr-1 inline-block" />
                  </div>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600"
                    contentEditable suppressContentEditableWarning
                    onBlur={handleFieldEdit('link')}
                  >
                    {link}
                  </a>
                </React.Fragment>
              );
            }
            if (currentSettings.showLocation) {
              contactItems.push(
                <React.Fragment key="location">
                  <div className="pdf-icon-wrapper">
                  <MapPin className="w-3 h-3 mr-1 inline-block" />
                  </div>
                  <span contentEditable suppressContentEditableWarning onBlur={handleFieldEdit('location')}>
                    {location}
                  </span>
                </React.Fragment>
              );
            }

            // Join items with a separator if there's more than one item
            return contactItems.map((item, index) => (
              <React.Fragment key={index}>
                {item}
                {index < contactItems.length - 1 && <span>•</span>}
              </React.Fragment>
            ));
          })()}
        </div>

        {currentSettings.showWebsite && website && ( // Conditional rendering for website
          <div
            className="text-sm text-blue-600 mt-1"
            contentEditable
            suppressContentEditableWarning
            onBlur={handleFieldEdit('website')}
            style={sectionStyle}
          >
            {website}
          </div>
        )}
      </div>

      {/* RIGHT: Profile picture & upload */}
      {currentSettings.showProfileImage && ( // Conditional rendering for profile image
        <div className="ml-0 flex flex-col items-center">
          <label className="cursor-pointer mt-2">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onUploadProfileImage(e.target.files[0])}
            />
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover bg-gray-200"
              />
            ) : (
              <div style={{ fontSize: '10px', }} className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
          </label>
        </div>
      )}
    </div>
  );
};

export default HeaderSection;