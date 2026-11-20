# 허 갤러리 · Heo gallery

그린트리 허광리(허광리/그린트리)의 온라인 개인 미술관 — 네 개의 관으로 이어집니다.

- **로비 + 1관 · 가을 풍경 사진전** — 매일 아침 맨발로 걸은 동네 숲의 가을, 대표 10점 정선
- **2관 · 엽서·카드관** — 직접 만지고 돌려 보는 인터랙티브 엽서 3점 (LP 턴테이블 엽서 · 가을 서리 스크래치 엽서 · 벚꽃 독서 3D 명언 카드)
- **3관 · 마음 낭독 상영관** — 낭독 영상 4편 (〈단풍 드는 날〉 〈수능 날 아침〉 〈조급하지 않게〉 〈단풍나무 아래서〉)
- **4관 · 책 홍보관** — 책 홍보 영상 3편

- 전시 주소: https://greentree-sudo.github.io/autumn-gallery/
- 배경음악: 드뷔시 〈달빛〉 (그린트리 클래식 BGM 05) · 기본 음량 0.22

## 구성

```
index.html            로비 + 1관 (사진 10점, 라이트박스, 좋아요 localStorage)
hall2/                2관 + 엽서 원본 3종(lp-postcard / frost-postcard / cherry-card)
hall3/                3관 + videos/ (H.264 faststart, 25MB 이하), posters/
hall4/                4관 + videos/, posters/
assets/               gallery.css · gallery.js · fonts/ (Heo gallery 이탤릭 서체, OFL)
images/               1관 사진 10점 (20점 중 정선)
bgm.mp3               배경음악
```

오프라인 소장용 1관 단일 HTML은 `downloads/그린트리_가을_풍경_미술관_웹갤러리.html`(사진·음악·서체 내장)로 따로 보관합니다.
2~4관은 진입할 때 배경음악이 겹치지 않도록, 영상 재생·엽서 열기 시 배경음악이 자동으로 멈춥니다.

© 그린트리 허광리. 사진과 글, 영상의 저작권은 작가에게 있습니다.
