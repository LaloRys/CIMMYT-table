import React, { useEffect, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel, //Filtro
  getSortedRowModel, //Ordenar
} from "@tanstack/react-table";
import fakeData from "../data/Data.json";
import classNames from "classnames";
import { rankItem } from "@tanstack/match-sorter-utils";

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);

  addMeta({ itemRank });

  return itemRank.passed;
};

const DebounceInput = ({ value: keyWord, onChange, ...props }) => {
  const [value, setValue] = useState(keyWord);

  useEffect(() => {
    const timeout = setTimeout(() => {
      // console.log("Filtro")
      onChange(value);
    }, 500);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

function DataTable() {
  // console.log(fakeData);
  const [data, setData] = useState(fakeData);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  console.log(globalFilter);

  const columns = [
    {
      accessorKey: "ACCENUMB",
      header: () => <span className="hover:text-slate-300">ACCENUMB</span>,
      cell: (info) => <span className="font-semibold">{info.getValue()}</span>,
    },
    {
      accessorKey: "DECLATITUDE",
      header: () => <span className="hover:text-slate-300">DECLATITUDE</span>,
      cell: (info) => <span className="font-bold">{info.getValue()}</span>,
    },
    {
      accessorKey: "DECLONGITUDE",
      header: () => <span>DECLONGITUDE</span>,
    },
    {
      accessorKey: "ORIGCTY",
      header: () => <span>ORIGCTY</span>,
      cell: (info) => (
        <span className="text-cyan-400 font-semibold">{info.getValue()}</span>
      ),
    },
    {
      accessorKey: "Distance",
      header: () => <span>Distance</span>,
    },
    {
      accessorKey: "Actual",
      header: () => <span>Actual</span>,
    },
    {
      accessorKey: "COMMETS",
      header: () => <span>COMMETS</span>,
    },
    {
      accessorKey: "Suggested coordinates",
      header: () => <span>Suggested</span>,
    },
    {
      accessorKey: "GRIN",
      header: () => <span>GRIN</span>,
      cell: (info) => (
        <a href={info.getValue()} className="text-cyan-400 font-semibold" target="_blank" >Enlace</a>
      ),
    },
  ];

  const getStateTable = () => {
    const totalRows = table.getFilteredRowModel().rows.length;
    const pageSize = table.getState().pagination.pageSize;
    const pageIndex = table.getState().pagination.pageIndex;
    const rowsPerPage = table.getRowModel().rows.length;

    const firstIndex = pageIndex * pageSize + 1;
    const lastIndex = pageIndex * pageSize + rowsPerPage;

    return { totalRows, firstIndex, lastIndex };
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter, //Filtro
      sorting, //ordenado
    },
    initialState: {
      pagination: {
        pageSize: 15, //Valor para inicializar la pagina
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // globalFilterFn: fuzzyFilter
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
  });

  return (
    <div className="px-6 py-4">
      
      {/* Buscador  */}
      <div className="my-2 flex justify-between">
        {/* Texto de ubicacion */}
        <div className="text-gray-400 text-sm font-semibold">
          Mostrando de {getStateTable().firstIndex} al{" "}
          {getStateTable().lastIndex} del total de {getStateTable().totalRows}{" "}
          registros
        </div>
        {/* Texto de ubicacion */}
        <DebounceInput
          type="text"
          value={globalFilter ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          className="text-black border-indigo-800 px-2 py-1 rounded-md outline-indigo-600"
          placeholder="Buscar..."
        />
      </div>
      {/* Buscador  */}
      <table className="table-auto w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              className="border-b border-gray-300 bg-indigo-600"
              key={headerGroup.id}
            >
              {headerGroup.headers.map((header) => (
                <th className="py-2 px-4 text-left uppercase" key={header.id}>
                  {header.isPlaceholder ? null : (
                    // Control Ordenado
                    <div
                      className={classNames({
                        "cursor-pointer select-none":
                          header.column.getCanSort(),
                      })}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {/* Manejo de estado con iconos */}
                      {{
                        asc: " 🔼",
                        desc: " 🔽",
                      }[header.column.getIsSorted()] ?? null}
                      {/* Manejo de estado con iconos */}
                    </div>
                    // Control Ordenado
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr className="text-gray-200 hover:bg-gray-500" key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td className="py-2 px-4" key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Paginacion */}
      <div className="mt-4 flex items-center justify-between">
        {/* Arrows de navegacion*/}
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="bg-indigo-600 px-2 py-1 rounded-md hover:bg-indigo-500  disabled:hover:bg-slate-700"
          >
            {"<<"}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="bg-indigo-600 px-2 py-1 rounded-md hover:bg-indigo-500  disabled:hover:bg-slate-700"
          >
            {"<"}
          </button>
          {/* Numero de pagina */}
          {table.getPageOptions().map((pageNumber, index) => (
            <button
              onClick={() => table.setPageIndex(pageNumber)}
              className={classNames({
                "bg-indigo-600 px-2.5 py-1 rounded-md hover:bg-indigo-500 font-semibold disabled:hover:bg-slate-700": true,
                "bg-indigo-100 text-black":
                  pageNumber == table.getState().pagination.pageIndex,
              })}
              key={index}
            >
              {pageNumber + 1}
            </button>
          ))}
          {/* Numero de pagina */}
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="bg-indigo-600 px-2 py-1 rounded-md hover:bg-indigo-500 disabled:hover:bg-slate-700"
          >
            {">"}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)} // Calcular ultima pagina
            disabled={!table.getCanPreviousPage()}
            className="bg-indigo-600 px-2 py-1 rounded-md hover:bg-indigo-500  disabled:hover:bg-slate-700"
          >
            {">>"}
          </button>
        </div>
        {/* Arrows de navegacion */}
        
        {/* Numero de paginas */}
        <select
          className="text-black border  border-gray-200 rounded-lg outline-indigo-600"
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
        >
          <option value="10">10 pág.</option>
          <option value="20">20 pág.</option>
          <option value="25">25 pág.</option>
          <option value="50">50 pág.</option>
        </select>
        {/* Numero de paginas */}
      </div>
      {/* Paginacion */}
    </div>
  );
}

export default DataTable;
