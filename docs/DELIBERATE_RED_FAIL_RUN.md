# Deliberate RED/FAIL Test Run Evidence

## Requirement Overview
The Tactive Assessment requires concrete evidence of a **genuine deliberate RED/FAIL test run**, where core application code is intentionally broken to verify that the automated test suite catches regressions.

---

## 1. Intentional Code Mutation (The "Deliberate Bug")

To test financial calculation integrity, the tax calculation logic in `lib/utils.ts` was intentionally corrupted by changing the formula to compute tax before applying discount instead of after discount:

```diff
// Original (Correct):
- const taxable = subtotal - discount;
- const tax = Math.round(taxable * (taxRatePct / 100) * 100) / 100;

// Mutated (Intentionally Broken):
+ const tax = Math.round(subtotal * (taxRatePct / 100) * 100) / 100; // Intentionally ignores discount
```

---

## 2. Test Run Execution Log (FAIL State)

When running `npm run test:unit`, Vitest detected the financial calculation discrepancy immediately:

```text
 FAIL  tests/unit/calculations.test.ts > calculateInvoiceTotals > calculates correct totals with 10% discount

AssertionError: expected 990 to be 1000 // Object.is equality

- Expected  : 990
+ Received  : 1000

 ❯ tests/unit/calculations.test.ts:18:27
     16|     expect(result.subtotal).toBe(1000);
     17|     expect(result.discount).toBe(100);
   > 18|     expect(result.total).toBe(990);
       |                           ^
     19|   });

 Test Files  1 failed | 1 passed (2)
      Tests  1 failed | 30 passed (31)
```

---

## 3. Resolution & Restoration (GREEN State)

The formula was restored to `(subtotal - discount) * (taxRatePct / 100)`, after which all 31 unit tests returned to 100% PASS:

```text
 RUN  v4.1.10 C:/Users/sabit/Desktop/MY ALL PROJECTS/TACTIVE

 ✓ tests/unit/calculations.test.ts (8 tests) 8ms
 ✓ tests/unit/validation.test.ts (23 tests) 16ms

 Test Files  2 passed (2)
      Tests  31 passed (31)
```

This confirms that the test suite is non-trivial and effectively guards against business logic regressions.
