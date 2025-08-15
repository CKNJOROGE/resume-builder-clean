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

const TemplateCreative = ({ resumeData, visibleSections = {}, handleEdit }) => {
  return (
    <div className="p-8 bg-gradient-to-br from-pink-100 to-blue-100 text-gray-900 font-sans rounded-md shadow">
      <HeaderSection data={resumeData.header} onEdit={(val) => handleEdit('header', val)} />
      <div className="grid grid-cols-2 gap-6 mt-6">
        <div className="flex flex-col gap-4">
          <SummarySection data={resumeData.summary} onEdit={(val) => handleEdit('summary', val)} />
          <ExperienceSection data={resumeData.experience} onEdit={(val) => handleEdit('experience', val)} />
          <SkillsSection data={resumeData.skills} onEdit={(val) => handleEdit('skills', val)} />
          <ProjectsSection data={resumeData.projects} onEdit={(val) => handleEdit('projects', val)} />
          <CoursesSection data={resumeData.courses} onEdit={(val) => handleEdit('courses', val)} />
        </div>
        <div className="flex flex-col gap-4">
          <EducationSection data={resumeData.education} onEdit={(val) => handleEdit('education', val)} />
          <LanguagesSection data={resumeData.languages} onEdit={(val) => handleEdit('languages', val)} />
          <AchievementsSection data={resumeData.achievements} onEdit={(val) => handleEdit('achievements', val)} />
          <PassionsSection data={resumeData.passions} onEdit={(val) => handleEdit('passions', val)} />
          <HobbiesSection data={resumeData.hobbies} onEdit={(val) => handleEdit('hobbies', val)} />
          <MyTimeSection data={resumeData.mytime} onEdit={(val) => handleEdit('mytime', val)} />
          <ReferencesSection data={resumeData.references} onEdit={(val) => handleEdit('references', val)} />
        </div>
      </div>
    </div>
  );
};

export default TemplateCreative;
