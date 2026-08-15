import { redirect, Form, useLoaderData } from "react-router";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className={styles.landingContainer}>
      <div className={styles.landingCard}>
        <div className={styles.badge}>
          <span>✨</span>
          <span>Free SKU Generator for Shopify</span>
        </div>

        <h1 className={styles.title}>
          Generate, Automate & Standardize Your Product SKUs
        </h1>

        <p className={styles.subtitle}>
          Create custom SKU rules with prefixes, body numbers, suffixes, and metafields to keep your store inventory organized.
        </p>

        {showForm && (
          <div className={styles.formCard}>
            <Form className={styles.form} method="post" action="/auth/login">
              <label className={styles.label}>
                <span className={styles.labelText}>Log in with your Shopify store</span>
                <div className={styles.inputRow}>
                  <input
                    className={styles.input}
                    type="text"
                    name="shop"
                    placeholder="my-shop-domain.myshopify.com"
                    required
                  />
                  <button className={styles.button} type="submit">
                    <span>Log in</span>
                    <span>→</span>
                  </button>
                </div>
                <span className={styles.hintText}>
                  Enter your store domain (e.g. store.myshopify.com)
                </span>
              </label>
            </Form>
          </div>
        )}

        <div className={styles.featuresGrid}>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>⚙️</div>
            <h3 className={styles.featureTitle}>Custom Rule Builder</h3>
            <p className={styles.featureDesc}>
              Define prefixes, sequential body numbers, suffixes, separators, and product metafields.
            </p>
          </div>

          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>⚡</div>
            <h3 className={styles.featureTitle}>Automated Generation</h3>
            <p className={styles.featureDesc}>
              Automatically assign SKUs to new products and variants as soon as they are added.
            </p>
          </div>

          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>🔍</div>
            <h3 className={styles.featureTitle}>Duplicate Scanner</h3>
            <p className={styles.featureDesc}>
              Instantly scan your entire Shopify catalog to find and fix duplicate SKU numbers.
            </p>
          </div>
        </div>

        <div className={styles.footerNote}>
          Built for Shopify Merchants • Secure OAuth Authentication
        </div>
      </div>
    </div>
  );
}
