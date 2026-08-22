import Shop from "../../models/Shop.server";
import { connectMongoose } from "../../db.mongoose.server";

/**
 * Sends an email notification to the store email when an SKU generation run finishes.
 */
export async function sendSkuRunCompletionEmail({ shopDomain, runId, runSummary = {} }) {
  try {
    await connectMongoose();
    const shopDoc = await Shop.findOne({ shopDomain });
    const targetEmail = shopDoc?.email;
    const shopName = shopDoc?.shopName || shopDomain;

    if (!targetEmail) {
      console.log(`[EmailService] No email found in DB for shop ${shopDomain}. Skipping email notification.`);
      return { success: false, reason: "NO_EMAIL" };
    }

    const {
      ruleName = "Manual SKU Run",
      status = "Completed",
      totalVariants = 0,
      processedVariants = 0,
      successfulVariants = 0,
      failedVariants = 0,
      skippedVariants = 0,
      errorSummary = "",
    } = runSummary;

    const isSuccess = status === "Completed";
    const statusColor = isSuccess ? "#059669" : status === "COMPLETED_WITH_ERRORS" ? "#D97706" : "#DC2626";
    const statusLabel = isSuccess ? "Completed Successfully" : status === "COMPLETED_WITH_ERRORS" ? "Completed with Errors" : "Failed";

    const subject = `[Free SKU App] SKU Generation ${statusLabel} for ${shopName}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #5B3DF5; padding: 20px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 22px;">Free SKU Generator</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Execution Summary Report</p>
        </div>

        <div style="padding: 24px; color: #374151;">
          <p style="font-size: 16px; margin-top: 0;">Hi <strong>${shopName}</strong>,</p>
          <p style="font-size: 15px; line-height: 1.5;">
            Your SKU generation run <strong>"${ruleName}"</strong> has finished. Here are the details of the execution:
          </p>

          <div style="background-color: #f9fafb; border-left: 4px solid ${statusColor}; padding: 14px; margin: 20px 0; border-radius: 4px;">
            <div style="font-size: 14px; font-weight: bold; color: ${statusColor}; text-transform: uppercase;">
              Status: ${statusLabel}
            </div>
            ${errorSummary ? `<div style="font-size: 13px; color: #dc2626; margin-top: 6px;">${errorSummary}</div>` : ""}
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <thead>
              <tr style="background-color: #f3f4f6; text-align: left;">
                <th style="padding: 10px; border-bottom: 2px solid #e5e7eb;">Metric</th>
                <th style="padding: 10px; border-bottom: 2px solid #e5e7eb;">Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Total Variants</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">${totalVariants.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Processed</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">${processedVariants.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #059669;">Successful SKUs Generated</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #059669;">${successfulVariants.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #dc2626;">Failed Variant Updates</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #dc2626;">${failedVariants.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #d97706;">Skipped (Already Had SKU)</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #d97706;">${skippedVariants.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <p style="font-size: 14px; margin-bottom: 24px;">
            You can view complete itemized SKU audit logs for this run in your <strong>SKU History</strong> dashboard inside the app.
          </p>
        </div>

        <div style="background-color: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
          Sent by Free SKU Generator App for Shopify store ${shopDomain}
        </div>
      </div>
    `;

    // Attempt sending email via nodemailer if SMTP credentials exist
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(process.env.SMTP_PORT || "587", 10),
          secure: process.env.SMTP_SECURE === "true",
          auth: { user: smtpUser, pass: smtpPass },
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"Free SKU App" <no-reply@${shopDomain}>`,
          to: targetEmail,
          subject,
          html: htmlContent,
        });

        console.log(`[EmailService] Email notification successfully sent to ${targetEmail} for run ${runId}`);
        return { success: true, sentTo: targetEmail };
      } catch (err) {
        console.warn(`[EmailService] Error sending email via SMTP:`, err.message);
      }
    }

    // Fallback: Log rendered email in console for local dev & testing
    console.log("\n=======================================================");
    console.log(`[EmailService LOG] Email Notification to Store (${targetEmail}):`);
    console.log(`Subject: ${subject}`);
    console.log(`Store: ${shopName} (${shopDomain})`);
    console.log(`Run ID: ${runId} | Status: ${status}`);
    console.log(`Results: ${successfulVariants} Successful, ${failedVariants} Failed, ${skippedVariants} Skipped`);
    console.log("=======================================================\n");

    return { success: true, loggedToConsole: true, targetEmail };
  } catch (err) {
    console.warn(`[EmailService] Failed to process email notification:`, err.message);
    return { success: false, error: err.message };
  }
}
