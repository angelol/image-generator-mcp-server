import { describe, it, expect } from 'vitest';
import { isValidImageGenerationArgs, isValidUpscaleArgs, isValidImageEditArgs } from './types.js';

describe('isValidImageGenerationArgs', () => {
  it('returns true for valid minimal args', () => {
    expect(isValidImageGenerationArgs({ prompt: 'test', outputPath: '/path/to/file' })).toBe(true);
  });

  it('returns true for valid args with size', () => {
    expect(
      isValidImageGenerationArgs({ prompt: 'test', outputPath: '/path', size: '1024x1024' })
    ).toBe(true);
    expect(isValidImageGenerationArgs({ prompt: 'test', outputPath: '/path', size: 'auto' })).toBe(
      true
    );
    expect(
      isValidImageGenerationArgs({ prompt: 'test', outputPath: '/path', size: '1536x1024' })
    ).toBe(true);
    expect(
      isValidImageGenerationArgs({ prompt: 'test', outputPath: '/path', size: '1024x1536' })
    ).toBe(true);
  });

  it('returns true for valid args with upscale params', () => {
    expect(
      isValidImageGenerationArgs({
        prompt: 'test',
        outputPath: '/path',
        upscaleWidth: 2048,
        upscaleHeight: 2048,
      })
    ).toBe(true);
  });

  it('returns true for valid args with upscale model', () => {
    expect(
      isValidImageGenerationArgs({
        prompt: 'test',
        outputPath: '/path',
        upscaleWidth: 2048,
        upscaleHeight: 2048,
        upscaleModel: 'High Fidelity V2',
      })
    ).toBe(true);
  });

  it('returns false for null', () => {
    expect(isValidImageGenerationArgs(null)).toBe(false);
  });

  it('returns false for non-object', () => {
    expect(isValidImageGenerationArgs('string')).toBe(false);
    expect(isValidImageGenerationArgs(123)).toBe(false);
  });

  it('returns false for missing prompt', () => {
    expect(isValidImageGenerationArgs({ outputPath: '/path' })).toBe(false);
  });

  it('returns false for missing outputPath', () => {
    expect(isValidImageGenerationArgs({ prompt: 'test' })).toBe(false);
  });

  it('returns false for invalid prompt type', () => {
    expect(isValidImageGenerationArgs({ prompt: 123, outputPath: '/path' })).toBe(false);
  });

  it('returns false for invalid size value', () => {
    expect(
      isValidImageGenerationArgs({ prompt: 'test', outputPath: '/path', size: 'invalid' })
    ).toBe(false);
  });

  it('returns false for non-string size', () => {
    expect(isValidImageGenerationArgs({ prompt: 'test', outputPath: '/path', size: 1024 })).toBe(
      false
    );
  });

  it('returns false when only upscaleWidth is provided (with size)', () => {
    expect(
      isValidImageGenerationArgs({
        prompt: 'test',
        outputPath: '/path',
        size: '1024x1024',
        upscaleWidth: 2048,
      })
    ).toBe(false);
  });

  it('returns false when only upscaleHeight is provided (with size)', () => {
    expect(
      isValidImageGenerationArgs({
        prompt: 'test',
        outputPath: '/path',
        size: '1024x1024',
        upscaleHeight: 2048,
      })
    ).toBe(false);
  });

  it('returns false for invalid upscaleModel (with size)', () => {
    expect(
      isValidImageGenerationArgs({
        prompt: 'test',
        outputPath: '/path',
        size: '1024x1024',
        upscaleWidth: 2048,
        upscaleHeight: 2048,
        upscaleModel: 'InvalidModel',
      })
    ).toBe(false);
  });

  it('returns false for non-string upscaleModel (with size)', () => {
    expect(
      isValidImageGenerationArgs({
        prompt: 'test',
        outputPath: '/path',
        size: '1024x1024',
        upscaleWidth: 2048,
        upscaleHeight: 2048,
        upscaleModel: 123,
      })
    ).toBe(false);
  });

  it('returns true when upscale params provided without size (early return)', () => {
    // Note: validation returns early if size is undefined, so upscale params are not validated
    expect(
      isValidImageGenerationArgs({ prompt: 'test', outputPath: '/path', upscaleWidth: 2048 })
    ).toBe(true);
  });
});

describe('isValidUpscaleArgs', () => {
  it('returns true for valid minimal args', () => {
    expect(
      isValidUpscaleArgs({
        inputPath: '/input.png',
        outputPath: '/output.png',
        width: 2048,
        height: 2048,
      })
    ).toBe(true);
  });

  it('returns true for valid args with model', () => {
    expect(
      isValidUpscaleArgs({
        inputPath: '/input.png',
        outputPath: '/output.png',
        width: 2048,
        height: 2048,
        model: 'CGI',
      })
    ).toBe(true);
  });

  it('returns true for edge dimension values', () => {
    expect(
      isValidUpscaleArgs({
        inputPath: '/input.png',
        outputPath: '/output.png',
        width: 1,
        height: 1,
      })
    ).toBe(true);
    expect(
      isValidUpscaleArgs({
        inputPath: '/input.png',
        outputPath: '/output.png',
        width: 32000,
        height: 32000,
      })
    ).toBe(true);
  });

  it('returns false for null', () => {
    expect(isValidUpscaleArgs(null)).toBe(false);
  });

  it('returns false for missing inputPath', () => {
    expect(
      isValidUpscaleArgs({
        outputPath: '/output.png',
        width: 2048,
        height: 2048,
      })
    ).toBe(false);
  });

  it('returns false for missing outputPath', () => {
    expect(
      isValidUpscaleArgs({
        inputPath: '/input.png',
        width: 2048,
        height: 2048,
      })
    ).toBe(false);
  });

  it('returns false for missing width', () => {
    expect(
      isValidUpscaleArgs({
        inputPath: '/input.png',
        outputPath: '/output.png',
        height: 2048,
      })
    ).toBe(false);
  });

  it('returns false for missing height', () => {
    expect(
      isValidUpscaleArgs({
        inputPath: '/input.png',
        outputPath: '/output.png',
        width: 2048,
      })
    ).toBe(false);
  });

  it('returns false for width < 1', () => {
    expect(
      isValidUpscaleArgs({
        inputPath: '/input.png',
        outputPath: '/output.png',
        width: 0,
        height: 2048,
      })
    ).toBe(false);
  });

  it('returns false for width > 32000', () => {
    expect(
      isValidUpscaleArgs({
        inputPath: '/input.png',
        outputPath: '/output.png',
        width: 32001,
        height: 2048,
      })
    ).toBe(false);
  });

  it('returns false for height < 1', () => {
    expect(
      isValidUpscaleArgs({
        inputPath: '/input.png',
        outputPath: '/output.png',
        width: 2048,
        height: 0,
      })
    ).toBe(false);
  });

  it('returns false for height > 32000', () => {
    expect(
      isValidUpscaleArgs({
        inputPath: '/input.png',
        outputPath: '/output.png',
        width: 2048,
        height: 32001,
      })
    ).toBe(false);
  });

  it('returns false for invalid model', () => {
    expect(
      isValidUpscaleArgs({
        inputPath: '/input.png',
        outputPath: '/output.png',
        width: 2048,
        height: 2048,
        model: 'InvalidModel',
      })
    ).toBe(false);
  });

  it('returns false for non-string model', () => {
    expect(
      isValidUpscaleArgs({
        inputPath: '/input.png',
        outputPath: '/output.png',
        width: 2048,
        height: 2048,
        model: 123,
      })
    ).toBe(false);
  });
});

describe('isValidImageEditArgs', () => {
  it('returns true for valid minimal args', () => {
    expect(
      isValidImageEditArgs({
        inputImages: ['/path/to/image.png'],
        prompt: 'edit this',
        outputPath: '/output.png',
      })
    ).toBe(true);
  });

  it('returns true for valid args with multiple images', () => {
    expect(
      isValidImageEditArgs({
        inputImages: ['/path/1.png', '/path/2.png'],
        prompt: 'edit this',
        outputPath: '/output.png',
      })
    ).toBe(true);
  });

  it('returns true for valid args with all optional fields', () => {
    expect(
      isValidImageEditArgs({
        inputImages: ['/path/to/image.png'],
        prompt: 'edit this',
        outputPath: '/output.png',
        inputFidelity: 'high',
        size: '1024x1024',
        background: 'transparent',
        upscaleWidth: 2048,
        upscaleHeight: 2048,
        upscaleModel: 'High Fidelity V2',
      })
    ).toBe(true);
  });

  it('returns false for null', () => {
    expect(isValidImageEditArgs(null)).toBe(false);
  });

  it('returns false for missing inputImages', () => {
    expect(
      isValidImageEditArgs({
        prompt: 'edit this',
        outputPath: '/output.png',
      })
    ).toBe(false);
  });

  it('returns false for empty inputImages array', () => {
    expect(
      isValidImageEditArgs({
        inputImages: [],
        prompt: 'edit this',
        outputPath: '/output.png',
      })
    ).toBe(false);
  });

  it('returns false for non-array inputImages', () => {
    expect(
      isValidImageEditArgs({
        inputImages: '/path/to/image.png',
        prompt: 'edit this',
        outputPath: '/output.png',
      })
    ).toBe(false);
  });

  it('returns false for inputImages with non-string elements', () => {
    expect(
      isValidImageEditArgs({
        inputImages: ['/path/1.png', 123],
        prompt: 'edit this',
        outputPath: '/output.png',
      })
    ).toBe(false);
  });

  it('returns false for missing prompt', () => {
    expect(
      isValidImageEditArgs({
        inputImages: ['/path/to/image.png'],
        outputPath: '/output.png',
      })
    ).toBe(false);
  });

  it('returns false for missing outputPath', () => {
    expect(
      isValidImageEditArgs({
        inputImages: ['/path/to/image.png'],
        prompt: 'edit this',
      })
    ).toBe(false);
  });

  it('returns false for invalid inputFidelity', () => {
    expect(
      isValidImageEditArgs({
        inputImages: ['/path/to/image.png'],
        prompt: 'edit this',
        outputPath: '/output.png',
        inputFidelity: 'invalid',
      })
    ).toBe(false);
  });

  it('returns false for invalid size', () => {
    expect(
      isValidImageEditArgs({
        inputImages: ['/path/to/image.png'],
        prompt: 'edit this',
        outputPath: '/output.png',
        size: 'invalid',
      })
    ).toBe(false);
  });

  it('returns false for invalid background', () => {
    expect(
      isValidImageEditArgs({
        inputImages: ['/path/to/image.png'],
        prompt: 'edit this',
        outputPath: '/output.png',
        background: 'invalid',
      })
    ).toBe(false);
  });

  it('returns false when only upscaleWidth is provided', () => {
    expect(
      isValidImageEditArgs({
        inputImages: ['/path/to/image.png'],
        prompt: 'edit this',
        outputPath: '/output.png',
        upscaleWidth: 2048,
      })
    ).toBe(false);
  });

  it('returns false when only upscaleHeight is provided', () => {
    expect(
      isValidImageEditArgs({
        inputImages: ['/path/to/image.png'],
        prompt: 'edit this',
        outputPath: '/output.png',
        upscaleHeight: 2048,
      })
    ).toBe(false);
  });

  it('returns false for invalid upscaleModel', () => {
    expect(
      isValidImageEditArgs({
        inputImages: ['/path/to/image.png'],
        prompt: 'edit this',
        outputPath: '/output.png',
        upscaleWidth: 2048,
        upscaleHeight: 2048,
        upscaleModel: 'InvalidModel',
      })
    ).toBe(false);
  });

  it('accepts all valid inputFidelity values', () => {
    expect(
      isValidImageEditArgs({
        inputImages: ['/path/to/image.png'],
        prompt: 'edit',
        outputPath: '/out.png',
        inputFidelity: 'low',
      })
    ).toBe(true);
    expect(
      isValidImageEditArgs({
        inputImages: ['/path/to/image.png'],
        prompt: 'edit',
        outputPath: '/out.png',
        inputFidelity: 'medium',
      })
    ).toBe(true);
    expect(
      isValidImageEditArgs({
        inputImages: ['/path/to/image.png'],
        prompt: 'edit',
        outputPath: '/out.png',
        inputFidelity: 'high',
      })
    ).toBe(true);
  });

  it('accepts all valid background values', () => {
    expect(
      isValidImageEditArgs({
        inputImages: ['/path/to/image.png'],
        prompt: 'edit',
        outputPath: '/out.png',
        background: 'transparent',
      })
    ).toBe(true);
    expect(
      isValidImageEditArgs({
        inputImages: ['/path/to/image.png'],
        prompt: 'edit',
        outputPath: '/out.png',
        background: 'opaque',
      })
    ).toBe(true);
    expect(
      isValidImageEditArgs({
        inputImages: ['/path/to/image.png'],
        prompt: 'edit',
        outputPath: '/out.png',
        background: 'auto',
      })
    ).toBe(true);
  });

  it('accepts all valid upscaleModel values', () => {
    const validModels = ['Standard V2', 'Low Resolution V2', 'High Fidelity V2', 'CGI'];
    for (const model of validModels) {
      expect(
        isValidImageEditArgs({
          inputImages: ['/path/to/image.png'],
          prompt: 'edit',
          outputPath: '/out.png',
          upscaleWidth: 2048,
          upscaleHeight: 2048,
          upscaleModel: model,
        })
      ).toBe(true);
    }
  });
});
