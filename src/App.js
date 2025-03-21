import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Home from './components/Home';
import Tourism from './components/Tourism';
import TourismDetail from './components/TourismDetail';
import Event from './components/Event';
import EventDetail from './components/EventDetail';
import Review from './components/Review';
import Schedule from './components/Schedule';
import ScheduleDetail from './components/ScheduleDetail';
import ScheduleAdd from './components/ScheduleAdd';
import ScheduleEdit from './components/ScheduleEdit';
import Login from './components/Login';
import Join from './components/Join';
import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer';
import ReviewAdd from './components/ReviewAdd';
import ReviewDetail from './components/ReviewDetail';
import ReviewEdit from "./components/ReviewEdit";


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
        <Route path="/event" element={<Event />} />  {/* 수정된 부분 */}
        <Route path="/event/:id" element={<EventDetail />} />  {/* 수정된 부분 */}
        <Route path="/review" element={<Review />} />  {/* 수정된 부분 */}
        <Route path="/tourism/review/:id" element={<ReviewAdd />} />
        <Route path="/event/review/:id" element={<ReviewAdd />} />
        <Route path="/review/:id" element={<ReviewDetail />} />
        <Route path="/review/edit/:id" element={<ReviewEdit />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/schedule/:id" element={<ScheduleDetail />} />
        <Route path="/schedule/add" element={<ScheduleAdd />} />
        <Route path="/schedule/edit/:scheduleId" element={<ScheduleEdit />} />
        <Route path="/login" element={<Login />} />
        <Route path="/join" element={<Join />} />
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
