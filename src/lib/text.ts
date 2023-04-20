function getTextBoxHeight(boxWidth: number, textLength: number, fontSize: number) {
    // Constants
    const averageCharWidthToFontSizeRatio = 0.6;
    const lineHeightMultiplier = 1.2;
    
    // Calculate the average character width
    const averageCharWidth = fontSize * averageCharWidthToFontSizeRatio;
    
    // Calculate the number of characters that can fit in one line
    const charsPerLine = Math.floor(boxWidth / averageCharWidth);
    
    // Calculate the number of lines needed to fit the text
    const numberOfLines = Math.ceil(textLength / charsPerLine);
    
    // Calculate the box height
    const boxHeight = numberOfLines * fontSize * lineHeightMultiplier;
    
    return boxHeight;
  }

export function getTextBoxDimensions(boxWidth: number, textLength: number, fontSize: number) {
    const height = getTextBoxHeight(boxWidth, textLength, fontSize) + 10;
    return [boxWidth, height];
}

export function getDisplayText (text: string) {
  let displayText = text;
  
  // if displaytext is too long try to split it at a comma and take the first part
  // if that's still too long truncate it at 20 characters
  if (text.length > 40) {
      const split = text.split(",");
      if (split.length > 1) {
          displayText = split[0] + "...";
      } else {
          displayText = text.slice(0, 20) + "...";
      }
  }
  return displayText;
}