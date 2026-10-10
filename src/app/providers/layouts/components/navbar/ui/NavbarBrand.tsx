import { Image } from "@mantine/core";

import classes from "./Navbar.module.css";
import { navbarLogo } from "../model/data";

export function NavbarBrand() {
  return (
    <Image className={classes.logo} src={navbarLogo.src} alt={navbarLogo.alt} />
  );
}
