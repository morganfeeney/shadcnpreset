import { cn } from "@/lib/utils";
import { ElementType } from "react";

export type IconLink = {
  href: string;
  label: string;
  Icon: ElementType;
  className?: string;
};

export type IconGroupProps = {
  links: IconLink[];
  className?: string;
  LinkComponent?: ElementType;
};

export function IconGroup({
  links,
  className,
  LinkComponent = "a",
}: IconGroupProps) {
  return (
    <div className={cn("flex justify-center items-center gap-6", className)}>
      {links.map(({ href, label, Icon, className: iconClassName }) => (
        <LinkComponent
          key={href}
          href={href}
          aria-label={label}
          className="text-muted-foreground transition-colors hover:text-foreground"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon className={cn("w-5 h-5 fill-current", iconClassName)} />
        </LinkComponent>
      ))}
    </div>
  );
}
