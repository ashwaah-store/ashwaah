export function getProductImageUrls(
  imagesJson: string | null | undefined,
  colorsJson: string | null | undefined,
  selectedColor?: string | null
): string[] {
  try {
    if (!imagesJson) return [];
    const parsedImages = JSON.parse(imagesJson);
    
    if (Array.isArray(parsedImages)) {
      return parsedImages; // old format
    }
    
    // It's a Record format (object)
    if (selectedColor && parsedImages[selectedColor] && parsedImages[selectedColor].length > 0) {
      return parsedImages[selectedColor];
    }
    
    // If no selectedColor or not found, try the first color from colors list
    if (colorsJson) {
      const parsedColors = JSON.parse(colorsJson);
      if (Array.isArray(parsedColors) && parsedColors.length > 0) {
        const firstColor = parsedColors[0];
        if (parsedImages[firstColor] && parsedImages[firstColor].length > 0) {
          return parsedImages[firstColor];
        }
      }
    }
    
    // Try Default key
    if (parsedImages["Default"] && parsedImages["Default"].length > 0) {
      return parsedImages["Default"];
    }
    
    // Try any key
    const keys = Object.keys(parsedImages);
    if (keys.length > 0) {
      for (const k of keys) {
        if (parsedImages[k] && parsedImages[k].length > 0) {
          return parsedImages[k];
        }
      }
    }
    
    return [];
  } catch {
    return [];
  }
}

export function getFirstProductImageUrl(
  imagesJson: string | null | undefined,
  colorsJson: string | null | undefined,
  selectedColor?: string | null
): string {
  const urls = getProductImageUrls(imagesJson, colorsJson, selectedColor);
  return urls.length > 0 ? urls[0] : "/images/placeholder.png";
}
