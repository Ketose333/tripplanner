import React, { useEffect, useState, useCallback } from "react";
import "../css/MyPage.css";
import { FaHeartBroken } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Pagination from "./Pagination";

const MyPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [username, setUsername] = useState(null);
  const [selectedType, setSelectedType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumbers, setPageNumbers] = useState([]);
  const itemsPerPage = 9;
  const navigate = useNavigate();

  // contentTypeId 옵션
  const contentTypes = [
    { id: "12", name: "관광지" },
    { id: "14", name: "문화시설" },
    { id: "28", name: "레포츠" },
  ];

  // 세션 확인
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/session", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        if (data.authenticated && data.user) {
          setUsername(data.user);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("세션 확인 실패:", error);
        navigate("/login");
      }
    };

    checkSession();
  }, [navigate]);

  // 찜 목록 불러오기 (currentPage 추가)
  const fetchFavorites = useCallback(async () => {
    if (!username) return;

    try {
      const response = await fetch(
        `http://localhost:8080/favorites/${username}?page=${currentPage}&size=${itemsPerPage}`, // ✅ 페이지네이션 적용
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("찜 목록 불러오기 실패");

      const data = await response.json();
      console.log("찜 목록 데이터:", data);

      if (data?.content && Array.isArray(data.content)) {
        setFavorites(data.content);
        setTotalCount(data.totalElements); // ✅ 전체 찜 개수 유지
        setPageNumbers(getPageNumbers(currentPage, Math.ceil(data.totalElements / itemsPerPage))); // ✅ 페이지 번호 업데이트
      } else {
        console.warn("찜 목록 응답이 올바른 형식이 아닙니다:", data);
        setFavorites([]);
        setTotalCount(0);
        setPageNumbers([]);
      }
    } catch (error) {
      console.error("찜 목록 가져오기 오류:", error);
      setFavorites([]);
      setTotalCount(0);
      setPageNumbers([]);
    }
  }, [username, currentPage]); // ✅ currentPage 추가

  useEffect(() => {
    if (username) {
      fetchFavorites();
    }
  }, [username, currentPage, fetchFavorites]); // ✅ currentPage 변경 시 재요청

  // 찜 삭제 함수
  const removeFavorite = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/favorites/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("찜 삭제 요청 실패");

      setFavorites((prev) => prev.filter((place) => place.id !== id));
      setTotalCount((prev) => prev - 1); // ✅ 삭제 시 전체 개수 감소
    } catch (error) {
      console.error("찜 삭제 오류:", error);
    }
  };

  // 페이지네이션 숫자 배열 생성 함수
  const getPageNumbers = (currentPage, totalPages) => {
    const pageNumbers = [];
    const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1;
    const endPage = Math.min(startPage + 4, totalPages);
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  return (
    <div className="mypage-section">
      <h2>❤️ 찜한 관광지</h2>
      <div className="filter-section">
        <label>카테고리 선택: </label>
        <select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            setCurrentPage(1); // ✅ 필터 변경 시 첫 페이지로 이동
          }}
        >
          <option value="all">전체</option>
          {contentTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {favorites.length === 0 ? (
        <p>선택한 카테고리에 찜한 관광지가 없습니다.</p>
      ) : (
        <div className="mypage-grid">
          {favorites.map((place) => (
            <div key={place.id} className="mypage-card">
              {place.tourism?.firstimage && (
                <img src={place.tourism.firstimage} alt={place.tourism.title} className="card-img" />
              )}
              <h3>{place.tourism?.title}</h3>
              <button className="remove-button" onClick={() => removeFavorite(place.id)}>
                <FaHeartBroken /> 삭제
              </button>
            </div>
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(totalCount / itemsPerPage)}
        handlePageChange={setCurrentPage}
        pageNumbers={pageNumbers}
      />
    </div>
  );
};

export default MyPage;