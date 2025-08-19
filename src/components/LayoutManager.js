import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const sectionLabels = {
  summary: 'Summary',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  courses: 'Courses',
  achievements: 'Achievements',
  languages: 'Languages',
  references: 'References',
  passions: 'Passions',
  hobbies: 'Hobbies',
  myTime: 'My Time',
  industrialExpertise: 'Industrial Expertise',
  awards: 'Awards',
  professionalStrengths: 'Professional Strengths',
  books: 'Books',
  volunteering: 'Volunteering',
  additionalExperience: 'Additional Experience',
};

const LayoutManager = ({ layout = { left: [], right: [] }, onLayoutChange, onClose }) => {
  const handleOnDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceColId = source.droppableId;
    const destColId = destination.droppableId;

    // Create a mutable copy to work with
    const newLayout = {
      left: [...(layout.left || [])],
      right: [...(layout.right || [])],
    };

    if (sourceColId === destColId) {
      // Reordering within the same column
      const items = newLayout[sourceColId];
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
    } else {
      // Moving from one column to another
      const sourceCol = newLayout[sourceColId];
      const destCol = newLayout[destColId];
      const [movedItem] = sourceCol.splice(source.index, 1);
      destCol.splice(destination.index, 0, movedItem);
    }

    onLayoutChange(newLayout);
  };

  return (
    <div className="fixed top-16 right-1 z-50 w-80 bg-white rounded-xl shadow-xl p-4 border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Reorder Sections</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
      </div>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <div className="grid grid-cols-2 gap-4">
          {/* Left Column */}
          <div>
            <h4 className="text-sm font-bold text-center text-gray-600 mb-2">Left Column</h4>
            <Droppable droppableId="left">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`p-2 rounded-lg min-h-[200px] transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-100'}`}
                >
                  {(layout.left || []).map((key, index) => (
                    <Draggable key={key} draggableId={key} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-2 border rounded-md text-xs font-medium mb-2 ${snapshot.isDragging ? 'bg-blue-100 shadow-md' : 'bg-white'}`}
                        >
                          {sectionLabels[key] || key}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* Right Column */}
          <div>
            <h4 className="text-sm font-bold text-center text-gray-600 mb-2">Right Column</h4>
            <Droppable droppableId="right">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`p-2 rounded-lg min-h-[200px] transition-colors ${snapshot.isDraggingOver ? 'bg-green-50' : 'bg-gray-100'}`}
                >
                  {(layout.right || []).map((key, index) => (
                    <Draggable key={key} draggableId={key} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-2 border rounded-md text-xs font-medium mb-2 ${snapshot.isDragging ? 'bg-green-100 shadow-md' : 'bg-white'}`}
                        >
                          {sectionLabels[key] || key}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

export default LayoutManager;