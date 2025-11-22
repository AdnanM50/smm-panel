'use client'

import Link from "next/link";
import PaymentStatusIcon from "@/components/animated/PaymentStatusIcon";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://smm-panel-khan-it.up.railway.app/api";
type VerifyStatus = "idle" | "loading" | "success" | "error";

export default function Page() {
	const searchParams = useSearchParams();
	const transactionId = useMemo(() => {
		if (!searchParams) return undefined;
		return searchParams.get("transactionId") ?? searchParams.get("transaction_id") ?? undefined;
	}, [searchParams]);

	const [status, setStatus] = useState<VerifyStatus>("idle");
	const [message, setMessage] = useState<string>("");

	useEffect(() => {
		if (!transactionId) {
			setStatus("error");
			setMessage("Transaction ID missing. Return to 'Add Funds' and try again.");
			return;
		}

		let isCancelled = false;
		const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

		const verifyPayment = async () => {
			setStatus("loading");
			setMessage("");
			try {
				const response = await fetch(
					`${API_BASE_URL}/verifyPayment?transactionId=${encodeURIComponent(transactionId)}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							...(authToken ? { token: String(authToken) } : {}),
						},
					}
				);
				let data: any = null;
				try {
					data = await response.json();
				} catch (jsonError) {
					console.warn("verifyPayment parse failed", jsonError);
				}

				if (isCancelled) return;

				if (response.ok && (data?.status === "Success" || data?.status === "success" || data?.success)) {
					setStatus("success");
					setMessage(data?.message || "Your balance has been updated.");
				} else {
					const errorMsg = data?.message || data?.error || (response.ok ? "Verification failed." : `Gateway error (${response.status})`);
					setStatus("error");
					setMessage(errorMsg);
				}
			} catch (fetchError) {
				if (isCancelled) return;
				const errorMsg = fetchError instanceof Error ? fetchError.message : "Unable to reach verification service.";
				setStatus("error");
				setMessage(errorMsg);
			}
		};

		verifyPayment();

		return () => {
			isCancelled = true;
		};
	}, [transactionId]);

	const title = useMemo(() => {
		switch (status) {
			case "loading":
				return "Verifying payment";
			case "success":
				return "Payment confirmed";
			case "error":
				return "Verification failed";
			default:
				return "Payment status";
		}
	}, [status]);

	const description = message || (status === "loading" ? "Contacting the gateway..." : "");
	const iconStatus: Parameters<typeof PaymentStatusIcon>[0]["status"] = useMemo(() => {
		return status === "error" ? "failed" : "success";
	}, [status]);

	return (
		<main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 sm:p-6 p-2">
			<div className="max-w-3xl w-full bg-white/80 dark:bg-slate-900/70 backdrop-blur rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center text-center space-y-6">
				<div className="w-40 h-40 flex items-center justify-center">
					<PaymentStatusIcon status={iconStatus} size={160} />
				</div>
				<div className="space-y-2 text-center">
					<p className="text-xs font-semibold tracking-[0.4em] uppercase text-muted-foreground">payment success</p>
					<h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
					<p className="text-sm text-slate-600 dark:text-slate-300">
						Transaction ID: <span className="font-mono text-foreground">{transactionId ?? "missing"}</span>
					</p>
				</div>
				<div className="rounded-2xl border border-border/60 p-6 text-center w-full">
					{status === "loading" && (
						<p className="text-sm text-muted-foreground">Please wait while we verify the payment.</p>
					)}
					{status === "success" && <p className="text-base text-success">{description || "Your balance has been updated."}</p>}
					{status === "error" && <p className="text-base text-destructive">{description || "Something went wrong."}</p>}
				</div>
				<div className="space-y-2 text-center w-full">
					{status === "error" && (
						<p className="text-sm text-muted-foreground">
							If the issue persists, contact support or try adding funds again.
						</p>
					)}
					<div className="flex flex-wrap justify-center gap-3 pt-4">
						<Link
							href="/dashboard"
							className="inline-flex items-center justify-center px-5 py-2 rounded-md bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-medium shadow hover:opacity-95"
						>
							Go to Dashboard
						</Link>
						<Link
							href="/dashboard/add-funds"
							className="inline-flex items-center justify-center px-5 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white/60 hover:bg-white/80"
						>
							Add Funds
						</Link>
					</div>
				</div>
			</div>
		</main>
	);
}
