import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";

interface AttachmentChipProps {
  url: string;
  onRemoveFn: () => void;
}

export function AttachmentChip({ url, onRemoveFn }: AttachmentChipProps) {
  return (
    <div className="group relative overflow-hidden rounded-md bg-muted size-12">
      <Image className="object-cover" src={url} alt="Attachment" fill />
      <div className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/30 group-hover:opacity-100">
        <Button
          type="button"
          variant="destructive"
          className="size-6 p-0 rounded-full"
          onClick={onRemoveFn}
        >
          <X className="size-3" />
        </Button>
      </div>
    </div>
  );
}
