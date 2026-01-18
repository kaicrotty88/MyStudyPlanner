export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-foreground">
        Privacy Policy
      </h1>

      <p className="mt-6 text-sm text-muted-foreground">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div className="mt-10 space-y-6 text-base text-foreground">
        <p>
          MyStudyPlanner is built by students, for students. We take your
          privacy seriously and aim to collect as little personal information
          as possible.
        </p>

        <section>
          <h2 className="text-lg font-medium">What information we collect</h2>
          <p className="mt-2 text-muted-foreground">
            When you create an account, we collect basic account information
            such as your email address and name. This information is used only
            to provide authentication and access to your account.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium">How your data is used</h2>
          <p className="mt-2 text-muted-foreground">
            Your data is used solely to operate the app — including signing you
            in, saving your study plans, and keeping your information secure.
            We do not sell your data or use it for advertising.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium">Authentication & security</h2>
          <p className="mt-2 text-muted-foreground">
            MyStudyPlanner uses Clerk to handle authentication and account
            security. Clerk may use strictly necessary cookies to keep you
            signed in and protect your session.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium">Cookies</h2>
          <p className="mt-2 text-muted-foreground">
            We only use cookies that are required for the app to function
            properly. These cookies are essential for login and security and
            do not track you across other websites.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium">Data storage</h2>
          <p className="mt-2 text-muted-foreground">
            Study data is stored securely and is only accessible to you. Demo
            mode data may be stored locally in your browser and can be cleared
            at any time.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium">Changes to this policy</h2>
          <p className="mt-2 text-muted-foreground">
            This policy may be updated from time to time as the app evolves.
            Any significant changes will be reflected on this page.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium">Contact</h2>
          <p className="mt-2 text-muted-foreground">
            If you have questions about privacy or data usage, you can contact
            us via the details provided on the website.
          </p>
        </section>
      </div>
    </main>
  );
}
