# Definition of Done - UI & Components

## React Components (SPEC-005) DoD

- [ ] All props fully typed (no `any`)
- [ ] Components render without console errors
- [ ] Event handlers properly typed
- [ ] Hooks follow rules-of-hooks (ESLint `react-hooks/exhaustive-deps`)
- [ ] No unnecessary re-renders (memoization where appropriate)
- [ ] Accessible (ARIA labels, semantic HTML)
- [ ] Responsive (mobile-friendly, tested at 375px width)

## Canvas & Visualization (SPEC-006, SPEC-008) DoD

- [ ] Canvas renders without visual artifacts
- [ ] Coordinate transformations accurate
- [ ] Trails render smoothly (no lag)
- [ ] Performance within budget (60 FPS)
- [ ] Mobile-friendly (touch events if applicable)

## Parameter Controls (SPEC-007) DoD

- [ ] Validation: Invalid inputs rejected or warned
- [ ] Sliders smooth and responsive
- [ ] Numeric inputs accept scientific notation (e.g., 1e24)
- [ ] Presets load correct values
- [ ] Reset returns to default without data loss

## Sandbox Mode (SPEC-009, SPEC-010) DoD

- [ ] Click placement shows preview
- [ ] Dialog appears with sensible defaults
- [ ] Added bodies appear immediately in simulation
- [ ] Right-click context menu works
- [ ] Edit/delete operations immediate and reversible (undo via reset)
- [ ] Performance: < 1 frame drop when adding body
