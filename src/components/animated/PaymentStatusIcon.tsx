import React from "react";

type Props = {
  status?: "success" | "failed";
  size?: number;
  className?: string;
};

export default function PaymentStatusIcon({ status = "success", size = 120, className = "" }: Props) {
  const viewBox = "0 0 120 120";

    if (status === "failed") {
    return (
      <svg
        width={size}
        height={size}
        viewBox={viewBox}
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Payment failed"
      >
        <defs>
          <linearGradient id="errGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>

          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>

          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g fill="none" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
          {/* outer glow ring (subtle) */}
          <circle cx="60" cy="60" r="54" stroke="url(#errGrad)" strokeOpacity="0.18" filter="url(#softGlow)">
            <animate attributeName="stroke-opacity" values="0;0.18;0.12" dur="3s" repeatCount="indefinite" />
          </circle>

          {/* main ring draw */}
          <circle cx="60" cy="60" r="48" stroke="url(#errGrad)" strokeDasharray="320" strokeDashoffset="320">
            <animate attributeName="stroke-dashoffset" from="320" to="0" dur="1.8s" fill="freeze" />
          </circle>

          {/* rotating sparks group for extra motion */}
          <g transform="translate(60,60)" >
            <g transform="rotate(0)" >
              <g transform="translate(-60,-60)" >
                <rect x="10" y="12" width="4" height="4" rx="1" fill="url(#errGrad)" opacity="0">
                  <animateTransform attributeName="transform" type="translate" values="0 -8;0 8" dur="2.2s" begin="0.6s" fill="freeze" />
                  <animate attributeName="opacity" from="0" to="1" dur="1s" begin="0.6s" fill="freeze" />
                </rect>
                <rect x="102" y="22" width="3" height="3" rx="0.8" fill="url(#errGrad)" opacity="0">
                  <animateTransform attributeName="transform" type="translate" values="0 -6;0 6" dur="2.2s" begin="0.9s" fill="freeze" />
                  <animate attributeName="opacity" from="0" to="1" dur="1s" begin="0.9s" fill="freeze" />
                </rect>
                <rect x="96" y="96" width="3.2" height="3.2" rx="0.9" fill="url(#errGrad)" opacity="0">
                  <animateTransform attributeName="transform" type="translate" values="0 -6;0 6" dur="2.2s" begin="1.2s" fill="freeze" />
                  <animate attributeName="opacity" from="0" to="1" dur="1s" begin="1.2s" fill="freeze" />
                </rect>
                <rect x="22" y="92" width="2.8" height="2.8" rx="0.8" fill="url(#errGrad)" opacity="0">
                  <animateTransform attributeName="transform" type="translate" values="0 -6;0 6" dur="2.2s" begin="1.5s" fill="freeze" />
                  <animate attributeName="opacity" from="0" to="1" dur="1s" begin="1.5s" fill="freeze" />
                </rect>
              </g>
            </g>

            {/* rotate the whole sparks group slowly */}
            <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 60 60" to="360 60 60" dur="6s" repeatCount="indefinite" />
          </g>

          {/* X mark draw (slower, more deliberate) */}
          <g stroke="#fff" strokeWidth={7} strokeDasharray={120} strokeDashoffset={120}>
            <path d="M40 40 L80 80">
              <animate attributeName="stroke-dashoffset" from="120" to="0" dur="1.2s" begin="1.0s" fill="freeze" />
            </path>
            <path d="M80 40 L40 80">
              <animate attributeName="stroke-dashoffset" from="120" to="0" dur="1.2s" begin="1.35s" fill="freeze" />
            </path>
          </g>

          {/* centered failure badge with pulse */}
          <g>
            <circle cx="60" cy="60" r="22" fill="url(#centerGlow)" opacity="0.98" filter="url(#softGlow)">
              <animateTransform attributeName="transform" type="scale" values="1;1.06;1" keyTimes="0;0.5;1" dur="2.2s" begin="1.4s" repeatCount="indefinite" />
            </circle>

            <circle cx="60" cy="60" r="18" fill="#fff" />

            <g stroke="#fb7185" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <path d="M60 48 L60 64" strokeDasharray="24" strokeDashoffset="24">
                <animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.9s" begin="1.5s" fill="freeze" />
              </path>
              <circle cx="60" cy="70" r="2.6" fill="#fb7185" opacity="0">
                <animate attributeName="opacity" from="0" to="1" dur="0.6s" begin="1.85s" fill="freeze" />
              </circle>
            </g>
          </g>
        </g>
      </svg>
    );
  }

  // success
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Payment successful"
    >
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>

        <radialGradient id="successGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>

        <filter id="softGlow2" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g fill="none" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        {/* subtle outer halo */}
        <circle cx="60" cy="60" r="54" stroke="url(#g1)" strokeOpacity="0.14" filter="url(#softGlow2)">
          <animate attributeName="stroke-opacity" values="0;0.14;0.08" dur="3.6s" repeatCount="indefinite" />
        </circle>

        {/* main ring draw */}
        <circle cx="60" cy="60" r="48" stroke="url(#g1)" strokeDasharray="320" strokeDashoffset="320">
          <animate attributeName="stroke-dashoffset" from="320" to="0" dur="1.6s" fill="freeze" />
        </circle>

        {/* rotating dots */}
        <g transform="translate(60,60)">
          <g transform="translate(-60,-60)">
            <circle cx="18" cy="20" r="3" fill="url(#g1)" opacity="0">
              <animateTransform attributeName="transform" type="translate" values="0 -8;0 8" dur="2.6s" begin="0.3s" fill="freeze" />
              <animate attributeName="opacity" from="0" to="1" dur="1s" begin="0.3s" fill="freeze" />
            </circle>
            <circle cx="102" cy="28" r="2.6" fill="url(#g1)" opacity="0">
              <animateTransform attributeName="transform" type="translate" values="0 -6;0 6" dur="2.6s" begin="0.6s" fill="freeze" />
              <animate attributeName="opacity" from="0" to="1" dur="1s" begin="0.6s" fill="freeze" />
            </circle>
            <circle cx="95" cy="92" r="2.8" fill="url(#g1)" opacity="0">
              <animateTransform attributeName="transform" type="translate" values="0 -6;0 6" dur="2.6s" begin="0.9s" fill="freeze" />
              <animate attributeName="opacity" from="0" to="1" dur="1s" begin="0.9s" fill="freeze" />
            </circle>
            <circle cx="28" cy="96" r="2.4" fill="url(#g1)" opacity="0">
              <animateTransform attributeName="transform" type="translate" values="0 -6;0 6" dur="2.6s" begin="1.2s" fill="freeze" />
              <animate attributeName="opacity" from="0" to="1" dur="1s" begin="1.2s" fill="freeze" />
            </circle>
          </g>

          <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 60 60" to="360 60 60" dur="8s" repeatCount="indefinite" />
        </g>

        {/* checkmark draw */}
        <path d="M36 62 L52 78 L84 46" stroke="#fff" strokeWidth={7} strokeDasharray="160" strokeDashoffset="160">
          <animate attributeName="stroke-dashoffset" from="160" to="0" dur="1.1s" begin="0.9s" fill="freeze" />
        </path>

        {/* centered success badge */}
        <g>
          <circle cx="60" cy="60" r="22" fill="url(#successGlow)" opacity="0.98" filter="url(#softGlow2)">
            <animateTransform attributeName="transform" type="scale" values="1;1.06;1" keyTimes="0;0.5;1" dur="2.6s" begin="1.2s" repeatCount="indefinite" />
          </circle>

          <circle cx="60" cy="60" r="18" fill="#fff" />

          <g stroke="#06b6d4" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M48 60 L56 68 L74 50" strokeDasharray="160" strokeDashoffset="160">
              <animate attributeName="stroke-dashoffset" from="160" to="0" dur="1s" begin="1.25s" fill="freeze" />
            </path>
          </g>
        </g>
      </g>
    </svg>
  );
}
