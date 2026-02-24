// src/types/jest-axe.d.ts
declare module 'jest-axe' {
  import { AxeResults } from 'axe-core';

  /**
   * The matcher function that `jest-axe` provides.
   */
  type ToHaveNoViolationsMatcher = (
    received: AxeResults
  ) => {
    pass: boolean;
    message: () => string;
  };

  /**
   * The object that `jest-axe` exports for extension.
   */
  export const toHaveNoViolations: {
    toHaveNoViolations: ToHaveNoViolationsMatcher;
  };

  /**
   * The main `axe` function for running accessibility checks.
   */
  export function axe(
    html: string | Element,
    options?: Record<string, any>
  ): Promise<AxeResults>;
}
