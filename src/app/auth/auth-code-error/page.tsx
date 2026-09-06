import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm rounded-lg border border-line bg-paper-raised p-6 text-center shadow-card">
        <h1 className="font-display text-lg">Link expired or invalid</h1>
        <p className="mt-2 text-sm text-ink-soft">
          That confirmation link didn&apos;t work. Try signing in, or register
          again to get a new link.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-md bg-brass px-4 py-2 text-sm font-medium text-white"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
