import React from 'react';

const sectionLabels = {
  summary: 'Summary',
  experience: 'Experience',
  additionalExperience: 'Additional Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  courses: 'Courses & Certifications',
  achievements: 'Achievements',
  languages: 'Languages',
  references: 'References',
  passions: 'Passions',
  hobbies: 'Hobbies',
  myTime: 'My Time',
  industrialExpertise: 'Industrial Expertise', 
  awards: 'Awards',
  professionalStrengths: 'Professional Strengths',
  books: 'Books',
  volunteering: 'Volunteering',
  custom: 'Custom Section',

};

const SectionTogglePanel = ({ visibleSections = {}, onChange, onClose }) => {
  const handleToggle = (key) => {
    const updated = {
      ...visibleSections,
      [key]: !visibleSections[key],
    };
    onChange && onChange(updated);
  };

  return (
    <div className="fixed top-0 right-0 h-full w-72 bg-white border-l shadow-lg z-50 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Show/Hide Sections</h2>
      <div className="space-y-2">
        {Object.entries(sectionLabels).map(([key, label]) => (
          <label key={key} className="flex items-center justify-between text-sm">
            <span>{label}</span>
            <input
              type="checkbox"
              checked={!!visibleSections[key]}
              onChange={() => handleToggle(key)}
            />
          </label>
        ))}
      </div>

      <button
        onClick={onClose}
        className="mt-4 text-sm text-blue-500 underline"
      >
        Close
      </button>
    </div>
  );
};

export default SectionTogglePanel;
