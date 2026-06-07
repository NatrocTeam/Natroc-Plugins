import type { ComponentPropsWithoutRef, ReactNode } from "react";

type TypedButtonProps = {
  variant?: "primary" | "quiet" | "danger";
  icon?: ReactNode;
  children: ReactNode;
} & ComponentPropsWithoutRef<"button">;

export function TypedButton({
  variant = "primary",
  icon,
  children,
  type = "button",
  ...buttonProps
}: TypedButtonProps) {
  return (
    <button data-variant={variant} type={type} {...buttonProps}>
      {icon}
      <span>{children}</span>
    </button>
  );
}

export function TypedButtonExample() {
  return (
    <TypedButton
      aria-label="Save profile"
      onClick={(event) => {
        event.currentTarget.dataset.clicked = "true";
      }}
      variant="primary"
    >
      Save
    </TypedButton>
  );
}
