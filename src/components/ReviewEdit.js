import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { PiStarFill, PiStarLight } from "react-icons/pi";
import { IoCaretBackCircle } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import "../css/ReviewEdit.css";
import Swal from "sweetalert2";

const ReviewEdit = () => {
  const { id } = useParams(); // URL에서 수정하려는 리뷰 ID 가져오기

  // 상태(state) 설정
  const [username, setUserName] = useState(null); // 사용자 이름 상태
  const [rating, setRating] = useState(0); // 평점 상태
  const [content, setContent] = useState(""); // 리뷰 내용 상태
  const [title, setTitle] = useState(""); // 리뷰 제목 상태
  const navigate = useNavigate(); // 페이지 이동을 위한 네비게이트 함수

  // 수정하려는 리뷰 데이터를 불러오는 useEffect
  useEffect(() => {
    if (id) {
      const fetchReview = async () => {
        try {
          const response = await fetch(`http://localhost:8080/api/review/${id}`); // API 호출
          if (!response.ok) throw new Error("리뷰를 불러오는 데 실패했습니다.");
          const data = await response.json(); // JSON 데이터 변환

          // 기존 리뷰 데이터 설정
          setRating(data.rating);
          setContent(data.content);
          setTitle(data.title);
        } catch (error) {
          // 오류 발생 시 무시
        }
      };
      fetchReview();
    }
  }, [id]);

  // 세션 정보를 확인하는 useEffect
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/session", {
          method: "GET",
          credentials: "include", // 쿠키를 포함하여 요청
        });
        const data = await response.json();

        if (data.authenticated && data.user) {
          setUserName(data.user); // 로그인된 사용자 이름 설정
        } else {
          setUserName(null); // 로그인되지 않은 경우 null로 설정
        }
      } catch (error) {
        setUserName(null);
      }
    };

    checkSession();
  }, []);

  // 제목 입력 변경 핸들러 (읽기 전용)
  const handleTitleChange = (e) => setTitle(e.target.value);

  // 별점 클릭 핸들러
  const handleClickStar = (index) => setRating(index + 1);

  // 리뷰 내용 변경 핸들러
  const handleReviewChange = (e) => setContent(e.target.value);

  // 리뷰 수정 요청 핸들러
  const handleSubmit = async () => {
    // 평점이 없거나, 리뷰 내용이 15자 미만이면 경고 표시
    if (rating === 0 || content.length < 15) {
      Swal.fire("알림", "평점과 15자 이상의 리뷰를 작성해 주세요.", "info");
      return;
    }

    if (title.length > 15) {
      Swal.fire("알림", "제목을 15자 이하로 작성해 주세요.", "info");
      return;
    }

    // 수정할 리뷰 데이터 객체
    const reviewData = {
      review_id: id,
      rating: rating,
      content: content,
      username: username,
      title: title,
    };

    try {
      // API 호출하여 리뷰 수정 요청
      const response = await fetch(`http://localhost:8080/api/review/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        Swal.fire("수정 완료", "리뷰가 수정되었습니다.", "success");
        navigate(`/review/${id}`); // 수정된 리뷰 페이지로 이동
      } else {
        Swal.fire("오류", "서버 오류가 발생했습니다. 다시 시도해 주세요.", "error");
      }
    } catch (error) {
      Swal.fire("오류", "서버에 연결할 수 없습니다. 다시 시도해 주세요.", "error");
    }
  };

  return (
    <div className="review-whole">
      <div className="review-Edit-container">
        <div className="review-edit-detail-container">
          {/* 뒤로 가기 버튼 */}
          <div className="review-back-button" onClick={() => navigate(-1)}>
            <IoCaretBackCircle size={32} />
          </div>
          <div className="review-header">
            <p>✏️ 리뷰 수정</p>
          </div>
          <div className="reviewform-container">
            <div className="form-title">
              <h1>리뷰를 수정해주세요.</h1>
            </div>

            {/* 평점 입력 */}
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

            {/* 제목 입력 (읽기 전용) */}
            <div className="review-title">
              <label htmlFor="title">제목:</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={handleTitleChange}
                className="reviewform-title"
                readOnly // 제목 수정 불가
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

            {/* 수정하기 버튼 */}
            <button onClick={handleSubmit} className="reviewform-btn">
              수정하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewEdit;