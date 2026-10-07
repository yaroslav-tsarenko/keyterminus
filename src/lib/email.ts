import nodemailer, { type Transporter } from "nodemailer";
import { COMPANY } from "@/lib/company";
import { BRAND, SITE_URL } from "@/lib/brand";
import { STORE_POLICY } from "@/config/store-policy";
import { computeTotals, rateConverter } from "@/lib/pricing";
import { addressLines, displayOrderNumber, type StoredAddress } from "@/lib/orders";
import { PAYMENT_METHOD_LABEL } from "@/lib/payments/types";
import { PASSWORD_RESET_TTL_MINUTES } from "@/lib/validators/auth";
import { invoiceAttachment, type InvoiceFile } from "@/lib/invoice";

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !user || !pass) return null;

  if (!transporter) {
    const port = Number(process.env.SMTP_PORT ?? 587);
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === "true" || port === 465,
      auth: { user, pass },
    });
  }
  return transporter;
}

function getFrom(): string {
  return (
    process.env.SMTP_FROM ||
    (process.env.SMTP_USER ? `${BRAND.name} <${process.env.SMTP_USER}>` : `${BRAND.name} <noreply@${BRAND.domain}>`)
  );
}

function getReplyTo(): string | undefined {
  return process.env.SMTP_REPLY_TO || undefined;
}

const C = {
  canvas: "#EAE5DA",
  panel: "#FCFBF7",
  board: "#222426",
  flap: "#2B2E31",
  onBoard: "#F2EDE1",
  onBoardMuted: "#B0ABA0",
  remark: "#E9BB45",
  ink: "#1B1C1D",
  muted: "#4B4842",
  faint: "#5D5951",
  line: "#D6D0C3",
  mustard: "#E2AE2F",
  mustardEdge: "#9C7612",
  success: "#2C6A3A",
  danger: "#B02A1F",
} as const;

const SANS = "'Overpass', Arial, Helvetica, sans-serif";
const MONO = "'Sometype Mono', Menlo, Consolas, monospace";

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: InvoiceFile[];
}

async function send({ to, subject, html, replyTo, attachments }: SendArgs): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    console.log(`[Email] Skipped (SMTP not configured) → ${subject} to ${to}`);
    return false;
  }
  try {
    await t.sendMail({ from: getFrom(), to, subject, html, replyTo: replyTo ?? getReplyTo(), attachments });
    return true;
  } catch (err) {
    console.error(`[Email] Exception → ${subject} to ${to}:`, err);
    return false;
  }
}

function escape(input: string): string {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

interface WrapperOptions {
  preheader?: string;
  sign: string;
  strip?: { order: string; status: string } | null;
}

function strip(order: string, status: string): string {
  const cell = (text: string, color: string) => `<td style="background:${C.flap};padding:10px 12px;font-family:${MONO};font-size:13px;line-height:1;font-weight:600;letter-spacing:0.04em;color:${color};white-space:nowrap;">${escape(text)}</td>`;
  return `<tr>
          <td style="background:${C.board};padding:0 24px 14px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:1px 0;">
              <tr>${cell("ORDER", C.onBoardMuted)}${cell(order, C.onBoard)}${cell(status.toUpperCase(), C.remark)}</tr>
            </table>
          </td>
        </tr>`;
}

function emailWrapper(content: string, options: WrapperOptions): string {
  const preheader = options.preheader
    ? `<div style="display:none;font-size:1px;color:${C.canvas};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escape(options.preheader)}</div>`
    : "";
  const year = new Date().getFullYear();
  const link = `color:${C.muted};text-decoration:underline;margin-right:12px;`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${BRAND.name}</title>
</head>
<body style="margin:0;padding:0;background:${C.canvas};color:${C.ink};font-family:${SANS};">
${preheader}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.canvas};">
  <tr>
    <td align="center" style="padding:24px 12px 40px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
        <tr>
          <td style="background:${C.board};padding:20px 24px;border-radius:8px 8px 0 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align:middle;">
                  <a href="${SITE_URL}" style="display:inline-block;line-height:0;color:${C.onBoard};text-decoration:none;"><img src="${SITE_URL}/email-logo.png" width="202" height="28" alt="${BRAND.name}" style="display:block;border:0;outline:none;height:28px;width:202px;color:${C.onBoard};font-family:${SANS};font-size:20px;font-weight:800;"></a>
                </td>
                <td align="right" style="vertical-align:middle;font-family:${SANS};font-size:11px;line-height:1;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${C.onBoardMuted};">${escape(options.sign)}</td>
              </tr>
            </table>
          </td>
        </tr>
        ${options.strip ? strip(options.strip.order, options.strip.status) : ""}
        <tr>
          <td style="height:4px;line-height:4px;font-size:0;background:${C.mustard};">&nbsp;</td>
        </tr>
        <tr>
          <td style="background:${C.panel};padding:32px 28px;border-left:1px solid ${C.line};border-right:1px solid ${C.line};border-bottom:1px solid ${C.line};border-radius:0 0 8px 8px;">
            ${content}
          </td>
        </tr>
        <tr>
          <td style="padding:22px 4px 0;font-size:12px;line-height:1.6;color:${C.muted};font-family:${SANS};">
            <p style="margin:0 0 4px;color:${C.ink};font-weight:600;">${escape(COMPANY.name)}</p>
            <p style="margin:0 0 4px;">${BRAND.name} is a trading name of ${escape(COMPANY.name)}. Company number ${escape(COMPANY.companyNumber)}.</p>
            <p style="margin:0 0 4px;">${escape(COMPANY.registeredOffice)}, ${escape(COMPANY.country)} &middot; <a href="mailto:${COMPANY.email}" style="color:${C.ink};">${COMPANY.email}</a>${COMPANY.phone ? ` &middot; ${escape(COMPANY.phone)}` : ""}</p>
            <p style="margin:12px 0 0;">
              <a href="${SITE_URL}/policies/terms" style="${link}">Terms</a>
              <a href="${SITE_URL}/policies/returns" style="${link}">Refunds</a>
              <a href="${SITE_URL}/policies/privacy" style="${link}">Privacy</a>
              <a href="${SITE_URL}/contact" style="color:${C.muted};text-decoration:underline;">Contact</a>
            </p>
            <p style="margin:12px 0 0;color:${C.faint};">&copy; ${year} ${BRAND.name}.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-family:${SANS};font-weight:800;font-size:26px;line-height:1.15;letter-spacing:-0.01em;color:${C.ink};">${text}</h1>`;
}

function paragraph(html: string, extra = ""): string {
  return `<p style="margin:0 0 16px;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.muted};${extra}">${html}</p>`;
}

function label(text: string): string {
  return `<p style="margin:0 0 6px;font-family:${SANS};font-size:11px;line-height:1;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;color:${C.faint};">${text}</p>`;
}

function button(href: string, text: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 8px;">
  <tr>
    <td style="background:${C.mustard};border:1px solid ${C.mustardEdge};border-radius:6px;">
      <a href="${href}" style="display:inline-block;padding:14px 26px;font-family:${SANS};font-size:15px;font-weight:700;line-height:1;color:${C.ink};text-decoration:none;">${text}</a>
    </td>
  </tr>
</table>`;
}

function note(html: string): string {
  return `<div style="border-left:3px solid ${C.line};padding:4px 0 4px 14px;margin:0 0 16px;">${html}</div>`;
}

interface Amount {
  toNumber?: () => number;
}

type Num = number | string | Amount | null | undefined;

interface OrderItem {
  productName: string;
  productSku: string;
  imageUrl?: string | null;
  variantName?: string | null;
  quantity: number;
  price: Num;
  total: Num;
}

interface OrderEmailData {
  orderId: string;
  orderNumber?: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: Num;
  taxAmount: Num;
  shippingCost: Num;
  discountAmount?: Num;
  discountPercent?: Num;
  total: Num;
  currency?: string | null;
  exchangeRate?: Num;
  shippingMethod: string;
  shippingAddress?: StoredAddress;
  billingAddress?: StoredAddress | null;
  paymentMethod?: string | null;
  trackingNumber?: string | null;
  createdAt?: Date | string;
  paidAt?: Date | string | null;
  waiverText?: string | null;
  waiverAcceptedAt?: Date | string | null;
}

function toNum(v: Num): number {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v);
  if (typeof v.toNumber === "function") return v.toNumber();
  return Number(v);
}

function currencyOf(data: OrderEmailData): string {
  return data.currency || STORE_POLICY.currency;
}

function money(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(amount);
}

function formatDate(d: Date | string | undefined): string {
  const date = d ? new Date(d) : new Date();
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function orderRef(data: OrderEmailData): string {
  return displayOrderNumber(data.orderNumber || data.orderId);
}

function chargeTotals(data: OrderEmailData) {
  return computeTotals(
    data.items.map((item) => ({ price: toNum(item.price), quantity: item.quantity })),
    {
      convert: rateConverter(toNum(data.exchangeRate) || 1),
      discountPercent: toNum(data.discountPercent),
      shippingBase: toNum(data.shippingCost),
    },
  );
}

async function invoiceFiles(data: OrderEmailData): Promise<InvoiceFile[]> {
  try {
    return [await invoiceAttachment({ ...data, orderNumber: data.orderNumber || data.orderId })];
  } catch (error) {
    console.error(`[Email] Invoice PDF for order ${orderRef(data)} failed`, error);
    return [];
  }
}

function addressHtml(address?: StoredAddress | null): string {
  const lines = addressLines(address);
  return lines.length ? lines.map(escape).join("<br>") : "&mdash;";
}

function sellerBlock(): string {
  return `${label("Seller")}
<p style="margin:0;font-family:${SANS};font-size:14px;line-height:1.6;color:${C.ink};">
  <strong>${escape(COMPANY.name)}</strong>, trading as ${BRAND.name}<br>
  ${escape(COMPANY.registeredOffice)}, ${escape(COMPANY.country)}<br>
  Company number <span style="font-family:${MONO};">${escape(COMPANY.companyNumber)}</span>${STORE_POLICY.vatRegistered ? `<br>VAT number <span style="font-family:${MONO};">${escape(COMPANY.vatNumber)}</span>` : ""}<br>
  Merchant of record: ${escape(COMPANY.name)}
</p>`;
}

function orderFacts(data: OrderEmailData): string {
  const currency = currencyOf(data);
  const cell = `padding:10px 0;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:14px;line-height:1.5;vertical-align:top;`;
  const rows: [string, string][] = [
    ["Order number", `<span style="font-family:${MONO};color:${C.ink};">${orderRef(data)}</span>`],
    ["Order date", `<span style="font-family:${MONO};">${formatDate(data.createdAt)}</span>`],
    ["Currency", `<span style="font-family:${MONO};">${currency}</span>`],
    ["Payment method", escape(data.paymentMethod === "card" || !data.paymentMethod ? PAYMENT_METHOD_LABEL : data.paymentMethod)],
  ];
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${C.line};margin:0 0 24px;">
${rows.map(([k, v]) => `<tr><td style="${cell}color:${C.faint};width:42%;">${k}</td><td style="${cell}color:${C.ink};">${v}</td></tr>`).join("")}
</table>`;
}

function itemsTable(data: OrderEmailData): string {
  const currency = currencyOf(data);
  const totals = chargeTotals(data);
  const th = `padding:0 0 8px;font-family:${SANS};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;color:${C.faint};border-bottom:1px solid ${C.ink};`;
  const td = `padding:12px 0;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:14px;line-height:1.5;vertical-align:top;`;
  const rows = data.items
    .map((item, index) => {
      const line = totals.lines[index];
      const thumb = item.imageUrl ? `<td width="52" style="${td}padding-right:12px;"><img src="${escape(item.imageUrl)}" width="40" height="53" alt="" style="display:block;width:40px;height:53px;border:0;object-fit:cover;background:${C.canvas};"></td>` : `<td width="0" style="${td}"></td>`;
      return `<tr>
  ${thumb}
  <td style="${td}color:${C.ink};padding-right:12px;"><span style="font-weight:700;">${escape(item.productName)}</span>${item.variantName ? `<br><span style="font-size:13px;color:${C.muted};">${escape(item.variantName)}</span>` : ""}<br><span style="font-family:${MONO};font-size:12px;color:${C.faint};">${escape(item.productSku)}</span></td>
  <td style="${td}color:${C.muted};text-align:center;white-space:nowrap;font-family:${MONO};">${item.quantity}</td>
  <td style="${td}color:${C.ink};text-align:right;white-space:nowrap;padding-left:12px;font-family:${MONO};">${money(line.total, currency)}</td>
</tr>`;
    })
    .join("");
  const sumRow = (name: string, value: string, strong = false) =>
    `<tr><td colspan="3" style="padding:6px 12px 6px 0;text-align:right;font-family:${SANS};font-size:${strong ? 16 : 14}px;color:${strong ? C.ink : C.muted};${strong ? "font-weight:700;" : ""}">${name}</td><td style="padding:6px 0;text-align:right;white-space:nowrap;font-family:${MONO};font-size:${strong ? 18 : 14}px;color:${C.ink};${strong ? "font-weight:600;" : ""}">${value}</td></tr>`;
  const summary = [
    sumRow("Subtotal", money(totals.subtotal, currency)),
    totals.discount > 0 ? sumRow(`Discount (${totals.discountPercent}%)`, `&minus;${money(totals.discount, currency)}`) : "",
    totals.vatRegistered && !totals.vatIncluded ? sumRow(`VAT (${totals.vatRatePercent}%)`, money(totals.vat, currency)) : "",
    sumRow(`Total (${currency})`, money(totals.total, currency), true),
    totals.vatRegistered && totals.vatIncluded ? sumRow(`Includes VAT at ${totals.vatRatePercent}%`, money(totals.vat, currency)) : "",
  ].join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
<thead><tr>
  <th style="${th}"></th>
  <th align="left" style="${th}">Key</th>
  <th align="center" style="${th}">Qty</th>
  <th align="right" style="${th}">Amount</th>
</tr></thead>
<tbody>${rows}${summary}</tbody>
</table>`;
}

function addressesBlock(data: OrderEmailData): string {
  const billing = data.billingAddress ?? data.shippingAddress;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
<tr>
  <td width="50%" style="vertical-align:top;padding-right:12px;">${label("Billing address")}<p style="margin:0;font-family:${SANS};font-size:14px;line-height:1.6;color:${C.ink};">${addressHtml(billing)}</p></td>
  <td width="50%" style="vertical-align:top;padding-left:12px;">${label("Delivery")}<p style="margin:0;font-family:${SANS};font-size:14px;line-height:1.6;color:${C.ink};">${escape(STORE_POLICY.delivery.method)}<br>${escape(data.customerEmail)}</p></td>
</tr>
</table>`;
}

function deliveryNote(): string {
  const d = STORE_POLICY.delivery;
  return note(
    paragraph(`${escape(d.headline)} Keys appear ${d.where}. If a key can’t be issued within ${d.deadlineHours} hours, we refund what you paid for it.`, "font-size:14px;margin:0;"),
  );
}

function waiverNote(data: OrderEmailData): string {
  const text = data.waiverText || STORE_POLICY.waiver.text;
  const when = data.waiverAcceptedAt ? ` on ${formatDate(data.waiverAcceptedAt)}` : "";
  return `${label("What you agreed to at checkout")}
${paragraph(`You confirmed${when}: &ldquo;${escape(text)}&rdquo; Once a key is issued to your account, the ${STORE_POLICY.returns.withdrawalDays}-day right to cancel ends for that key. A key that doesn’t work is still covered: see <a href="${SITE_URL}/policies/warranty" style="color:${C.ink};">Key not working?</a>.`, "font-size:13px;")}`;
}

function firstName(name: string): string {
  return escape(name.split(" ")[0] || name);
}

export async function sendWelcomeEmail(email: string, name?: string | null): Promise<boolean> {
  const first = name ? firstName(name) : null;
  const row = (text: string) => `<tr><td style="padding:12px 0;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:15px;color:${C.ink};">${text}</td></tr>`;
  return send({
    to: email,
    subject: `Your ${BRAND.name} account is ready`,
    html: emailWrapper(
      `${heading(first ? `Your account is ready, ${first}` : "Your account is ready")}
${paragraph(`You can now sign in with <strong style="color:${C.ink};">${escape(email)}</strong>. In your account you can:`)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${C.line};margin:0 0 8px;">
  ${row("Keep every key you buy, stored encrypted until you choose Reveal")}
  ${row("Download a PDF invoice for each order")}
  ${row("Save keys to come back to later")}
</table>
${button(`${SITE_URL}/catalog`, "Browse the catalogue")}
${paragraph("Didn’t create this account? Reply to this email and we’ll close it.", "font-size:13px;margin:16px 0 0;")}`,
      { sign: "Account created", preheader: `Your ${BRAND.name} account is ready to use.` },
    ),
  });
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
  const ref = orderRef(data);
  const totals = chargeTotals(data);
  const currency = currencyOf(data);
  const attachments = await invoiceFiles(data);
  return send({
    to: data.customerEmail,
    subject: `Order ${ref} confirmed · ${BRAND.name}`,
    attachments,
    html: emailWrapper(
      `${heading(`Payment confirmed, ${firstName(data.customerName)}`)}
${paragraph(`We’ve received your payment of <strong style="color:${C.ink};">${money(totals.total, currency)}</strong> and we’re issuing your keys now.${attachments.length ? " Your invoice is attached as a PDF." : ""}`)}
${orderFacts(data)}
${itemsTable(data)}
${addressesBlock(data)}
${deliveryNote()}
${waiverNote(data)}
${sellerBlock()}
${button(`${SITE_URL}/account/orders/${data.orderId}`, "View your order")}
${paragraph(`Read the <a href="${SITE_URL}/policies/returns" style="color:${C.ink};">Refund policy</a> and the <a href="${SITE_URL}/policies/shipping" style="color:${C.ink};">Delivery policy</a>.`, "font-size:13px;margin:16px 0 0;")}`,
      { sign: "Order confirmed", strip: { order: ref, status: "Payment confirmed" }, preheader: `Your ${BRAND.name} order ${ref} is confirmed.` },
    ),
  });
}

export async function sendOrderInvoiceEmail(data: OrderEmailData): Promise<boolean> {
  const ref = orderRef(data);
  const totals = chargeTotals(data);
  const currency = currencyOf(data);
  const attachments = await invoiceFiles(data);
  return send({
    to: data.customerEmail,
    subject: `Invoice for order ${ref} · ${BRAND.name}`,
    attachments,
    html: emailWrapper(
      `${heading("Your invoice")}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
<tr>
  <td width="50%" style="vertical-align:top;padding-right:12px;">${sellerBlock()}</td>
  <td width="50%" style="vertical-align:top;padding-left:12px;">${label("Billed to")}<p style="margin:0;font-family:${SANS};font-size:14px;line-height:1.6;color:${C.ink};">${addressHtml(data.billingAddress ?? data.shippingAddress)}<br>${escape(data.customerEmail)}</p></td>
</tr>
</table>
${orderFacts(data)}
${itemsTable(data)}
${paragraph(`Paid in full: ${money(totals.total, currency)}. Your card details were entered on the payment provider’s page; we never receive or store your full card number.`, "font-size:13px;")}
${paragraph(`${attachments.length ? "The PDF invoice is attached. " : ""}This email is your proof of purchase. For anything about the invoice, write to <a href="mailto:${COMPANY.email}" style="color:${C.ink};">${COMPANY.email}</a>.`, "font-size:13px;margin:0;")}`,
      { sign: "Invoice", strip: { order: ref, status: "Paid" }, preheader: `Invoice for ${BRAND.name} order ${ref}: ${money(totals.total, currency)}` },
    ),
  });
}

export async function sendKeysReadyEmail(data: OrderEmailData, items: { name: string; keys: number; platform: string | null }[]): Promise<boolean> {
  const ref = orderRef(data);
  const total = items.reduce((n, i) => n + i.keys, 0);
  const rows = items
    .map((item) => `<tr><td style="padding:12px 0;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:15px;font-weight:700;color:${C.ink};">${escape(item.name)}${item.platform ? `<br><span style="font-size:13px;font-weight:400;color:${C.muted};">${escape(item.platform)}</span>` : ""}</td><td style="padding:12px 0;border-bottom:1px solid ${C.line};font-family:${MONO};font-size:14px;color:${C.muted};text-align:right;white-space:nowrap;">${item.keys} ${item.keys === 1 ? "key" : "keys"}</td></tr>`)
    .join("");
  return send({
    to: data.customerEmail,
    subject: `${total === 1 ? "Your key is" : "Your keys are"} ready · order ${ref}`,
    html: emailWrapper(
      `${heading(total === 1 ? "Your key is ready" : "Your keys are ready")}
${paragraph(`Hi ${firstName(data.customerName)}, ${total === 1 ? "the key" : "the keys"} for this order ${total === 1 ? "is" : "are"} in your account. This email doesn’t contain ${total === 1 ? "it" : "them"}: sign in, open Keys and choose Reveal key when you’re ready to redeem.`)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${C.line};margin:0 0 8px;">${rows}</table>
${button(`${SITE_URL}/account/keys`, "View your keys")}
${paragraph(`Each platform’s steps are in <a href="${SITE_URL}/how-activation-works" style="color:${C.ink};">How activation works</a>. If a key doesn’t work, report it from the order within ${STORE_POLICY.guarantee.claimDays} days and include a screenshot of the error.`, "font-size:13px;margin:16px 0 0;")}`,
      { sign: "Key ready", strip: { order: ref, status: "Key ready" }, preheader: `Order ${ref}: your ${total === 1 ? "key is" : "keys are"} in your ${BRAND.name} account.` },
    ),
  });
}

export async function sendOrderStatusEmail(data: OrderEmailData, status: "DELIVERED" | "CANCELLED" | "REFUNDED", amount?: number): Promise<boolean> {
  const ref = orderRef(data);
  const totals = chargeTotals(data);
  const currency = currencyOf(data);
  const refundDays = STORE_POLICY.returns.refundDays;
  const refunded = money(amount ?? totals.total, currency);
  const variants = {
    DELIVERED: {
      subject: `All keys issued for order ${ref}`,
      title: "Every key in this order is ready",
      message: `every key from this order is waiting in your account. Reveal a key only when you are about to redeem it. If a key doesn’t work, tell us within ${STORE_POLICY.guarantee.claimDays} days of delivery and we replace it, or refund it if no replacement is available.`,
      cta: "View your keys",
      href: `${SITE_URL}/account/keys`,
      sign: "Key ready",
      strip: "Key ready",
    },
    CANCELLED: {
      subject: `Order ${ref} cancelled`,
      title: "Your order is cancelled",
      message: `if a payment was taken, ${refunded} goes back to ${STORE_POLICY.returns.refundMethod} within ${refundDays} days.`,
      cta: "Browse the catalogue",
      href: `${SITE_URL}/catalog`,
      sign: "Order cancelled",
      strip: "Cancelled",
    },
    REFUNDED: {
      subject: `Refund for order ${ref}`,
      title: "Your refund is on its way",
      message: `we’ve refunded ${refunded} to ${STORE_POLICY.returns.refundMethod}. Your bank may take a few days to show it.`,
      cta: "View your order",
      href: `${SITE_URL}/account/orders/${data.orderId}`,
      sign: "Refunded",
      strip: "Refunded",
    },
  } as const;
  const v = variants[status];
  return send({
    to: data.customerEmail,
    subject: `${v.subject} · ${BRAND.name}`,
    html: emailWrapper(
      `${heading(v.title)}
${paragraph(`Hi ${firstName(data.customerName)}, ${v.message}`)}
${button(v.href, v.cta)}`,
      { sign: v.sign, strip: { order: ref, status: v.strip }, preheader: `${BRAND.name} order ${ref}: ${v.title.toLowerCase()}.` },
    ),
  });
}

export async function sendPasswordResetEmail(email: string, resetUrl: string, name?: string | null): Promise<boolean> {
  const first = name ? firstName(name) : null;
  const minutes = PASSWORD_RESET_TTL_MINUTES;
  const expiry = minutes % 60 === 0 ? `${minutes / 60} ${minutes / 60 === 1 ? "hour" : "hours"}` : `${minutes} minutes`;
  return send({
    to: email,
    subject: `Reset your ${BRAND.name} password`,
    html: emailWrapper(
      `${heading("Choose a new password")}
${paragraph(`${first ? `Hi ${first}, someone` : "Someone"} asked to reset the password of the ${BRAND.name} account for ${escape(email)}. The link works once and expires in ${expiry}.`)}
${button(resetUrl, "Reset password")}
${paragraph(`If the button doesn’t open, paste this link into your browser:<br><a href="${resetUrl}" style="color:${C.ink};word-break:break-all;font-family:${MONO};font-size:12px;">${resetUrl}</a>`, "font-size:13px;")}
${paragraph("Didn’t ask for this? Ignore this email and your password stays as it is.", "font-size:13px;margin:0;")}`,
      { sign: "Password reset", preheader: `Reset link for your ${BRAND.name} account, valid for ${expiry}.` },
    ),
  });
}

interface ContactSubmission {
  name: string;
  email: string;
  orderNumber?: string;
  subject: string;
  message: string;
}

export async function sendContactFormEmail(submission: ContactSubmission): Promise<boolean> {
  const supportInbox = getReplyTo() || process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!supportInbox) {
    console.log("[Email] Contact form notification skipped (no inbox configured)");
    return false;
  }

  const order = submission.orderNumber?.trim();
  const row = (k: string, v: string, mono = false) => `<tr><td style="padding:8px 0;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:14px;color:${C.faint};width:90px;">${k}</td><td style="padding:8px 0;border-bottom:1px solid ${C.line};font-family:${mono ? MONO : SANS};font-size:14px;color:${C.ink};font-weight:600;">${v}</td></tr>`;

  return send({
    to: supportInbox,
    subject: `Contact: ${submission.subject}${order ? ` · order ${order}` : ""}`,
    replyTo: submission.email,
    html: emailWrapper(
      `${heading("New message from the contact form")}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${C.line};margin:0 0 16px;">
  ${row("From", `${escape(submission.name)} &lt;${escape(submission.email)}&gt;`)}
  ${row("Subject", escape(submission.subject))}
  ${order ? row("Order", escape(order), true) : ""}
</table>
${note(`<p style="margin:0;font-family:${SANS};font-size:14px;line-height:1.6;color:${C.ink};white-space:pre-wrap;">${escape(submission.message)}</p>`)}
${paragraph(`Reply to this email to answer ${escape(submission.email)} directly.`, "font-size:12px;margin:0;")}`,
      { sign: "Help desk" },
    ),
  });
}

export async function sendContactAutoReplyEmail(submission: ContactSubmission): Promise<boolean> {
  const order = submission.orderNumber?.trim();
  return send({
    to: submission.email,
    subject: `We’ve received your message · ${BRAND.name}`,
    html: emailWrapper(
      `${heading("We’ve received your message")}
${paragraph(`Hi ${escape(submission.name)}, thanks for contacting ${BRAND.name}. We reply ${STORE_POLICY.support.replyTime}. Support hours: ${escape(COMPANY.supportHours)}.`)}
${label("Your message")}
${note(`<p style="margin:0 0 8px;font-family:${SANS};font-size:14px;color:${C.ink};font-weight:700;">${escape(submission.subject)}${order ? ` · order <span style="font-family:${MONO};font-weight:500;">${escape(order)}</span>` : ""}</p><p style="margin:0;font-family:${SANS};font-size:14px;color:${C.muted};line-height:1.6;white-space:pre-wrap;">${escape(submission.message)}</p>`)}
${paragraph(`Many answers are already in <a href="${SITE_URL}/faq" style="color:${C.ink};">Questions</a>, the <a href="${SITE_URL}/policies/shipping" style="color:${C.ink};">Delivery policy</a> and the <a href="${SITE_URL}/policies/returns" style="color:${C.ink};">Refund policy</a>.`, "font-size:13px;margin:16px 0 0;")}`,
      { sign: "Help desk", preheader: `We reply ${STORE_POLICY.support.replyTime}.` },
    ),
  });
}
