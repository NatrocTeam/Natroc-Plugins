import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  ReactNode,
} from "react";

type NativeButtonProps = ComponentPropsWithoutRef<"button">;

type IconButtonProps = Omit<NativeButtonProps, "children"> & {
  icon: ReactNode;
  label: string;
  tone?: "neutral" | "accent";
  style?: CSSProperties;
};

export function IconButton({
  icon,
  label,
  tone = "neutral",
  type = "button",
  ...buttonProps
}: IconButtonProps) {
  return (
    <button aria-label={label} data-tone={tone} type={type} {...buttonProps}>
      {icon}
    </button>
  );
}

type SlotProps<TAs extends ElementType> = {
  as: TAs;
  children?: ReactNode;
} & ComponentPropsWithoutRef<TAs>;

export function Slot<TAs extends ElementType>({
  as: Component,
  children,
  ...props
}: SlotProps<TAs>) {
  const componentProps = props as Record<string, unknown>;

  return <Component {...componentProps}>{children}</Component>;
}

function createBadgeApi() {
  return {
    sizes: ["sm", "md", "lg"] as const,
    tones: ["neutral", "success", "danger"] as const,
  };
}

export type BadgeApi = ReturnType<typeof createBadgeApi>;
export type BadgeSize = BadgeApi["sizes"][number];
export type BadgeTone = BadgeApi["tones"][number];
