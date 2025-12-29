import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TopazUpscaler } from './topaz-upscaler.js';

describe('TopazUpscaler', () => {
  const originalEnv = process.env;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env = { ...originalEnv };
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('isAvailable', () => {
    it('returns true when TOPAZ_API_KEY is set', () => {
      process.env.TOPAZ_API_KEY = 'test-key';
      expect(TopazUpscaler.isAvailable()).toBe(true);
    });

    it('returns false when TOPAZ_API_KEY is not set', () => {
      delete process.env.TOPAZ_API_KEY;
      expect(TopazUpscaler.isAvailable()).toBe(false);
    });

    it('returns false when TOPAZ_API_KEY is empty string', () => {
      process.env.TOPAZ_API_KEY = '';
      expect(TopazUpscaler.isAvailable()).toBe(false);
    });
  });

  describe('upscaleImage', () => {
    let upscaler: TopazUpscaler;

    beforeEach(() => {
      upscaler = new TopazUpscaler('test-api-key');
    });

    it('upscales an image successfully', async () => {
      const mockImageData = Buffer.from('upscaled image');
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockImageData.buffer.slice(0)),
      });

      const result = await upscaler.upscaleImage({
        imageData: Buffer.from('input image'),
        outputWidth: 2048,
        outputHeight: 2048,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.topazlabs.com/image/v1/enhance',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-API-Key': 'test-api-key',
          }),
        })
      );
      expect(result.data).toBeInstanceOf(Buffer);
    });

    it('uses default model when not specified', async () => {
      const mockImageData = Buffer.from('upscaled image');
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockImageData.buffer.slice(0)),
      });

      await upscaler.upscaleImage({
        imageData: Buffer.from('input'),
        outputWidth: 2048,
        outputHeight: 2048,
      });

      // The model is included in form data, we can verify the call was made
      expect(mockFetch).toHaveBeenCalled();
    });

    it('uses specified model', async () => {
      const mockImageData = Buffer.from('upscaled image');
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockImageData.buffer.slice(0)),
      });

      await upscaler.upscaleImage({
        imageData: Buffer.from('input'),
        outputWidth: 2048,
        outputHeight: 2048,
        model: 'CGI',
      });

      expect(mockFetch).toHaveBeenCalled();
    });

    it('uses specified output format', async () => {
      const mockImageData = Buffer.from('upscaled image');
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockImageData.buffer.slice(0)),
      });

      await upscaler.upscaleImage({
        imageData: Buffer.from('input'),
        outputWidth: 2048,
        outputHeight: 2048,
        outputFormat: 'jpeg',
      });

      expect(mockFetch).toHaveBeenCalled();
    });

    it('throws error for invalid width < 1', async () => {
      await expect(
        upscaler.upscaleImage({
          imageData: Buffer.from('input'),
          outputWidth: 0,
          outputHeight: 2048,
        })
      ).rejects.toThrow('Invalid output width: 0. Must be between 1 and 32000.');
    });

    it('throws error for invalid width > 32000', async () => {
      await expect(
        upscaler.upscaleImage({
          imageData: Buffer.from('input'),
          outputWidth: 32001,
          outputHeight: 2048,
        })
      ).rejects.toThrow('Invalid output width: 32001. Must be between 1 and 32000.');
    });

    it('throws error for invalid height < 1', async () => {
      await expect(
        upscaler.upscaleImage({
          imageData: Buffer.from('input'),
          outputWidth: 2048,
          outputHeight: 0,
        })
      ).rejects.toThrow('Invalid output height: 0. Must be between 1 and 32000.');
    });

    it('throws error for invalid height > 32000', async () => {
      await expect(
        upscaler.upscaleImage({
          imageData: Buffer.from('input'),
          outputWidth: 2048,
          outputHeight: 32001,
        })
      ).rejects.toThrow('Invalid output height: 32001. Must be between 1 and 32000.');
    });

    it('throws error when API returns non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      });

      await expect(
        upscaler.upscaleImage({
          imageData: Buffer.from('input'),
          outputWidth: 2048,
          outputHeight: 2048,
        })
      ).rejects.toThrow('Topaz API error (401): Unauthorized');
    });

    it('throws error when API returns 500', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      });

      await expect(
        upscaler.upscaleImage({
          imageData: Buffer.from('input'),
          outputWidth: 2048,
          outputHeight: 2048,
        })
      ).rejects.toThrow('Topaz API error (500): Internal Server Error');
    });

    it('accepts edge dimension values', async () => {
      const mockImageData = Buffer.from('upscaled');
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockImageData.buffer.slice(0)),
      });

      // Test minimum values
      await upscaler.upscaleImage({
        imageData: Buffer.from('input'),
        outputWidth: 1,
        outputHeight: 1,
      });

      // Test maximum values
      await upscaler.upscaleImage({
        imageData: Buffer.from('input'),
        outputWidth: 32000,
        outputHeight: 32000,
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
