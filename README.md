# Photon Ranch UI

![Photon Ranch](public/img/logos/PTR-logo-spectrum-byline-medium.png)

This is the web interface used to access photon ranch observatories.

You can interact with the site at www.photonranch.org, or start up your own local server.

## Description

Photon Ranch is a global network of telescopes, created for middle and high school students to learn observational astronomy.
This web application is the portal where users can control telescopes in real time, schedule long-running observation
projects, organize the data they've acquired, and interpret the data using a variety of data analysis tools.

## Local Development

### Required

You will need npm or a similar package manager to run this vue project.

### Run a local instance

To run the project, first clone the repository and install the dependencies:

```bash
git clone https://github.com/LCOGT/ptr_ui.git
cd ptr_ui
npm install
```

Run a local instance with:

```bash
npm run serve
```

### Contributing

Photon Ranch currently has two stages running online:

- the 'production' environment uses the main branch, and lives at <https://www.photonranch.org>
- the 'dev' environment uses the dev branch, and lives at <https://dev.photonranch.org>

*Pull requests should propose changes for the dev branch, not main.* This is because, for various reasons, the 'dev'
environment is more active, up to date, and used by more people than the 'production' environment, which sits somewhat
dormant for the time being.

Pull requests must be approved by at least one reviewer and pass a code linter status check before changes can be
merged.

The linter involves two passes:

- a lint over the entire codebase using `.eslintrc.js`
- a lint over all changed files using `.eslintrc_strict.js`. This is for enforcing a higher standard of quality that
  we can't apply to the entire codebase in one pass. It also allows for more gradual adoption of any future changes to
  the linter configuration.

You can verify that the code passes either of these checks locally before commiting your changes in a pull request.

- To run the basic linter over everything, run `npm run lint:check`, and apply any automatically-fixable changes with
`npm run lint:fix`.
- To run the strict linter over changes from the dev branch, run `npm run lint-changes:check`, with the similar
  `npm run lint-changes:fix` to apply any changes that are auto-fixable.

It's also possible to lint specific directories or files manually using eslint, for example:
`eslint -c .eslintrc_strict.js src/components/SiteNavbar.vue --fix` would check lint `src/components/SiteNavbar.vue`
using the strict linter configuration, automatically fix any changes it can, displaying remaining errors that need to
be manually corrected.

## Configuration

Api endpoint urls used by the frontend are configured in the vuex module in `src/store/modules/api_endpoints.js`.
This provides a mechanism for dynamically toggling between different urls.

The backend services defined here and used for the main deployment (and set by default) are:

- General site communication: <https://api.photonranch.org>
- Sending commands: <https://jobs.photonranch.org>
- Calendar: <https://calendar.photonranch.org>
- Creating and managing projects: <https://projects.photonranch.org>
- Site and instrument status: <https://status.photonranch.org>
- Live site operation log stream: <https://logs.photonranch.org>
- Image analysis: <https://quickanalysis.photonranch.org>

## Authentication

User authentication and authorization is handled by Auth0. The configuration for this is specified in the file `auth_config.json`.

## Screenshots

![Sky chart](public/img/screenshots/skychart_view.png)
![Image analysis tools](public/img/screenshots/analysis_view.png)
![Site Calendar](public/img/screenshots/calendar_view.png)
![Popular targets explorer](public/img/screenshots/popular_targets.png)
