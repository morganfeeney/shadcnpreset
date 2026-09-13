import type { FileUIPart } from "ai"

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/cn-ui/attachment"
import { IconPlaceholder } from "@/components/icon-placeholder"

export function FilePart1({ part }: { part: FileUIPart }) {
  const name = part.filename ?? "Attachment"

  /**
   * A file part read back from a store often has the name and the media type
   * but no bytes, because keeping a data URL per message costs megabytes a
   * transcript does not need. So the image branch asks for the data as well as
   * the type, and anything without it falls back to the icon.
   */
  const preview = part.mediaType.startsWith("image/") && Boolean(part.url)

  return (
    <Attachment className="w-64">
      <AttachmentMedia variant={preview ? "image" : "icon"}>
        {preview ? (
          // A plain img, not a framework image component: the source is usually
          // a data URL, which your app never configured a loader for.
          <img src={part.url} alt={name} />
        ) : (
          <IconPlaceholder
            lucide="FileText"
            tabler="IconFileText"
            hugeicons="File01Icon"
            phosphor="FileTextIcon"
            remixicon="RiFileTextLine"
          />
        )}
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{name}</AttachmentTitle>
        {/* The media type, not the size: by the time a file is in the
            transcript it has been sent, so what is left worth saying is what
            the model was given. */}
        <AttachmentDescription>{part.mediaType}</AttachmentDescription>
      </AttachmentContent>
    </Attachment>
  )
}
