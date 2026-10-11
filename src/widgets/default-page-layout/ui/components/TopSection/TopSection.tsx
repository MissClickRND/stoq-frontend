import { Box, FloatingIndicator, Tabs } from "@mantine/core";
import { useLayoutEffect, useMemo, useState } from "react";
import type { TopSectionProps } from "./type";
import classes from "./TopSection.module.css";

export function TopSection<T extends string>({
  items,
  value,
  onChange,
  rightSection,
  ariaLabel = "Навигация по разделам",
}: TopSectionProps<T>) {
  const [sectionElement, setSectionElement] = useState<HTMLDivElement | null>(
    null,
  );
  const [navigationElement, setNavigationElement] =
    useState<HTMLDivElement | null>(null);
  const [rightElement, setRightElement] = useState<HTMLDivElement | null>(null);
  const [listElement, setListElement] = useState<HTMLDivElement | null>(null);
  const [tabElements, setTabElements] = useState<
    Record<string, HTMLButtonElement | null>
  >({});
  const [inlineRight, setInlineRight] = useState(false);
  const hasRightSection = rightSection != null && rightSection !== false;
  const tabRefs = useMemo(
    () =>
      new Map(
        items.map(
          (item) =>
            [
              item.value,
              (element: HTMLButtonElement | null) => {
                setTabElements((current) =>
                  current[item.value] === element
                    ? current
                    : { ...current, [item.value]: element },
                );
              },
            ] as const,
        ),
      ),
    [items],
  );

  useLayoutEffect(() => {
    if (!sectionElement || !navigationElement || !rightElement) return;
    const measure = () => {
      const gap = parseFloat(getComputedStyle(sectionElement).columnGap) || 0;
      const rightWidth = Math.max(
        rightElement.getBoundingClientRect().width,
        rightElement.scrollWidth,
      );
      // Reserve equal space on both sides so actions cannot displace the navigation.
      setInlineRight(
        sectionElement.clientWidth >=
          navigationElement.getBoundingClientRect().width +
            2 * (rightWidth + gap),
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(sectionElement);
    observer.observe(navigationElement);
    observer.observe(rightElement);
    measure();
    return () => observer.disconnect();
  }, [sectionElement, navigationElement, rightElement]);

  return (
    <Box
      ref={setSectionElement}
      className={classes.section}
      data-inline-right={(hasRightSection && inlineRight) || undefined}
    >
      <Tabs
        ref={setNavigationElement}
        variant="pills"
        radius="lg"
        color="primary"
        autoContrast
        value={value}
        onChange={(next) => {
          const selected = items.find((item) => item.value === next);
          if (selected && !selected.disabled) onChange(selected.value);
        }}
        allowTabDeactivation={false}
        classNames={{
          root: classes.navigation,
          list: classes.list,
          tab: classes.tab,
          tabLabel: classes.label,
        }}
      >
        <Tabs.List ref={setListElement} aria-label={ariaLabel}>
          <FloatingIndicator
            target={tabElements[value]}
            parent={listElement}
            transitionDuration={200}
            className={classes.indicator}
            aria-hidden
          />
          {items.map((item) => (
            <Tabs.Tab
              ref={tabRefs.get(item.value)}
              key={item.value}
              value={item.value}
              disabled={item.disabled}
              aria-controls={undefined}
              leftSection={item.icon && <item.icon size={20} aria-hidden />}
            >
              {item.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
      {hasRightSection && (
        <Box ref={setRightElement} className={classes.rightSection}>
          {rightSection}
        </Box>
      )}
    </Box>
  );
}
