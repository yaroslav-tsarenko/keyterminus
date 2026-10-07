import Link from "next/link";
import { PolicyLayout, policyMetadata, policyTable, type PolicySection } from "@/components/layout/PolicyLayout/PolicyLayout";
import { CookieSettingsButton } from "@/components/layout/PolicyLayout/CookieSettingsButton";
import { COOKIE_CATEGORIES, COOKIE_TABLE, type CookieRecord } from "@/config/cookies";
import { POLICY_FACTS as F } from "@/lib/policy-facts";

export const generateMetadata = policyMetadata(
  "cookies",
  `The cookies and browser storage keys on ${F.brand}: name, purpose, lifetime, and where to change your consent.`,
);

function CookieTable({ rows }: { rows: CookieRecord[] }) {
  return (
    <>
      <table className={`${policyTable} hidden md:table`}>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Type</th>
            <th scope="col">Provider</th>
            <th scope="col">Purpose</th>
            <th scope="col">Expiry</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td className="font-mono text-ui-sm text-ink [overflow-wrap:anywhere]">{row.name}</td>
              <td className="whitespace-nowrap text-ink-muted">{row.kind}</td>
              <td className="text-ink-muted">{row.provider}</td>
              <td>{row.purpose}</td>
              <td className="text-ink-muted">{row.expiry}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div role="list" className="mt-5 border-t border-line md:hidden">
        {rows.map((row) => (
          <div role="listitem" key={row.name} className="border-b border-line py-4">
            <div className="font-mono text-ui-sm text-ink [overflow-wrap:anywhere]">{row.name}</div>
            <div className="mt-1 text-ui-sm">{row.purpose}</div>
            <div className="meta mt-2 text-ink-muted">
              {row.kind} · {row.provider} · {row.expiry}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

const necessary = COOKIE_CATEGORIES.find((c) => c.id === "necessary");
const consentKey = COOKIE_TABLE.necessary.find((r) => r.name.endsWith("-consent"))?.name;

const sections: PolicySection[] = [
  {
    id: "what",
    title: "What this policy covers",
    body: (
      <>
        <p>
          A cookie is a small text file a website stores in your browser. Local storage and session storage are browser features that keep
          data on your device only. This page lists every cookie and storage key {F.brand} uses on {F.domain}.
        </p>
        <p>
          It is the same list you see under “Show cookies” in Cookie settings. Keys you save for later are kept in your account on our server,
          not in your browser.
        </p>
      </>
    ),
  },
  {
    id: "necessary",
    title: "Necessary cookies and storage",
    body: (
      <>
        <p>{necessary?.purpose} They are always on because the store doesn’t work without them, and they are never used for advertising.</p>
        <CookieTable rows={COOKIE_TABLE.necessary} />
      </>
    ),
  },
  {
    id: "optional",
    title: "Analytics and marketing",
    body: (
      <>
        <p>
          {F.brand} sets no analytics or marketing cookies at the moment. Both categories appear in Cookie settings and stay off until you
          turn them on. If we ever add such a tool, each of its cookies will be listed here first, and it will load only after you allow that
          category.
        </p>
        {COOKIE_TABLE.analytics.length ? <CookieTable rows={COOKIE_TABLE.analytics} /> : null}
        {COOKIE_TABLE.marketing.length ? <CookieTable rows={COOKIE_TABLE.marketing} /> : null}
      </>
    ),
  },
  {
    id: "choice",
    title: "Changing or withdrawing consent",
    body: (
      <>
        <p>
          On your first visit the cookie banner offers Accept all, Reject all and Choose cookies. You can change your mind whenever you like
          through <strong>Cookie settings</strong> at the foot of every page, or with the button below. Withdrawing consent is as easy as
          giving it, and it applies immediately.
        </p>
        <p>
          Your choice is kept in local storage under <code className="font-mono text-ui-sm">{consentKey}</code> for 12 months, after which we
          ask again.
        </p>
        <div className="mt-6">
          <CookieSettingsButton />
        </div>
        <p>Your browser can delete cookies and site data too. Deleting the necessary ones signs you out and clears your cart.</p>
      </>
    ),
  },
  {
    id: "third-party",
    title: "The payment page",
    body: (
      <p>
        When you pay, you move to the payment provider’s hosted page. The provider runs it on its own domain and may set its own cookies for
        security and fraud prevention, under its own cookie policy. See the <Link href="/policies/payment">Payment policy</Link>.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        We update this list whenever a cookie or storage key is added or removed. Send questions to {F.email}. How we handle personal data is
        explained in the <Link href="/policies/privacy">Privacy policy</Link>.
      </p>
    ),
  },
];

export default async function CookiesPage() {
  return <PolicyLayout slug="cookies" sections={sections} />;
}
