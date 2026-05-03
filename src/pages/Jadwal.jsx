export default function Jadwal() {
  return (
    <div>
      <div className="page-header">
        <h1>Jadwal Periksa</h1>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Nama Hewan</th>
              <th>Tanggal</th>
              <th>Dokter</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Milo</td>
              <td>12 Mei 2025</td>
              <td>Dr. Dika</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}