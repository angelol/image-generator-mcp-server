import * as fs from 'fs';
import * as path from 'path';

/**
 * Utility class to handle saving files with appropriate error handling
 */
export class FileSaver {
  /**
   * Save a base64-encoded string as a file
   * 
   * @param filePath The absolute path where the file should be saved
   * @param base64Data The base64-encoded data to save
   * @param fileExtension The file extension to add if not already present (default: 'png')
   * @returns The full path where the file was saved
   */
  async saveBase64(filePath: string, base64Data: string, fileExtension = 'png'): Promise<string> {
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Add extension if needed
    if (fileExtension && !filePath.toLowerCase().endsWith(`.${fileExtension.toLowerCase()}`)) {
      filePath = `${filePath}.${fileExtension}`;
    }
    
    // Ensure directory exists
    const directory = path.dirname(filePath);
    await fs.promises.mkdir(directory, { recursive: true });
    
    // Write the file
    await fs.promises.writeFile(filePath, buffer);
    
    return filePath;
  }
}