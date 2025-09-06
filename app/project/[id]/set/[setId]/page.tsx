'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, Loader2 } from 'lucide-react';

// Sample data - in a real app, this would come from an API
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

const sampleSets = [
  {
    id: 1,
    name: 'Alphabet',
    description: 'Complete set of authentication components and logic',
    itemCount: 12,
    createdAt: '2 days ago',
    lastModified: '5 hours ago',
    type: 'Components'
  },
  {
    id: 2,
    name: 'Dashboard Widgets',
    description: 'Collection of reusable dashboard widgets and charts',
    itemCount: 8,
    createdAt: '1 week ago',
    lastModified: '2 days ago',
    type: 'UI Components'
  },
  {
    id: 3,
    name: 'API Endpoints',
    description: 'REST API endpoints for user management',
    itemCount: 15,
    createdAt: '3 days ago',
    lastModified: '1 day ago',
    type: 'Backend'
  },
  {
    id: 4,
    name: 'Database Models',
    description: 'Data models and schema definitions',
    itemCount: 6,
    createdAt: '5 days ago',
    lastModified: '3 days ago',
    type: 'Database'
  },
  {
    id: 5,
    name: 'Test Suites',
    description: 'Comprehensive test cases for all components',
    itemCount: 24,
    createdAt: '1 week ago',
    lastModified: '4 hours ago',
    type: 'Testing'
  },
  {
    id: 6,
    name: 'Utility Functions',
    description: 'Shared utility functions and helpers',
    itemCount: 9,
    createdAt: '4 days ago',
    lastModified: '6 hours ago',
    type: 'Utils'
  }
];

interface PageProps {
  params: {
    id: string;
    setId: string;
  };
}

export default function SetPage({ params }: PageProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [setPrompt, setSetPrompt] = useState('');
  const [isPromptSaving, setIsPromptSaving] = useState(false);
  const [setPromptImages, setSetPromptImages] = useState<File[]>([]);
  
  // Find the project and set by ID - in a real app, this would be API calls
  const project = sampleProjects.find(p => p.id === parseInt(params.id));
  const set = sampleSets.find(s => s.id === parseInt(params.setId));

  // If project or set not found, show error
  if (!project || !set) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Set Not Found</h1>
          <button
            onClick={() => router.push(`/project/${params.id}`)}
            className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors"
          >
            Back to Project
          </button>
        </div>
      </div>
    );
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // TODO: Implement actual generation API call
    // Simulate API call delay
    setTimeout(() => {
      setIsGenerating(false);
      console.log('Generation completed');
    }, 2000);
  };

  const handleSavePrompt = async () => {
    setIsPromptSaving(true);
    
    // TODO: Implement API call to save set prompt and images
    // Example API call:
    // try {
    //   const formData = new FormData();
    //   formData.append('prompt', setPrompt);
    //   setPromptImages.forEach((image, index) => {
    //     formData.append(`image_${index}`, image);
    //   });
    //   await fetch(`/api/projects/${params.id}/sets/${params.setId}/prompt`, {
    //     method: 'PUT',
    //     body: formData
    //   });
    // } catch (error) {
    //   console.error('Failed to save set prompt:', error);
    // }
    
    console.log('Saving set prompt:', setPrompt);
    console.log('Saving set prompt images:', setPromptImages);
    setTimeout(() => setIsPromptSaving(false), 1000);
  };

  const handleSetImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSetPromptImages(prev => [...prev, ...files]);
  };

  const handleRemoveSetImage = (index: number) => {
    setSetPromptImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSetPaste = async (event: React.ClipboardEvent) => {
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
      setSetPromptImages(prev => [...prev, ...imageFiles]);
    }
  };

  // Generate empty cards for the grid
  const emptyCards = Array.from({ length: 12 }, (_, index) => index);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Left Sidebar */}
      <div className="bg-black border-r border-white flex flex-col" style={{ width: '640px' }}>
        {/* Header */}
        <div className="p-6">
          <div className="text-5xl tracking-tighter text-white">
            {project.title} / {set.name}
          </div>
        </div>

        {/* Set Prompt Section */}
        <div className="px-6">
          <div 
            className="rounded-lg relative overflow-hidden mb-6" 
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
                  SET PROMPT
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
                    Specific prompt for this set that will be combined with the master prompt
                  </div>
                </div>
              </div>
              
              {/* Content area with images and textarea */}
              <div className="flex-1 flex flex-col pr-16">
                {/* Uploaded Images Display */}
                {setPromptImages.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-3">
                    {setPromptImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Set prompt image ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-600 shadow-sm"
                        />
                        <button
                          onClick={() => handleRemoveSetImage(index)}
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
                    value={setPrompt}
                    onChange={(e) => setSetPrompt(e.target.value)}
                    onPaste={handleSetPaste}
                    placeholder="Enter set-specific prompt..."
                    className="w-full h-full bg-transparent border-none focus:outline-none focus:ring-0 text-white placeholder-gray-400 resize-none pr-12 pb-12"
                    style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  />
                  
                  {/* Paperclip/Attachment button */}
                  <div className="absolute bottom-2 left-2">
                    <input
                      type="file"
                      id="set-prompt-images"
                      multiple
                      accept="image/*"
                      onChange={handleSetImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="set-prompt-images"
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
              
              {/* Circular save button in bottom right */}
              <button
                onClick={handleSavePrompt}
                disabled={isPromptSaving}
                className="absolute bottom-6 right-6 w-10 h-10 bg-white hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed text-black rounded-full flex items-center justify-center transition-colors shadow-lg"
                title="Save Set Prompt"
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

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3 bg-white hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed text-black text-lg rounded-lg transition-colors flex items-center justify-center gap-3"
          >
            {isGenerating ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Generating Set...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Set
              </>
            )}
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 relative">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-5xl tracking-tighter text-gray-400">
            Set
          </h2>
        </div>

        {/* Grid of Items - 4 per row */}
        <div className="grid grid-cols-4 gap-4">
          {emptyCards.map((index) => (
            <div
              key={index}
              className="aspect-square rounded-lg relative overflow-hidden cursor-pointer group"
              style={{
                backgroundImage: `url(/labubu-a.png)`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: '#1D1D1D'
              }}
            >
              {/* Label in top left */}
              <div className="absolute top-3 left-3">
                <span className="font-['Helvetica'] text-xs text-white uppercase tracking-tight">
                  ITEM {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              
              {/* Retry button in bottom right of each item */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleGenerate();
                }}
                disabled={isGenerating}
                className="absolute bottom-3 right-3 w-8 h-8 bg-white hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed text-black rounded-full flex items-center justify-center transition-colors shadow-lg"
                title={`Retry Item ${String(index + 1).padStart(2, '0')}`}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Empty State Message */}
        <div className="text-center py-12 mt-8">
          <svg
            className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No items generated yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Use the generate button in the sidebar to create new items for this set.
          </p>
        </div>
      </div>
    </div>
  );
}
