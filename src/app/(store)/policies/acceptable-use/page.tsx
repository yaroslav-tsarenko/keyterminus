import Link from "next/link";
import { PolicyLayout, policyMetadata, type PolicySection } from "@/components/layout/PolicyLayout/PolicyLayout";
import { POLICY_FACTS as F } from "@/lib/policy-facts";

export const generateMetadata = policyMetadata("acceptable-use", `What you may and may not do on ${F.domain} and with a ${F.brand} account, and what happens if the rules are broken.`);

const sections: PolicySection[] = [
  {
    id: "scope",
    title: "Who these rules apply to",
    body: (
      <p>
        Anyone using {F.domain}, with or without an account. The rules below form part of the <Link href="/policies/terms">Terms and conditions</Link>.
      </p>
    ),
  },
  {
    id: "accounts",
    title: "Your account",
    body: (
      <ul>
        <li>Account holders must be {F.minAge} or over.</li>
        <li>One account per person, in your own name and with accurate details.</li>
        <li>Keep your password to yourself. Don’t share your account or use another person’s.</li>
        <li>
          Accounts can’t be opened from, or used to order for, {F.restrictedCountries} or {F.restrictedTerritories}. Don’t use a VPN, proxy
          or false address to get around this.
        </li>
      </ul>
    ),
  },
  {
    id: "not-allowed",
    title: "Not allowed",
    body: (
      <ul>
        <li>Paying with stolen or unauthorised cards, or placing orders you don’t mean to pay for.</li>
        <li>Buying keys to resell, or using several accounts to get around the limits ({F.maxItemsPerOrder} keys per order, and lower limits for gift cards and top-ups).</li>
        <li>Reporting a working key as faulty, or raising a chargeback for keys you received and redeemed, to avoid paying.</li>
        <li>Sharing or publishing keys bought here, or redeeming keys outside the region they’re listed for.</li>
        <li>Automated access that loads the site, such as scraping, mass sign-ups or repeated checkout attempts.</li>
        <li>Trying to reach other customers’ data, our admin area or any system you aren’t authorised to use, or probing for security weaknesses without our written permission.</li>
        <li>Uploading or sending malware, spam or anything unlawful.</li>
      </ul>
    ),
  },
  {
    id: "breach",
    title: "When the rules are broken",
    body: (
      <>
        <p>Depending on what happened, we can cancel an order and refund it, or suspend or close the account. Where the law requires it, for example with card fraud, we report it to the relevant authority.</p>
        <p>If you think we got it wrong, email {F.email} and we’ll look at the decision again.</p>
      </>
    ),
  },
];

export default async function AcceptableUsePage() {
  return <PolicyLayout slug="acceptable-use" sections={sections} />;
}
