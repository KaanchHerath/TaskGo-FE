import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Tasks from "./pages/Tasks";
import Categories from "./pages/Categories";
import Contact from "./pages/Contact";
import BrowseJobs from "./pages/BrowseJobs";
import PostTask from "./pages/PostTask";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/browse-jobs" element={<BrowseJobs />} />
          <Route path="/post-task" element={<PostTask />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;