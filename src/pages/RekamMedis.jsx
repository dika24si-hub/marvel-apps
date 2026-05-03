export default function RekamMedis() {
  return (
    <div>
      <div className="page-header">
        <h1>Rekam Medis</h1>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Nama Hewan</th>
              <th>Diagnosa</th>
              <th>Tanggal</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Milo</td>
              <td>Demam</td>
              <td>10 Mei 2025</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}