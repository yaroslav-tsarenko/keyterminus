import Link from "next/link";
import { PolicyLayout, policyMetadata, type PolicySection } from "@/components/layout/PolicyLayout/PolicyLayout";
import { POLICY_FACTS as F } from "@/lib/policy-facts";
import { PLATFORMS } from "@/lib/keys/taxonomy";
import { PLATFORM_ORDER, orderIndex } from "@/config/merchandising";

export const generateMetadata = policyMetadata(
  "shipping",
  `How ${F.brand} delivers game keys, subscription codes and gift cards: to your account once payment is confirmed, ${F.deliveryUsual}. Regions, languages and redeeming.`,
);

const platforms = [...PLATFORMS].filter((p) => p.key !== "other").sort((a, b) => orderIndex(PLATFORM_ORDER, a.key) - orderIndex(PLATFORM_ORDER, b.key));

const sections: PolicySection[] = [
  {
    id: "how",
    title: "What is delivered, and where",
    body: (
      <>
        <p>
          Every product on {F.brand} is digital: a key for a game or DLC, a subscription code, a gift card or top-up code, or a software
          licence key. Nothing is sent by post and there is no delivery charge.
        </p>
        <p>
          We ask our distribution partner for your key only once the payment provider has confirmed your payment. The key then appears{" "}
          {F.deliveryWhere}, {F.deliveryUsual}. {F.deliveryEmailNote}
        </p>
        <p>
          If an order contains several products, or several keys of one product, each key is issued separately. The order page shows where
          each one is: payment confirmed, issuing, issued or refunded.
        </p>
      </>
    ),
  },
  {
    id: "timing",
    title: "How long it takes",
    body: (
      <>
        <p>
          Most keys are issued within minutes of payment confirmation. We don’t promise an exact number of minutes, because a check by your
          bank, a security review of the order or a delay at our distribution partner can add time.
        </p>
        <p>
          If a key hasn’t been issued within {F.deliveryDeadlineHours} hours of payment confirmation, we refund what you paid for it to{" "}
          {F.refundMethod} within {F.refundDays} days and let you know by email.
        </p>
        <p>We don’t take pre-orders. Every listed product can be issued as soon as your payment is confirmed.</p>
      </>
    ),
  },
  {
    id: "before",
    title: "What to check before you pay",
    body: (
      <>
        <p>Every product page names:</p>
        <ul>
          <li>the platform the key is redeemed on and the account it needs;</li>
          <li>the activation region and what it means for your account’s country setting;</li>
          <li>the languages, where the publisher lists them;</li>
          <li>the edition, the length of a subscription, or the value and currency of a gift card;</li>
          <li>system requirements, for PC games, DLC and software only.</li>
        </ul>
        <p>
          A region-locked key activates only on an account set to that region, and DLC needs the base game on the same platform and in the
          same region. Compare these details with your account before you order.
        </p>
      </>
    ),
  },
  {
    id: "redeem",
    title: "Redeeming a key",
    body: (
      <>
        <p>In Account → Keys, choose Reveal key, copy the key and enter it on its platform:</p>
        <ul>
          {platforms.map((p) => (
            <li key={p.key}>
              <strong>{p.label}:</strong> {p.redeem[0]} {p.redeem[1] ?? ""}
            </li>
          ))}
        </ul>
        <p>
          Keep a key to yourself until you redeem it: whoever sees it can use it. We will never ask for your platform password or a
          two-factor code. Step-by-step help is in <Link href="/how-activation-works">How activation works</Link>.
        </p>
      </>
    ),
  },
  {
    id: "not-working",
    title: "When a key doesn’t work",
    body: (
      <p>
        Report it within {F.guaranteeClaimDays} days of delivery, with your order number and a screenshot of the error. We check the key and
        send a replacement or a refund. The full procedure is on <Link href="/policies/warranty">Key not working?</Link>.
      </p>
    ),
  },
  {
    id: "where",
    title: "Countries we serve",
    body: (
      <p>
        We serve customers in the {F.marketCountries}. We don’t accept orders from {F.restrictedCountries} or {F.restrictedTerritories}, and we
        don’t list keys whose activation region is limited to them. Don’t use a VPN or proxy to redeem a key outside its region: the
        platform may block the key or your account.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Questions about a delivery",
    body: <p>Email {F.email} with your order number. We reply {F.replyTime}.</p>,
  },
];

export default async function ShippingPage() {
  return <PolicyLayout slug="shipping" sections={sections} />;
}
