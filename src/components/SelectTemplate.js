// src/components/SelectTemplate.js
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { FiEdit2, FiCopy, FiDownload, FiTrash2 } from 'react-icons/fi';
import '../index.css';

const DEFAULT_TEMPLATE_CONFIGS = {
  ats: {
    // ... (ats config remains the same)
  },
  modern: {
    design: {
      font: 'Rubik',
      fontSize: 6, // px
      lineHeight: 1.6,
      margin: 1, // cm
      spacing: 1.5, // rem
      titleColor: '#002b7f',
      subtitleColor: '#56acf2',
      summaryAlign: 'left'
    },
    visibleSections: {
      header: true, summary: true, experience: false, education: false, skills: false,
      projects: false, courses: false, achievements: false, languages: false, references: false,
      passions: false, hobbies: false, myTime: false, additionalExperience: false,
      awards: false, books: false, industrialExpertise: false, keyAchievements: false,
      professionalStrengths: false, volunteering: false,
    },
    // --- NOTE: 'header' has been removed from the default layout ---
    layout: {
      // Main content sections
      left: [
        'summary', 
        'experience', 
        'achievements',
        'projects', 
        'courses', 
        'keyAchievements',
        'additionalExperience',
        'volunteering'
      ],
      // Secondary, smaller sections
      right: [
        'education',
        'skills', 
        'languages', 
        'awards',
        'industrialExpertise',
        'professionalStrengths',
        'books',
        'passions',
        'hobbies',
        'myTime',
        'references'
      ]
    }
  },
  classic: {
    // ... (classic config remains the same)
  }
};

const templates = [
  { name: 'modern', title: 'Modern Resume', description: 'Clean, structured layout for professionals.' },
  { name: 'classic', title: 'Traditional Resume', description: 'Traditional resume layout with simplicity.' },
  { name: 'ats', title: 'ATS Resume', description: 'Optimized for applicant tracking systems.' },
];

const SelectTemplate = () => {
  const { authToken, user, logout } = useContext(AuthContext);
  const [resumes, setResumes] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (authToken) {
      fetchResumes();
    } else {
      navigate('/login', { replace: true });
    }
  }, [authToken, navigate]);

  const fetchResumes = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/resumes/`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setResumes(Array.isArray(data) ? data : []);
      } else {
        setResumes([]);
      }
    } catch {
      setResumes([]);
    }
  };

  const createResume = async (templateName) => {
    if (!authToken) { alert('Please log in.'); return; }
    setIsCreating(true);

    const defaultTemplateConfig = DEFAULT_TEMPLATE_CONFIGS[templateName.toLowerCase()];

    if (!defaultTemplateConfig) {
      alert(`Error: No default configuration found for template type "${templateName}".`);
      setIsCreating(false);
      return;
    }

    const clonedAndFlattenedData = JSON.parse(JSON.stringify({
      header: {},
      summary: '',
      experience: [],
      education: [],
      skills: [],
      projects: [],
      courses: [],
      achievements: [],
      languages: [],
      references: [],
      passions: [],
      hobbies: [],
      myTime: [],
      industrialExpertise: [],
      awards: [],
      keyAchievements: [],
      professionalStrengths: [],
      books: [],
      volunteering: [],
      additionalExperience: [],
      design: defaultTemplateConfig.design,
      visibleSections: defaultTemplateConfig.visibleSections,
      layout: defaultTemplateConfig.layout,
    }));


    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/resumes/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template: templateName,
          title: 'Untitled Resume',
          data: clonedAndFlattenedData
        })
      });
      if (res.ok) {
        const created = await res.json();
        await fetchResumes();
        navigate(`/editor/${created.id}`);
      } else {
        alert(`Error (${res.status}): ${await res.text()}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const deleteResume = async (id) => {
    if (!window.confirm('Delete this resume?')) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/resumes/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) fetchResumes();
      else alert(`Failed to delete (${res.status})`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const duplicateResume = async (resume) => {
    const duplicatedData = JSON.parse(JSON.stringify(resume.data || {}));

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/resumes/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template: resume.template,
          title: `${resume.title} (Copy)`,
          data: duplicatedData
        })
      });
      if (res.ok) fetchResumes();
      else alert(`Failed to duplicate (${res.status})`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (!authToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-500 flex items-center justify-center">
        <div className="text-center p-8 bg-white/30 backdrop-blur-lg border border-white/40 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-extrabold mb-4 text-gray-100">Please log in</h1>
          <p className="text-gray-200">You need an account to create and manage resumes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 overflow-hidden">
      <header className="relative w-full mb-12 py-8">
        <img
          src="/hero-resume.svg"
          alt="Resume Builder"
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-16"
        />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold mb-2 text-gray-100">
            Pick Your Resume Style
          </h1>
          {user && (
            <p className="text-gray-200">
              Welcome back, <span className="font-medium">{user}</span>!
            </p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out"
        >
          Logout
        </button>
      </header>

      <div className="relative z-10 container mx-auto px-4 pb-12">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {templates.map(tpl => (
            <div
              key={tpl.name}
              className="bg-black/40 backdrop-blur-4xl border border-gray-200/40 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow p-6 flex flex-col"
            >
              <h2 className="text-2xl font-semibold mb-3 text-white">{tpl.title}</h2>
              <p className="text-white flex-grow">{tpl.description}</p>
              <button
                onClick={() => createResume(tpl.name)}
                disabled={isCreating}
                className="text-white btn-primary mt-6"
              >
                {isCreating ? 'Creating…' : `Use ${tpl.title}`}
              </button>
            </div>
          ))}
        </section>

        <hr className="border-white/40 mb-12" />

        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-100">Your Resumes</h2>
          {resumes.length === 0 ? (
            <p className="text-gray-200">No resumes yet. Pick a template above to get started.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {resumes.map((resume, idx) => (
                <div
                  key={resume.id}
                  className="bg-black/40 backdrop-blur-xl border border-gray-200/40 rounded-2xl shadow-lg p-6 flex flex-col"
                >
                  <div className="text-sm text-white/80 mb-2">RESUME #{idx + 1}</div>
                  <h3 className="text-xl font-semibold mb-1 text-white">{resume.title}</h3>
                  <div className="text-xs text-white/80 mb-2">
                    Last modified: {new Date(resume.updated).toLocaleString()}
                  </div>
                  <div className="text-sm text-white/80 mb-4">Template: {resume.template}</div>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(`/editor/${resume.id}`)}
                      className="flex items-center text-white hover:text-gray-200 text-sm font-medium"
                    >
                      <FiEdit2 className="mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => duplicateResume(resume)}
                      className="flex items-center text-white hover:text-gray-200 text-sm font-medium"
                    >
                      <FiCopy className="mr-1" /> Duplicate
                    </button>
                    <button
                    className="flex items-center text-white hover:text-gray-200 text-sm font-medium"
                    >
                      <FiDownload className="mr-1" /> Download
                    </button>
                    <button
                      onClick={() => deleteResume(resume.id)}
                      className="flex items-center text-white hover:text-gray-200 text-sm font-medium"
                    >
                      <FiTrash2 className="mr-1" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SelectTemplate;