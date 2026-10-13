import { useState } from "react";
import { Center, Image } from "@mantine/core";
import { IconSoupFilled } from "@tabler/icons-react";
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
      {src && src !== failedSource ? (
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
      ) : (
        <Center
          style={{ flexShrink: 0 }}
          h="100%"
          w="100%"
          bg="#DDDDDD"
          bdrs="md"
        >
          <IconSoupFilled color="gray" size={48} />
        </Center>
      )}
    </div>
  );
}
