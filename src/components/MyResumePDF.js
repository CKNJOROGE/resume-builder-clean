// src/components/MyResumePDF.js
import React from 'react';
import { Page, View, Document, StyleSheet } from '@react-pdf/renderer';

// 1. Import all the translated section components
import HeaderSectionPDF from './pdf/HeaderSectionPDF';
import SummarySectionPDF from './pdf/SummarySectionPDF';
import ExperienceSectionPDF from './pdf/ExperienceSectionPDF';
import EducationSectionPDF from './pdf/EducationSectionPDF';
import SkillsSectionPDF from './pdf/SkillsSectionPDF';
import ProjectsSectionPDF from './pdf/ProjectsSectionPDF';
import CoursesSectionPDF from './pdf/CoursesSectionPDF';       // Add this
import LanguagesSectionPDF from './pdf/LanguagesSectionPDF';   // Add this
import AchievementsSectionPDF from './pdf/AchievementsSectionPDF'; // Add this
import AwardsSectionPDF from './pdf/AwardsSectionPDF';             // Add this
import VolunteeringSectionPDF from './pdf/VolunteeringSectionPDF'; // Add this
import ReferencesSectionPDF from './pdf/ReferencesSectionPDF';     // Add this
import PassionsSectionPDF from './pdf/PassionsSectionPDF';                 // Add this
import HobbiesSectionPDF from './pdf/HobbiesSectionPDF';                   // Add this
import BooksSectionPDF from './pdf/BooksSectionPDF';                       // Add this
import AdditionalExperienceSectionPDF from './pdf/AdditionalExperienceSectionPDF'; // Add this
import IndustrialExpertiseSectionPDF from './pdf/IndustrialExpertiseSectionPDF'; // Add this
import MyTimeSectionPDF from './pdf/MyTimeSectionPDF';      

// 2. Create a map to easily render the correct component based on a key
const sectionComponents = {
  summary: SummarySectionPDF,
  experience: ExperienceSectionPDF,
  education: EducationSectionPDF,
  skills: SkillsSectionPDF,
  projects: ProjectsSectionPDF,
  courses: CoursesSectionPDF,           // Add this
  languages: LanguagesSectionPDF,       // Add this
  achievements: AchievementsSectionPDF, // Add this
  awards: AwardsSectionPDF,                 // Add this
  volunteering: VolunteeringSectionPDF,     // Add this
  references: ReferencesSectionPDF,         // Add this
  passions: PassionsSectionPDF,     // Add this
  hobbies: HobbiesSectionPDF,      // Add this
  books: BooksSectionPDF,         // Add this
  additionalExperience: AdditionalExperienceSectionPDF,  // Add this
  industrialExpertise: IndustrialExpertiseSectionPDF, // Add this
  myTime: MyTimeSectionPDF,  

  // As you translate more sections, add them here
};

// 3. Update the styles for a two-column layout
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Times-Roman',
  },
  body: {
    flexDirection: 'row',
  },
  columnLeft: {
    width: '60%',
    paddingRight: 15,
  },
  columnRight: {
    width: '40%',
    paddingLeft: 15,
  },
});

const MyResumePDF = ({ resumeData }) => {
  if (!resumeData) return <Document />;

  const { layout, ...sections } = resumeData;
  const { left = [], right = [] } = layout || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header is always at the top and full-width */}
        <HeaderSectionPDF data={sections.header} />

        {/* 4. Implement the two-column body */}
        <View style={styles.body}>
          {/* Left Column */}
          <View style={styles.columnLeft}>
            {left.map(sectionKey => {
              const Component = sectionComponents[sectionKey];
              // Render the component if it exists in our map and the resume data
              return Component && sections[sectionKey] ? (
                <Component key={sectionKey} data={sections[sectionKey]} design={sections.design} />
              ) : null;
            })}
          </View>

          {/* Right Column */}
          <View style={styles.columnRight}>
            {right.map(sectionKey => {
              const Component = sectionComponents[sectionKey];
              return Component && sections[sectionKey] ? (
                <Component key={sectionKey} data={sections[sectionKey]} design={sections.design} />
              ) : null;
            })}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default MyResumePDF;