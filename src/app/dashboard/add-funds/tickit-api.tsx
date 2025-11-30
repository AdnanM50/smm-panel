const DEFAULT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://smm-panel-khan-it.up.railway.app/api";

const buildHeaders = (token?: string) => ({
  "Content-Type": "application/json",
  ...(token ? { token } : {}),
});

const resolveBaseUrl = (override?: string) => override || DEFAULT_API_BASE_URL;

export interface TransactionHistoryEntry {
  _id: string;
  type: string;
  amount: number;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  orderId?: string;
  createdAt: string;
}

export type FetchTransactionHistoryOptions = {
  token?: string | null;
  baseUrl?: string;
};

export async function fetchTransactionHistory({
  token,
  baseUrl,
}: FetchTransactionHistoryOptions): Promise<TransactionHistoryEntry[]> {
  const response = await fetch(`${resolveBaseUrl(baseUrl)}/viewTransactionHistory`, {
    method: "GET",
    headers: buildHeaders(token ?? undefined),
    next: { revalidate: 60 },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.status !== "Success" || !Array.isArray(data?.data)) {
    const message = data?.message || "Failed to load transaction history";
    throw new Error(message);
  }
  return data.data;
}

export type VerifyPaymentOptions = {
  transactionId: string;
  token?: string | null;
  baseUrl?: string;
};

export type VerifyPaymentResult = {
  success: boolean;
  payload: any;
  message?: string;
};

export async function verifyPayment({
  transactionId,
  token,
  baseUrl,
}: VerifyPaymentOptions): Promise<VerifyPaymentResult> {
  const response = await fetch(
    `${resolveBaseUrl(baseUrl)}/verifyPayment?transactionId=${encodeURIComponent(
      transactionId,
    )}`,
    {
      method: "GET",
      headers: buildHeaders(token ?? undefined),
    },
  );
  const data = await response.json().catch(() => null);
  const success =
    response.ok &&
    (data?.status === "Success" || data?.status === "success" || data?.success);
  return {
    success,
    payload: data,
    message:
      success ? undefined : data?.message || data?.error || `Verification failed (${response.status})`,
  };
}

export type InitiatePaymentOptions = {
  amount: number;
  token?: string | null;
  baseUrl?: string;
};

export type InitiatePaymentResult = {
  paymentUrl: string;
  payload: any;
};

export async function initiatePayment({
  amount,
  token,
  baseUrl,
}: InitiatePaymentOptions): Promise<InitiatePaymentResult> {
  const response = await fetch(`${resolveBaseUrl(baseUrl)}/initiatePayment`, {
    method: "POST",
    headers: buildHeaders(token ?? undefined),
    body: JSON.stringify({ amount }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.payment_url) {
    const message = data?.message || data?.error || `Server responded with ${response.status}`;
    throw new Error(message);
  }
  return { paymentUrl: data.payment_url, payload: data };
}