import React from 'react';
import HeaderSection from '../components/sections/HeaderSection';
import SummarySection from '../components/sections/SummarySection';
import ExperienceSection from '../components/sections/ExperienceSection';
import EducationSection from '../components/sections/EducationSection';
import SkillsSection from '../components/sections/SkillsSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import CoursesSection from '../components/sections/CoursesSection';
import AchievementsSection from '../components/sections/AchievementsSection';
import LanguagesSection from '../components/sections/LanguagesSection';
import ReferencesSection from '../components/sections/ReferencesSection';
import PassionsSection from '../components/sections/PassionsSection';
import HobbiesSection from '../components/sections/HobbiesSection';
import MyTimeSection from '../components/sections/MyTimeSection';

const TemplateClassic = ({
  resumeData,
  visibleSections = {},
  handleEdit,
  design = {},
  changeSummaryAlignment // ADD THIS PROP
}) => {
  const {
    font = 'Georgia',
    fontSize = 3,
    lineHeight = 1.5,
    margin = 2,
    spacing = 1.2,
    titleColor = '#1f2937',
    subtitleColor = '#4b5563'
  } = design;

  const containerStyle = {
    fontFamily: font,
    fontSize: `${fontSize}mm`,
    lineHeight: lineHeight,
    padding: `${margin}cm`,
    color: subtitleColor,
    display: 'flex',
    flexDirection: 'column',
    gap: `${spacing}rem`
  };

  const sectionTitleStyle = {
    color: titleColor,
    fontWeight: 'bold',
    marginBottom: '0.3rem'
  };

  return (
    <div style={containerStyle} className="bg-white max-w-3xl mx-auto">
      <div style={sectionTitleStyle}>Header</div>
      <HeaderSection data={resumeData.header} onEdit={(val) => handleEdit('header', val)} />

      <div style={sectionTitleStyle}>Summary</div>
      <SummarySection
        data={resumeData.summary}
        onEdit={(val) => handleEdit('summary', val)}
        onChangeAlignment={changeSummaryAlignment} // PASS THE PROP
        sectionStyle={{ textAlign: design.summaryAlign || 'left' }} // APPLY ALIGNMENT FROM DESIGN
        design={design} // Ensure design prop is passed
      />

      <div style={sectionTitleStyle}>Experience</div>
      <ExperienceSection data={resumeData.experience} onEdit={(val) => handleEdit('experience', val)} />

      <div style={sectionTitleStyle}>Education</div>
      <EducationSection data={resumeData.education} onEdit={(val) => handleEdit('education', val)} />

      <div style={sectionTitleStyle}>Skills</div>
      <SkillsSection data={resumeData.skills} onEdit={(val) => handleEdit('skills', val)} />

      <div style={sectionTitleStyle}>Projects</div>
      <ProjectsSection data={resumeData.projects} onEdit={(val) => handleEdit('projects', val)} />

      <div style={sectionTitleStyle}>Courses</div>
      <CoursesSection data={resumeData.courses} onEdit={(val) => handleEdit('courses', val)} />

      <div style={sectionTitleStyle}>Achievements</div>
      <AchievementsSection data={resumeData.achievements} onEdit={(val) => handleEdit('achievements', val)} />

      <div style={sectionTitleStyle}>Languages</div>
      <LanguagesSection data={resumeData.languages} onEdit={(val) => handleEdit('languages', val)} />

      <div style={sectionTitleStyle}>References</div>
      <ReferencesSection data={resumeData.references} onEdit={(val) => handleEdit('references', val)} />

      <div style={sectionTitleStyle}>Passions</div>
      <PassionsSection data={resumeData.passions} onEdit={(val) => handleEdit('passions', val)} />

      <div style={sectionTitleStyle}>Hobbies</div>
      <HobbiesSection data={resumeData.hobbies} onEdit={(val) => handleEdit('hobbies', val)} />

      <div style={sectionTitleStyle}>My Time</div>
      <MyTimeSection data={resumeData.myTime} onEdit={(val) => handleEdit('myTime', val)} />
    </div>
  );
};

export default TemplateClassic;