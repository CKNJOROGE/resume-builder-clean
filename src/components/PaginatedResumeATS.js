import React, { useState, useRef, useLayoutEffect, useMemo } from 'react';

const MM_TO_PX = 96 / 25.4;
const mmToPx = (mm) => mm * MM_TO_PX;
const PAGE_HEIGHT_PX = mmToPx(290);
const SAFETY_MARGIN_PX = 1;

const sectionLabels = {
  summary: 'Summary',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  courses: 'Courses & Certifications',
  achievements: 'Achievements',
  languages: 'Languages',
  references: 'References',
  passions: 'Passions',
  hobbies: 'Hobbies & Interests',
  industrialExpertise: 'Industrial Expertise',
  awards: 'Awards',
  professionalStrengths: 'Professional Strengths',
  volunteering: 'Volunteering Experience',
  additionalExperience: 'Additional Experience',
  custom: 'Custom Section', // <-- THIS LINE IS ADDED
};

const PaginatedResumeATS = (props) => {
  const {
    sectionRenderList,
    resumeData,
    sectionComponentMap,
    design,
    handleEdit,
    changeSummaryAlignment,
  } = props;

  const [pages, setPages] = useState(null);
  
  const headerMeasurementRef = useRef(null);
  const titleMeasurementRef = useRef(null);
  const contentMeasureRef = useRef(null);

  const {
    margin = 1.5,
    spacing = 1,
    titleColor = '#000000',
    font = 'Times New Roman',
    fontSize = 3,
    lineHeight = 1.5,
  } = design;
  
  const spacingInPx = spacing * 16;
  const totalVerticalMarginPx = mmToPx(margin * 10 * 2);

  const sectionStyle = { fontFamily: font, fontSize: `${fontSize}mm`, lineHeight: lineHeight };
  const headingStyle = { color: titleColor, fontFamily: font };

  const sectionTitleStyle = {
    color: titleColor,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: '0.1rem',
    fontSize: '14px',
  };
  
  const hrStyle = {
    height: '1px',
    border: 'none',
    backgroundColor: titleColor,
    marginTop: '0.1rem',
    marginBottom: '0.5rem',
  };

  const HeaderComponent = useMemo(() => {
    const Header = sectionComponentMap['header'];
    return Header ? <Header data={resumeData.header} onEdit={(v) => handleEdit('header', v)} design={design} sectionStyle={sectionStyle} headingStyle={headingStyle} /> : null;
  }, [resumeData.header, design, handleEdit, sectionComponentMap, sectionStyle, headingStyle]);

  useLayoutEffect(() => {
    if (!contentMeasureRef.current || !titleMeasurementRef.current) return;

    const animationFrameId = requestAnimationFrame(() => {
      const headerHeight = headerMeasurementRef.current?.offsetHeight || 0;
      const titleHeight = titleMeasurementRef.current?.offsetHeight || 40;

      const allItems = [];
      sectionRenderList.forEach(({ key }) => {
        const sectionData = resumeData[key];
        if (sectionData !== undefined && sectionData !== null) {
          if (Array.isArray(sectionData)) {
            if (sectionData.length === 0) allItems.push({ id: key, sectionKey: key, data: [], isSingle: true, index: 0 });
            else sectionData.forEach((item, index) => {
              if (item != null) allItems.push({ id: `${key}-${index}`, sectionKey: key, data: item, index });
            });
          } else {
            allItems.push({ id: key, sectionKey: key, data: sectionData, isSingle: true, index: 0 });
          }
        }
      });

      const heights = {};
      Array.from(contentMeasureRef.current?.children || []).forEach(el => {
        if (el.dataset.key) {
          let h = el.getBoundingClientRect().height;
          if (el.dataset.key.startsWith('summary')) {
            h *= 0.8;
          }
          heights[el.dataset.key] = h;
        }
      });

      const pagesArr = [];
      let itemIndex = 0;
      while (itemIndex < allItems.length) {
        const isFirstPage = pagesArr.length === 0;
        const pageContentHeight = isFirstPage ? PAGE_HEIGHT_PX - headerHeight : PAGE_HEIGHT_PX;
        const availableHeight = pageContentHeight - totalVerticalMarginPx - SAFETY_MARGIN_PX;
        
        const currentPage = { items: {} };
        let currentHeight = 0;
        
        while (itemIndex < allItems.length) {
          const item = allItems[itemIndex];
          const itemHeight = heights[item.id] || 0;
          const isFirstItemOfItsKind = item.index === 0;
          const effectiveTitleHeight = isFirstItemOfItsKind ? titleHeight : 0;
          const gap = currentHeight > 0 ? spacingInPx : 0;
          const heightWithSpacing = itemHeight + effectiveTitleHeight + gap;

          if (currentHeight + heightWithSpacing <= availableHeight) {
            if (!currentPage.items[item.sectionKey]) currentPage.items[item.sectionKey] = [];
            currentPage.items[item.sectionKey].push(item.index);
            currentHeight += heightWithSpacing;
            itemIndex++;
          } else {
            break;
          }
        }
        pagesArr.push(currentPage);
      }
      setPages(pagesArr);
    });

    return () => cancelAnimationFrame(animationFrameId);
  }, [sectionRenderList, design, resumeData, HeaderComponent, totalVerticalMarginPx, spacingInPx]);

  const renderPageComponent = (sectionKey, itemIndices) => {
    const Component = sectionComponentMap[sectionKey];
    if (!Component || !itemIndices || itemIndices.length === 0) return null;
    
    const sectionData = resumeData[sectionKey];
    const isFirstChunkOfSection = Array.isArray(sectionData) ? itemIndices.includes(0) : true;

    return (
      <div key={sectionKey}>
        {isFirstChunkOfSection && (
          <div>
            {/* --- THIS IS THE MODIFIED TITLE LOGIC --- */}
            {sectionKey === 'custom' ? (
              <input
                type="text"
                value={resumeData.customTitle || 'Custom Section'}
                onChange={(e) => handleEdit('customTitle', e.target.value)}
                style={{ ...sectionTitleStyle, border: '1px solid #ccc', borderRadius: '4px', padding: '2px 4px', width: '100%', boxSizing: 'border-box' }}
              />
            ) : (
              <h2 style={sectionTitleStyle}>
                {sectionLabels[sectionKey] || sectionKey.replace(/([A-Z])/g, ' $1').toUpperCase()}
              </h2>
            )}
            <hr style={hrStyle} />
          </div>
        )}
        <Component
          itemsToRender={itemIndices}
          data={sectionData}
          onEdit={(val) => handleEdit(sectionKey, val)}
          design={design}
          sectionStyle={sectionStyle}
          headingStyle={headingStyle}
          {...(sectionKey === 'summary' && { changeSummaryAlignment })}
        />
      </div>
    );
  };
  
  const renderMeasurementComponent = (key) => {
    const Component = sectionComponentMap[key];
    if (!Component) return null;
    
    const sectionData = resumeData[key];
    const componentProps = { data: sectionData, onEdit: () => {}, design, sectionStyle, headingStyle, isMeasuring: true };

    if (key === 'skills' || key === 'industrialExpertise') {
      return (
        <div data-key={key} key={key}>
          <Component {...componentProps} />
        </div>
      );
    }
    
    if (Array.isArray(sectionData)) {
      return sectionData.map((item, index) => (
        item != null && <div data-key={`${key}-${index}`} key={`${key}-${index}`}><Component {...componentProps} itemsToRender={[index]} /></div>
      ));
    }
    
    return (sectionData && <div data-key={key} key={key}><Component {...componentProps} itemsToRender={[0]} /></div>);
  };

  return (
    <>
      <div style={{ visibility: 'hidden', position: 'absolute', zIndex: -1, left: -10000, top: 0, width: '210mm', padding: `${margin}cm` }}>
        <div ref={headerMeasurementRef}>{HeaderComponent}</div>
        <div ref={titleMeasurementRef}>
          <h2 style={sectionTitleStyle}>TITLE</h2>
          <hr style={hrStyle} />
        </div>
        <div ref={contentMeasureRef}>
          {sectionRenderList.map(({ key }) => renderMeasurementComponent(key))}
        </div>
      </div>

      {pages ? (
        pages.map((page, pageIndex) => (
          <div key={pageIndex} className="resume-page" style={{ padding: `${margin}cm` }}>
            {pageIndex === 0 && HeaderComponent}
            <div className="flex flex-col" style={{ gap: `${spacing}rem` }}>
              {Object.entries(page.items).map(([sectionKey, itemIndices]) =>
                renderPageComponent(sectionKey, itemIndices)
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="resume-page" style={{ padding: `${margin}cm` }}></div>
      )}
    </>
  );
};

export default PaginatedResumeATS;
