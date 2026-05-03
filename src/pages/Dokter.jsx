export default function Dokter() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dokter Hewan</h1>
          <p>Home / Dokter / Klinik Dokter Hewan</p>
        </div>

        <button className="add-button">+ Tambah Dokter</button>
      </div>

      <div className="table-card">
        <div className="card-header">
          <h3>Daftar Dokter</h3>
        </div>

        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Spesialis</th>
              <th>Jadwal</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Dr. Dika</td>
              <td>Bedah Hewan</td>
              <td>Senin - Jumat</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}