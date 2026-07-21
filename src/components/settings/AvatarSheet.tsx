import { motion } from "framer-motion";
import { Camera, Eye, Image as ImageIcon, Trash2, Upload } from "lucide-react";
import { BottomSheet, SheetItem } from "./BottomSheet";

export function AvatarSheet({
  open,
  onClose,
  onAction,
}: {
  open: boolean;
  onClose: () => void;
  onAction?: (a: "view" | "change" | "remove" | "take" | "gallery") => void;
}) {
  const run = (a: "view" | "change" | "remove" | "take" | "gallery") => {
    onAction?.(a);
    onClose();
  };
  return (
    <BottomSheet open={open} onClose={onClose} title="Profile photo">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-0.5"
      >
        <SheetItem icon={Eye} label="View photo" description="Open in full screen" onClick={() => run("view")} />
        <SheetItem icon={Upload} label="Upload new photo" onClick={() => run("change")} />
        <SheetItem icon={Camera} label="Take photo" description="Use camera" onClick={() => run("take")} />
        <SheetItem icon={ImageIcon} label="Choose from gallery" onClick={() => run("gallery")} />
        <SheetItem icon={Trash2} label="Remove photo" danger onClick={() => run("remove")} />
      </motion.div>
    </BottomSheet>
  );
}
