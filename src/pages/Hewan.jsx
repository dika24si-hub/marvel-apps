import { FaPlus } from "react-icons/fa";

export default function Hewan() {
  const data = [
    {
      no: 1,
      nama: "Milo",
      jenis: "Kucing",
      umur: "2 Tahun",
      pemilik: "Budi",
      status: "Sehat",
    },
    {
      no: 2,
      nama: "Rocky",
      jenis: "Anjing",
      umur: "3 Tahun",
      pemilik: "Andi",
      status: "Perawatan",
    },
    {
      no: 3,
      nama: "Luna",
      jenis: "Kucing",
      umur: "1 Tahun",
      pemilik: "Sari",
      status: "Vaksin",
    },
  ];

  return (
    <div>
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>Data Hewan</h1>
          <p>Home / Data Hewan / Klinik Dokter Hewan</p>
        </div>

        <button className="add-button">
          <FaPlus /> Tambah Hewan
        </button>
      </div>

      {/* TABLE */}
      <div className="table-card">
        <div className="card-header">
          <h3>Daftar Hewan</h3>
          <span>Data terbaru</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Hewan</th>
              <th>Jenis</th>
              <th>Umur</th>
              <th>Pemilik</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr key={item.no}>
                <td>{item.no}</td>
                <td>{item.nama}</td>
                <td>{item.jenis}</td>
                <td>{item.umur}</td>
                <td>{item.pemilik}</td>

                <td>
                  <span className="badge">{item.status}</span>
                </td>

                <td>
                  <button className="edit-btn">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}