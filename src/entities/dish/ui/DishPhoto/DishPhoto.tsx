import { useState } from "react";
import { Image } from "@mantine/core";
import { IconChefHat } from "@tabler/icons-react";
import classes from "./DishPhoto.module.css";

export function DishPhoto({
  src,
  name,
  className,
}: {
  src?: string;
  name: string;
  className?: string;
}) {
  const [failedSource, setFailedSource] = useState<string | undefined>();
  return (
    <div className={`${classes.dishPhoto} ${className ?? ""}`}>
      <div
        className={classes.photoFallback}
        role={src && failedSource !== src ? undefined : "img"}
        aria-label={src && failedSource !== src ? undefined : name}
        aria-hidden={src && failedSource !== src ? true : undefined}
      >
        <IconChefHat size={64} stroke={1.2} />
      </div>
      {src && failedSource !== src && (
        <Image
          src={src}
          alt={name}
          h="100%"
          w="100%"
          fit="cover"
          style={{ position: "absolute", inset: 0 }}
          loading="lazy"
          onError={() => setFailedSource(src)}
        />
      )}
    </div>
  );
}
