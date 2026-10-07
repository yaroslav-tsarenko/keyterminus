import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { RouteLine } from "@/components/ui/RouteLine";
import { MiniStill } from "@/components/theater/mini-still";
import { STORE_POLICY } from "@/config/store-policy";
import { SectionHeading } from "./parts";

export async function Gate() {
  const t = await getTranslations("home.gate");
  const hosted = STORE_POLICY.payment.hostedPage;
  const threeDS = STORE_POLICY.payment.threeDSecure;
  const encrypted = STORE_POLICY.security.keysEncryptedAtRest && !STORE_POLICY.security.keyInEmail;
  const never = [hosted ? t("neverCard") : null, threeDS ? t("neverBank") : null].filter((x): x is string => Boolean(x));
  const link = "underline decoration-link decoration-2 underline-offset-[3px] hover-device:hover:text-accent-ink";

  return (
    <section id="through-the-gate" aria-labelledby="gate-title" data-scene="gate" data-home-section="gate" className="home-gate bg-surface">
      <div className="mx-auto max-w-container px-gutter">
        <SectionHeading id="gate-title" eyebrow={t("eyebrow")} title={t("title")} className="max-w-[760px]" />

        <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-6">
          <div data-surface="board" data-anim="sign" data-depth="D1" className="board p-6 sm:p-8">
            <h3 className="m-0 text-step-2 font-extrabold leading-[1.15] text-on-board">{t("handled")}</h3>
            <ul className="m-0 mt-5 list-none p-0">
              <li className="gate-item gate-item-board">{encrypted ? t("handledKeys") : t("handledKeysPlain")}</li>
              <li className="gate-item gate-item-board">{t("handledOrders", { years: STORE_POLICY.retention.orderRecordsYears })}</li>
            </ul>
          </div>
          {never.length ? (
            <div data-anim="sign" className="sign-plate p-6 sm:p-8">
              <h3 className="m-0 text-step-2 font-extrabold leading-[1.15] text-ink">{t("never")}</h3>
              <ul className="m-0 mt-5 list-none p-0">
                {never.map((line) => (
                  <li key={line} className="gate-item">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <p className="m-0 mt-6 max-w-[80ch] text-ui-md leading-[1.6] text-ink-muted">
          {STORE_POLICY.guarantee.faultyKey ? (
            <>
              <Link href="/policies/warranty" className={link}>
                {t("faulty")}
              </Link>{" "}
            </>
          ) : null}
          <Link href="/policies/payment" className={link}>
            {t("failed")}
          </Link>{" "}
          <Link href="/contact" className={link}>
            {t("reply", { replyTime: STORE_POLICY.support.replyTime })}
          </Link>
        </p>

        {hosted && threeDS ? (
          <div className="mt-14 grid gap-x-6 gap-y-10 lg:grid-cols-12 lg:items-center">
            <figure className="m-0 min-w-0 lg:col-span-7">
              <figcaption className="sr-only">{t("routeLabel")}</figcaption>
              <div className="gate-lines">
                <div className="gate-line-card">
                  <p className="eyebrow m-0 mb-4">{t("cardLine")}</p>
                  <RouteLine
                    data-route-line=""
                    orientation="responsive"
                    label={t("cardLine")}
                    stops={[
                      { key: "you", label: t("stopYou"), state: "done" },
                      { key: "hosted", label: t("stopHosted"), state: "done" },
                      { key: "bank", label: t("stopBank"), state: "done" },
                    ]}
                    terminus={{ tone: "terminus", label: <>{t("stopProvider")}<br />{t("cardEnds")}</> }}
                  />
                </div>
                <div className="gate-line-confirm">
                  <p className="eyebrow m-0 mb-4">{t("confirmLine")}</p>
                  <RouteLine
                    data-route-line=""
                    orientation="responsive"
                    label={t("confirmLine")}
                    stops={[
                      { key: "provider", label: t("stopProvider"), state: "station" },
                      { key: "store", label: t("stopStore"), state: "station" },
                      { key: "account", label: t("stopAccount"), state: "station" },
                    ]}
                    terminus={{ tone: "ink", label: t("yourKey") }}
                  />
                </div>
              </div>
            </figure>
            <div className="min-w-0 lg:col-span-5">
              <MiniStill scene="pay" state={{ step: "challenge", approving: 0.6 }} device="auto" address={t("stopHosted")} label={t("stillLabel")} />
              <p className="m-0 mt-3 text-ui-sm text-ink-muted">{t("stillCaption")}</p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
