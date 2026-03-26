# 🍎 과일 비즈니스 토탈 대시보드

> 과일 셀러를 위한 데이터 기반 소싱·마진 분석 통합 웹 대시보드

---

## 📌 주요 기능

| 페이지 | 기능 |
|--------|------|
| **1. Trend** | KAMIS API 기반 계절별 소싱 타이밍 + AI 주간 소싱 가이드 |
| **2. Margin** | 플랫폼별 수수료·포장·배송비 통합 마진 계산기, 3개년 가격 차트 |
| **3. Price** | 제휴 도매처 3곳 CSV 매칭 비교 테이블 |
| **4. Benchmarking** | 쿠팡 상위 판매자 분석, AI SEO 태그·제목 전략 제안 |
| **5. My List** | 검증 품목 저장·관리 (LocalStorage 기반 소싱 포트폴리오) |

---

## 🚀 로컬 실행 방법

### 1. 패키지 설치
```bash
pip install -r requirements.txt
```

### 2. 환경변수 설정
`.env.example`을 복사해 `.env` 파일을 만들고, KAMIS 인증 정보를 입력합니다.
```bash
cp .env.example .env
# .env 파일을 열어 본인의 KAMIS 인증키/이메일 입력
```

> KAMIS API 키는 [농산물유통정보(KAMIS)](https://www.kamis.or.kr) 에서 무료 발급받을 수 있습니다.

### 3. 서버 실행
```bash
python app.py
```

### 4. 브라우저 접속
```
http://127.0.0.1:5000/
```

---

## 📁 주요 파일 구조

```
├── app.py                         # Flask 백엔드 서버
├── requirements.txt               # Python 패키지 목록
├── .env.example                   # 환경변수 예시 (실제 .env는 gitignore 처리)
├── templates/
│   └── index.html                 # 메인 대시보드 UI
├── static/
│   ├── app.js                     # 프론트엔드 로직 (탭, 차트, 마진 계산)
│   └── style.css                  # 다크 글래스모피즘 스타일
├── fruit_price_comparison_detailed.csv  # KAMIS 품목 기준 데이터
├── econfarm_prices.csv            # 도매처1 가격 데이터
├── mgb2bmall_prices.csv           # 도매처2 가격 데이터
├── hwanggs3_prices.csv            # 도매처3 가격 데이터
└── 대시보드_구축_사양서_v1.0.md   # 기능 사양서
```

---

## 🔐 보안 주의사항

- `.env` 파일은 **절대 커밋하지 마세요** (`.gitignore` 처리됨)
- KAMIS 인증키는 `.env` 파일에만 저장하고 코드에 직접 입력하지 않습니다

---

## 🛠 기술 스택

- **Backend:** Python 3.x, Flask, Pandas, Waitress
- **Frontend:** Vanilla JS, Chart.js, CSS (Glassmorphism Dark Theme)
- **External API:** KAMIS 농산물 유통정보 Open API
- **Fonts:** Google Fonts (Outfit, Pretendard)
