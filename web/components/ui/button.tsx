import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-paper hover:bg-accent-deep shadow-[0_10px_24px_-10px_rgb(200_85_61/0.8)]",
  ghost: "bg-transparent text-ink border border-line hover:bg-paper-deep",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export function Button({ variant = "primary", className = "", ...props }: Props) {
  return (
    <button
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium
        transition active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
        ${variants[variant]} ${className}`}
      {...props}
    />
  );
}