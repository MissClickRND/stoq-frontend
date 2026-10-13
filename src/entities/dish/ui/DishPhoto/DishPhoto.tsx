import { useState } from "react";
import { Center, Image } from "@mantine/core";
import { IconSoupFilled } from "@tabler/icons-react";
import classes from "./DishPhoto.module.css";

export function DishPhoto({
  src,

  className,
}: {
  src?: string;
  name: string;
  className?: string;
}) {
  const [failedSource, setFailedSource] = useState<string | undefined>();
  return (
    <div className={`${classes.dishPhoto} ${className ?? ""}`}>
      {src ? (
        <Image
          src={src}
          alt={"Блюдо"}
          h="100%"
          w="100%"
          fit="cover"
          style={{ position: "absolute", inset: 0 }}
          loading="lazy"
          onError={() => setFailedSource(src)}
          fallbackSrc="https://placehold.co/900x400?text=Изображение недоступно"
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
