'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Data for Bar Chart (Daily Study Time)
const barData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Study Hours',
      data: [20, 30, 40, 10, 50, 60, 20], // Sample data
      backgroundColor: 'rgba(59, 130, 246, 0.7)', // Tailwind blue-500
      borderRadius: 5,
    },
  ],
};

// Data for Pie Chart (Task Completion Rate)
const pieData = {
  labels: ['Completed', 'Pending', 'Overdue'],
  datasets: [
    {
      label: 'Tasks',
      data: [70, 20, 10], // Sample data in percentage
      backgroundColor: ['#14c5e8 ', '#ffa500', '#ff0000'], // Green, Yellow, Red
    },
  ],
};

// Data for Line Chart (Weekly Progress)
const lineData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Progress (%)',
      data: [20, 40, 60, 50, 80, 90, 100],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: '#3b82f6',
      tension: 0.3,
    },
  ],
};

// Chart Options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100, // Y-axis as percentage
      ticks: {
        stepSize: 10,
        callback: function (tickValue: string | number) {
          return `${tickValue}%`;
        },
      },
    },
  },
};

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col  ">
      {/* Header Section */}
      <section className="text-center py-20 bg-purple-50 text-white rounded-xl p-4">
        <h1 className="text-4xl font-bold text-black">
          Organize Your Studies Efficiently!
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Plan your schedule, track progress, and boost productivity.
        </p>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-10 text-center">
        <div className="p-6 border rounded-lg shadow-lg hover:bg-gray-200">
          <h2 className="text-xl font-semibold">📅 Task Scheduling</h2>
          <p className="text-gray-600 mt-2">
            Plan study sessions effortlessly.
          </p>
        </div>
        <div className="p-6 border rounded-lg shadow-lg hover:bg-gray-200">
          <h2 className="text-xl font-semibold">⏳ Time Management</h2>
          <p className="text-gray-600 mt-2">Stay productive with timers.</p>
        </div>
        <div className="p-6 border rounded-lg shadow-lg hover:bg-gray-200">
          <h2 className="text-xl font-semibold">📊 Progress Tracking</h2>
          <p className="text-gray-600 mt-2">See completed tasks easily.</p>
        </div>
        <div className="p-6 border rounded-lg shadow-lg hover:bg-gray-200">
          <h2 className="text-xl font-semibold">🎯 AI Recommendations</h2>
          <p className="text-gray-600 mt-2">Smart study suggestions.</p>
        </div>
      </section>

      {/* Performance Charts Section */}
      <section className="p-10 bg-gray-100 rounded-xl">
        <h2 className="text-3xl font-semibold text-center  mb-10">
          📊 Your Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Daily Study Time - Bar Chart */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>📊 Daily Study Time</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <Bar data={barData} options={chartOptions} />
            </CardContent>
          </Card>

          {/* Task Completion Rate - Pie Chart */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>✅ Task Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <Pie data={pieData} />
            </CardContent>
          </Card>

          {/* Weekly Progress - Line Chart */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>📈 Weekly Progress</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <Line data={lineData} options={chartOptions} />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
