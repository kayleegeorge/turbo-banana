'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Project } from './lib/types';


export default function Home() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/projects/list');
        const data = await response.json();
        if (data.success) {
          setProjects(data.projects);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const handleCreateProject = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/projects/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: crypto.randomUUID(),
          name: 'Untitled',
          prompt: null,
          coverImageId: null
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh the projects list
        const projectsResponse = await fetch('http://localhost:3000/api/projects/list');
        const projectsData = await projectsResponse.json();
        if (projectsData.success) {
          setProjects(projectsData.projects);
        }
      } else {
        console.error('Error creating project:', data.error);
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleEditProject = (projectId: string, currentName: string) => {
    setEditingProject(projectId);
    setEditingName(currentName);
  };

  const handleSaveEdit = async (projectId: string) => {
    if (!editingName.trim()) return;

    try {
      const response = await fetch(`http://localhost:3000/api/project/${projectId}/name`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingName.trim()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update the project in local state
        setProjects(prev => 
          prev.map(project => 
            project.id === projectId 
              ? { ...project, name: editingName.trim() }
              : project
          )
        );
        setEditingProject(null);
        setEditingName('');
        
        // Show success toast
        setToastMessage('Project name updated.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        console.error('Error updating project name:', data.error);
      }
    } catch (error) {
      console.error('Error updating project name:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setEditingName('');
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
          {loading ? (
            // Skeleton loading state
            <>
              {/* Skeleton Project Card */}
              {[1].map((index) => (
                <div
                  key={`skeleton-${index}`}
                  className="rounded-lg relative overflow-hidden animate-pulse"
                  style={{ 
                    aspectRatio: '1.618 / 1', 
                    backgroundColor: '#1D1D1D'
                  }}
                >
                  {/* Content Container */}
                  <div className="p-6 h-full flex flex-col justify-between">
                    {/* Skeleton Project Title */}
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-600 rounded w-1/2"></div>
                    </div>
                    
                    {/* Skeleton Timestamp */}
                    <div className="h-3 bg-gray-600 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
              
              {/* Create New Project Card - Always visible */}
              <div
                onClick={handleCreateProject}
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
            </>
          ) : (
            <>
              {/* Project Cards */}
              {projects.slice(0, 2).map((project, index) => (
            <div
              key={project.id}
              onClick={() => router.push(`/project/${project.id}`)}
              className="rounded-lg hover:shadow-lg transition-shadow cursor-pointer relative overflow-hidden group"
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
                {editingProject === project.id ? (
                  <div className="w-full" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEdit(project.id);
                        } else if (e.key === 'Escape') {
                          handleCancelEdit();
                        }
                      }}
                      className="bg-gray-700 text-white px-2 py-1 rounded text-xs w-full focus:outline-none focus:ring-1 focus:ring-gray-500 mb-2"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(project.id)}
                        className="bg-white hover:bg-gray-200 text-black px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="font-['Helvetica'] text-sm font-medium text-white uppercase tracking-tight line-clamp-3 flex items-start gap-2">
                    <span className="flex-1">
                      PROJECT {String(index + 1).padStart(2, '0')}: {project.name.toUpperCase()}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProject(project.id, project.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white ml-1"
                      title="Edit project name"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {/* Updated Timestamp */}
                <div className="font-['IBM_Plex_Mono'] text-xs text-gray-400 uppercase tracking-wider">
                  PROJECT ID: {project.id.substring(0, 8).toUpperCase()}
                </div>
              </div>
            </div>
              ))}
              
              {/* Create New Project Card */}
              <div
                onClick={handleCreateProject}
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
            </>
          )}
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div 
            className="fixed top-6 right-6 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-in slide-in-from-top-2 duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{toastMessage}</span>
          </div>
        )}

      </div>
    </div>
  );
}
