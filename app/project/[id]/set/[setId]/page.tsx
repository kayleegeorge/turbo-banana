'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, Loader2 } from 'lucide-react';
import { removeBackgroundBatch } from '@/app/lib/imageUtils';




interface PageProps {
  params: Promise<{
    id: string;
    setId: string;
  }>;
}

interface GeneratedImage {
  id: string;
  imageData?: string; // Base64 data for immediate display
  imageUrl?: string;  // Saved URL from blob store
  definition: string;
  success: boolean;
  error?: string;
}

export default function SetPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [isGenerating, setIsGenerating] = useState(false);
  const [setPrompt, setSetPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [processedImages, setProcessedImages] = useState<{[key: string]: string}>({});
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Load project data
  useEffect(() => {
    const loadProject = async () => {
      try {
        const response = await fetch(`/api/project/${resolvedParams.id}`);
        const data = await response.json();
        setProject(data);
        
        // Load the current set's prompt
        const currentSet = data.sets?.find((set: any) => set.id === resolvedParams.setId);
        if (currentSet && currentSet.prompts) {
          setSetPrompt(currentSet.prompts);
        }
      } catch (error) {
        console.error('Failed to load project:', error);
      } finally {
        setIsLoadingProject(false);
      }
    };

    loadProject();
  }, [resolvedParams.id, resolvedParams.setId]);

  // Load existing images on page load
  useEffect(() => {
    const loadExistingImages = async () => {
      try {
        const response = await fetch(`/api/projects/${resolvedParams.id}/sets/${resolvedParams.setId}`);
        const result = await response.json();

        if (result.success && result.set.images.length > 0) {
          const loadedImages: GeneratedImage[] = result.set.images.map((img: any) => ({
            id: img.id,
            imageUrl: img.url,
            definition: img.definition || `Generated image`,
            success: true,
          }));
          setGeneratedImages(loadedImages);
          
          // Process loaded images to remove backgrounds
          setIsProcessingImages(true);
          try {
            const imagesToProcess = loadedImages
              .filter(img => img.success && img.imageUrl)
              .map(img => ({
                id: img.id,
                imageData: img.imageUrl!
              }));
            
            if (imagesToProcess.length > 0) {
              const backgroundRemoved = await removeBackgroundBatch(imagesToProcess, 'black', 30);
              const processedMap: {[key: string]: string} = {};
              backgroundRemoved.forEach(result => {
                processedMap[result.id] = result.processedImageData;
              });
              setProcessedImages(processedMap);
            }
          } catch (error) {
            console.error('Failed to remove backgrounds from loaded images:', error);
            // Continue without background removal
          } finally {
            setIsProcessingImages(false);
          }
        }
      } catch (error) {
        console.error('Failed to load existing images:', error);
      } finally {
        setIsLoadingImages(false);
      }
    };

    loadExistingImages();
  }, [resolvedParams.id, resolvedParams.setId]);

  // Show loading state while fetching project
  if (isLoadingProject) {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        {/* Left Sidebar Skeleton */}
        <div className="bg-black border-r border-white flex flex-col" style={{ width: '640px' }}>
          {/* Header Skeleton */}
          <div className="p-6">
            <div className="h-12 bg-gray-700 rounded animate-pulse"></div>
          </div>


          {/* Set Prompt Section Skeleton */}
          <div className="px-6">
            <div 
              className="rounded-lg relative overflow-hidden mb-6 bg-gray-700 animate-pulse" 
              style={{ aspectRatio: '1.618/1' }}
            >
            </div>

            {/* Generate Button Skeleton */}
            <div className="w-full h-12 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>

          <div className="flex-1"></div>
        </div>

        {/* Main Content Area Skeleton */}
        <div className="flex-1 p-6 relative">
          {/* Header Skeleton */}
          <div className="mb-6">
            <div className="h-12 w-24 bg-gray-700 rounded animate-pulse"></div>
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square rounded-lg bg-gray-700 animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If project not found, show error
  if (!project) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <button
            onClick={() => router.push(`/`)}
            className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      // Check if we have a prompt
      if (!setPrompt) {
        setGenerationError('Please enter a prompt before generating.');
        setIsGenerating(false);
        return;
      }

      // Save the prompt to database first
      try {
        await fetch(`/api/project/${resolvedParams.id}/set/${resolvedParams.setId}/prompt`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: setPrompt.trim()
          })
        });
      } catch (error) {
        console.error('Error saving set prompt:', error);
        // Continue with generation even if saving fails
      }

      // No style images needed for now
      const styleImages: { data: string; mimeType: string }[] = [];

      // Use default count of 12 items
      const itemCount = 12;
      
      // Show toast that request was received
      setToastMessage('Generation request received. Processing...');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      // Call the generate API with asset generation flow
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          styleImages: styleImages,
          prompt: setPrompt,
          count: itemCount,
          setId: resolvedParams.setId // Include setId to save images automatically
        }),
      });

      const result = await response.json();

      if (result.success && result.images) {
        // Process the generated images with hybrid approach
        const processedImages: GeneratedImage[] = result.images.map((img: any, index: number) => {
          const savedImage = result.savedImages?.[index];
          return {
            id: savedImage?.id || `image-${Date.now()}-${index}`,
            imageData: img.imageData || '', // Immediate display
            imageUrl: savedImage?.url || '', // Saved URL (may be empty if save failed)
            definition: result.definitions[index] || `Generated image ${index + 1}`,
            success: img.success,
            error: img.error
          };
        });

        setGeneratedImages(processedImages);
        
        // Process images to remove backgrounds
        setIsProcessingImages(true);
        try {
          const imagesToProcess = processedImages
            .filter(img => img.success && img.imageData)
            .map(img => ({
              id: img.id,
              imageData: `data:image/png;base64,${img.imageData}`
            }));
          
          if (imagesToProcess.length > 0) {
            const backgroundRemoved = await removeBackgroundBatch(imagesToProcess, 'black', 30);
            const processedMap: {[key: string]: string} = {};
            backgroundRemoved.forEach(result => {
              processedMap[result.id] = result.processedImageData;
            });
            setProcessedImages(processedMap);
          }
        } catch (error) {
          console.error('Failed to remove backgrounds:', error);
          // Continue without background removal
        } finally {
          setIsProcessingImages(false);
        }
      } else {
        setGenerationError(result.error || 'Failed to generate images. Please try again.');
      }
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteImage = async (imageId: string, index: number) => {
    try {
      // Call API to delete the image from the database
      const response = await fetch(`/api/projects/${resolvedParams.id}/sets/${resolvedParams.setId}/images/${imageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the image from local state
        setGeneratedImages(prevImages => prevImages.filter(img => img.id !== imageId));
        // Also remove from processed images
        setProcessedImages(prevProcessed => {
          const newProcessed = { ...prevProcessed };
          delete newProcessed[imageId];
          return newProcessed;
        });
        
        // Show success toast
        setToastMessage(`Item ${String(index + 1).padStart(2, '0')} deleted`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        throw new Error('Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      // Show error toast
      setToastMessage('Failed to delete item');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Generate cards based on the number of generated images, or default to 12 if no images
  const itemCount = generatedImages.length > 0 ? generatedImages.length : 12;
  const emptyCards = Array.from({ length: itemCount }, (_, index) => index);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Left Sidebar */}
      <div className="bg-black border-r border-white flex flex-col" style={{ width: '640px' }}>
        {/* Header */}
        <div className="p-6">
          <div className="text-5xl tracking-tighter text-white">
            {project.name} / {project.sets?.find((set: any) => set.id === resolvedParams.setId)?.name || `Set ${resolvedParams.setId}`}
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
              
              {/* Content area with textarea */}
              <div className="flex-1 flex flex-col">
                {/* Textarea */}
                <div className="flex-1 relative">
                  <textarea
                    value={setPrompt}
                    onChange={(e) => setSetPrompt(e.target.value)}
                    placeholder="Enter set-specific prompt..."
                    className="w-full h-full bg-transparent border-none focus:outline-none focus:ring-0 text-white placeholder-gray-400 resize-none"
                    style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {generationError && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-red-400 text-sm">{generationError}</p>
              </div>
            </div>
          )}

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
          {emptyCards.map((index) => {
            const generatedImage = generatedImages[index];
            const hasImage = generatedImage && generatedImage.success;
            
            // Prefer processed image, then saved URL, fallback to base64 data, then default placeholder
            let imageUrl = '/labubu-a.png';
            if (hasImage) {
              // Use processed image with removed background if available
              if (processedImages[generatedImage.id]) {
                imageUrl = processedImages[generatedImage.id];
              } else if (generatedImage.imageUrl) {
                imageUrl = generatedImage.imageUrl;
              } else if (generatedImage.imageData) {
                imageUrl = `data:image/png;base64,${generatedImage.imageData}`;
              }
            }
            
            return (
              <div
                key={index}
                className="aspect-square rounded-lg relative overflow-hidden cursor-pointer group"
                style={{
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundColor: '#1D1D1D'
                }}
                title={generatedImage?.definition}
              >
                {/* Label in top left */}
                <div className="absolute top-3 left-3">
                  <span className="font-['Helvetica'] text-xs text-white uppercase tracking-tight">
                    ITEM {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                
                {/* Processing indicator */}
                {isProcessingImages && hasImage && !processedImages[generatedImage.id] && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-white text-xs flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </div>
                  </div>
                )}
                
                {/* Error indicator if generation failed */}
                {generatedImage && !generatedImage.success && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center" title={generatedImage.error}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Delete button - always shown if there's an image */}
                {hasImage && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(generatedImage.id, index);
                    }}
                    className="absolute top-3 right-3 w-6 h-6 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    title={`Delete Item ${String(index + 1).padStart(2, '0')}`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                
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
            );
          })}
        </div>

        {/* Loading State for initial image load */}
        {isLoadingImages && (
          <div className="text-center py-12 mt-8">
            <Loader2 className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Loading Images...
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Checking for existing images in this set.
            </p>
          </div>
        )}

        {/* Empty State Message - only show if no images have been generated */}
        {generatedImages.length === 0 && !isGenerating && !isLoadingImages && (
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
              Add a prompt in the sidebar, then click Generate Set to create new items.
            </p>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
