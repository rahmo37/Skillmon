import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./component/Dashboard";
import AddCourse from "./component/AddCourse";
import AddPoints from "./component/AddPoints";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add-course" element={<AddCourse />} />
        <Route path="/add-points/:courseId" element={<AddPoints />} />
      </Routes>
    </Router>
  );
}

export default App;

