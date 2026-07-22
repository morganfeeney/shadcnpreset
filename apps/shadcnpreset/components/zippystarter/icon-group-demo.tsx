import { IconGroup } from "@/components/zippystarter/icon-group";
import { ICON_LINKS } from "@/data/icon-lists";

export function Demo() {
  return (
    <div className="@container h-full place-content-center p-8">
      <div className="flex justify-around max-w-2xl mx-auto items-end">
        <IconGroup links={ICON_LINKS} />
      </div>
    </div>
  );
}
