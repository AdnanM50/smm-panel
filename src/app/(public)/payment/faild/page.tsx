import Link from "next/link";
import PaymentStatusIcon from "@/components/animated/PaymentStatusIcon";

export default function Page() {
  return (
	<main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 sm:p-6 p-2">
	  <div className="max-w-3xl w-full bg-white/90 dark:bg-slate-900/70 backdrop-blur rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center text-center">
		<div className="w-40 h-40 flex items-center justify-center mb-6">
		  <PaymentStatusIcon status="failed" size={160} />
		</div>

		<h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Payment Failed</h1>
		<p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md">
		  Oops — something went wrong processing your payment. No charges were made. Try again
		  or contact support if the issue persists.
		</p>

		<div className="flex gap-3">
		  <Link
			href="/payment"
			className="inline-flex items-center justify-center px-5 py-2 rounded-md bg-gradient-to-r from-rose-500 to-orange-400 text-white font-medium shadow hover:opacity-95"
		  >
			Retry Payment
		  </Link>

		  <Link
			href="/support"
			className="inline-flex items-center justify-center px-5 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white/60 hover:bg-white/80"
		  >
			Contact Support
		  </Link>
		</div>

		<div className="mt-6 text-sm text-slate-500 dark:text-slate-400">
		  <strong>Error Code:</strong> <span className="ml-2 text-slate-700 dark:text-slate-200">PAY-FAILED</span>
		</div>
	  </div>
	</main>
  );
}

