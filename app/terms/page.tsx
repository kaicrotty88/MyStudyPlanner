export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-foreground">
        Terms of Use
      </h1>

      <p className="mt-6 text-sm text-muted-foreground">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div className="mt-10 space-y-6 text-base text-foreground">
        <p>
          By using MyStudyPlanner, you agree to the following terms. These terms
          are designed to keep the app fair, safe, and usable for everyone.
        </p>

        <section>
          <h2 className="text-lg font-medium">Purpose of the app</h2>
          <p className="mt-2 text-muted-foreground">
            MyStudyPlanner is a study planning tool intended to help students
            organise their workload. It does not provide academic advice or
            guarantee academic outcomes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium">User responsibility</h2>
          <p className="mt-2 text-muted-foreground">
            You are responsible for how you use the app and for the accuracy of
            the information you enter. MyStudyPlanner should be used as a
            support tool, not a replacement for school requirements or
            deadlines.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium">Availability</h2>
          <p className="mt-2 text-muted-foreground">
            We aim to keep the app available and reliable, but we cannot
            guarantee uninterrupted access. Features may change or be removed
            as the app develops.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium">Accounts</h2>
          <p className="mt-2 text-muted-foreground">
            You are responsible for maintaining the security of your account.
            Do not share your login details with others.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium">Limitation of liability</h2>
          <p className="mt-2 text-muted-foreground">
            MyStudyPlanner is provided “as is”. We are not responsible for any
            loss of data, missed deadlines, or outcomes resulting from use of
            the app.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium">Changes to these terms</h2>
          <p className="mt-2 text-muted-foreground">
            These terms may be updated occasionally. Continued use of the app
            means you accept any changes.
          </p>
        </section>
      </div>
    </main>
  );
}
