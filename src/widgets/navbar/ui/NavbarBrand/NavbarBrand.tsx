import componentClasses from "./NavbarBrand.module.css";
import { Image } from "@mantine/core";

import { navbarLogo } from "../../model/config";

export function NavbarBrand() {
  return (
    <Image
      className={componentClasses.logo}
      src={navbarLogo.src}
      alt={navbarLogo.alt}
    />
  );
}
