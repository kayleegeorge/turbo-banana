/**
 * Remove background color from an image and make it transparent
 */
export async function removeBackground(
  imageData: string, 
  backgroundColor: 'black' | 'green' = 'black',
  tolerance: number = 30
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the image to canvas
      ctx.drawImage(img, 0, 0);
      
      // Get image data
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      // Define target color to remove
      let targetR, targetG, targetB;
      if (backgroundColor === 'black') {
        targetR = targetG = targetB = 0;
      } else if (backgroundColor === 'green') {
        targetR = 0; targetG = 255; targetB = 0; // Pure green
      }
      
      // Process each pixel
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate distance from target color
        const distance = Math.sqrt(
          Math.pow(r - targetR, 2) + 
          Math.pow(g - targetG, 2) + 
          Math.pow(b - targetB, 2)
        );
        
        // If close enough to target color, make transparent
        if (distance <= tolerance) {
          data[i + 3] = 0; // Set alpha to 0 (transparent)
        }
      }
      
      // Put the modified data back
      ctx.putImageData(imgData, 0, 0);
      
      // Convert to base64
      const result = canvas.toDataURL('image/png');
      resolve(result);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    
    // Handle both data URLs and regular URLs
    if (imageData.startsWith('data:')) {
      img.src = imageData;
    } else {
      img.crossOrigin = 'anonymous';
      img.src = imageData;
    }
  });
}

/**
 * Advanced background removal with edge smoothing
 */
export async function removeBackgroundAdvanced(
  imageData: string,
  backgroundColor: 'black' | 'green' = 'black',
  tolerance: number = 30,
  featherEdges: boolean = true
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      // Target color
      let targetR, targetG, targetB;
      if (backgroundColor === 'black') {
        targetR = targetG = targetB = 0;
      } else if (backgroundColor === 'green') {
        targetR = 0; targetG = 255; targetB = 0;
      }
      
      // Create alpha mask
      const alphaMap = new Uint8Array(canvas.width * canvas.height);
      
      for (let i = 0; i < data.length; i += 4) {
        const pixelIndex = i / 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const distance = Math.sqrt(
          Math.pow(r - targetR, 2) + 
          Math.pow(g - targetG, 2) + 
          Math.pow(b - targetB, 2)
        );
        
        if (distance <= tolerance) {
          alphaMap[pixelIndex] = 0; // Transparent
        } else if (distance <= tolerance * 1.5 && featherEdges) {
          // Gradual transparency near edges
          const alpha = Math.min(255, Math.max(0, (distance - tolerance) / (tolerance * 0.5) * 255));
          alphaMap[pixelIndex] = alpha;
        } else {
          alphaMap[pixelIndex] = 255; // Opaque
        }
      }
      
      // Apply alpha map
      for (let i = 0; i < data.length; i += 4) {
        const pixelIndex = i / 4;
        data[i + 3] = alphaMap[pixelIndex];
      }
      
      ctx.putImageData(imgData, 0, 0);
      
      const result = canvas.toDataURL('image/png');
      resolve(result);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    
    if (imageData.startsWith('data:')) {
      img.src = imageData;
    } else {
      img.crossOrigin = 'anonymous';
      img.src = imageData;
    }
  });
}

/**
 * Batch process multiple images to remove backgrounds
 */
export async function removeBackgroundBatch(
  images: Array<{id: string, imageData: string}>,
  backgroundColor: 'black' | 'green' = 'black',
  tolerance: number = 30
): Promise<Array<{id: string, processedImageData: string}>> {
  const results = await Promise.all(
    images.map(async (img) => {
      try {
        const processed = await removeBackground(img.imageData, backgroundColor, tolerance);
        return { id: img.id, processedImageData: processed };
      } catch (error) {
        console.error(`Failed to process image ${img.id}:`, error);
        return { id: img.id, processedImageData: img.imageData }; // Return original on error
      }
    })
  );
  
  return results;
}