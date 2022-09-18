# Change Log

All notable changes to the "covering" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

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
