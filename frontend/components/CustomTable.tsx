import {
    Column,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel, getSortedRowModel, SortingState,
    Table as ReactTable,
    useReactTable,
} from '@tanstack/react-table'
import React from "react";
import {DataTableProps} from "@/components/DataTable";
import {Table, Tbody, Th, Thead, Tr, Td, Flex, Button, Input, Text, chakra, Box} from "@chakra-ui/react";
import {TriangleDownIcon, TriangleUpIcon} from "@chakra-ui/icons";


export default function CustomTable<Data extends object>({
                                                             data,
                                                             columns
                                                         }: DataTableProps<Data>) {
    const [sorting, setSorting] = React.useState<SortingState>([{
        id: 'chance',
        desc: true
    }]);
    const table = useReactTable({
        data,
        columns,
        // Pipeline
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting
        },
        //
        debugTable: true,
    })

    return (
        <div>
            <Table>
                <Thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <Tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => {
                                const meta: any = header.column.columnDef.meta;
                                return (
                                    <Th key={header.id} colSpan={header.colSpan}

                                        isNumeric={meta?.isNumeric}>
                                        {header.isPlaceholder ? null : (
                                            <div>
                                                <div onClick={header.column.getToggleSortingHandler()}>
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}

                                                    <chakra.span pl="4">
                                                        {header.column.getIsSorted() ? (
                                                            header.column.getIsSorted() === "desc" ? (
                                                                <TriangleDownIcon aria-label="sorted descending"/>
                                                            ) : (
                                                                <TriangleUpIcon aria-label="sorted ascending"/>
                                                            )
                                                        ) : null}
                                                    </chakra.span>
                                                </div>

                                                {header.column.getCanFilter() ? (
                                                    <Box paddingTop={"5px"}>
                                                        <Filter column={header.column} table={table}/>
                                                    </Box>
                                                ) : null}
                                            </div>
                                        )}


                                    </Th>
                                )
                            })}
                        </Tr>
                    ))}
                </Thead>
                <Tbody>
                    {table.getRowModel().rows.map(row => {
                        return (
                            <Tr key={row.id}>
                                {row.getVisibleCells().map(cell => {
                                    const meta: any = cell.column.columnDef.meta;
                                    return (
                                        <Td key={cell.id} isNumeric={meta?.isNumeric}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </Td>
                                    )
                                })}
                            </Tr>
                        )
                    })}
                </Tbody>
            </Table>
            <Flex alignItems={"center"} gap={2} flex={1}>
                <Button onClick={() => table.setPageIndex(0)}
                        isDisabled={!table.getCanPreviousPage()}>{'<<'}</Button>
                <Button
                    onClick={() => table.previousPage()}
                    isDisabled={!table.getCanPreviousPage()}
                >
                    {'<'}
                </Button>

                <Flex justifyContent={"center"} gap={3} flex={1}>
                    <Flex gap={1}>
                        <div>Page</div>
                        <strong>
                            {table.getState().pagination.pageIndex + 1} of{' '}
                            {table.getPageCount()}
                        </strong>
                    </Flex>
                    <Flex gap={1}>
                        <Text>Page:</Text>
                        <Input
                            type="number"
                            size={"xs"}
                            defaultValue={table.getState().pagination.pageIndex + 1}
                            onChange={e => {
                                const page = e.target.value ? Number(e.target.value) - 1 : 0
                                table.setPageIndex(page)
                            }}
                        />
                    </Flex>
                    <select
                        value={table.getState().pagination.pageSize}
                        onChange={e => {
                            table.setPageSize(Number(e.target.value))
                        }}
                    >
                        {[10, 20, 30, 40, 50].map(pageSize => (
                            <option key={pageSize} value={pageSize}>
                                Show {pageSize}
                            </option>
                        ))}
                    </select>
                </Flex>

                <Flex alignItems={"center"} gap={2}>
                    <Button
                        onClick={() => table.nextPage()}
                        isDisabled={!table.getCanNextPage()}
                    >
                        {'>'}
                    </Button>
                    <Button
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        isDisabled={!table.getCanNextPage()}
                    >
                        {'>>'}
                    </Button>
                </Flex>
            </Flex>
        </div>
    )
}

function Filter({
                    column,
                    table,
                }: {
    column: Column<any, any>
    table: ReactTable<any>
}) {
    const firstValue = table
        .getPreFilteredRowModel()
        .flatRows[0]?.getValue(column.id)

    const columnFilterValue = column.getFilterValue()

    return typeof firstValue === 'number' ? (
        <Flex gap={2} justifyContent={"flex-end"}>
            <Input
                type="number"
                size={"xs"}
                value={(columnFilterValue as [number, number])?.[0] ?? ''}
                onChange={e =>
                    column.setFilterValue((old: [number, number]) => [
                        e.target.value,
                        old?.[1],
                    ])
                }
                placeholder={`Min`}
                width={"50px"}
                className="w-24 border shadow rounded"
            />
            <Input
                type="number"
                size={"xs"}
                value={(columnFilterValue as [number, number])?.[1] ?? ''}
                onChange={e =>
                    column.setFilterValue((old: [number, number]) => [
                        old?.[0],
                        e.target.value,
                    ])
                }
                width={"50px"}
                placeholder={`Max`}
                className="w-24 border shadow rounded"
            />
        </Flex>
    ) : (
        <Input
            type="text"
            size={"xs"}
            value={(columnFilterValue ?? '') as string}
            onChange={e => column.setFilterValue(e.target.value)}
            placeholder={`Search...`}
            className="w-36 border shadow rounded"
        />
    )
}