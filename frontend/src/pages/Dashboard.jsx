import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Card from "../components/Card";

export default function Dashboard() {
  return (
    <>
      <Sidebar />
      <Navbar />

      <div className="ml-60 p-6">
        <div className="grid grid-cols-3 gap-4">
          <Card title="Students" value="120" />
          <Card title="Courses" value="10" />
          <Card title="Revenue" value="₹50000" />
        </div>
      </div>
    </>
  );
}