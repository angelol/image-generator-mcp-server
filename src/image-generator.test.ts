import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageGenerator } from './image-generator.js';

// Mock OpenAI
vi.mock('openai', () => {
  const mockGenerate = vi.fn();
  const mockEdit = vi.fn();

  return {
    default: vi.fn().mockImplementation(() => ({
      images: {
        generate: mockGenerate,
        edit: mockEdit,
      },
    })),
    toFile: vi.fn().mockResolvedValue({ name: 'image.png' }),
  };
});

// Mock fs for editImage
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn().mockResolvedValue(Buffer.from('fake image data')),
  },
}));

import OpenAI from 'openai';

describe('ImageGenerator', () => {
  let imageGenerator: ImageGenerator;
  let mockOpenAI: {
    images: { generate: ReturnType<typeof vi.fn>; edit: ReturnType<typeof vi.fn> };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    imageGenerator = new ImageGenerator('test-api-key');
    // Get reference to the mock instance
    mockOpenAI = vi.mocked(OpenAI).mock.results[0].value;
  });

  describe('generateImage', () => {
    it('generates an image successfully', async () => {
      const mockBase64 = 'base64encodedimage';
      mockOpenAI.images.generate.mockResolvedValue({
        data: [{ b64_json: mockBase64 }],
      });

      const result = await imageGenerator.generateImage('a cat');

      expect(mockOpenAI.images.generate).toHaveBeenCalledWith({
        model: 'gpt-image-1.5',
        prompt: 'a cat',
        size: '1024x1024',
        output_format: 'png',
        quality: 'high',
      });
      expect(result).toBe(mockBase64);
    });

    it('uses default size when not specified', async () => {
      mockOpenAI.images.generate.mockResolvedValue({
        data: [{ b64_json: 'base64data' }],
      });

      await imageGenerator.generateImage('a cat');

      expect(mockOpenAI.images.generate).toHaveBeenCalledWith(
        expect.objectContaining({ size: '1024x1024' })
      );
    });

    it('uses specified size', async () => {
      mockOpenAI.images.generate.mockResolvedValue({
        data: [{ b64_json: 'base64data' }],
      });

      await imageGenerator.generateImage('a cat', '1536x1024');

      expect(mockOpenAI.images.generate).toHaveBeenCalledWith(
        expect.objectContaining({ size: '1536x1024' })
      );
    });

    it('uses auto size', async () => {
      mockOpenAI.images.generate.mockResolvedValue({
        data: [{ b64_json: 'base64data' }],
      });

      await imageGenerator.generateImage('a cat', 'auto');

      expect(mockOpenAI.images.generate).toHaveBeenCalledWith(
        expect.objectContaining({ size: 'auto' })
      );
    });

    it('uses specified output format', async () => {
      mockOpenAI.images.generate.mockResolvedValue({
        data: [{ b64_json: 'base64data' }],
      });

      await imageGenerator.generateImage('a cat', undefined, 'webp');

      expect(mockOpenAI.images.generate).toHaveBeenCalledWith(
        expect.objectContaining({ output_format: 'webp' })
      );
    });

    it('throws error when no data received', async () => {
      mockOpenAI.images.generate.mockResolvedValue({ data: null });

      await expect(imageGenerator.generateImage('a cat')).rejects.toThrow(
        'Failed to generate image: No image data received'
      );
    });

    it('throws error when empty data array', async () => {
      mockOpenAI.images.generate.mockResolvedValue({ data: [] });

      await expect(imageGenerator.generateImage('a cat')).rejects.toThrow(
        'Failed to generate image: No image data received'
      );
    });

    it('throws error when no b64_json in response', async () => {
      mockOpenAI.images.generate.mockResolvedValue({
        data: [{ url: 'http://example.com/image.png' }],
      });

      await expect(imageGenerator.generateImage('a cat')).rejects.toThrow(
        'Failed to generate image: No image data received'
      );
    });
  });

  describe('editImage', () => {
    it('edits an image successfully', async () => {
      const mockBase64 = 'editedbase64image';
      mockOpenAI.images.edit.mockResolvedValue({
        data: [{ b64_json: mockBase64 }],
      });

      const result = await imageGenerator.editImage(['/path/to/image.png'], 'remove background');

      expect(mockOpenAI.images.edit).toHaveBeenCalledWith({
        model: 'gpt-image-1.5',
        image: expect.any(Array),
        prompt: 'remove background',
        size: 'auto',
        quality: 'high',
      });
      expect(result).toBe(mockBase64);
    });

    it('uses specified size option', async () => {
      mockOpenAI.images.edit.mockResolvedValue({
        data: [{ b64_json: 'base64data' }],
      });

      await imageGenerator.editImage(['/path/to/image.png'], 'edit', { size: '1024x1024' });

      expect(mockOpenAI.images.edit).toHaveBeenCalledWith(
        expect.objectContaining({ size: '1024x1024' })
      );
    });

    it('includes background option when specified', async () => {
      mockOpenAI.images.edit.mockResolvedValue({
        data: [{ b64_json: 'base64data' }],
      });

      await imageGenerator.editImage(['/path/to/image.png'], 'edit', { background: 'transparent' });

      expect(mockOpenAI.images.edit).toHaveBeenCalledWith(
        expect.objectContaining({ background: 'transparent' })
      );
    });

    it('handles multiple input images', async () => {
      mockOpenAI.images.edit.mockResolvedValue({
        data: [{ b64_json: 'base64data' }],
      });

      await imageGenerator.editImage(['/path/1.png', '/path/2.png'], 'combine');

      expect(mockOpenAI.images.edit).toHaveBeenCalled();
    });

    it('throws error when no data received', async () => {
      mockOpenAI.images.edit.mockResolvedValue({ data: null });

      await expect(imageGenerator.editImage(['/path/to/image.png'], 'edit')).rejects.toThrow(
        'Failed to edit image: No image data received'
      );
    });

    it('throws error when empty data array', async () => {
      mockOpenAI.images.edit.mockResolvedValue({ data: [] });

      await expect(imageGenerator.editImage(['/path/to/image.png'], 'edit')).rejects.toThrow(
        'Failed to edit image: No image data received'
      );
    });

    it('throws error when no b64_json in response', async () => {
      mockOpenAI.images.edit.mockResolvedValue({
        data: [{ url: 'http://example.com/image.png' }],
      });

      await expect(imageGenerator.editImage(['/path/to/image.png'], 'edit')).rejects.toThrow(
        'Failed to edit image: No image data received'
      );
    });
  });

  describe('constructor', () => {
    it('initializes with provided API key', () => {
      new ImageGenerator('custom-api-key');
      expect(OpenAI).toHaveBeenCalledWith({ apiKey: 'custom-api-key' });
    });
  });
});
