# SaunaStay

SaunaStay is a sauna discovery and booking platform. Guests can browse sauna listings, search for a sauna, view listing details, manage bookings and favorites, and complete booking payments. Sauna hosts can publish and manage listings, availability, bookings, and revenue through owner tools.

> **Production status: not ready for real users or payments.** The repository currently contains a Stripe test secret and webhook signing secret in Cloud Functions source, the checkout callable trusts client-supplied booking/payment data, and payment webhook processing is not safely idempotent. Rotate the exposed Stripe credentials immediately. Do not deploy or accept real payments until the release gates below are completed and independently verified.

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

## Production release gates

Treat this list as a required release checklist, not as a claim that the current application has passed a security review. Record evidence for each item (review, test run, deployment configuration, or approval) before launch.

### 1. Contain exposed credentials

- Revoke and replace the Stripe API key and webhook signing secret currently present in `functions/index.js`. Assume they are compromised, even if the API key is in test mode. Review Stripe activity and rotate any other credential that may have been exposed.
- Remove secrets from source and repository history. Deleting a secret from the latest commit does not make the old value safe. Coordinate history cleanup with collaborators, then verify the old credentials no longer work.
- Store Stripe credentials with Firebase Functions Secret Manager (`defineSecret` / `secrets`); use a least-privilege Google service identity for Functions. Never put private keys in frontend environment variables, source control, build artifacts, or logs.
- Treat Firebase web configuration as public client configuration, not as an authorization boundary. Restrict its API key where appropriate and secure data with Firebase Authentication and Security Rules.

### 2. Complete a security review

- Have a qualified reviewer assess the application before launch, covering threat modeling, dependency and secret scanning, authorization, input validation, abuse/rate limiting, privacy/data retention, logging, and incident response. Track findings and verify fixes; a successful build is not a security review.
- Add Firestore (and Storage, if used) Security Rules that deny access by default and grant only the minimum required access. No Firestore or Storage rules file is currently present in this repository. Test rules in the Firebase Emulator Suite for unauthenticated users, ordinary users, listing owners, and admins.
- Enforce authorization in trusted server-side code and Security Rules. Frontend route guards only control navigation; they do not protect Firestore or callable functions. Remove client-side privilege assignment based on an email address and grant admin privileges through a controlled, auditable process (for example, server-managed custom claims).
- Review personal-data exposure in booking, owner, and admin queries; apply least privilege, retention/deletion procedures, privacy disclosures, and applicable legal requirements.

### 3. Secure checkout and payment webhooks

- Require an authenticated Firebase caller in `createCheckoutSession`; validate the caller's identity and ownership of the requested booking. Validate booking status, sauna, quantity, currency, and allowed values on the server.
- Derive the payable amount and recipient/owner data from trusted Firestore records on the server. Never accept the amount, customer identity, owner identity, or booking state as authoritative just because the browser supplied it. Prevent duplicate or concurrent checkout for a booking.
- Construct success and cancel URLs from a configured, allowlisted production origin; do not accept arbitrary redirect URLs from the client.
- Keep Stripe signature verification on the raw webhook request body. Store the webhook signing secret in Secret Manager. Verify payment status and reconcile Stripe session, booking, currency, and amount before confirming a booking.
- Make webhook handling idempotent using the Stripe event ID (or a durable payment/session identifier) and a Firestore transaction/atomic write. Acknowledge only after durable processing; safely retry transient failures. Test duplicate, out-of-order, invalid-signature, unpaid, amount-mismatch, and missing-booking events in Stripe test mode.
- Fix and test the current webhook implementation before enabling it: it references undefined identifiers and can create duplicate payment records on retries. Do not treat a browser redirect to a success page as proof of payment.

### 4. Prove release readiness

- Add automated tests for authorization, Security Rules, checkout input tampering, webhook signature verification/idempotency, and booking/payment state transitions. The root package currently has no test script.
- Run dependency vulnerability checks and static analysis in CI; pin and review dependency updates. Keep test and production Firebase/Stripe projects and credentials separate.
- Configure monitoring and alerts for function failures, payment/webhook failures, suspicious access, and quota/abuse. Document backup/restore, incident response, key rotation, and rollback procedures.
- Verify production domains, HTTPS, Firebase Authentication settings, CORS/origin policy where relevant, secret access, Functions region, and deployment permissions. Run a final smoke test in a production-like staging environment before launch.
- Publish a real, owner-approved license in a `LICENSE` file and make the package metadata agree with it. Do not select or publish a license without the copyright holder's approval; until then, state that redistribution rights are not granted by this repository.

**Launch rule:** If any gate is incomplete, keep payments disabled and do not describe the service as production-ready.

## Getting Started

1. Clone this repository and enter the project directory.
2. Install the frontend dependencies:

   ```bash
   npm install
   ```

3. Configure a separate Firebase development project and the required public client configuration. The frontend Firebase initialization is in `src/firebase.js`. Do not commit service-account credentials, Stripe secret keys, webhook signing secrets, or other private credentials. Complete the production release gates before using production credentials.
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

Configure Firebase CLI for the intended non-production project and securely provide credentials. Do not put production secrets in source files or commit them to version control. The Functions package is configured for Node.js 22 and the `europe-west1` region. Use Secret Manager for Stripe secrets and grant Functions only the permissions they need.

## Available Scripts

Run these from the repository root:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server with hot reload. |
| `npm run build` | Create a production frontend build in `dist/`. |
| `npm run preview` | Preview the production build locally. |

The root `package.json` currently defines no test, lint, or security-audit script. Add and run appropriate checks in CI before treating a release as ready.

## Configuration and Security

- Firebase client initialization is currently configured in `src/firebase.js`. Use a Firebase project you control, restrict the client API key as appropriate, and verify Authentication settings and tested Security Rules before deployment.
- The Cloud Functions code integrates with Stripe and Google Cloud Translation. Use managed secrets and least-privilege service identities; never commit private keys or webhook secrets.
- Rotate any credentials that may have been exposed in source control, chat, logs, build output, or other public locations, and remove them from repository history.
- Do not deploy the current payment implementation to production: the checkout callable currently trusts client-provided identity, price, and redirect URLs; webhook processing has correctness and retry/idempotency defects. See the release gates above.
- Only collect and retain personal or payment-related data required for the service, and provide appropriate privacy disclosures.

## Deployment

### Vercel

The repository includes a Vercel rewrite that routes application paths to the SPA entry point. Import the repository into Vercel, configure the project to build with `npm run build`, and publish the Vite output directory, `dist`. Configure any required Firebase and service settings for the deployment environment. Use separate preview/staging and production projects, and do not enable real payments until all release gates have passed.

### Firebase Hosting and Functions

Firebase configuration files are included. Firebase Hosting is configured to publish `dist`, Vite's build output. Select the intended Firebase project, configure Functions secrets and least-privilege Google Cloud permissions, and deploy tested Security Rules. Build and deploy only after all release gates have passed; the current payment and webhook implementation must not be used for live payments.

## Localization

The interface currently includes English (`en`) and Finnish (`fi`) translation resources in `src/i18n/locales/`. The selected language is detected from browser preferences and stored in local storage.

## Contributing

1. Create a feature branch.
2. Make focused changes and run `npm run build` to check the production frontend build.
3. Open a pull request describing the change and any required Firebase or deployment configuration.

## License

No `LICENSE` file is currently included. The root package metadata currently says `ISC`, but that metadata alone is not a substitute for an owner-approved license file. The copyright holder must choose and approve the license, add its complete text as `LICENSE`, and align package metadata before distribution. Until that is done, do not assume you have permission to redistribute or reuse the project.