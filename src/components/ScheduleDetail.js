import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoCaretBackCircle } from "react-icons/io5";
import Swal from "sweetalert2"; // SweetAlert2를 사용하여 경고창을 표시
import "../css/ScheduleDetail.css";

const ScheduleDetail = () => {
    // URL에서 일정 ID를 가져옴
    const { id } = useParams();
    const navigate = useNavigate();

    // 일정 데이터 및 로딩 상태를 관리하는 state
    const [scheduleData, setScheduleData] = useState(null);
    const [loading, setLoading] = useState(true);

    // 현재 로그인한 사용자 정보 가져오기
    const [currentUser, setCurrentUser] = useState(null);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

    // 로그인된 사용자 정보 가져오기
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/session", {
                    method: "GET",
                    credentials: "include",
                });
                const data = await response.json();

                if (data.authenticated) {
                    setCurrentUser(data.user);
                    setIsUserLoggedIn(true);
                } else {
                    setIsUserLoggedIn(false);
                }
            } catch (error) {
                setIsUserLoggedIn(false);
            }
        };

        fetchSession();
    }, []);

    // 일정 데이터를 가져오는 useEffect
    useEffect(() => {
        const fetchScheduleData = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/schedule/${id}`);
                if (!response.ok) {
                    throw new Error("데이터를 불러오는 데 실패했습니다.");
                }
                const data = await response.json();

                // 일정 유형 매핑 (숫자 코드를 한글로 변환)
                const typeLabels = {
                    "12": "관광지",
                    "14": "문화시설",
                    "28": "레포츠"
                };

                // 일정 목록 배열 생성 (비어있는 일정은 필터링)
                const scheduleItems = [
                    { place: data.place1, details: data.details1, type: data.type1 },
                    { place: data.place2, details: data.details2, type: data.type2 },
                    { place: data.place3, details: data.details3, type: data.type3 }
                ].filter(item => item.place && item.details);

                // 일정 항목별로 관광지 정보를 가져와 업데이트
                const updatedScheduleItems = await Promise.all(scheduleItems.map(async (item) => {
                    const tourismData = await fetchTourismData(item.place, item.type);
                    return {
                        ...item,
                        type: typeLabels[item.type] || (item.type === "0" ? "행사" : "알 수 없음"),
                        firstimage: tourismData.firstimage,
                        addr1: tourismData.addr1,
                        tel: tourismData.tel
                    };
                }));

                // 일정 데이터를 state에 저장
                setScheduleData({
                    id: data.id,
                    title: data.title,
                    date: data.date,
                    username: data.username,
                    scheduleItems: updatedScheduleItems
                });
            } catch (error) {
                setScheduleData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchScheduleData();
    }, [id]);

    // 특정 관광지 정보를 가져오는 함수
    const fetchTourismData = async (place, type) => {
        try {
            const apiUrl = type === "0"
                ? "http://localhost:8080/api/event"  // 행사 데이터 API
                : "http://localhost:8080/api/tourism"; // 관광지 데이터 API

            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error("데이터 검색 실패");

            const data = await response.json();
            const match = data.find(item => item.title === place);

            return match ? {
                firstimage: match.firstimage || "",
                addr1: match.addr1 || "정보 없음",
                tel: match.tel && match.tel !== "null" ? match.tel : "정보 없음"
            } : { firstimage: "", addr1: "정보 없음", tel: "정보 없음" };
        } catch (error) {
            return { firstimage: "", addr1: "정보 없음", tel: "정보 없음" };
        }
    };

    // 일정 삭제 기능
    const handleDelete = async () => {
        Swal.fire({
            title: "정말 삭제하시겠습니까?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "삭제",
            cancelButtonText: "취소",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`http://localhost:8080/api/schedule/${id}`, {
                        method: "DELETE",
                    });
                    if (!response.ok) {
                        throw new Error("삭제에 실패했습니다.");
                    }
                    Swal.fire("삭제 완료!", "일정이 삭제되었습니다.", "success").then(() => {
                        navigate("/"); // 삭제 후 홈 화면으로 이동
                    });
                } catch (error) {
                    Swal.fire("오류", "삭제 중 문제가 발생했습니다.", "error");
                }
            }
        });
    };

    // 데이터가 로딩 중일 때 표시할 화면
    if (loading) {
        return <p>데이터를 불러오는 중...</p>;
    }

    // 일정 데이터를 찾을 수 없는 경우
    if (!scheduleData) {
        return <p>해당 일정 정보를 찾을 수 없습니다.</p>;
    }

    // 현재 로그인한 사용자와 일정 작성자가 같은지 확인
    const isOwner = currentUser && scheduleData && currentUser === scheduleData.username;

    return (
        <div className="schedule-detail-container">
            {/* 뒤로 가기 버튼 */}
            <div className="schedule-back-button" onClick={() => navigate(-1)}>
                <IoCaretBackCircle size={32} />
            </div>

            {/* 일정 제목, 날짜, 작성자 정보 */}
            <h2 className="schedule-detail-title">{scheduleData.title}</h2>
            <p><strong>🗓️ 날짜:</strong> {scheduleData.date}</p>
            <p><strong>👤 작성자:</strong> {scheduleData.username}</p>

            {/* 일정 목록 출력 */}
            {scheduleData.scheduleItems.length > 0 && (
                <div>
                    <h3>📍 일정 내용</h3>
                    <ul>
                        {scheduleData.scheduleItems.map((item, index) => (
                            <li key={index} className="schedule-item">
                                {/* 일정에 대한 이미지 출력 */}
                                {item.firstimage && <img src={item.firstimage} alt={item.place} className="schedule-image" />}
                                <p><strong>유형:</strong> {item.type}</p>
                                <p><strong>장소:</strong> {item.place}</p>
                                <p><strong>내용:</strong> {item.details}</p>
                                <p><strong>주소:</strong> {item.addr1}</p>
                                {item.tel && item.tel !== "정보 없음" && <p><strong>전화번호:</strong> {item.tel}</p>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* 수정 및 삭제 버튼 */}
            {isOwner && (
                <div className="schedule-detail-buttons">
                    <button onClick={() => navigate(`/schedule/edit/${scheduleData.id}`)} className="schedule-detail-button">수정하기</button>
                    <button onClick={handleDelete} className="schedule-detail-button">삭제하기</button>
                </div>
            )}
        </div>
    );
};

export default ScheduleDetail;