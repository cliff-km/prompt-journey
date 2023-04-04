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