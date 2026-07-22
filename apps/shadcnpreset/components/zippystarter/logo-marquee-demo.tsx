import { LogoMarquee } from "@/components/zippystarter/logo-marquee";
import { logoMarqueeItems } from "@/components/zippystarter/logo-marquee-items";

export function Demo() {
  return (
    <div className="min-h-24 grid h-full">
      <LogoMarquee className="[&_svg]:h-24 [&_svg]:mx-10">
        {logoMarqueeItems}
      </LogoMarquee>
    </div>
  );
}
