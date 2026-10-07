import Link from "next/link";
import { PolicyLayout, SellerBlock, policyMetadata, type PolicySection } from "@/components/layout/PolicyLayout/PolicyLayout";
import { POLICY_FACTS as F } from "@/lib/policy-facts";

export const generateMetadata = policyMetadata(
  "terms",
  `How ordering from ${F.brand} (${F.company}) works: eligibility, product details, prices, payment, key delivery, the right to cancel, refunds and complaints.`,
);

const sections: PolicySection[] = [
  {
    id: "about",
    title: "About us and the scope of these terms",
    body: (
      <>
        <p>
          These terms apply to each order you place on {F.domain}. {F.brand} is a trading name of {F.company}; “we”, “us” and “our” mean{" "}
          {F.company}, and “you” means the person who places the order.
        </p>
        <SellerBlock />
        <p>
          Every product on {F.domain} is supplied to you by {F.company}. We source keys and product information from distribution partners, but your contract
          is with {F.company} alone.
        </p>
        <p>
          The <Link href="/policies/shipping">Delivery policy</Link>, <Link href="/policies/returns">Refund policy</Link>,{" "}
          <Link href="/policies/warranty">Key not working?</Link>, <Link href="/policies/payment">Payment policy</Link>,{" "}
          <Link href="/policies/privacy">Privacy policy</Link> and <Link href="/policies/cookies">Cookie policy</Link> form part of these
          terms. Nothing in them takes away rights you have by law as a consumer.
        </p>
      </>
    ),
  },
  {
    id: "definitions",
    title: "Definitions",
    body: (
      <ul>
        <li><strong>Product:</strong> a key for a game or DLC, a subscription code, a gift card or top-up code, or a software licence key offered on {F.domain}.</li>
        <li><strong>Key:</strong> the activation key, code or serial number we issue to you for a product.</li>
        <li><strong>Platform:</strong> the service on which a key is redeemed, for example Steam, Xbox, PlayStation or the EA app.</li>
        <li><strong>Publisher:</strong> whoever makes or runs the game, service, card or software that a key gives access to.</li>
      </ul>
    ),
  },
  {
    id: "who-can-order",
    title: "Who may order",
    body: (
      <>
        <p>You must be {F.minAge} or over to open an account or order. We ask for your date of birth at registration and refuse orders from anyone younger.</p>
        <p>
          We supply consumers buying for their own use, not for resale. The name, email, phone number, date of birth and billing address you
          give must be accurate and yours, and the card you pay with must be yours or used with its holder’s consent.
        </p>
      </>
    ),
  },
  {
    id: "where-we-sell",
    title: "Countries we serve",
    body: (
      <>
        <p>We serve customers in the {F.marketCountries}, and checkout accepts billing addresses in these countries only.</p>
        <p>
          We don’t open accounts in, deliver to or accept orders from {F.restrictedCountries} or {F.restrictedTerritories}; these are excluded
          at registration and checkout, and keys whose activation region is limited to them are not listed. If an order turns out to be
          connected to one of them, for example through the billing address or the card, we cancel it and refund the full amount.
        </p>
        <p>
          Don’t use a VPN, proxy, false address or another person’s card to hide your location or get around a restriction. We don’t offer
          keys that need a VPN to activate.
        </p>
      </>
    ),
  },
  {
    id: "products",
    title: "Product information",
    body: (
      <>
        <p>
          Before you order, read the product page: the platform, the activation region, the languages, the edition, a subscription’s length
          or a gift card’s value and currency, the account you need and, for PC games, DLC and software, the system requirements.
        </p>
        <p>
          You buy a key only; there is no disc, box or printed card. Cover art and screenshots come from the publisher and show the product,
          not the key. Descriptions, release dates and requirements come from publishers and distributors and we take care to keep them
          right. If we find a material error in a price, description, region or platform, we correct it and, where necessary, cancel and
          refund the affected order.
        </p>
        <p>We don’t take pre-orders. Every listed product can be issued as soon as your payment is confirmed.</p>
      </>
    ),
  },
  {
    id: "platforms",
    title: "Platforms and publishers",
    body: (
      <>
        <p>
          To redeem a key you need an account with the platform and must accept the platform’s and the publisher’s terms and licence. A key
          for a game or software gives you a licence to use the content on those terms; it doesn’t transfer ownership of the content.
        </p>
        <p>
          A subscription code gives access for the length and region shown. We never renew it or charge you again; any renewal is between you
          and the platform. A gift card or top-up code adds the value shown to an account set to the region shown, and the issuing platform
          holds and governs that balance.
        </p>
        <p>
          {F.brand} isn’t affiliated with or endorsed by the platforms and publishers whose products it offers. We aren’t responsible for
          platform outages, for a platform’s decisions about your account that have nothing to do with the key, or for changes a publisher
          makes after you redeem a key. This doesn’t limit our duty to supply a key that matches its description.
        </p>
      </>
    ),
  },
  {
    id: "orders",
    title: "Placing an order",
    body: (
      <>
        <ol>
          <li>Signed in to your {F.brand} account, you add products to your cart.</li>
          <li>At checkout you give your contact details and billing address.</li>
          <li>We check each product’s price and stock again. Any price increase is shown to you as a new total before payment.</li>
          <li>You tick the box accepting these terms and the Refund policy, tick the separate box asking for delivery straight after payment, and choose Pay.</li>
          <li>You pay by card on the payment provider’s hosted page.</li>
          <li>When the provider confirms the payment, we email an order confirmation with your invoice. Sending that email is the moment the contract between you and {F.company} comes into being.</li>
        </ol>
        <p>
          To protect customers and cardholders, an order can hold up to {F.maxItemsPerOrder} keys worth up to {F.maxOrderValue} in total, and
          some products have a lower limit per order, shown on their page. Gift cards and top-ups are limited to {F.cardLimitPerItem} per
          product in an order and to {F.cardLimit24h} keys or {F.cardValue24h} per customer in 24 hours.
        </p>
        <p>
          We may refuse an order before the contract is formed, or cancel it afterwards with a full refund, when a product is no longer
          available, a price or description was obviously wrong, a purchase limit applies, a security check can’t be completed, the order is
          linked to a restricted country or territory, or the payment looks fraudulent. We tell you by email if this happens.
        </p>
      </>
    ),
  },
  {
    id: "prices",
    title: "Prices, currencies and VAT",
    body: (
      <>
        <p>
          Prices can be shown in {F.currencies}. We set them in {F.baseCurrency} and convert them into other currencies at our current
          exchange rate. You pay in the currency chosen when you order, and the total shown before payment is the amount charged. If your card
          uses another currency, its issuer may add a foreign exchange fee.
        </p>
        {F.vatRegistered ? (
          <p>Prices include VAT at the rate that applies to your order.</p>
        ) : (
          <p>{F.company} isn’t registered for VAT. No VAT is charged or added at checkout, and none appears on your confirmation or invoice.</p>
        )}
        <p>There are no delivery or service charges: the checkout total is everything you pay.</p>
      </>
    ),
  },
  {
    id: "payment",
    title: "Payment",
    body: (
      <>
        <p>
          We accept {F.cardMethods} cards. You enter your card details on the hosted payment page of {F.paymentProvider}, which is PCI DSS
          compliant; we never see or store your full card number. Your bank may ask you to approve the payment with 3-D Secure, for example in
          its app.
        </p>
        <p>
          We ask for your keys only after the payment provider confirms the payment. A declined or cancelled payment means no order and no
          key. See the <Link href="/policies/payment">Payment policy</Link> for more.
        </p>
      </>
    ),
  },
  {
    id: "delivery",
    title: "Delivery",
    body: (
      <>
        <p>
          Keys are delivered {F.deliveryWhere}, {F.deliveryUsual}. {F.deliveryEmailNote} A key counts as delivered when it is available in your
          account.
        </p>
        <p>
          We don’t promise a fixed time: a bank check, a security review or a delay at our distribution partner can add time. A key we can’t
          issue within {F.deliveryDeadlineHours} hours of payment confirmation is refunded. See the <Link href="/policies/shipping">Delivery policy</Link>.
        </p>
      </>
    ),
  },
  {
    id: "cancel",
    title: "Your right to cancel",
    body: (
      <>
        <p>
          Under the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013 in the UK and the Consumer Rights
          Directive in the EU, you can usually cancel a contract for digital content within {F.withdrawalDays} days. The right ends once supply
          has started at your express request and you have acknowledged that you lose it.
        </p>
        <p>
          At checkout there is a separate box, unticked by default and apart from accepting these terms: “{F.waiverText}” An order can’t be
          placed without it. We record the wording and the time you ticked it, and repeat them in your confirmation email and on your invoice.
          Supply starts when a key is issued to your account, which is normally straight after your payment is confirmed.
        </p>
        <p>
          You can cancel at no cost before {F.cancelBefore} by emailing {F.email} or using the <Link href="/contact">contact form</Link> with
          your order number. Losing the right to cancel doesn’t affect your rights when a key isn’t issued, doesn’t work or isn’t as described.
        </p>
      </>
    ),
  },
  {
    id: "your-key",
    title: "Keeping your key safe",
    body: (
      <p>
        Keep a key private until you redeem it, and redeem it only on the platform and in the region named; whoever sees a key can use it. We
        aren’t responsible for a key redeemed by someone else because you shared it, or because your email or {F.brand} account was entered
        with your sign-in details, unless a security failure on our side caused it.
      </p>
    ),
  },
  {
    id: "refunds",
    title: "Refunds and faulty keys",
    body: (
      <>
        <p>
          If a key isn’t issued, is invalid, was redeemed before it reached you, is withdrawn for a reason you didn’t cause or doesn’t match its
          product page, tell us within {F.guaranteeClaimDays} days of delivery. We replace it, or refund what you paid for it to{" "}
          {F.refundMethod} within {F.refundDays} days. The steps are on <Link href="/policies/warranty">Key not working?</Link>.
        </p>
        <p>
          A key that works as described isn’t refunded because you changed your mind or picked the wrong platform, region or edition when the
          product page named them correctly. See the <Link href="/policies/returns">Refund policy</Link>.
        </p>
      </>
    ),
  },
  {
    id: "chargebacks",
    title: "Chargebacks",
    body: (
      <>
        <p>If something is wrong with an order, contact us first; we can usually fix it faster than a card dispute can.</p>
        <p>
          If you raise a chargeback, we answer your card issuer with the order details, the delivery record, the record of when the key was
          revealed in your account, your recorded request for delivery straight after payment and our messages with you. If the chargeback is
          decided in your favour, we don’t also refund the same amount directly. While a dispute is open we may pause new orders on the
          account. None of this limits your rights under card scheme rules or consumer law.
        </p>
      </>
    ),
  },
  {
    id: "account",
    title: "Your account",
    body: (
      <>
        <p>Keep your password secure; you are responsible for activity on your account. Tell us at once if you think someone else has used it.</p>
        <p>
          We may suspend or close an account that breaks the <Link href="/policies/acceptable-use">Acceptable use policy</Link>, gives false
          details or is linked to a restricted country or territory. Your rights for earlier valid orders remain. You may ask us to close your
          account at any time; keys you redeemed stay valid on their platforms.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "Our liability",
    body: (
      <>
        <p>
          If we break these terms, we are liable for loss or damage you suffer that was a foreseeable result of the breach. We aren’t liable for
          loss that couldn’t be foreseen when the contract was formed.
        </p>
        <p>
          We don’t exclude or limit liability for death or personal injury caused by our negligence, for fraud, for supplying digital content
          that doesn’t match its description, or for anything else the law doesn’t allow us to limit.
        </p>
        <p>Products are for private use, so we aren’t liable to you for lost profit, lost business or business interruption.</p>
      </>
    ),
  },
  {
    id: "outside-control",
    title: "Events beyond our control",
    body: (
      <p>
        If something outside our control, such as a platform outage or a disruption at our distribution partner or payment provider, delays
        your order, we tell you as soon as we can and do what we reasonably can to shorten the delay. A key that can’t be issued within{" "}
        {F.deliveryDeadlineHours} hours is refunded.
      </p>
    ),
  },
  {
    id: "ip",
    title: "Trademarks and content",
    body: (
      <p>
        Game titles, platform names, logos, cover art and screenshots belong to their owners and appear only to identify the products we offer;
        this doesn’t mean their owners sponsor or endorse {F.brand}. All other text, design and software on the site belongs to {F.company}.
      </p>
    ),
  },
  {
    id: "data",
    title: "Your personal data",
    body: (
      <p>
        How we use your personal data is set out in the <Link href="/policies/privacy">Privacy policy</Link>.
      </p>
    ),
  },
  {
    id: "complaints",
    title: "Complaints",
    body: (
      <p>
        If anything about an order isn’t right, email {F.email}. We confirm receipt {F.complaintsAck} and answer in full within{" "}
        {F.complaintsDays} days. The process, and where to go next, is in the <Link href="/policies/complaints">Complaints policy</Link>.
      </p>
    ),
  },
  {
    id: "law",
    title: "Governing law",
    body: (
      <>
        <p>These terms are governed by {F.governingLaw}, and disputes may be taken to {F.courts}.</p>
        <p>
          If you live in the United Kingdom or an EU member state, you keep the protection of the mandatory consumer law of your country and may
          bring proceedings in its courts.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: <p>We may update these terms. An order is governed by the version published when you placed it; the date at the top shows the latest change.</p>,
  },
];

export default async function TermsPage() {
  return <PolicyLayout slug="terms" sections={sections} />;
}
