# [1.2.0](https://github.com/MaxNize/fortgeschrittene-programmierung/compare/v1.1.0...v1.2.0) (2026-08-24)


### Bug Fixes

* **build:** grant missing GITHUB_TOKEN scopes to CI jobs ([e8c4461](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/e8c44615048291f77103733d9fc859f5ab62ba66))
* **canvas:** disable body context menu in preset mode (FP-39) ([f231b16](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/f231b16411962ed83851ebdd1f78547d36f4bc8d))
* **ci:** add fallow complexity annotations for timer, tick, and Simulator ([e56f12d](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/e56f12deb30f06f2f7e9b5f41bdf6277c3253d91))
* **ci:** add JSDoc comment to ThreeBodyControls and format files ([70b879f](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/70b879fd90c89b4125ef5fdb4f4ef9346df2a581))
* **ci:** disable husky hooks during semantic-release commit ([e44bc12](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/e44bc1252f969e35d9ea449641965dba7525690f))
* **ci:** disable husky hooks during semantic-release commit ([#34](https://github.com/MaxNize/fortgeschrittene-programmierung/issues/34)) ([cb8e56c](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/cb8e56c50fe4e754948889ea5af3b94dd1acc27a))
* **ci:** drop GHAS-only jobs and align commitlint with actual history ([7414fbf](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/7414fbfb88828ec53f200c1f7c2a55c8b8e4ce02))
* **ci:** increase test coverage and add fallow complexity annotations ([eb9c1a9](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/eb9c1a9da8be14b8dabcf130cdcae2ba4d074a50))
* **ci:** make check_rust_coverage.sh executable ([61296c9](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/61296c9079fcb9e390f9c365e7e8f0344d443bb4))
* **ci:** make check-max-lines zero-dependency for rust-tests CI job ([c694552](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/c6945523777336639dd2fbee930acec4f32bdc3b))
* **ci:** only run Commit Message Lint on pull_request ([b7750f1](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/b7750f1198f769475b8baafbd396e1bb77557898))
* **ci:** resolve dev->main pipeline failures ([71cc55a](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/71cc55ac9b94997fe865e49a06bce14e785e5dcd)), closes [hi#complexity](https://github.com/hi/issues/complexity)
* **ci:** resolve fallow duplication and complexity audit findings ([1f2c80b](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/1f2c80bb7cea5cea656f96a1bbe758c343276f5d))
* **sandbox:** stop object-list row text overlapping ([85bd090](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/85bd090c3d06582853e6c5c1b273d2f91e3b7e5b))
* **toast:** stop timer reset on every parent re-render ([c53b3b2](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/c53b3b2ff19a653f40d7d38dedb6053aa96fcac9))
* **ui:** i18nize stresstest ([a6aec03](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/a6aec03c706fe9fcaf509505bc7f0be559c11319))
* **ui:** resolve Fallow code-quality gate failures ([db246e3](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/db246e34b296e2f25aec164378166d6a8d48e7f6)), closes [hi#complexity](https://github.com/hi/issues/complexity)


### Features

* **canvas:** add focused body miniview (FP-37) ([c49a50e](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/c49a50e12e69a2c859559dfcf53745c93cbaffb7))
* **canvas:** track a body so the camera follows it (FP-36) ([f693461](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/f693461256c697933df9364209b47422c580a5c8))
* **ci:** add rust quality tooling ([e355df8](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/e355df8cd70d8ceac904f515f0e9f7a1c642c32e))
* **miniview:** allow zooming out in the body miniview ([9801fe7](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/9801fe7750fe6e73a33dda7e7bd888c985a6305d))
* **sandbox:** Figma-like body creation, no mode button (FP-38) ([48b053b](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/48b053bc54333dbfbe581beaa12ce8f836cc6d93))
* **ui:** add favicon (FP-33) ([bcd49c6](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/bcd49c66a6ed6df354eb4fe698f11a68163c787a))
* **ui:** add real-time FPS counter, HUD overlay, and 60 FPS stress test benchmark ([52e6f59](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/52e6f59743fe09f38aa14529fbbe381e467d433d))
* **ui:** add real-time FPS counter, HUD overlay, and 60 FPS stress test benchmark ([#30](https://github.com/MaxNize/fortgeschrittene-programmierung/issues/30)) ([4b24c89](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/4b24c89db1f97b31e745ed28d5481bb64ae8c316))
* **ui:** show auto-scaled, human-readable units (FP-34) ([c51557f](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/c51557f152231d99d6be5850da9641b84a5f1eb4))


### Performance Improvements

* **sandbox:** resolve sandbox mode performance bottlenecks at scale ([0f0be95](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/0f0be95cb7574651cd1f78dad634830d204def23))
* **sandbox:** resolve sandbox mode performance bottlenecks at scale ([#33](https://github.com/MaxNize/fortgeschrittene-programmierung/issues/33)) ([2a5aa75](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/2a5aa75bd25d8b21b8e6832202d0dccbaf6884c5))

# [1.1.0](https://github.com/MaxNize/fortgeschrittene-programmierung/compare/v1.0.3...v1.1.0) (2026-08-11)


### Bug Fixes

* **ci:** resolve remaining CI check failures (Rust line count, SandboxControls size) ([2c7dc8b](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/2c7dc8bc8832eb6498c139b638942741800be776))
* **docs:** add doc to function ([8ef169d](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/8ef169db08128bf8ce722982014de1ca62f5e2b9))
* **frontend:** break circular dependency between SimulationContext and SimulationProvider ([e5f6117](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/e5f611787e884329fd8e6fff9ec322919f5539d3))
* **frontend:** fix failing ci ([27a86e1](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/27a86e154f08867ea14874bbad179195ba8b94b8))
* **frontend:** resolve ESLint and TypeScript check failures ([645164e](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/645164ed2a01cdfaf5cafc5ad12fdeb0d17ead94))
* **SimulationProvider:** restore [simulator, mode] deps on mode-change effect to prevent trail reset on every slider drag ([6aeff2d](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/6aeff2dd6f6d75bf49cab79c06515d6161147fd2))
* **wasm:** correct doctest crate name from planet_sim to planet_sim_wasm ([6fcc708](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/6fcc70813bb8a439fd505b81a2b788098c070ad5))


### Features

* **canvas:** implement SPEC-008 multi-body trajectory trails with fa… ([#22](https://github.com/MaxNize/fortgeschrittene-programmierung/issues/22)) ([d387b15](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/d387b159626e10556537b69e7abfc12c43ed8def))
* **canvas:** implement SPEC-008 multi-body trajectory trails with fading ([b33977e](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/b33977e0f16e7b8557e192596db9d147fb28d753))
* **frontend:** implement SPEC-006 canvas rendering and E2E playwrigh… ([#20](https://github.com/MaxNize/fortgeschrittene-programmierung/issues/20)) ([9beaaa9](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/9beaaa94e6b4079b78324448055474c87280d76c))
* **frontend:** implement SPEC-006 canvas rendering and E2E playwright testing ([e61848e](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/e61848efaeca4d5639d76a6eccb998bec3bb4a58)), closes [hi#DPI](https://github.com/hi/issues/DPI)
* **frontend:** implement spec-009 and add i18n ([0b4f94d](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/0b4f94d9f0fea12e11cff3046b240daed4a711a5))
* **frontend:** implement spec-009 and add i18n ([#23](https://github.com/MaxNize/fortgeschrittene-programmierung/issues/23)) ([cdf4d4c](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/cdf4d4cccdd68015b8ba7c3eb7d0129199d6e3fa))
* **i18n:** add klingon ([91542fa](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/91542fad02f35bec8b5b164faab9bcc5dfb7d50b))
* **i18n:** add klingon ([#25](https://github.com/MaxNize/fortgeschrittene-programmierung/issues/25)) ([9912ef9](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/9912ef957ab4b802bbd6aa1c191f4e537e7d798a))

## [1.0.3](https://github.com/MaxNize/fortgeschrittene-programmierung/compare/v1.0.2...v1.0.3) (2026-07-25)


### Bug Fixes

* **cd:** fix deploy job ([c57053e](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/c57053ecdf35184561196a8eeb9085281f0a3637))
* **cd:** fix deploy job ([#17](https://github.com/MaxNize/fortgeschrittene-programmierung/issues/17)) ([cde3b4e](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/cde3b4e3d92d278cadb66e12d53ef48c71ef1a89))
* **cd:** fix deploy script ([af6ef98](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/af6ef980fa9c2dc8c43c85c841e3e9395d8e610e))
* **cd:** fix deploy script ([9046917](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/904691757bd14715165c12bc635830ffbe4fe0fc))
* **cd:** fix deploy script ([#18](https://github.com/MaxNize/fortgeschrittene-programmierung/issues/18)) ([cb88184](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/cb88184e949ed7d05e90613e6b9aa0cda54f9a66))
* **cd:** fix deploy script ([#19](https://github.com/MaxNize/fortgeschrittene-programmierung/issues/19)) ([866240e](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/866240e92024f85c21e5568651b27d27d314dce7))

## [1.0.2](https://github.com/MaxNize/fortgeschrittene-programmierung/compare/v1.0.1...v1.0.2) (2026-07-25)


### Bug Fixes

* **ci:** fix ci problems ([1663358](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/16633580a0b588b8132072ec9106f185288cf95d))
* **ci:** fix fallow checking ([1b3020e](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/1b3020ea0f1bc259832666350129d365ee43c282))

## [1.0.1](https://github.com/MaxNize/fortgeschrittene-programmierung/compare/v1.0.0...v1.0.1) (2026-07-14)


### Bug Fixes

* **deploy:** fixed app port ([428ba16](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/428ba1639b804ebbe305ed7424ec657b0f31b5b6))
* **deploy:** fixed app port ([#8](https://github.com/MaxNize/fortgeschrittene-programmierung/issues/8)) ([0750400](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/07504009bf1022136d02f42de3c14d1f36eaf8cb))

# 1.0.0 (2026-07-14)


### Bug Fixes

* **ci:** fix ci dependency installation ([c01f2ac](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/c01f2ac984632f506849be6b66c47c1246382eec))
* **ci:** fix ci dependency installation ([#6](https://github.com/MaxNize/fortgeschrittene-programmierung/issues/6)) ([aed1897](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/aed18977eb2bf1dd5de98306103e4b06014342c1))
* **ci:** fix markdown linting ([cf4a162](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/cf4a162b5082db312796b1cc4b310e941bdd7a55))
* **ci:** fix markdown linting ([#7](https://github.com/MaxNize/fortgeschrittene-programmierung/issues/7)) ([2284782](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/228478239f65628fef0bb59874e920a3ad8099ec))
* **ci:** fixed pipeline ([c4bf846](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/c4bf8462e7912e3f85cf93df52a1055ede0d6fac))
* **ci:** fixed pipeline ([#5](https://github.com/MaxNize/fortgeschrittene-programmierung/issues/5)) ([c0ff790](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/c0ff7900190a6d2e1e4990be2148f008be9283d2))
* **ci:** grant needed permissions and fix commitlint workflow ([98ef58d](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/98ef58dd393eeaa209b044a205df990dddc69f8e))


### Features

* **docs:** add commit-message and documentation writer prompts ([c6029b9](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/c6029b9ec63953a326bb82057321ae7ce9447941))
* **ui:** initialize React + TypeScript frontend with Vite ([88ad753](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/88ad753f29b70967ba700f3cc799996576c54ee3))
* **wasm:** initialize Rust physics engine WASM package ([aa512f3](https://github.com/MaxNize/fortgeschrittene-programmierung/commit/aa512f3f46a9a20b1221756f7c50b1e6498c3604))
