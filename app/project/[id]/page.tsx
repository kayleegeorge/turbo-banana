'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Project, Set } from '../../lib/types';

type ProjectAttachmentData = {
  url: string;
  attachmentId: string;
};

type ProjectWithSets = {
  id: string;
  name: string;
  prompt: string | null;
  coverImageId: string | null;
  promptImageUrls: string[];
  promptAttachments: ProjectAttachmentData[];
  sets: Set[];
};

interface PageProps {
  params: {
    id: string;
  };
}

export default function ProjectPage({ params }: PageProps) {
  const router = useRouter();
  const [projectPrompt, setProjectPrompt] = useState('');
  const [isPromptSaving, setIsPromptSaving] = useState(false);
  const [promptImages, setPromptImages] = useState<File[]>([]);
  const [savedPromptImageUrls, setSavedPromptImageUrls] = useState<string[]>([]);
  const [savedPromptAttachments, setSavedPromptAttachments] = useState<ProjectAttachmentData[]>([]);
  const [project, setProject] = useState<ProjectWithSets | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [editingSet, setEditingSet] = useState<string | null>(null);
  const [editingSetName, setEditingSetName] = useState('');

  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/api/project/${params.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: params.id })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }

        const projectData = await response.json();
        setProject(projectData);
        setProjectPrompt(projectData.prompt || '');
        setSavedPromptImageUrls(projectData.promptImageUrls || []);
        setSavedPromptAttachments(projectData.promptAttachments || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [params.id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="px-6 py-8">
          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Left Column - Title and Project Prompt Skeleton */}
            <div className="space-y-8">
              {/* Project Title Skeleton */}
              <div>
                <div className="h-16 bg-gray-700 rounded w-3/4 animate-pulse"></div>
              </div>
              
              {/* Project Prompt Skeleton */}
              <div 
                className="rounded-lg relative overflow-hidden animate-pulse" 
                style={{ 
                  aspectRatio: '1.618/1', 
                  backgroundColor: '#1D1D1D' 
                }}
              >
                {/* Content Container */}
                <div className="p-6 h-full flex flex-col">
                  {/* Label skeleton */}
                  <div className="mb-4">
                    <div className="h-4 bg-gray-600 rounded w-32"></div>
                  </div>
                  
                  {/* Content area skeleton */}
                  <div className="flex-1 flex flex-col pr-16">
                    {/* Text lines */}
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-600 rounded w-full"></div>
                      <div className="h-3 bg-gray-600 rounded w-4/5"></div>
                      <div className="h-3 bg-gray-600 rounded w-3/5"></div>
                    </div>
                  </div>
                  
                  {/* Save button skeleton */}
                  <div className="absolute bottom-6 right-6 w-10 h-10 bg-gray-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Right Column - Sets Skeleton */}
            <div>
              {/* Sets Title Skeleton */}
              <div className="mb-6">
                <div className="h-16 bg-gray-700 rounded w-1/2 animate-pulse mb-8"></div>
              </div>
              
              {/* Sets Grid Skeleton */}
              <div className="grid grid-cols-2 gap-4">
                {/* Set Card Skeleton */}
                {[1].map((index) => (
                  <div
                    key={`set-skeleton-${index}`}
                    className="rounded-lg relative overflow-hidden animate-pulse"
                    style={{ 
                      aspectRatio: '1.618 / 1', 
                      backgroundColor: '#1D1D1D'
                    }}
                  >
                    {/* Content Container */}
                    <div className="p-4 h-full flex flex-col justify-between">
                      {/* Set Title Skeleton */}
                      <div className="space-y-2">
                        <div className="h-6 bg-gray-600 rounded w-3/4"></div>
                      </div>
                      
                      {/* Bottom info skeleton */}
                      <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
                
                {/* Create New Set Card - Always visible */}
                <div
                  className="rounded-lg relative overflow-hidden flex items-center justify-center"
                  style={{ aspectRatio: '1.618 / 1', backgroundColor: '#1D1D1D' }}
                >
                  {/* White Circle with Plus */}
                  <div className="w-12 h-12 bg-white dark:bg-gray-100 rounded-full flex items-center justify-center shadow-lg">
                    <svg 
                      className="w-5 h-5 text-gray-600 dark:text-gray-700" 
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {error ? 'Error Loading Project' : 'Project Not Found'}
          </h1>
          {error && <p className="text-gray-500 mb-4">{error}</p>}
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors"
            style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
          >
            BACK TO PROJECTS
          </button>
        </div>
      </div>
    );
  }


  const handleSavePrompt = async () => {
    setIsPromptSaving(true);
    
    try {
      const formData = new FormData();
      formData.append('prompt', projectPrompt);
      
      // Add new images to FormData
      promptImages.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });
      
      const response = await fetch(`http://localhost:3000/api/project/${params.id}/prompt`, {
        method: 'PUT',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Clear the new images and reload the project data
        setPromptImages([]);
        
        // Refresh project data to get updated image URLs
        const projectResponse = await fetch(`http://localhost:3000/api/project/${params.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: params.id })
        });
        
        if (projectResponse.ok) {
          const projectData = await projectResponse.json();
          setSavedPromptImageUrls(projectData.promptImageUrls || []);
        }
        
        // Show success toast
        setToastMessage('Project prompt saved.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        console.error('Failed to save prompt:', result.error);
      }
    } catch (error) {
      console.error('Failed to save prompt:', error);
    } finally {
      setIsPromptSaving(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPromptImages(prev => [...prev, ...files]);
  };

  const handleRemoveImage = (index: number) => {
    setPromptImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveSavedImage = async (index: number) => {
    const attachmentToDelete = savedPromptAttachments[index];
    if (!attachmentToDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/api/project/${params.id}/attachment/${attachmentToDelete.attachmentId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        // Remove from local state
        setSavedPromptImageUrls(prev => prev.filter((_, i) => i !== index));
        setSavedPromptAttachments(prev => prev.filter((_, i) => i !== index));
        
        // Show success toast
        setToastMessage('Attachment deleted.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        console.error('Failed to delete attachment:', result.error);
      }
    } catch (error) {
      console.error('Failed to delete attachment:', error);
    }
  };

  const handlePaste = async (event: React.ClipboardEvent) => {
    const items = event.clipboardData.items;
    const imageFiles: File[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length > 0) {
      setPromptImages(prev => [...prev, ...imageFiles]);
    }
  };

  const handleCreateSet = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/project/${params.id}/set/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Untitled'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh the project data to get the new set
        const projectResponse = await fetch(`http://localhost:3000/api/project/${params.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: params.id })
        });
        
        if (projectResponse.ok) {
          const projectData = await projectResponse.json();
          setProject(projectData);
        }
      } else {
        console.error('Error creating set:', data.error);
      }
    } catch (error) {
      console.error('Error creating set:', error);
    }
  };

  const handleEditSet = (setId: string, currentName: string) => {
    setEditingSet(setId);
    setEditingSetName(currentName);
  };

  const handleSaveSetEdit = async (setId: string) => {
    if (!editingSetName.trim()) return;

    try {
      const response = await fetch(`http://localhost:3000/api/project/${params.id}/set/${setId}/name`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingSetName.trim()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update the set in local state
        setProject(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            sets: prev.sets.map(set => 
              set.id === setId 
                ? { ...set, name: editingSetName.trim() }
                : set
            )
          };
        });
        setEditingSet(null);
        setEditingSetName('');
        
        // Show success toast
        setToastMessage('Set name updated.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        console.error('Error updating set name:', data.error);
      }
    } catch (error) {
      console.error('Error updating set name:', error);
    }
  };

  const handleCancelSetEdit = () => {
    setEditingSet(null);
    setEditingSetName('');
  };



  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="px-6 py-8">
        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Title and Master Prompt */}
          <div className="space-y-8">
            {/* Project Title */}
            <div>
              <h1 className="text-5xl mb-2 tracking-tighter">{project.name}</h1>
            </div>
            
            {/* Master Prompt */}
            <div 
              className="rounded-lg relative overflow-hidden" 
              style={{ 
                aspectRatio: '1.618/1', 
                backgroundColor: '#1D1D1D' 
              }}
            >
              {/* Content Container */}
              <div className="p-6 h-full flex flex-col">
                {/* Label in top left */}
                <div className="mb-4 flex items-center gap-2">
                  <h2 className="font-['Helvetica'] text-sm font-medium text-white uppercase tracking-tight">
                    PROJECT PROMPT
                  </h2>
                  <div className="group relative">
                    <svg 
                      className="w-4 h-4 text-gray-400 hover:text-white transition-colors cursor-help" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    {/* Tooltip */}
                    <div className="absolute left-0 top-6 invisible group-hover:visible bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-20">
                      Define the project prompt for all generations in this project
                    </div>
                  </div>
                </div>
                
                {/* Content area with images and textarea */}
                <div className="flex-1 flex flex-col pr-16">
                  {/* Images Display - Both Saved and New */}
                  {(savedPromptImageUrls.length > 0 || promptImages.length > 0) && (
                    <div className="mb-4 flex flex-wrap gap-3">
                      {/* Display saved images */}
                      {savedPromptImageUrls.map((imageUrl, index) => (
                        <div key={`saved-${index}`} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Saved prompt image ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-600 shadow-sm"
                          />
                          <button
                            onClick={() => handleRemoveSavedImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg border border-gray-600"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      
                      {/* Display new images to be saved */}
                      {promptImages.map((image, index) => (
                        <div key={`new-${index}`} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`New prompt image ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border border-yellow-600 shadow-sm"
                          />
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg border border-gray-600"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Textarea with attachment button */}
                  <div className="flex-1 relative">
                    <textarea
                      value={projectPrompt}
                      onChange={(e) => setProjectPrompt(e.target.value)}
                      onPaste={handlePaste}
                      placeholder="Enter your project prompt here..."
                      className="w-full h-full bg-transparent border-none focus:outline-none focus:ring-0 text-white placeholder-gray-400 resize-none pr-12 pb-12"
                      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                    />
                    
                    {/* Paperclip/Attachment button */}
                    <div className="absolute bottom-2 left-2">
                      <input
                        type="file"
                        id="prompt-images"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="prompt-images"
                        className="inline-flex items-center justify-center w-8 h-8 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-full cursor-pointer transition-all shadow-sm"
                        title="Attach images"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Checkmark save button in bottom right */}
                <button
                  onClick={handleSavePrompt}
                  disabled={isPromptSaving}
                  className="absolute bottom-6 right-6 w-10 h-10 bg-white hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed text-black rounded-full flex items-center justify-center transition-colors shadow-lg"
                  title="Save Project Prompt"
                >
                  {isPromptSaving ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Sets starting at title level */}
          <div>
            {/* Sets Title - aligned with project title */}
            <div className="mb-6">
              <h2 className="text-5xl mb-8 tracking-tighter text-gray-400">
                Sets
              </h2>
            </div>
            
            {/* Sets Grid */}
            <div className="grid grid-cols-2 gap-4">
              {project.sets && project.sets.length > 0 ? project.sets.map((set, index) => (
                <div
                  key={set.id}
                  onClick={() => router.push(`/project/${params.id}/set/${set.id}`)}
                  className="rounded-lg hover:shadow-lg transition-shadow cursor-pointer relative overflow-hidden group"
                  style={{ 
                    aspectRatio: '1.618 / 1', 
                    backgroundColor: '#1D1D1D',
                    backgroundImage: `url(/${index === 1 ? 'isometric-house.png' : 'labubu-a.png'})`,
                    backgroundSize: index === 1 ? '150px' : '180px',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  {/* Content Container */}
                  <div className="p-4 h-full flex flex-col justify-between">
                    {/* Set Title */}
                    {editingSet === set.id ? (
                      <div className="w-full" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingSetName}
                          onChange={(e) => setEditingSetName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveSetEdit(set.id);
                            } else if (e.key === 'Escape') {
                              handleCancelSetEdit();
                            }
                          }}
                          className="bg-gray-700 text-white px-2 py-1 rounded text-lg w-full focus:outline-none focus:ring-1 focus:ring-gray-500 mb-2"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveSetEdit(set.id)}
                            className="bg-white hover:bg-gray-200 text-black px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save
                          </button>
                          <button
                            onClick={handleCancelSetEdit}
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
                      <div className="text-3xl mb-2 tracking-tighter text-gray-400 line-clamp-2 flex items-start gap-2">
                        <span className="flex-1">{set.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSet(set.id, set.name);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-300 ml-1"
                          title="Edit set name"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    {/* Bottom info */}
                    <div className="flex justify-between items-end">
                      <div className="font-['IBM_Plex_Mono'] text-xs text-gray-400 uppercase tracking-wider">
                        SET ID: {set.id.substring(0, 8).toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              )) : null}
              
              {/* Add New Set Card */}
              <div
                onClick={handleCreateSet}
                className="rounded-lg hover:shadow-lg transition-shadow cursor-pointer relative overflow-hidden flex items-center justify-center"
                style={{ aspectRatio: '1.618 / 1', backgroundColor: '#1D1D1D' }}
              >
                {/* White Circle with Plus */}
                <div className="w-12 h-12 bg-white dark:bg-gray-100 rounded-full flex items-center justify-center shadow-lg">
                  <svg 
                    className="w-5 h-5 text-gray-600 dark:text-gray-700" 
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
          </div>
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
