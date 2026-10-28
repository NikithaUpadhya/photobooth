import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-paper hover:bg-accent-deep shadow-[0_10px_24px_-10px_rgb(200_85_61/0.8)]",
  ghost: "bg-transparent text-ink border border-line hover:bg-paper-deep",
};

export function buttonClasses(variant: ButtonVariant = "primary", extra = "") {
  return `inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium
    transition active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50
    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
    ${variants[variant]} ${extra}`;
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant };

export function Button({ variant = "primary", className = "", ...props }: Props) {
  return <button className={buttonClasses(variant, className)} {...props} />;
}