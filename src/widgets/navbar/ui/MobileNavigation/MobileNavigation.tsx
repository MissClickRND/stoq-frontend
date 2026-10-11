import { Burger, Drawer, Group, Image } from "@mantine/core";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import { navbarLogo } from "../../model/config";
import classes from "./MobileNavigation.module.css";

export function MobileNavigation() {
  const [opened, setOpened] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpened(false);
  }, [pathname]);

  return (
    <>
      <Group
        component="header"
        className={classes.header}
        justify="space-between"
      >
        <Image src={navbarLogo.src} alt={navbarLogo.alt} w={112} />
        <Burger
          opened={opened}
          onClick={() => setOpened((current) => !current)}
          aria-label={opened ? "Закрыть меню" : "Открыть меню"}
          color="var(--mantine-color-white)"
        />
      </Group>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        position="right"
        size={300}
        classNames={{
          header: classes.drawerHeader,
          body: classes.drawerBody,
          content: classes.drawerContent,
          close: classes.close,
        }}
      >
        <Navbar />
      </Drawer>
    </>
  );
}
