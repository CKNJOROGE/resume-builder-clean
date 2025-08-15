import React, { useMemo } from 'react';

// --- FULL LIST OF SECTION IMPORTS ---
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
import IndustrialExpertiseSection from '../components/sections/IndustrialExpertiseSection';
import AwardsSection from '../components/sections/AwardsSection';
import KeyAchievementsSection from '../components/sections/KeyAchievementsSection';
import ProfessionalStrengthsSection from '../components/sections/ProfessionalStrengthsSection';
import BooksSection from '../components/sections/BooksSection';
import VolunteeringSection from '../components/sections/VolunteeringSection';
import AdditionalExperienceSection from '../components/sections/AdditionalExperienceSection';

import PaginatedResume from '../components/PaginatedResume';

const sectionComponentMap = {
    header: HeaderSection,
    summary: SummarySection,
    experience: ExperienceSection,
    education: EducationSection,
    skills: SkillsSection,
    projects: ProjectsSection,
    courses: CoursesSection,
    achievements: AchievementsSection,
    languages: LanguagesSection,
    references: ReferencesSection,
    passions: PassionsSection,
    hobbies: HobbiesSection,
    industrialExpertise: IndustrialExpertiseSection,
    myTime: MyTimeSection,
    awards: AwardsSection,
    keyAchievements: KeyAchievementsSection,
    professionalStrengths: ProfessionalStrengthsSection,
    books: BooksSection,
    volunteering: VolunteeringSection,
    additionalExperience: AdditionalExperienceSection,
};

const TemplateModern = (props) => {
  const { resumeData = {}, visibleSections = {}, handleEdit, design = {}, uploadProfileImage } = props;

  const {
    font = 'Rubik',
    fontSize = 6,
    lineHeight = 1.6,
    titleColor = '#002b7f',
    subtitleColor = '#56acf2',
    margin = 1,
  } = design;
  
  const containerStyle = { fontFamily: font, fontSize: `${fontSize}px`, lineHeight };
  const sectionStyle = { color: subtitleColor, fontFamily: font, fontSize: `${fontSize}px`, lineHeight };
  const headingStyle = { color: titleColor, fontFamily: font };

  // --- FIX IS HERE: Removed the marginBottom from this wrapper ---
  // Spacing is now handled exclusively by the grid gap in PaginatedResume.js
  const withSectionWrapper = (key, SectionComponent, column) => {
    if (!SectionComponent || !visibleSections[key]) return null;
    return (
        <div key={key} data-column={column} className="no-break">
            {SectionComponent}
        </div>
    );
  };
  
  const headerComponent = useMemo(() => {
    if (!visibleSections.header) return null;
    const Header = sectionComponentMap['header'];
    return withSectionWrapper(
        'header', 
        <Header 
            data={resumeData.header} 
            onEdit={(v) => handleEdit('header', v)} 
            onUploadProfileImage={uploadProfileImage} 
            sectionStyle={sectionStyle} 
            headingStyle={headingStyle} 
            design={design}
        />, 
        'left'
    );
  }, [visibleSections.header, resumeData.header, design]);

  const sectionRenderList = useMemo(() => {
    const leftKeys = (resumeData.layout?.left || []).filter(key => visibleSections[key] && key !== 'header');
    const rightKeys = (resumeData.layout?.right || []).filter(key => visibleSections[key] && key !== 'header');
    const leftItems = leftKeys.map(key => ({ key, column: 'left' }));
    const rightItems = rightKeys.map(key => ({ key, column: 'right' }));
    return [...leftItems, ...rightItems];
  }, [resumeData.layout, visibleSections]);

  return (
    <div style={containerStyle} className="bg-white w-full">
      <PaginatedResume
        {...props}
        sectionRenderList={sectionRenderList}
        sectionComponentMap={sectionComponentMap}
      />
    </div>
  );
};

export default TemplateModern;