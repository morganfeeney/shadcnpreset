import React, { forwardRef } from "react";

export type ImageProps = React.ComponentPropsWithoutRef<"img">;

export const Image = forwardRef(function Image(
  props: ImageProps,
  ref: React.ForwardedRef<HTMLImageElement>
) {
  // This wrapper intentionally forwards all native img props for this starter component API.
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt="" {...props} ref={ref} />;
});
