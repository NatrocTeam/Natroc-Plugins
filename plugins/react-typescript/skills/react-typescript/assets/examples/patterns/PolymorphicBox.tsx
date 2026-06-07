import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type BoxOwnProps<TAs extends ElementType> = {
  as?: TAs;
  children?: ReactNode;
  padding?: "none" | "sm" | "md";
};

type BoxProps<TAs extends ElementType> = BoxOwnProps<TAs> &
  Omit<ComponentPropsWithoutRef<TAs>, keyof BoxOwnProps<TAs>>;

export function PolymorphicBox<TAs extends ElementType = "div">({
  as,
  children,
  padding = "none",
  ...props
}: BoxProps<TAs>) {
  const Component = (as ?? "div") as ElementType;
  const componentProps = props as Record<string, unknown>;

  return (
    <Component data-padding={padding} {...componentProps}>
      {children}
    </Component>
  );
}

export function PolymorphicBoxExample() {
  return (
    <>
      <PolymorphicBox padding="md">Plain div</PolymorphicBox>
      <PolymorphicBox as="a" href="/dashboard" padding="sm">
        Dashboard
      </PolymorphicBox>
      <PolymorphicBox as="button" onClick={() => console.log("clicked")}>
        Button
      </PolymorphicBox>
    </>
  );
}
