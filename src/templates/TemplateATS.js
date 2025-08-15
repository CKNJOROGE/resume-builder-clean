import React from 'react';
import HeaderSection from '../components/sections/HeaderSection';
import SummarySection from '../components/sections/SummarySection';
import ExperienceSection from '../components/sections/ExperienceSection';
import SkillsSection from '../components/sections/SkillsSection';
import EducationSection from '../components/sections/EducationSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import CoursesSection from '../components/sections/CoursesSection';
import AchievementsSection from '../components/sections/AchievementsSection';
import LanguagesSection from '../components/sections/LanguagesSection';
import ReferencesSection from '../components/sections/ReferencesSection';
import PassionsSection from '../components/sections/PassionsSection';
import HobbiesSection from '../components/sections/HobbiesSection';
import MyTimeSection from '../components/sections/MyTimeSection';
import AdditionalExperienceSection from '../components/sections/AdditionalExperienceSection';
import AwardsSection from '../components/sections/AwardsSection';
import BooksSection from '../components/sections/BooksSection';
import IndustrialExpertiseSection from '../components/sections/IndustrialExpertiseSection';
import KeyAchievementsSection from '../components/sections/KeyAchievementsSection';
import ProfessionalStrengthsSection from '../components/sections/ProfessionalStrengthsSection';
import VolunteeringSection from '../components/sections/VolunteeringSection';

const TemplateATS = ({
  resumeData,
  visibleSections = {},
  handleEdit,
  design = {},
  changeSummaryAlignment // ADD THIS PROP
}) => {
  const {
    font = 'Times New Roman',
    fontSize = 3,
    lineHeight = 1.5,
    margin = 1.5,
    spacing = 1,
    titleColor = '#000000',
    subtitleColor = '#444444'
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

        <HeaderSection data={resumeData.header} onEdit={(val) => handleEdit('header', val)} />

      {visibleSections.summary && (
       <SummarySection
         data={resumeData.summary}
         onEdit={(val) => handleEdit('summary', val)}
         onChangeAlignment={changeSummaryAlignment} // PASS THE PROP
         sectionStyle={{ textAlign: design.summaryAlign || 'left' }} // APPLY ALIGNMENT FROM DESIGN
         design={design} // Ensure design prop is passed
       />
      )}

      {visibleSections.experience && (
       <ExperienceSection data={resumeData.experience} onEdit={(val) => handleEdit('experience', val)}
       design={design}
        />
      )}

      {visibleSections.education && (
        <EducationSection data={resumeData.education} onEdit={(val) => handleEdit('education', val)}
        design={design}
         />
      )}

      {visibleSections.skills && (
        <SkillsSection data={resumeData.skills} onEdit={(val) => handleEdit('skills', val)}
        design={design}
         />
      )}

      {visibleSections.projects && (
        <ProjectsSection data={resumeData.projects} onEdit={(val) => handleEdit('projects', val)}
        design={design}
         />
      )}

      {visibleSections.courses && (
       <CoursesSection data={resumeData.courses} onEdit={(val) => handleEdit('courses', val)}
       design={design}
        />
      )}

      {visibleSections.achievements && (
       <AchievementsSection data={resumeData.achievements} onEdit={(val) => handleEdit('achievements', val)}
       design={design}
        />
      )}

      {visibleSections.languages && (
       <LanguagesSection data={resumeData.languages} onEdit={(val) => handleEdit('languages', val)}
       design={design}
        />
      )}

      {visibleSections.references && (
       <ReferencesSection data={resumeData.references} onEdit={(val) => handleEdit('references', val)}
       design={design}
        />
      )}

      {visibleSections.passions && (
       <PassionsSection data={resumeData.passions} onEdit={(val) => handleEdit('passions', val)} />
      )}

      {visibleSections.hobbies && (
       <HobbiesSection data={resumeData.hobbies} onEdit={(val) => handleEdit('hobbies', val)}
       design={design}
        />
      )}

      {visibleSections.myTime && (
       <MyTimeSection data={resumeData.myTime} onEdit={(val) => handleEdit('myTime', val)} 
       design={design}
       />
      )}

      {visibleSections.additionalExperience && (
      <AdditionalExperienceSection data={resumeData.additionalExperience} onEdit={(val) => handleEdit('additionalExperience', val)} 
      design={design}
      />
      )}

      {visibleSections.awards && (
      <AwardsSection data={resumeData.awards} onEdit={(val) => handleEdit('awards', val)} 
      design={design}
      />
      )}

      {visibleSections.books && (
      <BooksSection data={resumeData.books} onEdit={(val) => handleEdit('books', val)}
      design={design}
       />
      )}

      {visibleSections.industrialExpertise && (
      <IndustrialExpertiseSection data={resumeData.industrialExpertise} onEdit={(val) => handleEdit('industrialExpertise', val)}
      design={design}
       />
      )}

      {visibleSections.keyAchievements && (
       <KeyAchievementsSection data={resumeData.keyAchievements}  onEdit={(val) => handleEdit('keyAchievements', val)}
       design={design}
         />
      )}

      {visibleSections.professionalStrengths && (
      <ProfessionalStrengthsSection data={resumeData.professionalStrengths}
      onEdit={(val) => handleEdit('professionalStrengths', val)} 
      design={design}
            />
      )}

      {visibleSections.volunteering && (
       <VolunteeringSection data={resumeData.volunteering} onEdit={(val) => handleEdit('volunteering', val)}
       design={design}
         />
      )}

    </div>
  );
};

export default TemplateATS;