import { ScrollArea, SegmentedControl } from "@mantine/core";
import { useLocation, useNavigate } from "react-router-dom";
import { authModes } from "../model/data";
import classes from "./AuthModeSwitch.module.css";

export function AuthModeSwitch() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <ScrollArea type="auto" className={classes.scroll}>
      <SegmentedControl<string>
        aria-label="Режим авторизации"
        value={pathname}
        onChange={(path) => navigate(path)}
        data={authModes}
        fullWidth
        withItemsBorders={false}
        classNames={{
          root: classes.root,
          indicator: classes.indicator,
          label: classes.label,
          control: classes.control,
        }}
      />
    </ScrollArea>
  );
}
