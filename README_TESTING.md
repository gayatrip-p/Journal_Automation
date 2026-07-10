Testing setup
----------------

1. Copy the example env and fill in secrets:

   - Copy `.env.example` to `.env` and edit values.

     ```powershell
     copy .env.example .env
     ````

2. Install dependencies (if not already installed):

   ```powershell
   npm install
   ```

3. Run tests:

   - Run all tests:

     ```powershell
     npx playwright test
     ```

   - Run a single spec (headed, single worker):

     ```powershell
     npx playwright test Tests/specs/journal.spec.ts --headed --reporter=list --workers=1
     ```

Notes
-----
- `.env` is ignored by Git in this repo; store credentials securely outside source control.
- Use `BASE_URL` in `.env` to point tests at other environments (staging, local, etc.).
