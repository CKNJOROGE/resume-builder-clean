import React, { useMemo } from 'react';
import PaginatedResumeATS from '../components/PaginatedResumeATS'; // Use the new ATS paginator

// Import all possible section components for the ATS template
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
import AdditionalExperienceSection from '../components/sections/AdditionalExperienceSection';
import AwardsSection from '../components/sections/AwardsSection';
import IndustrialExpertiseSection from '../components/sections/IndustrialExpertiseSection';
import ProfessionalStrengthsSection from '../components/sections/ProfessionalStrengthsSection';
import VolunteeringSection from '../components/sections/VolunteeringSection';

// Create a map to look up components by key.
const sectionComponentMap = {
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
  additionalExperience: AdditionalExperienceSection,
  awards: AwardsSection,
  industrialExpertise: IndustrialExpertiseSection,
  professionalStrengths: ProfessionalStrengthsSection,
  volunteering: VolunteeringSection,
  header: HeaderSection,
};

const TemplateATS = (props) => {
  const { resumeData = {}, visibleSections = {} } = props;
  const { font = 'Times New Roman', fontSize = 3, lineHeight = 1.5 } = props.design;

  // --- NEW: Create a special design object for the ATS template ---
  // This adds flags to disable visual elements.
  const atsDesign = {
    ...props.design,
    disableIcons: true,
    disableSliders: true,
    horizontalFlow: true,
  };

  const sectionRenderList = useMemo(() => {
    const sectionKeys = (resumeData.layout?.left || []).filter(key => visibleSections[key]);
    return sectionKeys.map(key => ({ key }));
  }, [resumeData.layout, visibleSections]);

  return (
    <div style={{ fontFamily: font, fontSize: `${fontSize}mm`, lineHeight: lineHeight }} className="bg-white w-full">
      <PaginatedResumeATS
        {...props}
        design={atsDesign} // --- Pass the new atsDesign object, overriding the one in props ---
        sectionRenderList={sectionRenderList}
        sectionComponentMap={sectionComponentMap}
      />
    </div>
  );
};

export default TemplateATS;