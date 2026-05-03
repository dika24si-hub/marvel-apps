export default function Pembayaran() {
  return (
    <div>
      <div className="page-header">
        <h1>Pembayaran</h1>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Nama Hewan</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Milo</td>
              <td>Rp 150.000</td>
              <td><span className="badge">Lunas</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}