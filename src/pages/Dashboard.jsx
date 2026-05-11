import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from "recharts";

import {
  FaArrowUp,
  FaArrowDown,
  FaWallet,
  FaPiggyBank,
  FaFileInvoiceDollar,
} from "react-icons/fa";

const chartData = [
  { name: "18 Oct", income: 4, expense: -3 },
  { name: "20 Oct", income: 2, expense: -1 },
  { name: "22 Oct", income: 5, expense: -2 },
  { name: "25 Oct", income: 6, expense: -4 },
  { name: "28 Oct", income: 3, expense: -1 },
  { name: "2 Nov", income: 4, expense: -2 },
  { name: "9 Nov", income: 5, expense: -3 },
];

const Dashboard = () => {
  return (
    <div className="dashboard-page">

      {/* HERO */}
      <div className="hero-card">

        <div>
          <p>Total Pendapatan Klinik</p>
          <h1>Rp 32.000.000</h1>
        </div>

        <div className="hero-buttons">
          <button className="hero-btn green">
            + Tambah
          </button>

          <button className="hero-btn dark">
            Kirim
          </button>

          <button className="hero-btn dark">
            Request
          </button>
        </div>

      </div>

      {/* CHART SECTION */}
      <div className="dashboard-main-grid">

        {/* LEFT */}
        <div className="cashflow-card">

          <div className="cashflow-header">

            <h3>Cash Flow</h3>

            <div className="cashflow-tabs">
              <button className="active">
                Weekly
              </button>

              <button>Daily</button>
            </div>

          </div>

          <ResponsiveContainer
            width="100%"
            height={280}
          >
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <Tooltip />

              <Bar
                dataKey="income"
                fill="#0f766e"
                radius={[8, 8, 0, 0]}
              />

              <Bar
                dataKey="expense"
                fill="#22c55e"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

        </div>

        {/* RIGHT */}
        <div className="summary-side">

          <div className="summary-box">

            <div className="summary-icon teal">
              <FaArrowUp />
            </div>

            <div>
              <p>Income</p>
              <h2>Rp 12.3JT</h2>
              <span className="positive">
                +45%
              </span>
            </div>

          </div>

          <div className="summary-box">

            <div className="summary-icon green">
              <FaArrowDown />
            </div>

            <div>
              <p>Expense</p>
              <h2>Rp 5.7JT</h2>
              <span className="negative">
                -12%
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* SMALL STATS */}
      <div className="small-stats">

        <div className="small-card">

          <div className="small-top">
            <FaWallet />
            <span>Last 30 days</span>
          </div>

          <h3>Business Account</h3>
          <h2>Rp 8.672.000</h2>

          <p className="positive">
            +16%
          </p>

        </div>

        <div className="small-card">

          <div className="small-top">
            <FaPiggyBank />
            <span>Last 30 days</span>
          </div>

          <h3>Total Saving</h3>
          <h2>Rp 3.765.000</h2>

          <p className="negative">
            -8%
          </p>

        </div>

        <div className="small-card">

          <div className="small-top">
            <FaFileInvoiceDollar />
            <span>Last 30 days</span>
          </div>

          <h3>Tax Reserve</h3>
          <h2>Rp 14.376.000</h2>

          <p className="positive">
            +35%
          </p>

        </div>

      </div>

      {/* BOTTOM GRID */}
      <div className="bottom-grid">

        {/* ACTIVITY */}
        <div className="activity-card">

          <div className="activity-header">
            <h3>Recent Activity</h3>
          </div>

          <table className="activity-table">

            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Method</th>
              </tr>
            </thead>

            <tbody>

              <tr>
                <td>
                  Theo Lawrence
                </td>

                <td>
                  Rp 500.000
                </td>

                <td>
                  <span className="success-pill">
                    Success
                  </span>
                </td>

                <td>
                  Credit Card
                </td>
              </tr>

              <tr>
                <td>
                  Amy March
                </td>

                <td>
                  Rp 250.000
                </td>

                <td>
                  <span className="pending-pill">
                    Pending
                  </span>
                </td>

                <td>
                  Transfer
                </td>
              </tr>

            </tbody>

          </table>

        </div>

        {/* CARD */}
        <div className="mycard-card">

          <div className="mycard-top">

            <h3>My Cards</h3>

            <button>
              See All
            </button>

          </div>

          <div className="visa-card">

            <div className="visa-header">
              <span>VISA</span>
              <span>2104</span>
            </div>

            <h2>Rp 4.540.000</h2>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;