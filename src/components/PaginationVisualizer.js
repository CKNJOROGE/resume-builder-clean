import React from 'react';

const getItemPreview = (item) => {
  if (!item || !item.data) return item.sectionKey;
  if (typeof item.data === 'string') return item.data.substring(0, 30);
  if (item.data.title) return item.data.title;
  if (item.data.degree) return item.data.degree;
  if (item.data.language) return item.data.language;
  if (item.data.skill) return item.data.skill;
  return item.sectionKey;
};

const PaginationVisualizer = ({ data }) => {
  if (!data) return null;

  const { pages, heights, pageMetrics, allItems } = data;
  const { titleHeight, headerHeight, spacingInPx, pageHeight, totalVerticalMarginPx, SAFETY_MARGIN_PX } = pageMetrics;
  const scale = 600 / pageHeight;

  const visualizerStyle = {
    position: 'fixed', bottom: 0, left: 0, width: '100%',
    background: '#1a202c', color: 'white', zIndex: 10000,
    padding: '1rem', borderTop: '2px solid #4a5568', fontFamily: 'monospace',
    fontSize: '11px', display: 'flex', gap: '1rem', overflowX: 'auto',
  };

  const pageStyle = {
    flexShrink: 0, width: '450px', height: `${pageHeight * scale}px`,
    background: '#2d3748', border: '2px solid #a0aec0', position: 'relative',
  };

  const blockBaseStyle = {
    width: '100%', boxSizing: 'border-box', overflow: 'hidden',
    padding: '2px 4px', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
    borderBottom: '1px solid #1a202c',
  };

  const renderColumnContent = (columnData, columnType) => {
    if (!columnData) return null;
    return Object.entries(columnData).map(([sectionKey, itemIndices]) => {
      const isFirstChunkOfSection = itemIndices.includes(0);
      return (
        <React.Fragment key={`${columnType}-${sectionKey}`}>
          {isFirstChunkOfSection && (
            <div style={{ ...blockBaseStyle, height: `${titleHeight * scale}px`, background: '#9f7aea', color: 'white' }}>
              <strong>Title ({sectionKey}):</strong> {titleHeight.toFixed(0)}px
            </div>
          )}
          {itemIndices.map(itemIndex => {
            const item = allItems.find(i => i.sectionKey === sectionKey && i.index === itemIndex);
            if (!item) return null;
            const itemHeight = heights[item.id] || 0;
            return (
              <div key={item.id} style={{ ...blockBaseStyle, height: `${itemHeight * scale}px`, background: '#4299e1' }}>
                <strong>{item.id}:</strong> {getItemPreview(item)} ({itemHeight.toFixed(0)}px)
              </div>
            );
          })}
        </React.Fragment>
      );
    });
  };

  return (
    <div style={visualizerStyle}>
      {pages.map((page, pageIndex) => {
        // --- THIS LOGIC IS NOW CORRECT ---
        const pageContentHeight = pageHeight - (pageIndex === 0 ? headerHeight : 0);
        const availableHeightForPage = pageContentHeight - totalVerticalMarginPx - SAFETY_MARGIN_PX;
        const topOffset = (pageIndex === 0 ? headerHeight : 0);

        const pageLimitLineStyle = {
          position: 'absolute', width: '100%', borderTop: '1px dashed #f56565',
          left: 0, top: `${(topOffset + availableHeightForPage) * scale}px`,
        };
        const pageLimitLabelStyle = {
          position: 'absolute', color: '#f56565', background: '#1a202c',
          padding: '0 4px', left: '5px', top: `${(topOffset + availableHeightForPage) * scale}px`,
          transform: 'translateY(-100%)',
        };

        return (
          <div key={pageIndex}>
            <div style={{ marginBottom: '5px' }}><strong>Page {pageIndex + 1}</strong></div>
            <div style={pageStyle}>
              {pageIndex === 0 && headerHeight > 0 && (
                <div style={{ ...blockBaseStyle, height: `${headerHeight * scale}px`, background: '#4a5568', color: '#e2e8f0' }}>
                  <strong>Header:</strong> {headerHeight.toFixed(0)}px
                </div>
              )}
              <div style={{ display: 'flex', height: `calc(100% - ${pageIndex === 0 ? headerHeight * scale : 0}px)` }}>
                <div style={{ width: '62.5%', borderRight: '2px solid #a0aec0' }}>
                  {renderColumnContent(page.left, 'left')}
                </div>
                <div style={{ width: '37.5%' }}>
                  {renderColumnContent(page.right, 'right')}
                </div>
              </div>
              <div style={pageLimitLineStyle} />
              <div style={pageLimitLabelStyle}>Page Limit</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PaginationVisualizer;