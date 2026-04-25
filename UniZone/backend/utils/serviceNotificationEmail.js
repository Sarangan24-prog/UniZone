const nodemailer = require("nodemailer");
const User = require("../models/User");

let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  const normalizedEmailPass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");
  cachedTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: normalizedEmailPass,
    },
  });
  return cachedTransporter;
}

function collectRecipientsFromEnv() {
  const raw = process.env.ADMIN_NOTIFY_EMAILS || "";
  return raw
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}

async function collectRecipientsFromDb() {
  try {
    const admins = await User.find({ role: "admin" }).select("email").lean();
    return admins
      .map((u) => (u.email || "").trim().toLowerCase())
      .filter(Boolean);
  } catch (err) {
    console.warn("⚠️ Failed to load admin recipients from DB:", err.message);
    return [];
  }
}

function toPlainDetails(payload) {
  try {
    return JSON.stringify(payload, null, 2);
  } catch (_err) {
    return "Unable to serialize payload details.";
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function pickRequestFields(requestDoc = {}) {
  const excludedKeys = new Set([
    "__v",
    "_id",
    "userId",
    "createdAt",
    "updatedAt",
  ]);

  return Object.entries(requestDoc)
    .filter(([key, val]) => !excludedKeys.has(key) && val !== undefined && val !== null && val !== "")
    .map(([key, val]) => {
      const label = key
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/^./, (s) => s.toUpperCase());

      if (typeof val === "object") {
        return [label, toPlainDetails(val)];
      }
      return [label, String(val)];
    });
}

async function notifyAdminsOfServiceSubmission({
  serviceType,
  requestDoc,
  student,
}) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(
      "⚠️ Service email notification skipped: EMAIL_USER/EMAIL_PASS not configured."
    );
    return;
  }

  const envRecipients = collectRecipientsFromEnv();
  const dbRecipients = await collectRecipientsFromDb();
  const fallbackRecipient = (process.env.EMAIL_USER || "").trim().toLowerCase();
  const recipients = [...new Set([...envRecipients, ...dbRecipients, fallbackRecipient].filter(Boolean))];

  if (recipients.length === 0) {
    console.warn(
      "⚠️ Service email notification skipped: no admin recipients found."
    );
    return;
  }

  const submittedAt = new Date().toLocaleString();
  const subject = `UniZone: New ${serviceType} request submitted`;
  const requestFields = pickRequestFields(requestDoc);
  const plainDetails =
    requestFields.length > 0
      ? requestFields.map(([k, v]) => `- ${k}: ${v}`).join("\n")
      : "- No additional request fields";

  const plainBody = [
    `A new ${serviceType} request was submitted in UniZone.`,
    "",
    `Student: ${student?.name || "Unknown"} (${student?.email || "no-email"})`,
    `Request ID: ${requestDoc?._id || "unknown"}`,
    `Submitted At: ${submittedAt}`,
    "",
    "Request details:",
    plainDetails,
  ].join("\n");

  const detailsRows =
    requestFields.length > 0
      ? requestFields
          .map(
            ([k, v]) => `
              <tr>
                <td style="padding: 8px 10px; border-bottom: 1px solid #eee; font-weight: 600; width: 35%;">${escapeHtml(k)}</td>
                <td style="padding: 8px 10px; border-bottom: 1px solid #eee;">${escapeHtml(v)}</td>
              </tr>
            `
          )
          .join("")
      : `
        <tr>
          <td style="padding: 8px 10px; border-bottom: 1px solid #eee; font-weight: 600;">Details</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #eee;">No additional request fields</td>
        </tr>
      `;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111; max-width: 720px; margin: 0 auto; background: #fff;">
      <div style="background: #1d4ed8; color: #fff; padding: 14px 18px; border-radius: 10px 10px 0 0;">
        <h2 style="margin: 0; font-size: 20px;">New ${escapeHtml(serviceType)} Request</h2>
      </div>
      <div style="border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; padding: 16px 18px;">
        <p style="margin: 0 0 12px;">A student has submitted a new service request in UniZone.</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px;">
          <tr>
            <td style="padding: 8px 10px; border-bottom: 1px solid #eee; font-weight: 600; width: 35%;">Student</td>
            <td style="padding: 8px 10px; border-bottom: 1px solid #eee;">${escapeHtml(student?.name || "Unknown")}</td>
          </tr>
          <tr>
            <td style="padding: 8px 10px; border-bottom: 1px solid #eee; font-weight: 600;">Email</td>
            <td style="padding: 8px 10px; border-bottom: 1px solid #eee;">${escapeHtml(student?.email || "no-email")}</td>
          </tr>
          <tr>
            <td style="padding: 8px 10px; border-bottom: 1px solid #eee; font-weight: 600;">Request ID</td>
            <td style="padding: 8px 10px; border-bottom: 1px solid #eee;">${escapeHtml(requestDoc?._id || "unknown")}</td>
          </tr>
          <tr>
            <td style="padding: 8px 10px; border-bottom: 1px solid #eee; font-weight: 600;">Submitted At</td>
            <td style="padding: 8px 10px; border-bottom: 1px solid #eee;">${escapeHtml(submittedAt)}</td>
          </tr>
        </table>
        <h3 style="margin: 10px 0 6px; font-size: 16px;">Request Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${detailsRows}
        </table>
      </div>
    </div>
  `;

  const transporter = getTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: recipients.join(","),
    subject,
    text: plainBody,
    html: htmlBody,
  });
  console.log(`📧 Service notification sent to: ${recipients.join(", ")} (${info.response || "ok"})`);
}

async function resolveStudentUser(requestDoc) {
  const userRef = requestDoc?.userId;
  if (!userRef) return null;

  if (typeof userRef === "object" && (userRef.email || userRef.name)) {
    return {
      name: userRef.name || "Student",
      email: userRef.email || "",
    };
  }

  const student = await User.findById(userRef).select("name email").lean();
  if (!student) return null;
  return {
    name: student.name || "Student",
    email: student.email || "",
  };
}

async function notifyStudentOfServiceStatusUpdate({
  serviceType,
  requestDoc,
  updatedBy,
}) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(
      "⚠️ Student status email skipped: EMAIL_USER/EMAIL_PASS not configured."
    );
    return;
  }

  const student = await resolveStudentUser(requestDoc);
  if (!student?.email) {
    console.warn("⚠️ Student status email skipped: student email not found.");
    return;
  }

  const currentStatus = requestDoc?.status || "updated";
  const updatedAt = new Date().toLocaleString();
  const requestFields = pickRequestFields(requestDoc);
  const plainDetails =
    requestFields.length > 0
      ? requestFields.map(([k, v]) => `- ${k}: ${v}`).join("\n")
      : "- No additional request fields";

  const subject = `UniZone: Your ${serviceType} request status is now "${currentStatus}"`;
  const plainBody = [
    `Hello ${student.name || "Student"},`,
    "",
    `Your ${serviceType} request has been updated by ${updatedBy?.role || "admin/staff"}.`,
    `New Status: ${currentStatus}`,
    `Request ID: ${requestDoc?._id || "unknown"}`,
    `Updated At: ${updatedAt}`,
    "",
    "Your request details:",
    plainDetails,
  ].join("\n");

  const detailsRows =
    requestFields.length > 0
      ? requestFields
          .map(
            ([k, v]) => `
              <tr>
                <td style="padding: 8px 10px; border-bottom: 1px solid #eee; font-weight: 600; width: 35%;">${escapeHtml(k)}</td>
                <td style="padding: 8px 10px; border-bottom: 1px solid #eee;">${escapeHtml(v)}</td>
              </tr>
            `
          )
          .join("")
      : `
        <tr>
          <td style="padding: 8px 10px; border-bottom: 1px solid #eee; font-weight: 600;">Details</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #eee;">No additional request fields</td>
        </tr>
      `;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111; max-width: 720px; margin: 0 auto; background: #fff;">
      <div style="background: #059669; color: #fff; padding: 14px 18px; border-radius: 10px 10px 0 0;">
        <h2 style="margin: 0; font-size: 20px;">Service Request Status Updated</h2>
      </div>
      <div style="border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; padding: 16px 18px;">
        <p style="margin: 0 0 12px;">Hello <strong>${escapeHtml(student.name || "Student")}</strong>, your ${escapeHtml(
          serviceType
        )} request has been updated.</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px;">
          <tr>
            <td style="padding: 8px 10px; border-bottom: 1px solid #eee; font-weight: 600; width: 35%;">New Status</td>
            <td style="padding: 8px 10px; border-bottom: 1px solid #eee;">${escapeHtml(currentStatus)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 10px; border-bottom: 1px solid #eee; font-weight: 600;">Request ID</td>
            <td style="padding: 8px 10px; border-bottom: 1px solid #eee;">${escapeHtml(requestDoc?._id || "unknown")}</td>
          </tr>
          <tr>
            <td style="padding: 8px 10px; border-bottom: 1px solid #eee; font-weight: 600;">Updated By</td>
            <td style="padding: 8px 10px; border-bottom: 1px solid #eee;">${escapeHtml(updatedBy?.role || "admin/staff")}</td>
          </tr>
          <tr>
            <td style="padding: 8px 10px; border-bottom: 1px solid #eee; font-weight: 600;">Updated At</td>
            <td style="padding: 8px 10px; border-bottom: 1px solid #eee;">${escapeHtml(updatedAt)}</td>
          </tr>
        </table>
        <h3 style="margin: 10px 0 6px; font-size: 16px;">Your Request Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${detailsRows}
        </table>
      </div>
    </div>
  `;

  const transporter = getTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: student.email,
    subject,
    text: plainBody,
    html: htmlBody,
  });
  console.log(
    `📧 Status update email sent to student: ${student.email} (${info.response || "ok"})`
  );
}

module.exports = {
  notifyAdminsOfServiceSubmission,
  notifyStudentOfServiceStatusUpdate,
};
