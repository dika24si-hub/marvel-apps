import {
  FaDog,
  FaUserMd,
  FaCalendarCheck,
  FaPaw,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import StatsCard from "../components/StatsCard";

const surveyData = [
  { month: "Jan", visit: 20, treatment: 15 },
  { month: "Feb", visit: 48, treatment: 40 },
  { month: "Mar", visit: 35, treatment: 55 },
  { month: "Apr", visit: 22, treatment: 28 },
  { month: "Mei", visit: 45, treatment: 30 },
  { month: "Jun", visit: 60, treatment: 45 },
  { month: "Jul", visit: 32, treatment: 38 },
  { month: "Agu", visit: 20, treatment: 55 },
  { month: "Sep", visit: 18, treatment: 25 },
  { month: "Okt", visit: 31, treatment: 30 },
  { month: "Nov", visit: 24, treatment: 35 },
  { month: "Des", visit: 12, treatment: 42 },
];

const barData = [
  { day: "Sen", vaksin: 12, periksa: 20 },
  { day: "Sel", vaksin: 18, periksa: 28 },
  { day: "Rab", vaksin: 10, periksa: 25 },
  { day: "Kam", vaksin: 21, periksa: 32 },
  { day: "Jum", vaksin: 14, periksa: 22 },
  { day: "Sab", vaksin: 25, periksa: 35 },
];

const patients = [
  {
    no: 1,
    pet: "Milo",
    owner: "Jens Brincker",
    doctor: "Dr. Kiran",
    date: "23/05/2025",
    diagnosis: "Vaksin",
    room: "101",
  },
  {
    no: 2,
    pet: "Luna",
    owner: "Mark Hay",
    doctor: "Dr. Budi",
    date: "26/05/2025",
    diagnosis: "Demam",
    room: "105",
  },
  {
    no: 3,
    pet: "Coco",
    owner: "Anthony Davie",
    doctor: "Dr. Clara",
    date: "21/05/2025",
    diagnosis: "Grooming",
    room: "106",
  },
  {
    no: 4,
    pet: "Rocky",
    owner: "David Perry",
    doctor: "Dr. Felix",
    date: "20/04/2025",
    diagnosis: "Operasi",
    room: "102",
  },
  {
    no: 5,
    pet: "Bella",
    owner: "Alan Gilchrist",
    doctor: "Dr. Joseph",
    date: "22/05/2025",
    diagnosis: "Checkup",
    room: "103",
  },
];

export default function Dashboard() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard Klinik Hewan</h1>
          <p>Home / Dashboard / Klinik Dokter Hewan</p>
        </div>

        <button className="add-button">+ Tambah Pasien</button>
      </div>

      <div className="stats-grid">
        <StatsCard
          title="Hewan Baru"
          value="125"
          icon={<FaDog />}
          color="#6c63ff"
          progress="65%"
        />
        <StatsCard
          title="Jadwal Periksa"
          value="218"
          icon={<FaCalendarCheck />}
          color="#00c9a7"
          progress="75%"
        />
        <StatsCard
          title="Dokter Hewan"
          value="25"
          icon={<FaUserMd />}
          color="#ff9f43"
          progress="45%"
        />
        <StatsCard
          title="Total Hewan"
          value="2,479"
          icon={<FaPaw />}
          color="#ff6b6b"
          progress="80%"
        />
      </div>

      <div className="dashboard-grid">
        <div className="chart-card large">
          <div className="card-header">
            <h3>Statistik Kunjungan Klinik</h3>
            <span>2025</span>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={surveyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="visit"
                stroke="#6c63ff"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="treatment"
                stroke="#00c9a7"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="card-header">
            <h3>Perawatan Mingguan</h3>
            <span>+20%</span>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="vaksin" fill="#00c9a7" />
              <Bar dataKey="periksa" fill="#6c63ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="table-card">
        <div className="card-header">
          <h3>Daftar Pasien Hewan</h3>
          <span>Data terbaru</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Hewan</th>
              <th>Pemilik</th>
              <th>Dokter</th>
              <th>Tanggal</th>
              <th>Diagnosis</th>
              <th>Ruang</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {patients.map((item) => (
              <tr key={item.no}>
                <td>{item.no}</td>
                <td>{item.pet}</td>
                <td>{item.owner}</td>
                <td>{item.doctor}</td>
                <td>{item.date}</td>
                <td>
                  <span className="badge">{item.diagnosis}</span>
                </td>
                <td>{item.room}</td>
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