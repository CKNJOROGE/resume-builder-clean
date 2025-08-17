import React, { useState, useRef, useLayoutEffect, useMemo } from 'react';

const MM_TO_PX = 96 / 25.4;
const mmToPx = (mm) => mm * MM_TO_PX;
const PAGE_HEIGHT_PX = mmToPx(290);
const PAGE_WIDTH_PX = mmToPx(210);
const GRID_GAP_PX = 20;
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
  myTime: 'My Time',
  industrialExpertise: 'Industrial Expertise',
  awards: 'Awards',
  keyAchievements: 'Key Achievements',
  professionalStrengths: 'Professional Strengths',
  books: 'Books',
  volunteering: 'Volunteering Experience',
  additionalExperience: 'Additional Experience',
};

const PaginatedResume = (props) => {
  const {
    sectionRenderList,
    resumeData,
    sectionComponentMap,
    visibleSections,
    handleEdit,
    design,
    uploadProfileImage,
    changeSummaryAlignment 
  } = props;

  const [pages, setPages] = useState(null);
  const headerMeasurementRef = useRef(null);
  const titleMeasurementRef = useRef(null);
  const leftMeasureRef = useRef(null);
  const rightMeasureRef = useRef(null);

  const {
    font = 'Rubik',
    fontSize = 6,
    lineHeight = 1.6,
    titleColor = '#002b7f',
    subtitleColor = '#56acf2',
    margin = 1,
  } = design;

  const sectionStyle = { color: subtitleColor, fontFamily: font, fontSize: `${fontSize}px`, lineHeight };
  const headingStyle = { color: titleColor, fontFamily: font };

  const headerComponent = useMemo(() => {
    if (!visibleSections.header) return null;
    const Header = sectionComponentMap['header'];
    return (
      <Header
        data={resumeData.header}
        onEdit={(v) => handleEdit('header', v)}
        onUploadProfileImage={uploadProfileImage}
        sectionStyle={sectionStyle}
        headingStyle={headingStyle}
        design={design}
      />
    );
  }, [visibleSections.header, resumeData.header, design, handleEdit, uploadProfileImage]);

  useLayoutEffect(() => {
    if (!leftMeasureRef.current || !rightMeasureRef.current || !titleMeasurementRef.current) return;

    const animationFrameId = requestAnimationFrame(() => {
      const headerHeight = headerMeasurementRef.current?.offsetHeight || 0;
      const titleHeight = titleMeasurementRef.current?.offsetHeight || 40;

      const leftItems = [];
      const rightItems = [];

     
      sectionRenderList.forEach(({ key, column }) => {
        const sectionData = resumeData[key];
        const list = (column === 'left') ? leftItems : rightItems;

        if (key === 'myTime') { // Add this special condition
          if (sectionData && sectionData.length > 0) {
            // Treat the entire section as a single, indivisible item
            list.push({ id: key, sectionKey: key, data: sectionData, isSingle: true, index: 0 });
          }
  // Only skip if the section's data is truly missing
        } else if (sectionData !== undefined && sectionData !== null) {
          const list = (column === 'left') ? leftItems : rightItems;

          if (Array.isArray(sectionData)) {
            // Handle array sections (like Experience). If empty, still add it so its title can be rendered.
            if (sectionData.length === 0) {
              list.push({ id: key, sectionKey: key, data: [], isSingle: true, index: 0 });
            } else {
              sectionData.forEach((item, index) => {
                if (item != null) list.push({ id: `${key}-${index}`, sectionKey: key, data: item, index });
              });
            }
          } else {
            // Handle non-array sections (like Summary), including empty strings.
            list.push({ id: key, sectionKey: key, data: sectionData, isSingle: true, index: 0 });
          }
        }
      });

        const allElements = [
          ...Array.from(leftMeasureRef.current?.children || []),
          ...Array.from(rightMeasureRef.current?.children || [])
        ];
        const heights = {};
        allElements.forEach(el => {
          if (el.dataset.key) {
            let h = el.getBoundingClientRect().height;

            if (el.dataset.key.startsWith('industrialExpertise')) {
              h = h * 0.6;
            }

            if (el.dataset.key.startsWith('passions')) {
              h = h * 0.9;
            }

            if (el.dataset.key.startsWith('skills')) {
              h = h * 0.4;
            }

            heights[el.dataset.key] = h;
          }
        });



      const pagesArr = [];
      let leftItemIndex = 0;
      let rightItemIndex = 0;

      while (leftItemIndex < leftItems.length || rightItemIndex < rightItems.length) {
          const isFirstPage = pagesArr.length === 0;
          const availableHeight = (isFirstPage ? PAGE_HEIGHT_PX - headerHeight - mmToPx(20) : PAGE_HEIGHT_PX - mmToPx(20)) - SAFETY_MARGIN_PX;

          const currentPage = { left: {}, right: {} };
          let currentLeftHeight = 0;
          let currentRightHeight = 0;
          let leftColumnFull = false;
          let rightColumnFull = false;
          let itemsAddedInLoop = 0;

          while ((!leftColumnFull || !rightColumnFull) && (leftItemIndex < leftItems.length || rightItemIndex < rightItems.length)) {
            let itemPlacedOnThisPass = false;

            if (!leftColumnFull && leftItemIndex < leftItems.length) {
              const item = leftItems[leftItemIndex];
              const h = heights[item.id] || 0;
              const isFirstOfKindOnPage = !currentPage.left[item.sectionKey];
              const effectiveTitleHeight = isFirstOfKindOnPage ? titleHeight : 0;
              const gap = Object.values(currentPage.left).flat().length > 0 || (isFirstOfKindOnPage && Object.keys(currentPage.left).length > 0) ? GRID_GAP_PX : 0;
              const heightWithSpacing = h + effectiveTitleHeight + gap;

              if (currentLeftHeight + heightWithSpacing <= availableHeight) {
                if (!currentPage.left[item.sectionKey]) currentPage.left[item.sectionKey] = [];
                currentPage.left[item.sectionKey].push(item.index);
                currentLeftHeight += heightWithSpacing;
                leftItemIndex++;
                itemPlacedOnThisPass = true;
                itemsAddedInLoop++;
              } else {
                leftColumnFull = true;
              }
            } else {
              leftColumnFull = true;
            }

            if (!rightColumnFull && rightItemIndex < rightItems.length) {
              const item = rightItems[rightItemIndex];
              const h = heights[item.id] || 0;
              const isFirstOfKindOnPage = !currentPage.right[item.sectionKey];
              const effectiveTitleHeight = isFirstOfKindOnPage ? titleHeight : 0;
              const gap = Object.values(currentPage.right).flat().length > 0 || (isFirstOfKindOnPage && Object.keys(currentPage.right).length > 0) ? GRID_GAP_PX : 0;
              const heightWithSpacing = h + effectiveTitleHeight + gap;

              if (currentRightHeight + heightWithSpacing <= availableHeight) {
                if (!currentPage.right[item.sectionKey]) currentPage.right[item.sectionKey] = [];
                currentPage.right[item.sectionKey].push(item.index);
                currentRightHeight += heightWithSpacing;
                rightItemIndex++;
                itemPlacedOnThisPass = true;
                itemsAddedInLoop++;
              } else {
                rightColumnFull = true;
              }
            } else {
              rightColumnFull = true;
            }

            if (!itemPlacedOnThisPass && (leftColumnFull && rightColumnFull)) {
                 break;
            }
          }

          pagesArr.push(currentPage);

          if (itemsAddedInLoop === 0 && (leftItemIndex < leftItems.length || rightItemIndex < rightItems.length)) {
             if(leftItemIndex < leftItems.length) {
                const item = leftItems[leftItemIndex];
                if (!currentPage.left[item.sectionKey]) currentPage.left[item.sectionKey] = [];
                currentPage.left[item.sectionKey].push(item.index);
                leftItemIndex++;
             } else if(rightItemIndex < rightItems.length) {
                const item = rightItems[rightItemIndex];
                if (!currentPage.right[item.sectionKey]) currentPage.right[item.sectionKey] = [];
                currentPage.right[item.sectionKey].push(item.index);
                rightItemIndex++;
             } else {
                break;
             }
          }
      }
      setPages(pagesArr);
    });

    return () => cancelAnimationFrame(animationFrameId);
  }, [sectionRenderList, design, resumeData, headerComponent]);

  const renderMeasurementComponent = (key) => {
    const Component = sectionComponentMap[key];
    if (!Component) return null;
    const sectionData = resumeData[key];
    const componentProps = { data: sectionData, onEdit: () => {}, design, sectionStyle, headingStyle, isMeasuring: true };
    if (Array.isArray(sectionData)) {
      return sectionData.map((item, index) => (
        item != null && <div data-key={`${key}-${index}`} key={`${key}-${index}`}><Component {...componentProps} itemsToRender={[index]} /></div>
      ));
    }
    return (sectionData && <div data-key={key} key={key}><Component {...componentProps} itemsToRender={[0]} /></div>);
  };

  const renderPageComponent = (sectionKey, items) => {
    const Component = sectionComponentMap[sectionKey];
    if (!Component || !items || items.length === 0) return null;
    const sectionData = resumeData[sectionKey];
    
    const isFirstChunkOfSection = Array.isArray(sectionData) ? items.includes(0) : true;

    return (
      <div key={sectionKey} className="no-break" style={{
        marginBottom: `${GRID_GAP_PX}px`,
        border: '1px' // Add this line for debugging
      }}>
        {isFirstChunkOfSection && (
          <div>
            <h2 style={{...headingStyle, fontSize: '14px', color: '#000000' }} className="text-xl">{sectionLabels[sectionKey] || sectionKey}</h2>
            <hr style={{ borderTop: '2px solid #000000', margin: '0.25rem 0 0.5rem 0' }} />
          </div>
        )}
        <Component itemsToRender={items} data={sectionData} onEdit={(value) => handleEdit(sectionKey, value)} sectionStyle={sectionStyle} headingStyle={headingStyle} design={design} {...(sectionKey === 'summary' && { onChangeAlignment: changeSummaryAlignment })}/>
      </div>
    );
  };

  return (
    <>
      <div style={{ visibility: 'hidden', position: 'absolute', zIndex: -1, left: -10000, top: 0, padding: '1cm' }}>
        <div ref={headerMeasurementRef}>{headerComponent}</div>
        <div ref={titleMeasurementRef}>
            <h2 style={{...headingStyle, fontSize: '14px' }} className="text-xl">Title</h2>
            <hr style={{ borderTop: `2px solid ${design.subtitleColor || '#dddddd'}`, margin: '0.125rem 0 0.25rem 0' }} />
        </div>
        <div className="grid grid-cols-8 gap-6" style={{ width: PAGE_WIDTH_PX - mmToPx(20) }}>
          <div className="col-span-5 flex flex-col gap-0" ref={leftMeasureRef}>
            {sectionRenderList.filter(s => s.column === 'left').map(({ key }) => renderMeasurementComponent(key))}
          </div>
          <div className="col-span-3 flex flex-col gap-0" ref={rightMeasureRef}>
            {sectionRenderList.filter(s => s.column === 'right').map(({ key }) => renderMeasurementComponent(key))}
          </div>
        </div>
      </div>

      {pages ? (
        pages.map((page, pageIndex) => (
          <div key={pageIndex} className="resume-page" style={{ padding: `${margin}cm` }}>
            {pageIndex === 0 && headerComponent}
            <div className="grid grid-cols-8 gap-5">
              <div className="col-span-5 flex flex-col gap-0">
                {Object.entries(page.left).map(([sectionKey, items]) => renderPageComponent(sectionKey, items))}
              </div>
              <div className="col-span-3 flex flex-col gap-0">
                 {Object.entries(page.right).map(([sectionKey, items]) => renderPageComponent(sectionKey, items))}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="resume-page" style={{ padding: `${margin}cm` }}></div>
      )}
    </>
  );
};

export default PaginatedResume;