import Link from "next/link";
import { PolicyLayout, SellerBlock, policyMetadata, policyTable, type PolicySection } from "@/components/layout/PolicyLayout/PolicyLayout";
import { STORE_POLICY } from "@/config/store-policy";
import { POLICY_FACTS as F } from "@/lib/policy-facts";

export const generateMetadata = policyMetadata(
  "privacy",
  `The personal data ${F.company} (${F.brand}) holds under UK GDPR and EU GDPR: what, why, who processes it, how long it is kept and your rights.`,
);

const purposes: { purpose: string; data: string; basis: string }[] = [
  { purpose: "Taking your order and issuing your keys", data: "Name, email, phone (optional), billing address, products ordered, keys issued to you (stored encrypted)", basis: "Contract" },
  { purpose: "Showing each key only to its owner", data: "When each key was revealed in your account, and how often", basis: "Contract and legitimate interests" },
  { purpose: "Running your account", data: "Name, email, phone, date of birth, address, password (stored as a hash), orders, saved keys", basis: "Contract" },
  { purpose: "Recording your request for delivery straight after payment", data: "The wording you agreed to and when you ticked the box", basis: "Legal obligation" },
  { purpose: `Confirming you are ${F.minAge} or over`, data: "Date of birth", basis: "Contract and legitimate interests" },
  { purpose: "Replying to messages and complaints", data: "Name, email, order number, your message and the IP address it came from", basis: "Contract and legitimate interests" },
  { purpose: "Refunds, chargebacks and fraud prevention", data: "Order details, payment result, transaction reference, IP address", basis: "Legal obligation and legitimate interests" },
  { purpose: "Refusing orders from restricted countries and territories", data: "Billing country and address", basis: "Legal obligation" },
  { purpose: "Accounting and tax", data: "Order and refund records", basis: "Legal obligation" },
  { purpose: "Newsletter, only if you subscribe", data: "Email address", basis: "Consent" },
  { purpose: "Keeping the site secure and running", data: "IP address, browser and device type, pages requested, error logs", basis: "Legitimate interests" },
];

const sections: PolicySection[] = [
  {
    id: "controller",
    title: "Who controls your data",
    body: (
      <>
        <p>
          {F.company}, trading as {F.brand}, is the controller of the personal data described here. For customers in the United Kingdom this
          policy follows the UK GDPR and the Data Protection Act 2018; for customers in the European Union, the EU General Data Protection
          Regulation.
        </p>
        <SellerBlock />
        <p>Questions about your data, or requests to use your rights, go to {F.email}.</p>
      </>
    ),
  },
  {
    id: "collect",
    title: "What we hold",
    body: (
      <ul>
        <li><strong>Account:</strong> first and last name, email, phone number, date of birth, street, city, postcode and country, and your password, kept only as a one-way hash.</li>
        <li><strong>Orders:</strong> the products you buy, billing address, contact details, your request for delivery straight after payment, the status of each key, and the payment result and transaction reference the payment provider sends us.</li>
        <li><strong>Keys:</strong> the keys issued to you, stored encrypted. A key is decrypted only when you choose Reveal key, and we record when it was first revealed.</li>
        <li><strong>Messages:</strong> what you send by email or through the contact form, including any order number, and for the form the IP address it came from.</li>
        <li><strong>Saved keys:</strong> the products you save in your account.</li>
        <li><strong>Newsletter:</strong> your email address, if you subscribe.</li>
        <li><strong>Technical data:</strong> IP address, browser and device type and the pages requested, in server logs. Browser storage is listed in the <Link href="/policies/cookies">Cookie policy</Link>.</li>
      </ul>
    ),
  },
  {
    id: "card-data",
    title: "Card payments",
    body: (
      <>
        <p>
          <strong>
            We don’t store or process full payment card data. Every card payment is processed by our PCI DSS compliant payment provider
            {F.paymentProviderNamed ? `, ${F.paymentProviderNamed}` : ""}.
          </strong>
        </p>
        <p>
          You type your card details on the provider’s hosted page, not on our site. Payments are protected by 3-D Secure and Strong Customer
          Authentication (SCA), so your bank may ask you to approve a payment, for example in its app. We receive only the payment result and
          a transaction reference.
        </p>
      </>
    ),
  },
  {
    id: "use",
    title: "Why we use it, and on what legal basis",
    body: (
      <div className="overflow-x-auto">
        <table className={policyTable}>
          <thead>
            <tr>
              <th scope="col">Purpose</th>
              <th scope="col">Data</th>
              <th scope="col">Lawful basis</th>
            </tr>
          </thead>
          <tbody>
            {purposes.map((row) => (
              <tr key={row.purpose}>
                <td className="font-medium text-ink">{row.purpose}</td>
                <td className="text-ink-muted">{row.data}</td>
                <td>{row.basis}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: "sharing",
    title: "Who receives it",
    body: (
      <>
        <p>We pass personal data only to service providers that process it for us, on our instructions, and each receives only what it needs:</p>
        <ul>
          {STORE_POLICY.processors.map((p) => (
            <li key={p.role}>
              <strong>{p.name ? `${p.role} (${p.name})` : p.role}:</strong> {p.purpose.charAt(0).toLowerCase() + p.purpose.slice(1)}.
            </li>
          ))}
        </ul>
        <p>
          We also disclose data when the law requires it, for example to tax authorities or the police, or to a card issuer during a payment
          dispute. We never sell personal data and don’t share it with advertisers.
        </p>
      </>
    ),
  },
  {
    id: "transfers",
    title: "Transfers abroad",
    body: (
      <p>
        Our key distribution partner receives the product, the quantity and our own order reference, never your name, email, address or card
        details. When a service provider processes data outside the UK or the European Economic Area, we rely on an adequacy decision or
        standard contractual clauses (with the UK International Data Transfer Addendum for UK data).
      </p>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <ul>
        <li>Order, payment and refund records: {F.retention.orderRecordsYears} years from the order, as accounting and tax law require.</li>
        <li>Your account: until you ask us to close it, or after {F.retention.inactiveAccountYears} years with no sign-in or order. Order records then follow the rule above.</li>
        <li>Messages and complaints: {F.retention.supportMessagesMonths} months after the conversation ends.</li>
        <li>Newsletter: until you unsubscribe.</li>
      </ul>
    ),
  },
  {
    id: "rights",
    title: "Your rights",
    body: (
      <>
        <p>You can ask us to:</p>
        <ul>
          <li>give you a copy of the personal data we hold about you;</li>
          <li>correct data that is wrong;</li>
          <li>delete data we no longer need or have no lawful basis to keep;</li>
          <li>restrict or stop using it, including where we rely on legitimate interests;</li>
          <li>hand over the data you gave us in a portable format.</li>
        </ul>
        <p>You can also withdraw consent at any time, for example by unsubscribing or changing your cookie settings.</p>
        <p>Email {F.email} to use these rights. We answer within one month, and may ask you to confirm your identity first.</p>
        <p>
          You may complain to a supervisory authority: the Information Commissioner’s Office (ico.org.uk) in the United Kingdom, or in the
          European Union the data protection authority of the country where you live or work. We’d welcome the chance to sort it out with you
          first.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <p>
        The site is served over HTTPS only and passwords are kept as one-way hashes. Only the people who fulfil orders and answer messages can
        reach customer data. Keys are encrypted at rest and shown only to the signed-in account that bought them; staff can’t see them in the
        admin area. Card details never reach our systems.
      </p>
    ),
  },
  {
    id: "automated",
    title: "Automated decisions",
    body: (
      <p>
        We don’t make decisions with legal or similarly significant effects on you by automated means alone. Your card issuer and the payment
        provider run their own automated fraud checks and may decline a payment; if that happens, contact us and we’ll look at the order.
      </p>
    ),
  },
  {
    id: "age",
    title: "Age",
    body: (
      <p>
        The store is for adults, and we don’t knowingly collect data from anyone under {F.minAge}. If you think someone under {F.minAge} has
        an account, email {F.email} and we’ll delete it.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: <p>We update this policy whenever the way we use personal data changes. The date at the top shows the current version.</p>,
  },
];

export default async function PrivacyPage() {
  return <PolicyLayout slug="privacy" sections={sections} />;
}
