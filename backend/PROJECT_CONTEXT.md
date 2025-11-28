# FESTIVAL PROJECT – SYSTEM CONTEXT (FOR CODE ASSISTANT)

## 1. Backend (Spring Boot)
- Port: 8080
- Base URL: http://localhost:8080
- Database: MariaDB
- Framework: Spring Boot 3.x
- Functions:
  - User signup/login
  - Festival list
  - Product list
  - Reservation (festival + optional product)
  - Review (festival-based)
- Entities:
  - User
  - Festival
  - Product
  - Reservation
  - Review

### API Spec Example
POST /users/signup
POST /users/login
GET /festivals
GET /festivals/{id}/products
POST /reservations
POST /reviews

---

## 2. Frontend (React Native, Expo)
- axios 기반 API 요청
- AsyncStorage로 로그인 상태 저장
- 주요 화면:
  - Login
  - Signup
  - Festival List
  - Festival Details
  - Reservation
  - Review List / Create Review

---

## 3. Tasks for AI Assistant (CODEx / Copilot)
- Match axios requests to Spring Boot controller endpoints automatically
- Fix mismatched request/response DTO fields
- Create missing frontend types based on backend DTOs
- Align URL paths Frontend ↔ Backend
- Generate API module inside /frontend/api
- Remove fake data and replace with real API calls
- Convert AsyncStorage-based logic to server-based workflow
- Add or modify Spring Boot CORS config
- Convert backend DTOs to frontend TypeScript interfaces
