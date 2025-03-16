import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import "../css/TourismDetail.css";

const TourismDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tourism, setTourism] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState(null);
  // const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchTourismData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/api/tourism/${id}`);
        if (!response.ok) throw new Error("데이터를 불러오는 데 실패했습니다.");
        const data = await response.json();
        setTourism(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    // 리뷰 관련 데이터는 아직 구현되지 않았으므로, 주석 처리
    /*
        const fetchReviewsData = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/reviews/tourism/${id}`);
                if (!response.ok) {
                    throw new Error("리뷰 데이터를 불러오는 데 실패했습니다.");
                }
                const data = await response.json();
                setReviews(data);
            } catch (error) {
                setError(error.message);
            }
        };
        */
    fetchTourismData();
    // 리뷰 관련 API 호출도 주석 처리
    // fetchReviewsData();
  }, [id]);

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
        }
      } catch (error) {
        console.error("세션 확인 오류:", error);
      }
    };
    checkSession();
  }, []);

  const handleWriteReview = () => {
    navigate(`/tourism/review/${tourism.id}`, { state: { productInfo: tourism } });
  };

  if (loading) return <p>데이터를 불러오는 중...</p>;
  if (error) return <p>오류 발생: {error}</p>;
  if (!tourism) return <p>데이터를 찾을 수 없습니다.</p>;

  const validTel = tourism.tel && tourism.tel !== "null";

  return (
    <div className="tourism-detail">
      <img src={tourism.firstimage} alt={tourism.title} className="detail-image" />
      <h2>{tourism.title}</h2>
      <p>{tourism.overview}</p>
      <p><strong>주소:</strong> {tourism.addr1}</p>
      {validTel && <p><strong>전화번호:</strong> {tourism.tel}</p>}
      <div className="button-container">
        <button className="writeReview-button" onClick={handleWriteReview}>리뷰쓰기</button>
        <button onClick={() => navigate(-1)} className="backTour-button">뒤로가기</button>
      </div>
    </div>
  );
};

export default TourismDetail;