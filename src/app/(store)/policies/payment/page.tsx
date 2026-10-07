import Link from "next/link";
import { PolicyLayout, policyMetadata, type PolicySection } from "@/components/layout/PolicyLayout/PolicyLayout";
import { POLICY_FACTS as F } from "@/lib/policy-facts";

export const generateMetadata = policyMetadata(
  "payment",
  `Pay ${F.brand} by ${F.cardMethods} card on a PCI DSS compliant hosted payment page, in ${F.currencies}. Your full card number never reaches us.`,
);

const sections: PolicySection[] = [
  {
    id: "methods",
    title: "Accepted payment",
    body: (
      <>
        <p>We accept {F.cardMethods} credit and debit cards, and no other payment methods.</p>
        <p>
          Payment takes place on the hosted page of{" "}
          {F.paymentProviderNamed ? `${F.paymentProviderNamed}, a PCI DSS compliant payment provider` : "our PCI DSS compliant payment provider"}. When you
          choose Pay at checkout you go to that page to enter your card details, and return to {F.brand} when the payment is finished.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Your card details",
    body: (
      <>
        <p>
          <strong>We don’t store or process full payment card data.</strong> Your card number, expiry date and security code are typed on the
          payment provider’s page and never travel through our website. We receive only the payment result and a transaction reference.
        </p>
        <p>
          Payments go through 3-D Secure and Strong Customer Authentication, so your bank may ask you to approve the payment, for example in
          its app or with a one-time code. If you don’t approve it, no payment is taken.
        </p>
      </>
    ),
  },
  {
    id: "currencies",
    title: "Currencies",
    body: (
      <>
        <p>
          You can view prices and pay in {F.currencies}. We set prices in {F.baseCurrency} and convert them into the other currencies at our
          current exchange rate. The checkout total, in the currency you chose, is exactly what we charge.
        </p>
        <p>If your card uses another currency, the card issuer may convert the amount and add its own fee, which we don’t control.</p>
      </>
    ),
  },
  {
    id: "tax",
    title: "VAT",
    body: F.vatRegistered ? (
      <p>Prices include VAT at the rate that applies to your order, and the invoice shows the VAT amount.</p>
    ) : (
      <p>{F.company} isn’t registered for VAT. No VAT is charged, and none appears at checkout, in your confirmation or on your invoice.</p>
    ),
  },
  {
    id: "when-charged",
    title: "When you’re charged",
    body: (
      <>
        <p>
          Your card is charged when you finish paying on the provider’s page. Only after the provider confirms the payment do we confirm the
          order, email you and request your keys. A declined or cancelled payment costs you nothing and no key is issued.
        </p>
        <p>
          If a payment fails, check the card details and that your bank approved it, then try again. If it keeps failing, contact your bank or
          email {F.email}.
        </p>
      </>
    ),
  },
  {
    id: "refunds",
    title: "Refunds",
    body: (
      <p>
        Refunds go back to the card you paid with, in the same currency, within {F.refundDays} days, as set out in the{" "}
        <Link href="/policies/returns">Refund policy</Link>. We can’t send a refund to a different card or account.
      </p>
    ),
  },
  {
    id: "statement",
    title: "How the charge appears",
    body: (
      <p>
        Depending on your bank, the charge shows the name {F.company} or {F.brand}. If you don’t recognise a charge, email {F.email} before you
        contact your bank and we’ll find the order.
      </p>
    ),
  },
  {
    id: "disputes",
    title: "Disputes",
    body: (
      <p>
        If something is wrong with an order, contact us first: it is usually quicker than a card dispute. Chargebacks are covered in the{" "}
        <Link href="/policies/terms#chargebacks">Terms and conditions</Link>.
      </p>
    ),
  },
];

export default async function PaymentPage() {
  return <PolicyLayout slug="payment" sections={sections} />;
}
