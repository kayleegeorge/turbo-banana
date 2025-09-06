'use client';

import { useState } from 'react';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [count, setCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix to get just the base64 string
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt.trim()) {
      setError('Please upload an image and enter a prompt');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults(null);

    try {
      const base64Image = await convertImageToBase64(selectedImage);
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          styleImage: base64Image,
          prompt: prompt.trim(),
          count: count,
          mimeType: selectedImage.type
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data);
      } else {
        setError(data.error || 'Generation failed');
      }
    } catch (err) {
      setError('An error occurred during generation');
      console.error('Generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Image Generation Tester</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Upload Style Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full h-auto max-h-64 rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to generate..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Number of Images</label>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                min="1"
                max="10"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !selectedImage || !prompt.trim()}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating...' : 'Generate Images'}
            </button>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Results</h2>
            
            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Generating images...</p>
              </div>
            )}

            {results && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                  <p><strong>Success!</strong> Generated {results.successfulImages} of {results.totalGenerated} images</p>
                  <p><strong>Original Prompt:</strong> {results.originalPrompt}</p>
                </div>

                {results.definitions && (
                  <div>
                    <h3 className="font-medium mb-2">Generated Definitions:</h3>
                    <ul className="space-y-1">
                      {results.definitions.map((def: string, index: number) => (
                        <li key={index} className="p-2 bg-gray-50 rounded text-sm">
                          {index + 1}. {def}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {results.images && (
                  <div>
                    <h3 className="font-medium mb-2">Generated Images:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {results.images.map((image: any, index: number) => (
                        <div key={index} className="space-y-2">
                          {image.success && image.imageData ? (
                            <img
                              src={`data:image/png;base64,${image.imageData}`}
                              alt={`Generated ${index + 1}`}
                              className="w-full h-auto rounded-lg shadow-md"
                            />
                          ) : (
                            <div className="w-full h-32 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center text-red-600">
                              Failed: {image.error || 'Unknown error'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isLoading && !results && (
              <div className="text-center py-8 text-gray-500">
                Upload an image and enter a prompt to get started
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
