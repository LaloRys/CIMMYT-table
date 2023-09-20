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
import {
  Link,
  Unlink,
  Latitude,
  Longitude,
  Aleft,
  AleftLines,
  Aright,
  ArightLines,
  ArrowUp,
  ArrowDown,
} from "../components/Icons";

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

const getCommentColor = (comment) => {
  if (comment.startsWith("WRONG")) {
    return "bg-red-500 text-white px-2 py-1 rounded-lg"; // Rojo si comienza con 'WRONG'
  } else if (comment.startsWith("OK")) {
    return "bg-green-500 text-white px-2 py-1 rounded-lg"; // Verde si comienza con 'CORRECT'
  } else if (comment.startsWith("NOT")) {
    return "bg-yellow-400 text-white px-2 py-1 rounded-lg"; // Verde si comienza con 'CORRECT'
  } else {
    return "text-black"; // Verde en cualquier otro caso
  }
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
      cell: (info) => <span className="font-bold">{info.getValue()}</span>,
    },
    {
      accessorKey: "DECLATITUDE",
      header: () => (
        <div className="flex justify-center items-center">
          <span>DECLATITUDE</span>{" "}
          <i className="ml-2 text-xl">
            <Latitude />
          </i>
        </div>
      ),
      cell: (info) => (
        <span className="text-blue-400 font-semibold">{info.getValue()}</span>
      ),
    },
    {
      accessorKey: "DECLONGITUDE",
      header: () => (
        <div className="flex justify-center items-center">
          <span>DECLONGITUDE</span>{" "}
          <i className="ml-2 text-xl">
            <Longitude />
          </i>
        </div>
      ),
      cell: (info) => (
        <span className="text-blue-400 font-semibold ">{info.getValue()}</span>
      ),
    },
    {
      accessorKey: "ORIGCTY",
      header: () => <span>ORIGCTY</span>,
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
      cell: (info) => {
        const comment = info.getValue() || ""; // Obtén el contenido de la celda
        const colorClass = getCommentColor(comment); // Determina el color basado en el contenido
        return <span className={`font-semibold ${colorClass}`}>{comment}</span>;
      },
    },
    {
      accessorKey: "Suggested coordinates",
      header: () => <span>Suggested</span>,
    },
    {
      accessorKey: "GRIN",
      header: () => <span>GRIN</span>,
      cell: (info) =>
        info.getValue() ? (
          <a
            href={info.getValue()}
            className="text-blue-500 font-semibold"
            target="_blank"
          >
            <Link className="text-2xl" />
          </a>
        ) : (
          <i className="text-2xl">
            <Unlink />
          </i>
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
        pageSize: 10, //Valor para inicializar la pagina
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
        <div className="text-slate-900 text-sm font-semibold">
          Mostrando de {getStateTable().firstIndex} al{" "}
          {getStateTable().lastIndex} del total de {getStateTable().totalRows}{" "}
          registros
        </div>
        {/* Texto de ubicacion */}
        <DebounceInput
          type="text"
          value={globalFilter ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          className="text-black border-2 border-sky-600 px-2 py-1 rounded-md outline-sky-700"
          placeholder="Buscar..."
        />
      </div>
      {/* Buscador  */}
      <table className="table-auto w-full ">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              className="border border-slate-500 bg-sky-600 text-white rounded-lg"
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
                        asc: <ArrowUp className="text-xl" />,
                        desc: <ArrowDown className="text-xl" />,
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
            <tr
              className="text-slate-900 hover:bg-slate-200 border border-slate-500"
              key={row.id}
            >
              {row.getVisibleCells().map((cell) => (
                <td className="py-2 px-4 border border-slate-500" key={cell.id}>
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
            className="bg-sky-600 px-1 py-1 rounded-md hover:bg-sky-500 disabled:hover:bg-slate-700"
          >
            <i className="text-3xl text-white">
              <AleftLines />
            </i>
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="bg-sky-600 px-1 py-1 rounded-md hover:bg-sky-500  disabled:hover:bg-slate-700"
          >
            <i className="text-2xl text-white">
              <Aleft />
            </i>
          </button>
          {/* Numero de pagina */}
          {table.getPageOptions().map((pageNumber, index) => (
            <button
              onClick={() => table.setPageIndex(pageNumber)}
              className={classNames({
                "bg-sky-600 text-white px-2.5 py-1 rounded-md hover:bg-sky-500 hover: font-semibold disabled:hover:bg-slate-700": true,
                "bg-sky-500 text-black px-3.5 py-2 hover:bg-sky-600":
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
            className="bg-sky-600 px-1 py-1 rounded-md hover:bg-sky-500 disabled:hover:bg-slate-700"
          >
            <i className="text-2xl text-white">
              <Aright />
            </i>
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)} // Calcular ultima pagina
            disabled={!table.getCanPreviousPage()}
            className="bg-sky-600 px-1 py-1 rounded-md hover:bg-sky-500 disabled:hover:bg-slate-700"
          >
            <i className="text-3xl text-white">
              <ArightLines />
            </i>
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
