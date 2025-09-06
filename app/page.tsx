'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Sample project data
const sampleProjects = [
  {
    id: 1,
    title: 'THE MONSTERS',
    description: 'A modern e-commerce solution built with Next.js and TypeScript',
    status: 'Active',
    lastUpdated: '2 days ago',
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS']
  },
  {
    id: 2,
    title: 'TERRARIA',
    description: 'Collaborative task management tool with real-time updates',
    status: 'In Progress',
    lastUpdated: '5 hours ago',
    tags: ['React', 'Node.js', 'Socket.io']
  },
  {
    id: 3,
    title: 'Analytics Dashboard',
    description: 'Data visualization dashboard for business insights',
    status: 'Completed',
    lastUpdated: '1 week ago',
    tags: ['React', 'D3.js', 'Python']
  },
  {
    id: 4,
    title: 'Mobile Banking App',
    description: 'Secure mobile banking application with biometric authentication',
    status: 'Active',
    lastUpdated: '3 days ago',
    tags: ['React Native', 'Node.js', 'MongoDB']
  },
  {
    id: 5,
    title: 'AI Chat Assistant',
    description: 'Intelligent chat assistant powered by machine learning',
    status: 'In Progress',
    lastUpdated: '1 day ago',
    tags: ['Python', 'TensorFlow', 'FastAPI']
  },
  {
    id: 6,
    title: 'Video Streaming Platform',
    description: 'Netflix-like streaming platform with content management',
    status: 'Planning',
    lastUpdated: '4 days ago',
    tags: ['React', 'AWS', 'CDN']
  }
];

export default function Home() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');

  const handleCreateProject = () => {
    if (projectTitle.trim()) {
      // TODO: Add API call to create project
      console.log('Creating project:', projectTitle);
      setIsModalOpen(false);
      setProjectTitle('');
      // For now, just close the modal
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-5xl mb-2 tracking-tighter">Projects</h1>
          <p className="text-gray-600 dark:text-gray-400 tracking-tighter text-lg">Manage and track your projects</p>
        </div>


        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* First 2 Project Cards */}
          {sampleProjects.slice(0, 2).map((project, index) => (
            <div
              key={project.id}
              onClick={() => router.push(`/project/${project.id}`)}
              className="rounded-lg hover:shadow-lg transition-shadow cursor-pointer relative overflow-hidden"
              style={{ 
                aspectRatio: '1.618 / 1', 
                backgroundColor: '#1D1D1D',
                backgroundImage: `url(/${index === 0 ? 'labubu-a.png' : 'isometric-house.png'})`,
                backgroundSize: index === 0 ? '250px' : '200px',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Content Container */}
              <div className="p-6 h-full flex flex-col justify-between">
                {/* Project Title */}
                <div className="font-['Helvetica'] text-sm font-medium text-white uppercase tracking-tight line-clamp-3">
                  PROJECT {String(index + 1).padStart(2, '0')}: {project.title.toUpperCase()}
                </div>
                
                {/* Updated Timestamp */}
                <div className="font-['IBM_Plex_Mono'] text-xs text-gray-400 uppercase tracking-wider">
                  UPDATED {project.lastUpdated.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
          
          {/* Create New Project Card */}
          <div
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg hover:shadow-lg transition-shadow cursor-pointer relative overflow-hidden flex items-center justify-center"
            style={{ aspectRatio: '1.618 / 1', backgroundColor: '#1D1D1D' }}
          >
            {/* White Circle with Plus */}
            <div className="w-24 h-24 bg-white dark:bg-gray-100 rounded-full flex items-center justify-center shadow-lg">
              <svg 
                className="w-8 h-8 text-gray-600 dark:text-gray-700" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 4v16m8-8H4" 
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Create Project Modal */}
        {isModalOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
            onClick={() => {
              setIsModalOpen(false);
              setProjectTitle('');
            }}
          >
              <div 
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
              <h2 className="text-xl text-gray-900 dark:text-white mb-4">
                Create Project
              </h2>
              
              <div className="mb-4">
                <label htmlFor="project-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  PROJECT TITLE
                </label>
                <input
                  id="project-title"
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Enter project title..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  autoFocus
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setProjectTitle('');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={!projectTitle.trim()}
                  className="px-4 py-2 bg-white hover:bg-gray-100 disabled:bg-gray-400 disabled:cursor-not-allowed text-black disabled:text-white border border-gray-300 rounded-md transition-colors"
                >
                  Create Project
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
