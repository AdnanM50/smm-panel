import Link from "next/link";
import PaymentStatusIcon from "@/components/animated/PaymentStatusIcon";

export default function Page() {
	return (
		<main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 sm:p-6 p-2">
			<div className="max-w-3xl w-full bg-white/80 dark:bg-slate-900/70 backdrop-blur rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center text-center">
				<div className="w-40 h-40 flex items-center justify-center mb-6">
					<PaymentStatusIcon status="success" size={160} />
				</div>

				<h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Payment Successful</h1>
				<p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md">
					Thanks — your payment went through. We've credited your account and sent an email receipt.
					You can now continue to the dashboard or create a new order.
				</p>

				<div className="flex gap-3">
					<Link
						href="/dashboard"
						className="inline-flex items-center justify-center px-5 py-2 rounded-md bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-medium shadow hover:opacity-95"
					>
						Go to Dashboard
					</Link>

					<Link
						href="/"
						className="inline-flex items-center justify-center px-5 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white/60 hover:bg-white/80"
					>
						Back to Home
					</Link>
				</div>

				<div className="mt-6 text-sm text-slate-500 dark:text-slate-400">
					<strong>Order ID:</strong> <span className="ml-2 text-slate-700 dark:text-slate-200">#TRX123456</span>
				</div>


			</div>
		</main>
	);
}
