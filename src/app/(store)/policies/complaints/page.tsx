import Link from "next/link";
import { PolicyLayout, policyMetadata, type PolicySection } from "@/components/layout/PolicyLayout/PolicyLayout";
import { POLICY_FACTS as F } from "@/lib/policy-facts";

export const generateMetadata = policyMetadata(
  "complaints",
  `How to make a complaint to ${F.brand}: we confirm receipt ${F.complaintsAck} and send a full answer within ${F.complaintsDays} days.`,
);

const sections: PolicySection[] = [
  {
    id: "how",
    title: "Making a complaint",
    body: (
      <>
        <p>
          Write to {F.email} or use the <Link href="/contact">contact form</Link>, and include:
        </p>
        <ul>
          <li>your name and the email address on the order;</li>
          <li>the order number, if it concerns an order;</li>
          <li>what went wrong, with a screenshot of the error if a key won’t activate;</li>
          <li>what you would like us to do about it.</li>
        </ul>
        <p>Support hours are {F.supportHours}.</p>
      </>
    ),
  },
  {
    id: "timeline",
    title: "What we do with it",
    body: (
      <ol>
        <li>We confirm receipt {F.complaintsAck} and tell you who is handling it.</li>
        <li>We investigate, which can include checking a key with our distribution partner.</li>
        <li>
          Within {F.complaintsDays} days we send a full answer: what we found and what we will do. If it takes longer, for instance while a
          publisher checks a key, we explain why and when you will hear from us.
        </li>
      </ol>
    ),
  },
  {
    id: "escalate",
    title: "If you’re not satisfied",
    body: (
      <>
        <p>Reply to our answer and ask for a review. Someone else in the team looks at the complaint again and replies within {F.complaintsDays} days.</p>
        <p>
          If we still disagree, you can turn to the consumer advice service where you live: Citizens Advice in England, Wales and Scotland,
          Consumerline in Northern Ireland, or the European Consumer Centre in your EU country. You may also go to court, as explained under
          governing law in the <Link href="/policies/terms#law">Terms and conditions</Link>.
        </p>
        <p>
          Complaints about the use of your personal data can also go to a data protection authority, as described in the{" "}
          <Link href="/policies/privacy#rights">Privacy policy</Link>.
        </p>
      </>
    ),
  },
  {
    id: "records",
    title: "Records we keep",
    body: <p>We keep each complaint and our answer for {F.retention.supportMessagesMonths} months, so we can follow up and fix what went wrong.</p>,
  },
];

export default async function ComplaintsPage() {
  return <PolicyLayout slug="complaints" sections={sections} />;
}
