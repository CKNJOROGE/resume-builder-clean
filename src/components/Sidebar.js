import { useNavigate } from 'react-router-dom';

const Sidebar = ({ resumes, onLoad }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-900 text-white w-60 p-4">
      <h2 className="text-lg font-semibold mb-4">Your Resumes</h2>
      {resumes.length > 0 ? (
        resumes.map((resume, index) => (
          <button
            key={resume.id}
            onClick={() => onLoad(resume)}
            className="block w-full text-left mb-2 p-2 bg-slate-700 rounded hover:bg-slate-600"
          >
            Resume #{index + 1}
          </button>
        ))
      ) : (
        <p className="text-sm mb-2">No resumes yet.</p>
      )}

      {/* ✅ NEW BUTTON */}
      <button
        onClick={() => navigate('/select-template')}
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
      >
        + New Resume
      </button>
    </div>
  );
};

export default Sidebar;
