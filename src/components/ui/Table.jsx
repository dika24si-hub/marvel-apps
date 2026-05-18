import EmptyState from "./EmptyState";
export default function Table({
  columns = [],
  data = [],
  rowKey = "id",
  empty,
  className = "",
}) {
  const getKey = (row, i) =>
    typeof rowKey === "function" ? rowKey(row, i) : row[rowKey] ?? i;

  return (
    <div className={`ui-table-wrap ${className}`}>
      <table className="ui-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ textAlign: col.align ?? "left" }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: 0 }}>
                {typeof empty === "string" ? (
                  <EmptyState title={empty} />
                ) : (
                  empty || <EmptyState />
                )}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={getKey(row, i)}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{ textAlign: col.align ?? "left" }}
                  >
                    {col.render ? col.render(row, i) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
