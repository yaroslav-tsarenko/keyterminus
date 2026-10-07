import Link from "next/link";
import { PolicyLayout, policyMetadata, type PolicySection } from "@/components/layout/PolicyLayout/PolicyLayout";
import { POLICY_FACTS as F } from "@/lib/policy-facts";

export const generateMetadata = policyMetadata(
  "warranty",
  `Key not working? Report it to ${F.brand} within ${F.guaranteeClaimDays} days of delivery and we send a replacement key, or refund what you paid if no replacement is available.`,
);

const sections: PolicySection[] = [
  {
    id: "guarantee",
    title: "What is covered",
    body: (
      <>
        <p>{F.guarantee}</p>
        <p>We treat a key as faulty when:</p>
        <ul>
          <li>the platform rejects it as invalid when you enter it;</li>
          <li>it had already been redeemed before it reached your account;</li>
          <li>it is for another product, platform, region or edition than the one named on the product page;</li>
          <li>the publisher withdraws it for a reason that already existed when we issued it and that you didn’t cause.</li>
        </ul>
        <p>A key we don’t manage to issue within {F.deliveryDeadlineHours} hours of payment confirmation is refunded without you having to ask.</p>
      </>
    ),
  },
  {
    id: "claim",
    title: "How to report a key",
    body: (
      <ol>
        {F.guaranteeSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    ),
  },
  {
    id: "evidence",
    title: "What helps us check it",
    body: (
      <>
        <ul>
          <li>the order number and the product concerned;</li>
          <li>a screenshot of the message the platform shows when you enter the key;</li>
          <li>the platform, and the country your platform account is set to.</li>
        </ul>
        <p>
          Don’t post the full key anywhere public. Send it only if we ask for it, by replying to our email or through the{" "}
          <Link href="/contact">contact form</Link>.
        </p>
      </>
    ),
  },
  {
    id: "outcome",
    title: "Replacement or refund",
    body: (
      <p>
        When a key is faulty, we issue a replacement key for the same product to your account. If no replacement is available, or you would
        rather have your money back, we refund what you paid for that key to {F.refundMethod} within {F.refundDays} days.
      </p>
    ),
  },
  {
    id: "what-it-is-not",
    title: "What isn’t covered",
    body: (
      <>
        <ul>
          {F.guaranteeExclusions.map((item) => (
            <li key={item}>{item};</li>
          ))}
          <li>keys you passed on to someone else, or that were taken from your email or account after its sign-in details were exposed.</li>
        </ul>
        <p>
          None of this limits your statutory rights as a consumer in the UK or the EU. Digital content must match its description and be fit
          for purpose; this page adds to those rights.
        </p>
      </>
    ),
  },
];

export default async function WarrantyPage() {
  return <PolicyLayout slug="warranty" sections={sections} />;
}
