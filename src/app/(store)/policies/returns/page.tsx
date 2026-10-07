import Link from "next/link";
import { PolicyLayout, policyMetadata, type PolicySection } from "@/components/layout/PolicyLayout/PolicyLayout";
import { POLICY_FACTS as F } from "@/lib/policy-facts";

export const generateMetadata = policyMetadata(
  "returns",
  `When ${F.brand} refunds game keys, subscription codes and gift cards: keys we can’t issue, keys that don’t work and cancellations before a key is issued. Refunds go to ${F.refundMethod} within ${F.refundDays} days.`,
);

const sections: PolicySection[] = [
  {
    id: "summary",
    title: "The short version",
    body: (
      <ul>
        <li>A key we can’t issue within {F.deliveryDeadlineHours} hours of payment confirmation is refunded.</li>
        <li>A key that doesn’t work, reported within {F.guaranteeClaimDays} days of delivery, is replaced or refunded.</li>
        <li>You can cancel at no cost before {F.cancelBefore}.</li>
        <li>Once a key is issued to your account, the {F.withdrawalDays}-day right to cancel ends for it, because at checkout you asked for delivery straight after payment.</li>
        <li>Refunds go to {F.refundMethod} within {F.refundDays} days, in the currency you paid in.</li>
      </ul>
    ),
  },
  {
    id: "withdrawal",
    title: "Your right to cancel and delivery straight after payment",
    body: (
      <>
        <p>
          Under the Consumer Contracts Regulations 2013 (UK) and the Consumer Rights Directive (EU), consumers have {F.withdrawalDays} days to
          cancel a contract for digital content that isn’t supplied on a physical medium. That right ends once supply has started at the
          consumer’s express request and with their acknowledgement that the right will be lost.
        </p>
        <p>
          We issue keys straight after payment. At checkout you tick a separate, unticked box that reads: “{F.waiverText}” This request is
          separate from agreeing to our terms, and no order can be placed without it. We record its wording and time with your order, and
          repeat it in your confirmation email and on your invoice.
        </p>
        <p>
          Supply starts when a key is issued to your account. Before that, you can cancel at no cost by emailing {F.email} or using the{" "}
          <Link href="/contact">contact form</Link> with your order number. Keys are usually issued within minutes, so a cancellation that
          arrives later is handled under the rules below.
        </p>
        <p>Asking for immediate delivery doesn’t change your rights when a key isn’t issued, doesn’t work or isn’t as described.</p>
      </>
    ),
  },
  {
    id: "when-we-refund",
    title: "When we refund",
    body: (
      <>
        <ul>
          <li>We couldn’t issue the key within {F.deliveryDeadlineHours} hours of payment confirmation.</li>
          <li>The key is invalid, or was redeemed before it reached you, and no replacement is available.</li>
          <li>The key is for another product, platform, region or edition than the one named on the product page.</li>
          <li>The publisher withdrew the key for a reason that already existed when we issued it and that you didn’t cause.</li>
          <li>You cancelled before {F.cancelBefore}.</li>
        </ul>
        <p>
          For a key that doesn’t work, we try a replacement first. The steps and what to send are on{" "}
          <Link href="/policies/warranty">Key not working?</Link>.
        </p>
      </>
    ),
  },
  {
    id: "not-refundable",
    title: "When we don’t refund",
    body: (
      <>
        <p>We don’t refund a key that has been issued and works as described when:</p>
        <ul>
          <li>you changed your mind or saw a lower price elsewhere;</li>
          <li>you chose the wrong platform, region or edition although the product page named them correctly;</li>
          <li>your device doesn’t meet the system requirements listed on the product page;</li>
          <li>you redeemed the key, or passed it to someone who did.</li>
        </ul>
        <p>Changes a publisher makes to a game or service after you’ve redeemed it are governed by the publisher’s own terms.</p>
      </>
    ),
  },
  {
    id: "how-refunds",
    title: "How refunds are paid",
    body: (
      <>
        <p>
          We pay a refund within {F.refundDays} days of confirming it to you, to {F.refundMethod} and in the currency you paid in. If an order
          contains several products, only the affected ones are refunded. Refunds are free of charge. Your bank may need a few more working
          days to show the money on your statement.
        </p>
        <p>
          Each product on your <Link href="/account/orders">order page</Link> shows its status, including “Refund pending” and “Refunded”,
          and we email you when a refund is paid.
        </p>
      </>
    ),
  },
  {
    id: "chargebacks",
    title: "Talk to us before your bank",
    body: (
      <p>
        Please contact us first so we can look into it. If a chargeback is raised for an order whose keys were issued and work as described,
        we may send the payment provider the order, delivery and reveal records we hold, as set out in the{" "}
        <Link href="/policies/privacy">Privacy policy</Link>.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Asking about a refund",
    body: (
      <p>
        Email {F.email} or use the <Link href="/contact">contact form</Link> with your order number. We reply {F.replyTime}. If you aren’t
        happy with our answer, see the <Link href="/policies/complaints">Complaints policy</Link>.
      </p>
    ),
  },
];

export default async function ReturnsPage() {
  return <PolicyLayout slug="returns" sections={sections} />;
}
