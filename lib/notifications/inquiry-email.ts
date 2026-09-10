import "server-only";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export type InquiryNotification = {
  formType: "consultation" | "reservation";
  name: string;
  phone: string;
  email: string;
  houseAge: string;
  location: string;
  budget: string;
  projectType: string;
  message: string;
  lineId: string;
  sourcePath: string;
};

function singleLine(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function display(value: string) {
  return value || "未填寫";
}

function notificationRecipients() {
  return (process.env.INQUIRY_NOTIFY_EMAIL || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

export function formatInquiryNotification(inquiry: InquiryNotification) {
  const formLabel = inquiry.formType === "reservation" ? "預約諮詢" : "網站詢問";
  const receivedAt = new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    dateStyle: "full",
    timeStyle: "medium",
  }).format(new Date());

  return {
    subject: `[翔胤] ${formLabel}｜${singleLine(inquiry.name)}`,
    text: [
      `翔胤室內設計收到一筆${formLabel}：`,
      "",
      `姓名：${display(inquiry.name)}`,
      `電話：${display(inquiry.phone)}`,
      `Email：${display(inquiry.email)}`,
      `屋齡：${display(inquiry.houseAge)}`,
      `地區：${display(inquiry.location)}`,
      `預算：${display(inquiry.budget)}`,
      `詢問類型：${display(inquiry.projectType)}`,
      `LINE ID：${display(inquiry.lineId)}`,
      "",
      "詢問內容：",
      display(inquiry.message),
      "",
      `來源頁面：${display(inquiry.sourcePath)}`,
      `收件時間：${receivedAt}`,
      "",
      "這封信由翔胤網站表單自動寄出；完整紀錄亦已保存在翔胤新版後台。",
    ].join("\n"),
  };
}

export async function sendInquiryNotificationEmail(inquiry: InquiryNotification) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.INQUIRY_NOTIFY_FROM?.trim();
  const to = notificationRecipients();

  if (!apiKey || !from || to.length === 0) {
    throw new Error(
      "Inquiry email is not configured. RESEND_API_KEY, INQUIRY_NOTIFY_FROM and INQUIRY_NOTIFY_EMAIL are required.",
    );
  }

  const content = formatInquiryNotification(inquiry);
  const payload: Record<string, unknown> = {
    from,
    to,
    subject: content.subject,
    text: content.text,
  };

  if (inquiry.email) {
    payload.reply_to = inquiry.email;
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    const details = (await response.text()).slice(0, 500);
    throw new Error(`Resend rejected the inquiry notification (${response.status}): ${details}`);
  }
}
