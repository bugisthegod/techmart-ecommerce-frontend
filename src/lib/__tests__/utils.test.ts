import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility', () => {
  it('merges class strings', () => {
    const result = cn('class1', 'class2', 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const isDisabled = false;

    const result = cn(
      'base-class',
      isActive && 'active',
      isDisabled && 'disabled'
    );

    expect(result).toBe('base-class active');
  });

  it('resolves Tailwind conflicts (last wins)', () => {
    const result = cn('p-4', 'p-8');
    // tailwind-merge should keep only the last padding class
    expect(result).toBe('p-8');
  });

  it('handles arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toContain('class1');
    expect(result).toContain('class2');
    expect(result).toContain('class3');
  });

  it('handles empty, undefined, and null values', () => {
    const result = cn('valid', undefined, null, '', 'another-valid');
    expect(result).toBe('valid another-valid');
  });

  it('merges objects with boolean values', () => {
    const result = cn({
      'class1': true,
      'class2': false,
      'class3': true,
    });
    expect(result).toContain('class1');
    expect(result).not.toContain('class2');
    expect(result).toContain('class3');
  });

  it('handles complex Tailwind class conflicts', () => {
    const result = cn(
      'bg-red-500',
      'hover:bg-blue-500',
      'bg-green-500' // Should override bg-red-500
    );
    expect(result).toContain('bg-green-500');
    expect(result).not.toContain('bg-red-500');
    expect(result).toContain('hover:bg-blue-500');
  });

  it('preserves non-conflicting classes', () => {
    const result = cn('text-white', 'p-4', 'rounded-lg', 'bg-blue-500');
    expect(result).toContain('text-white');
    expect(result).toContain('p-4');
    expect(result).toContain('rounded-lg');
    expect(result).toContain('bg-blue-500');
  });
});
