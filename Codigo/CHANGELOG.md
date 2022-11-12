# Change Log

All notable changes to the "covering" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.4.2] - 2022-11-12

### Fixed

- Fix commands functions bind. Add arrow functions to be able to see service attributes at scope.

### Changed

- Update README covering config params description

## [1.4.1] - 2022-10-27

### Fixed

- Add undefined root verification when application start up.

## [1.4.0] - 2022-10-27

### Added

- Add command `runTestCoverage` to run test script on covering file.
- Add icon on coverage-view to run test command.

## [1.3.0] - 2022-10-20

### Added

- Add view coverage only for activity edit in extension configuration view.

## [1.2.3] - 2022-10-09

### Changed

- Update parameters descriptions at README.md

## [1.2.2] - 2022-10-07

### Added

- Created parameter on project configuration to find files different from `lcov.info` to render coverage data.

## [1.2.1] - 2022-10-07

### Added

- Created command to reload the extension
- Added icon to reload the extension

## [1.1.0] - 2022-09-25

### Added

- Create pre-push file and update with coverage values to approve or refused the git action based on project coverage result and extension configurations.

## [1.0.2] - 2022-09-18

### Changed

- Update coverage view and uncovered lines tree view to show the right information when theres no line to cover and when the minimum value was not reached.

## [1.0.1] - 2022-09-18

### Changed

- Updated the CHANGELOG file.
- Updated the main README file.

## [1.0.0] - 2022-09-18

### Added

- Add uncovered lines view
- Add `.coveringconfig` file to be used as coverage calculation parameter
  - Now the user can set the reference branch and the minimum coverage value.

## [0.4.0] - 2022-09-12

### Added

- Get instructions from configuration view to hide line status
- Get instructions from configuration view to calculate coverage by branch diff.

## [0.3.0] - 2022-07-07

### Added

- Read `lcov.info`file and show coverage lines at editor and coverage percentage at activity bar.
