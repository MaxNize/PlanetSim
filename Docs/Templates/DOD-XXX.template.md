# DOD: Definition of Done

**Use this to determine:** Is my feature ready to merge?

-

## ✅ Code Quality
- [ ] Code Formatted: `prettier` (TS) / `cargo fmt` (Rust)
- [ ] Lint Clean: No `eslint` / `clippy` warnings
- [ ] Type Safe: No implicit `any` types
- [ ] No Debug Code: No `console.log`, `dbg!()`, temp commits

-

## 🧪 Tests
- [ ] Unit Tests: ≥70% coverage (critical ≥90%)
- [ ] Integration Tests: Pass (if cross-module)
- [ ] Edge Cases: Null, boundary, error conditions
- [ ] All Tests GREEN: 100% pass rate

-

## 📋 Code Review
- [ ] ≥1 Developer Approved
- [ ] All Feedback Resolved
- [ ] Functions Documented (JSDoc / comments)

-

## 🚀 Performance & Security
- [ ] No Memory Leaks
- [ ] Input Validation: User inputs checked
- [ ] Error Handling: Fails gracefully
- [ ] No Secrets/Credentials in code

-

## 🔀 Build & Merge Checklist
- [ ] Build Passes: `npm run build` / `cargo build` ✓
- [ ] CI Pipeline Green: All checks pass
- [ ] No Conflicts: Branch up-to-date with `main`
- [ ] Tests Pass: 100% on CI

-

## ✨ Manual Testing
- [ ] Feature Works: Matches all AC from SPEC
- [ ] No UI Glitches: Works as expected
- [ ] Tested in Browser: Works on target environments

-

## 🎯 Acceptance
- [ ] All AC Verified: Every criteria from SPEC met
- [ ] Docs Updated: SPEC/README/Changelog
- [ ] Ready for Merge

-

**Ready to Merge?** Check all boxes → Merge! ✅
