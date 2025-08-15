import React from 'react';
import TemplateModern from './TemplateModern';
import TemplateATS from './TemplateATS';

const TemplateRouter = ({ template, resumeData, handleEdit }) => {
  switch (template) {
    case 'ATS':
      return <TemplateATS resumeData={resumeData} handleEdit={handleEdit} />;
    case 'Modern':
    default:
      return <TemplateModern resumeData={resumeData} handleEdit={handleEdit} />;
  }
};

export default TemplateRouter;
