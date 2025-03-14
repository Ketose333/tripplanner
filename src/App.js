import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Home from './components/Home';
import Tourism from './components/Tourism';
import TourismDetail from './components/TourismDetail';
import Events from './components/Events';
import Review from './components/Review';
import Schedule from './components/Schedule';
import ScheduleDetail from './components/ScheduleDetail';
import ScheduleAdd from './components/ScheduleAdd';
import Login from './components/Login';
import Join from './components/Join';
import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer';
import MyPage from './components/MyPage';
import ReviewAdd from './components/ReviewAdd';
import ReviewListPage from "./components/ReviewListPage"; 

const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login' || location.pathname === '/join';

  return (
    <div className="App">
      {!isLoginPage && <NavigationBar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tourism" element={<Tourism />} />
        <Route path="/tourism/:id" element={<TourismDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/review" element={<Review />} />
        <Route path="/tourism/review/:id" element={<ReviewAdd/>}/>
        <Route path="/tourism/review/list/:tourismId" element={<ReviewListPage />}/>
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/schedule/:id" element={<ScheduleDetail />} />
        <Route path="/schedule/add" element={<ScheduleAdd />} />
        <Route path="/login" element={<Login />} />
        <Route path="/join" element={<Join />} />
        <Route path="/mypage" element={<MyPage />} />
      </Routes>
      {!isLoginPage && <Footer />}
    </div>
  );
};

export default function WrappedApp() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}