# Change Log

All notable changes to the "sysinfo-vscode" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## 2.6.0 - 2023-07-23

### Added

- Support multiple(array) specification in `sysinfo.statusBarLabel` configuration
- `sysinfo.statusBarSwitchInterval` configuration
- `sysinfo.statusBarCommand` configuration
- `System Information: Copy Status bar Text` Command
- `System Information: Switch Status bar Label` Command

## 2.5.1 - 2023-07-05

### Removed

- VSMarketplaceBadges in README.md. ( To avoid an issue where updates cannot be released to the marketplace due to a VSMarketplaceBadges server failure. )

## 2.5.0 - 2023-07-05

### Added

- Support for configuration information in `sysinfo.statusBarLabel`. [#8](https://github.com/wraith13/sysinfo-vscode/issues/8)

### Security

- `npm audit fix`ed.

## 2.4.3 - 2022-07-12

### Changed

- `activationEvents`: `*` -> `onStartupFinished`

## 2.4.2 - 2022-07-12

### Added

- Also released on [github.com](https://github.com/wraith13/sysinfo-vscode/releases)
- VSIX download link in README.md

### Security

- `npm audit fix`ed.

## 2.4.1 - 2020-10-09

### Changed

- Refactoring. ( The behavior does not change. )

## 2.4.0 - 2020-09-14

### Added

- Increased `System Information: Show Schema` Command's schema presets. ( `vscode://schemas/settings/workspace`, `vscode://schemas/icons` )

### Removed

- Decreased `System Information: Show Schema` Command's schema presets. ( `vscode://schemas/ignoredExtensions` )

## 2.3.0 - 2020-08-20

### Added

- Increased `System Information: Show Schema` Command's schema presets.

## 2.2.0 - 2020-08-10

### Added

- Increased `System Information: Show Schema` Command's schema presets.

## 2.1.0 - 2020-08-09

### Added

- Increased `System Information: Show Schema` Command's schema presets.

## 2.0.0 - 2020-06-10

### Changed

- `System Information: Show Scheme` Command -> `System Information: Show Schema` Command

## 1.4.0 - 2020-06-09

### Added

- `System Information: Show Scheme` Command

### Security

- `npm audit fix`ed.

## 1.3.0 - 2020-02-01

### Security

- `npm audit fix`ed. ( https-proxy-agent v2.2.2 -> v2.2.4 )

## 1.3.0 - 2019-08-04

### Added

- show customizable information in status bar

## 1.2.3 - 2018-12-30

### Fixed

- update internal packages because secrity reason

## 1.2.2 - 2018-12-30

### Fixed

- fixed that option specification not work bugs in Japanese Environment

## 1.2.1 - 2018-10-02

### Fixed

- fixed multi-language support bugs

## 1.2.0 - 2018-10-02

### Added

- support Japanese

## 1.1.2 - 2018-09-25

### Fixed

- fixed section name of extension without displayName in markdown.

## 1.1.1 - 2018-09-16

### Fixed

- fixed description mistake in CHANGE.md

## 1.1.0 - 2018-09-16

### Added

- System Lint ( When system with problems, show warnings section. )
- `sysinfo.hideItems` configuration

## 1.0.2 - 2018-09-13

### Fixed

- fixed markdown \\ escape problem.

### Removed

- Removed internal extensions links. ( because link destination does not exist )
- Removed images/infohex.1024.png from package.

## 1.0.1 - 2018-09-12

### Fixed

- Version number problem. ( 0.0.0 → 0.0.1 )

## 1.0.0 - 2018-09-12

### Added

- Initial release of System Information.

## [Unreleased]

## 0.0.0 - 2018-09-10

### Added

- Start this project.
