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
}: TableLayoutProps<T>) {
  return (
    <Paper className={classes.section} withBorder radius="lg">
      <ScrollArea h="100%" type="auto" offsetScrollbars>
        <Table
          miw={minWidth}
          horizontalSpacing="xl"
          stickyHeader
          stickyHeaderOffset={0}
          highlightOnHover
          verticalSpacing="md"
          className={classes.table}
        >
          <Table.Thead className={classes.header}>
            <Table.Tr>
              {columns.map((title) => (
                <Table.Th key={title}><Text size="inherit" fw="inherit">{title}</Text></Table.Th>
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
                  <Text ta="center" c="dimmed" py="xl">
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
