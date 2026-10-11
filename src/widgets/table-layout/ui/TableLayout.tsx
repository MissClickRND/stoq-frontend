import { Paper, ScrollArea, Table, Text } from "@mantine/core";
import { Fragment } from "react";
import type { TableLayoutProps } from "../model/type";
import classes from "./TableLayout.module.css";

export function TableLayout<T>({
  columns,
  data,
  renderRow,
  getRowKey,
  emptyText,
  minWidth,
  autoHeight = false,
  fillHeight = false,
}: TableLayoutProps<T>) {
  return (
    <Paper
      className={
        (autoHeight
          ? `${classes.section} ${classes.autoHeight}`
          : classes.section) + (fillHeight ? ` ${classes.fillHeight}` : "")
      }
      withBorder
      radius="lg"
    >
      <ScrollArea
        h={autoHeight && !fillHeight ? "auto" : "100%"}
        type="auto"
        offsetScrollbars={!fillHeight}
      >
        <Table
          miw={minWidth}
          h={fillHeight ? "100%" : undefined}
          horizontalSpacing="md"
          stickyHeader
          stickyHeaderOffset={0}
          highlightOnHover
          verticalSpacing="md"
        >
          <Table.Thead
            className={classes.header}
            style={fillHeight ? { height: 1 } : undefined}
          >
            <Table.Tr>
              {columns.map((title) => (
                <Table.Th key={title}>
                  <Text size="inherit" fw="inherit">
                    {title}
                  </Text>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((item) => (
              <Fragment key={getRowKey(item)}>{renderRow(item)}</Fragment>
            ))}
            {data.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={columns.length}>
                  <Text size="lg" ta="center" c="dimmed" py="xl">
                    {emptyText}
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
}
