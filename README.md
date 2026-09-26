# SaunaStay

SaunaStay is a sauna discovery and booking platform. Guests can browse sauna listings, search for a sauna, view listing details, manage bookings and favorites, and complete booking payments. Sauna hosts can publish and manage listings, availability, bookings, and revenue through owner tools.

> SaunaStay is an MVP. Review the security and deployment notes below before using it with real users or payments.

## Features

- Browse sauna listings, search, and view sauna details.
- Create sauna listings with guided listing steps, including photos, amenities, location, timing, and security information.
- User accounts and role-protected owner and admin areas, backed by Firebase Authentication.
- Booking, availability, payment, confirmation, and cancellation flows.
- Guest dashboards for profile, bookings, and favorite saunas.
- Host dashboards for sauna listings, availability, bookings, owner profiles, and revenue.
- English and Finnish interface translations with browser-language detection.
- Sauna journal, help pages, feedback form, and feedback assistant.
- Responsive React UI with maps, calendars, charts, and toast notifications.

## Technology Stack

### Frontend
- React 18 and JavaScript (JSX)
- Vite
- React Router
- Tailwind CSS
- Firebase Web SDK (Authentication, Firestore, and Cloud Functions)
- i18next and react-i18next
- React Leaflet, FullCalendar, and Recharts

### Cloud Functions and services
- Firebase Cloud Functions for Node.js 22
- Firebase Admin SDK
- Stripe Checkout integration for booking payments
- Google Cloud Translation client for translation functionality
- Firebase Hosting and Vercel deployment configuration are included

## Project Structure

```text
saunastay-frontend/
|-- functions/                 # Firebase Cloud Functions
|-- public/                    # Static images and music
|-- src/
|   |-- components/            # Shared UI, booking, account, and owner components
|   |-- context/               # Authentication and sauna context providers
|   |-- i18n/                  # English and Finnish translations
|   `-- Pages/                 # Application pages and route-level screens
|-- firebase.json              # Firebase Hosting, Functions, and emulator config
|-- vercel.json                # SPA rewrite for Vercel
`-- vite.config.js             # Vite configuration
```

## Prerequisites

- Node.js 22 or later (also required by the Firebase Functions configuration)
- npm
- A Firebase project for Authentication, Firestore, and Cloud Functions
- Firebase CLI for deploying or running Firebase emulators
- Stripe account and credentials if enabling checkout and payment webhooks
- Google Cloud Translation API and suitable credentials if using server-side translation

## Getting Started

1. Clone this repository and enter the project directory.
2. Install the frontend dependencies:

   ```bash
   npm install
   ```

3. Configure the Firebase web app and service integrations for your own development project. The frontend Firebase initialization is in `src/firebase.js`. Do not commit service-account credentials, Stripe secret keys, webhook signing secrets, or other private credentials.
4. Start the Vite development server:

   ```bash
   npm run dev
   ```

5. Open the local URL printed by Vite in your browser.

### Firebase Functions

Install the Functions dependencies separately before developing or deploying them:

```bash
cd functions
npm install
```

Configure Firebase CLI for the correct project and securely provide the credentials required by each function. Do not put production secrets in source files or commit them to version control. The Functions package is configured for Node.js 22 and the `europe-west1` region.

## Available Scripts

Run these from the repository root:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server with hot reload. |
| `npm run build` | Create a production frontend build in `dist/`. |
| `npm run preview` | Preview the production build locally. |

There is currently no test script defined in the root `package.json`.

## Configuration and Security

- Firebase client initialization is currently configured in `src/firebase.js`. Use a Firebase project you control and review its Authentication, Firestore, and security rules before deployment.
- The Cloud Functions code integrates with Stripe and Google Cloud Translation. Configure secrets and service credentials using an appropriate secret-management mechanism; never commit private keys or webhook secrets.
- Rotate any credentials that may have been exposed in source control, chat, logs, or other public locations.
- Review payment webhook handling, authorization, input validation, rate limits, and Firestore rules before production use. A successful frontend build does not verify these backend security controls.
- Only collect and retain personal or payment-related data required for the service, and provide appropriate privacy disclosures.

## Deployment

### Vercel

The repository includes a Vercel rewrite that routes application paths to the SPA entry point. Import the repository into Vercel, configure the project to build with `npm run build`, and publish the Vite output directory, `dist`. Configure any required Firebase and service settings for the deployment environment.

### Firebase Hosting and Functions

Firebase configuration files are included. Before deploying, make sure the Firebase Hosting `public` directory matches Vite's build output (`dist` by default), select the intended Firebase project, and configure Functions secrets and Google Cloud permissions. Build and deploy only after reviewing the security notes and the project's current payment and webhook implementation.

## Localization

The interface currently includes English (`en`) and Finnish (`fi`) translation resources in `src/i18n/locales/`. The selected language is detected from browser preferences and stored in local storage.

## Contributing

1. Create a feature branch.
2. Make focused changes and run `npm run build` to check the production frontend build.
3. Open a pull request describing the change and any required Firebase or deployment configuration.

## License

No project-specific license file is currently included. Confirm licensing terms with the project maintainers before redistributing or reusing this project.