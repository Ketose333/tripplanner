import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PiStarFill, PiStarLight } from "react-icons/pi";
import { IoCaretBackCircle } from "react-icons/io5";
import Swal from "sweetalert2";
import "../css/ReviewAdd.css";

const ReviewAdd = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 hook
  const location = useLocation(); // 현재 위치의 state 가져오기
  const { productInfo } = location.state || {}; // 전달된 상품 정보

  // 상태 변수 선언
  const [username, setUserName] = useState(null); // 사용자 이름
  const [rating, setRating] = useState(0); // 평점 (별점)
  const [content, setContent] = useState(""); // 리뷰 내용
  const [title, setTitle] = useState(productInfo?.title || ""); // 리뷰 제목

  // 사용자 로그인 상태 확인
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/session", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        if (data.authenticated && data.user) {
          setUserName(data.user);
        } else {
          Swal.fire("오류", "로그인이 필요합니다.", "error").then(() => {
            navigate("/login");
          });
        }
      } catch (error) {
        Swal.fire("오류", "로그인 확인 중 오류가 발생했습니다.", "error").then(() => {
          navigate("/login");
        });
      }
    };

    checkSession();
  }, [navigate]);

  // 제목 입력 핸들러
  const handleTitleChange = (e) => setTitle(e.target.value);

  // 별점 클릭 핸들러
  const handleClickStar = (index) => setRating(index + 1);

  // 리뷰 내용 입력 핸들러
  const handleReviewChange = (e) => setContent(e.target.value);

  // 리뷰 제출 핸들러
  const handleSubmit = async () => {
    if (rating === 0 || content.length < 15) {
      Swal.fire("알림","평점과 15자 이상의 리뷰를 작성해 주세요.","info");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, content, username, title }),
      });

      if (response.ok) {
        Swal.fire("등록 완료", "리뷰가 성공적으로 등록되었습니다.", "success")
        setRating(0);
        setContent("");
        setTitle(productInfo?.title || "");

        navigate("/review"); // 리뷰 목록 페이지로 이동
      } else {
        Swal.fire("오류", "서버 오류가 발생했습니다. 다시 시도해 주세요.", "error");
      }
    } catch (error) {
      Swal.fire("오류", "서버에 연결할 수 없습니다. 다시 시도해 주세요.", "error");
    }
  };

  return (
    <div className="review-add-container">
      <div className="review-add-detail-container">
        {/* 뒤로 가기 버튼 */}
        <div className="review-back-button" onClick={() => navigate(-1)}>
          <IoCaretBackCircle size={32} />
        </div>

        {/* 상품 정보 표시 */}
        {productInfo && (
          <div className="before-information">
            <div>
              <img
                src={productInfo.firstimage}
                alt="관광지 이미지"
                className="before-img"
              />
            </div>
            <div>
              <p className="before-title">{productInfo.title} </p>
            </div>
          </div>
        )}

        <div className="review-container">
          <div className="review-header">
            <p>🚌 이번 여행은 어떠셨나요?</p>
          </div>
          <div className="reviewform-container">
            <div className="form-title">
              <h1>상세 리뷰를 작성해주세요.</h1>
            </div>

            {/* 별점 입력 */}
            <div className="star-text-container">
              <p>평점을 남겨주세요:</p>
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <div key={i} onClick={() => handleClickStar(i)}>
                    {i < rating ? (
                      <PiStarFill className="star-lg" />
                    ) : (
                      <PiStarLight className="star-lg" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 리뷰 제목 입력 */}
            <div className="review-title">
              <label htmlFor="title">제목:</label>
              <input
                id="title"
                type="text"
                value={productInfo.title}
                readOnly
                onChange={handleTitleChange}
                className="reviewform-title"
              />
            </div>

            {/* 리뷰 내용 입력 */}
            <div className="star-text-container">
              <p>내용: </p>
              <textarea
                id="text"
                value={content}
                onChange={handleReviewChange}
                placeholder="내용 15자 이상 기입해주세요."
                className="reviewform-text"
                spellCheck="false"
                rows="5"
                cols="50"
              />
            </div>

            {/* 리뷰 등록 버튼 */}
            <button onClick={handleSubmit} className="reviewform-btn">
              등록하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewAdd;