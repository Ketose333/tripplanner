import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Search from "./Search";
import Pagination from "./Pagination";
import "../css/Schedule.css";

const Schedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allSchedule, setAllSchedule] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [view, setView] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentGroup, setCurrentGroup] = useState(0);
  const [size, setSize] = useState(5);
  const navigate = useNavigate();

  // 카테고리(유형) 옵션
  const contentTypes = [
    { id: "12", name: "관광지" },
    { id: "14", name: "문화시설" },
    { id: "28", name: "레포츠" },
  ];

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/session", {
          method: "GET",
          credentials: "include"
        });
        const data = await response.json();

        if (data.authenticated) {
          setIsAuthenticated(true);
          setUsername(data.user);
          fetchSchedule();
        } else {
          Swal.fire("오류", "로그인이 필요합니다.", "error");
          navigate("/login");
        }
      } catch (error) {
        Swal.fire("오류", "로그인 확인 중 오류가 발생했습니다.", "error");
        navigate("/login");
      }
    };

    checkSession();
  }, [navigate]);

  const fetchSchedule = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/schedule");
      if (!response.ok) throw new Error("서버 오류");

      const data = await response.json();

      if (Array.isArray(data)) {
        const processed = processSchedule(data);
        setAllSchedule(processed); // 전체 일정 데이터 저장
        setSchedule(processed);
      } else if (Array.isArray(data.schedule)) {
        const processed = processSchedule(data.schedule);
        setAllSchedule(processed); // 전체 일정 데이터 저장
        setSchedule(processed);
      } else {
        setSchedule([]);
      }
    } catch (error) {
      Swal.fire("오류", "일정 데이터를 불러오는 중 오류가 발생했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 일정 데이터에서 카테고리 추출
  const processSchedule = (schedule) => {
    return schedule.map(schedule => {
      const typeLabels = {
        "12": "관광지",
        "14": "문화시설",
        "28": "레포츠"
      };

      // 일정 속 장소의 유형을 배열로 모음
      const scheduleTypes = [
        typeLabels[schedule.type1],
        typeLabels[schedule.type2],
        typeLabels[schedule.type3]
      ].filter(Boolean);

      return {
        ...schedule,
        types: scheduleTypes
      };
    });
  };

  useEffect(() => {
    filterSchedule();
  }, [view, allSchedule, searchTerm]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * size;
    const endIndex = startIndex + size;
    setSchedule(allSchedule.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(allSchedule.length / size));
  }, [currentPage, allSchedule]);

  const filterSchedule = () => {
    let filteredSchedule = allSchedule;

    if (view === "mine") {
      filteredSchedule = filteredSchedule.filter(
        (schedule) => schedule.username?.trim() === username?.trim()
      );
    }

    if (selectedType !== "all") {
      filteredSchedule = filteredSchedule.filter((schedule) =>
        schedule.types.includes(
          contentTypes.find((type) => type.id === selectedType)?.name
        )
      );
    }

    // 검색 기능 추가 (place1, place2, place3 중 하나라도 일치하는 경우)
    if (searchTerm.trim() !== "") {
      filteredSchedule = filteredSchedule.filter(
        (schedule) =>
          schedule.place1?.trim() === searchTerm.trim() ||
          schedule.place2?.trim() === searchTerm.trim() ||
          schedule.place3?.trim() === searchTerm.trim()
      );
    }

    setSchedule(filteredSchedule);
    setCurrentPage(1);
    setTotalPages(Math.ceil(filteredSchedule.length / size));
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
    filterSchedule();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleGroupChange = (direction) => {
    const newGroup = currentGroup + direction;
    if (newGroup >= 0 && newGroup < Math.ceil(totalPages / 5)) {
      setCurrentGroup(newGroup);
      setCurrentPage(newGroup * 5 + 1);
    }
  };

  return (
    <>
      <Search onSearch={handleSearch} />
      <p className="search-schedule-title">🔍관광지 및 행사명을 검색하세요</p>
      <div className="schedule-list-container">
        <h2>🗓️ 일정 목록</h2>
        <div className="schedule-view-select">
          <label htmlFor="view-selection">일정 유형: </label>
          <select id="view-selection" value={view} onChange={(e) => setView(e.target.value)}>
            <option value="all">전체 일정 보기</option>
            {isAuthenticated && username && <option value="mine">내 일정 보기</option>}
          </select>
        </div>
        <div className="schedule-list-form">
          <div className="schedule-list-form-container">
            {schedule.length === 0 ? (
              <div className="no-schedule">
                <p>등록된 일정이 없습니다.</p>
              </div>
            ) : (
              <div className="schedule-cards-container">
                {schedule.map((schedule) => (
                  <div className="schedule-card" key={schedule.id}>
                    <Link to={`/schedule/${schedule.id}`} className="schedule-card-btn">
                      <div className="schedule-card-content">
                        <div className="schedule-card-header">
                          <p><strong>👤 작성자:</strong> {schedule.username}</p>
                          <p className="schedule-date">{schedule.date}</p>
                        </div>
                        <p className="schedule-title">{schedule.title}</p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
            {schedule.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageNumbers={Array.from({ length: totalPages }, (_, i) => i + 1)}
                currentGroup={currentGroup}
                handlePageChange={handlePageChange}
                onGroupChange={handleGroupChange}
              />
            )}
            <div className="schedule-button-container">
              <button className="add-schedule-button" onClick={() => navigate("/schedule/add")}>
                일정 추가
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Schedule;