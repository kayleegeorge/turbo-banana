'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Sample sets data for a project
const sampleSets = [
  {
    id: 1,
    name: 'Alphabet Letters',
    description: 'Complete A-Z letter collection in various styles',
    itemCount: 26,
    createdAt: '2 days ago',
    lastModified: '5 hours ago'
  },
  {
    id: 2,
    name: 'Modern Furniture',
    description: 'Contemporary furniture pieces for home and office',
    itemCount: 18,
    createdAt: '1 week ago',
    lastModified: '2 days ago'
  },
  {
    id: 3,
    name: 'Cozy Houses',
    description: 'Residential homes in different architectural styles',
    itemCount: 12,
    createdAt: '3 days ago',
    lastModified: '1 day ago'
  },
  {
    id: 4,
    name: 'Fashion Hats',
    description: 'Stylish headwear collection for all seasons',
    itemCount: 15,
    createdAt: '5 days ago',
    lastModified: '3 days ago'
  },
  {
    id: 5,
    name: 'Fun Stickers',
    description: 'Colorful sticker pack with emojis and characters',
    itemCount: 32,
    createdAt: '1 week ago',
    lastModified: '4 hours ago'
  },
  {
    id: 6,
    name: 'Kitchen Tools',
    description: 'Essential cooking utensils and appliances',
    itemCount: 14,
    createdAt: '4 days ago',
    lastModified: '6 hours ago'
  }
];

// Sample project data - in a real app, this would come from an API or database
const sampleProjects = [
  {
    id: 1,
    title: 'The Monsters',
    description: 'A modern e-commerce solution built with Next.js and TypeScript',
    status: 'Active',
    lastUpdated: '2 days ago',
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS']
  },
  {
    id: 2,
    title: 'Task Management App',
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

interface PageProps {
  params: {
    id: string;
  };
}

export default function ProjectPage({ params }: PageProps) {
  const router = useRouter();
  const [masterPrompt, setMasterPrompt] = useState('');
  const [isPromptSaving, setIsPromptSaving] = useState(false);
  const [promptImages, setPromptImages] = useState<File[]>([]);
  const [isSetModalOpen, setIsSetModalOpen] = useState(false);
  const [newSetTitle, setNewSetTitle] = useState('');

  // Find the project by ID - in a real app, this would be an API call
  const project = sampleProjects.find(p => p.id === parseInt(params.id));

  // If project not found, show error or redirect
  if (!project) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
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
    
    // TODO: Implement API call to save master prompt and images
    // Example API call:
    // try {
    //   const formData = new FormData();
    //   formData.append('prompt', masterPrompt);
    //   promptImages.forEach((image, index) => {
    //     formData.append(`image_${index}`, image);
    //   });
    //   await fetch(`/api/projects/${params.id}/prompt`, {
    //     method: 'PUT',
    //     body: formData
    //   });
    // } catch (error) {
    //   console.error('Failed to save prompt:', error);
    // }
    
    console.log('Saving master prompt:', masterPrompt);
    console.log('Saving prompt images:', promptImages);
    setTimeout(() => setIsPromptSaving(false), 1000);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPromptImages(prev => [...prev, ...files]);
  };

  const handleRemoveImage = (index: number) => {
    setPromptImages(prev => prev.filter((_, i) => i !== index));
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

  const handleCreateSet = () => {
    if (newSetTitle.trim()) {
      // TODO: Add API call to create set
      console.log('Creating set:', newSetTitle);
      setIsSetModalOpen(false);
      setNewSetTitle('');
      // For now, just close the modal
      // In a real app, you would add the new set to the sets list and navigate to it
    }
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
              <h1 className="text-5xl mb-2 tracking-tighter">{project.title}</h1>
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
                    MASTER PROMPT
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
                      Define the master prompt for all generations in this project
                    </div>
                  </div>
                </div>
                
                {/* Content area with images and textarea */}
                <div className="flex-1 flex flex-col pr-16">
                  {/* Uploaded Images Display */}
                  {promptImages.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-3">
                      {promptImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Prompt image ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-600 shadow-sm"
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
                      value={masterPrompt}
                      onChange={(e) => setMasterPrompt(e.target.value)}
                      onPaste={handlePaste}
                      placeholder="Enter your master prompt here..."
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
                  title="Save Master Prompt"
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
              {sampleSets.map((set, index) => (
                <div
                  key={set.id}
                  onClick={() => router.push(`/project/${params.id}/set/${set.id}`)}
                  className="rounded-lg hover:shadow-lg transition-shadow cursor-pointer relative overflow-hidden"
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
                    <div className="text-3xl mb-2 tracking-tighter text-gray-400 line-clamp-2">
                      {set.name}
                    </div>
                    
                    {/* Bottom info */}
                    <div className="flex justify-between items-end">
                      <div className="font-['IBM_Plex_Mono'] text-xs text-gray-400 uppercase tracking-wider">
                        MODIFIED {set.lastModified.toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">
                        {set.itemCount} ITEMS
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add New Set Card */}
              <div
                onClick={() => setIsSetModalOpen(true)}
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

        {/* Create Set Modal */}
        {isSetModalOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
            onClick={() => {
              setIsSetModalOpen(false);
              setNewSetTitle('');
            }}
          >
            <div 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl text-gray-900 dark:text-white mb-4">
                Create Set
              </h2>
              
              <div className="mb-4">
                <label htmlFor="set-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SET TITLE
                </label>
                <input
                  id="set-title"
                  type="text"
                  value={newSetTitle}
                  onChange={(e) => setNewSetTitle(e.target.value)}
                  placeholder="Enter set title..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  autoFocus
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsSetModalOpen(false);
                    setNewSetTitle('');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSet}
                  disabled={!newSetTitle.trim()}
                  className="px-4 py-2 bg-white hover:bg-gray-100 disabled:bg-gray-400 disabled:cursor-not-allowed text-black disabled:text-white border border-gray-300 rounded-md transition-colors"
                >
                  Create Set
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
