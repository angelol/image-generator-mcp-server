import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import { FileSaver } from './file-saver.js';

vi.mock('fs', () => ({
  promises: {
    mkdir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('FileSaver', () => {
  let fileSaver: FileSaver;

  beforeEach(() => {
    fileSaver = new FileSaver();
    vi.clearAllMocks();
  });

  describe('saveBase64', () => {
    const base64Data = Buffer.from('test image data').toString('base64');

    it('saves base64 data to file', async () => {
      const result = await fileSaver.saveBase64('/path/to/output.png', base64Data);

      expect(fs.promises.mkdir).toHaveBeenCalledWith('/path/to', { recursive: true });
      expect(fs.promises.writeFile).toHaveBeenCalledWith('/path/to/output.png', expect.any(Buffer));
      expect(result).toBe('/path/to/output.png');
    });

    it('adds extension when missing', async () => {
      const result = await fileSaver.saveBase64('/path/to/output', base64Data, 'png');

      expect(result).toBe('/path/to/output.png');
      expect(fs.promises.writeFile).toHaveBeenCalledWith('/path/to/output.png', expect.any(Buffer));
    });

    it('does not duplicate extension when already present', async () => {
      const result = await fileSaver.saveBase64('/path/to/output.png', base64Data, 'png');

      expect(result).toBe('/path/to/output.png');
    });

    it('handles case-insensitive extension matching', async () => {
      const result = await fileSaver.saveBase64('/path/to/output.PNG', base64Data, 'png');

      expect(result).toBe('/path/to/output.PNG');
    });

    it('handles different file extensions', async () => {
      const result = await fileSaver.saveBase64('/path/to/output', base64Data, 'jpeg');

      expect(result).toBe('/path/to/output.jpeg');
    });

    it('creates directory recursively if it does not exist', async () => {
      await fileSaver.saveBase64('/deep/nested/path/to/output.png', base64Data);

      expect(fs.promises.mkdir).toHaveBeenCalledWith('/deep/nested/path/to', { recursive: true });
    });

    it('correctly decodes base64 data', async () => {
      const originalData = 'Hello, World!';
      const encoded = Buffer.from(originalData).toString('base64');
      await fileSaver.saveBase64('/path/to/output.txt', encoded, 'txt');

      const writeFileCall = vi.mocked(fs.promises.writeFile).mock.calls[0];
      const writtenBuffer = writeFileCall[1] as Buffer;
      expect(writtenBuffer.toString()).toBe(originalData);
    });
  });
});
