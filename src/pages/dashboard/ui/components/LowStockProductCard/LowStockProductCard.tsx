import { Image, Text } from "@mantine/core";
import { IconPhoto } from "@tabler/icons-react";
import { useState } from "react";
import { normalizeArticle } from "@/shared/lib/format";
import type { LowStockProduct } from "../../../model/type";
import classes from "./LowStockProductCard.module.css";

const numberFormat = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });

export function LowStockProductCard({ item }: { item: LowStockProduct }) {
  const { product, quantity, initialQuantity, imageUrl } = item;
  const [failedSource, setFailedSource] = useState<string>();
  const unit = product.unit.shortName;

  return (
    <li className={classes.card}>
      <div className={classes.photo}>
        {imageUrl && imageUrl !== failedSource ? (
          <Image
            src={imageUrl}
            alt={product.name}
            w="100%"
            h="100%"
            fit="cover"
            loading="lazy"
            onError={() => setFailedSource(imageUrl)}
          />
        ) : (
          <IconPhoto size={24} stroke={1.5} aria-hidden="true" />
        )}
      </div>
      <div className={classes.identity}>
        <Text className={classes.name}>{product.name}</Text>
        <Text className={classes.article}>Арт. {normalizeArticle(product.id)}</Text>
      </div>
      <div className={classes.stock}>
        <Text className={classes.quantity}>{numberFormat.format(quantity)} {unit}</Text>
        <Text className={classes.initialQuantity}>из {numberFormat.format(initialQuantity)} {unit}</Text>
      </div>
    </li>
  );
}
