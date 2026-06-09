// app.js
// 앱의 두뇌 역할. 화면에 데이터를 불러오고 표시하는 모든 동작을 담당함
// 이 파일은 propositions.js가 먼저 로드된 뒤에 실행됨 (index.html에서 순서가 중요)

// ─────────────────────────────────────────────
// 0단계: 테마(라이트/다크) — 맨 먼저 실행
// 다른 코드보다 앞에 있어야 페이지가 그려지기 전에 테마가 적용되어
// 화면이 깜빡이지 않음
// ─────────────────────────────────────────────

const themeToggleBtn = document.getElementById("theme-toggle");
// HTML의 <button id="theme-toggle"> 을 찾아서 변수에 담음

// ── 저장된 테마를 불러와서 바로 적용 ──
const savedTheme = localStorage.getItem("theme");
// localStorage.getItem("theme") = 이전에 저장해둔 값을 꺼냄
// 처음 방문이면 null, 이전에 다크로 바꿨으면 "dark", 라이트면 "light"

if (savedTheme === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
  // document.documentElement = 페이지의 <html> 태그 그 자체
  // setAttribute("data-theme", "dark") = <html data-theme="dark"> 로 바꿈
  // 이 속성이 붙으면 style.css의 [data-theme="dark"] 색 세트가 발동함
}

// ── 버튼 클릭 시 테마 전환 ──
themeToggleBtn.addEventListener("click", function () {

  const current = document.documentElement.getAttribute("data-theme");
  // getAttribute("data-theme") = 지금 <html> 에 붙은 data-theme 값을 읽음
  // 다크모드면 "dark" / 라이트모드면 null (속성 자체가 없음)

  if (current === "dark") {
    // 현재 다크 → 라이트로 전환
    document.documentElement.removeAttribute("data-theme");
    // removeAttribute = 속성을 완전히 제거. :root 변수가 다시 작동함
    localStorage.setItem("theme", "light");
    // 다음에 이 페이지를 열 때도 라이트모드로 시작하도록 저장

  } else {
    // 현재 라이트 → 다크로 전환
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    // 다음에 열 때도 다크모드로 시작하도록 저장
  }
});


// ─────────────────────────────────────────────
// 1단계: 오늘 날짜를 가져와서 화면에 표시
// ─────────────────────────────────────────────

const today = new Date();
// new Date() = 지금 이 순간의 날짜와 시간을 담은 객체를 만듦

const year  = today.getFullYear();   // 연도 (예: 2026)
const month = today.getMonth() + 1;  // 월 (0~11을 반환하므로 +1 해야 1~12가 됨)
const day   = today.getDate();       // 일 (1~31)

const formattedDate = year + "년 " + month + "월 " + day + "일";
// 문자열을 + 로 이어 붙여 "2026년 5월 28일" 같은 형태를 만듦

const dateElement = document.getElementById("today-date");
// document.getElementById("아이디") = HTML에서 id가 "today-date"인 요소를 찾아옴
// 마치 "화면에서 이 이름표 달린 칸을 찾아줘" 라고 명령하는 것

dateElement.textContent = formattedDate;
// .textContent = 해당 칸 안의 텍스트를 바꿔 넣음
// "날짜 로딩 중..." 이 "2026년 5월 28일" 로 교체됨


// ─────────────────────────────────────────────
// 2단계: 오늘 날짜를 기반으로 명제 하나를 선택
// ─────────────────────────────────────────────

// 날짜로부터 0 이상의 숫자를 만들어 배열 인덱스로 활용
// month * 31 + day 는 월과 일을 합쳐 1년 중 대략의 위치를 숫자로 표현
// 예: 5월 28일 → 5 * 31 + 28 = 183
const dayNumber = month * 31 + day;

// 나머지 연산(%) : dayNumber를 명제 개수로 나눈 나머지 = 0 ~ 9 사이의 숫자
// 이렇게 하면 날짜가 달라질 때마다 다른 명제가 나오고,
// 같은 날에는 항상 같은 명제가 나옴
const todayIndex = dayNumber % PROPOSITIONS.length;
// PROPOSITIONS.length = 배열 안 명제의 총 개수 (현재 10)

const todayProposition = PROPOSITIONS[todayIndex];
// 배열[숫자] = 그 위치의 항목을 꺼냄
// 예: PROPOSITIONS[3] → 4번째 명제 (배열은 0부터 셈)


// ─────────────────────────────────────────────
// 3단계: 선택된 명제를 화면에 표시
// ─────────────────────────────────────────────

const propositionTextElement = document.getElementById("proposition-text");
propositionTextElement.textContent = todayProposition.text;
// index.html의 <blockquote id="proposition-text"> 자리에 명제 텍스트를 넣음

const philosopherNameElement = document.getElementById("philosopher-name");
philosopherNameElement.textContent = "— " + todayProposition.philosopher;
// index.html의 <p id="philosopher-name"> 자리에 철학자 이름을 넣음
// "— " 은 단순한 꾸밈 문자 (대시)


// ─────────────────────────────────────────────
// 3-1단계: 즐겨찾기 — 별 버튼 토글 + localStorage
// ─────────────────────────────────────────────

const favoriteBtn = document.getElementById("favorite-btn");
// HTML의 <button id="favorite-btn"> 을 찾아서 변수에 담음

// 즐겨찾기 목록을 localStorage에서 읽어오는 함수
// 여러 곳에서 쓰이므로 함수로 한 번 묶어둠
function getFavorites() {
  const raw = localStorage.getItem("philosophy-favorites");
  // raw = "[1, 4, 10]" 같은 문자열 / 한 번도 저장 안 했으면 null

  return raw ? JSON.parse(raw) : [];
  // raw ? A : B = raw가 null이 아니면 A, null이면 B
  // → 저장된 게 있으면 배열로 변환해서 반환, 없으면 빈 배열 반환
}

// ── 페이지 열릴 때: 오늘 명제가 이미 즐겨찾기 됐는지 확인 ──
if (getFavorites().includes(todayProposition.id)) {
  // .includes(값) = 배열 안에 이 값이 있으면 true
  favoriteBtn.textContent = "★";
  favoriteBtn.classList.add("favorited");
  // classList.add("favorited") = 버튼에 "favorited" 클래스를 붙임
  // → CSS의 #favorite-btn.favorited 스타일(포인트 색)이 적용됨
}

// ── 별 버튼 클릭 시 즐겨찾기 토글 ──
favoriteBtn.addEventListener("click", function () {
  const favorites = getFavorites();   // 현재 즐겨찾기 목록을 가져옴
  const id = todayProposition.id;     // 오늘 명제의 고유 번호

  if (favorites.includes(id)) {
    // 이미 즐겨찾기 된 상태 → 해제
    const updated = favorites.filter(function (fav) { return fav !== id; });
    localStorage.setItem("philosophy-favorites", JSON.stringify(updated));
    favoriteBtn.textContent = "☆";
    favoriteBtn.classList.remove("favorited");
    renderFavorites();   // 즐겨찾기 섹션에서 이 명제를 즉시 제거

  } else {
    // 즐겨찾기 안 된 상태 → 추가
    favorites.push(id);
    localStorage.setItem("philosophy-favorites", JSON.stringify(favorites));
    favoriteBtn.textContent = "★";
    favoriteBtn.classList.add("favorited");
    renderFavorites();   // 즐겨찾기 섹션에 이 명제를 즉시 추가
  }
});


// ─────────────────────────────────────────────
// 4단계: 저장하기 버튼 기능 + localStorage 설명
// ─────────────────────────────────────────────

// localStorage란?
// ┌──────────────────────────────────────────────────────────┐
// │  브라우저 안에 내장된 작은 저장 공간.                        │
// │  마치 메모장 파일처럼, 앱을 껐다 켜도 데이터가 남아 있음.      │
// │  인터넷 없이도 작동함.                                      │
// │                                                          │
// │  규칙: 텍스트(문자열)만 저장 가능.                           │
// │  → 배열·객체 저장 시 JSON 형식으로 변환 필요                  │
// │  → JSON.stringify() : 객체 → 문자열                        │
// │  → JSON.parse()     : 문자열 → 객체                        │
// │                                                          │
// │  비유: localStorage = 서랍장                               │
// │        setItem = 서랍에 종이를 넣음                         │
// │        getItem = 서랍에서 종이를 꺼냄                        │
// └──────────────────────────────────────────────────────────┘

const saveButton    = document.getElementById("save-button");
const thoughtInput  = document.getElementById("my-thought");
const saveFeedback  = document.getElementById("save-feedback");
const commentaryBtn = document.getElementById("commentary-btn");
const commentaryBox = document.getElementById("commentary-box");
// HTML에서 각 요소를 찾아 변수에 담아둠. 버튼 클릭 때마다 getElementById를 반복 호출하지 않기 위해

saveButton.addEventListener("click", function () {
  // addEventListener("click", 함수) = "이 버튼이 클릭될 때마다 이 함수를 실행해"
  // 함수 안의 코드는 클릭 전까지 실행되지 않음

  const thoughtText = thoughtInput.value.trim();
  // .value     = 입력창에 사용자가 적은 텍스트를 가져옴
  // .trim()    = 앞뒤 공백·줄바꿈 제거 ("  안녕  " → "안녕")

  // ── 빈 칸 방어: 아무것도 안 적으면 저장 중단 ──
  if (thoughtText === "") {
    // === : 값과 타입이 완전히 같을 때만 true (JavaScript에선 == 보다 === 를 권장)
    saveFeedback.textContent = "내용을 먼저 적어주세요.";
    return;
    // return = 함수 즉시 종료. 아래 저장 코드는 실행되지 않음
  }

  // ── 저장할 항목(entry) 하나를 객체로 구성 ──
  const newEntry = {
    date:             formattedDate,              // "2026년 5월 28일" (위에서 만든 변수)
    dateKey:          year + "-"
                      + String(month).padStart(2, "0") + "-"
                      + String(day).padStart(2, "0"),
    // dateKey = "2026-05-28" 형태. 나중에 날짜 순 정렬에 유용
    // String(month).padStart(2, "0") : 숫자 5 → "05" (두 자리로 맞춤)
    propositionId:    todayProposition.id,
    propositionText:  todayProposition.text,
    philosopher:      todayProposition.philosopher,
    thought:          thoughtText,
    savedAt:          Date.now()
    // Date.now() = 지금 이 순간을 숫자로 표현 (밀리초 단위. 예: 1749843200000)
    // 나중에 Date.now() - entry.savedAt 으로 경과 시간을 ms 단위로 계산할 수 있음
    // 1시간 = 60 × 60 × 1000 = 3,600,000 ms
  };

  // ── 기존 기록을 localStorage에서 불러오기 ──
  const savedRaw = localStorage.getItem("philosophy-entries");
  // getItem("키") = 해당 키로 저장된 값을 문자열로 가져옴. 없으면 null 반환

  let entries = [];
  // let = 이후에 값을 재할당할 수 있는 변수 (const는 재할당 불가)

  if (savedRaw !== null) {
    entries = JSON.parse(savedRaw);
    // JSON.parse() = 문자열을 JavaScript 배열/객체로 되돌림
    // '[{"date":"..."}]' → [{ date: "..." }]
  }

  // ── 새 항목을 배열 맨 앞에 추가 (최신 기록이 위에 오도록) ──
  entries.unshift(newEntry);
  // .unshift() = 배열 맨 앞에 삽입 (.push()는 맨 뒤에 삽입)

  // ── 배열을 문자열로 변환 후 localStorage에 저장 ──
  localStorage.setItem("philosophy-entries", JSON.stringify(entries));
  // JSON.stringify() = 배열/객체를 문자열로 변환
  // [{ date: "..." }] → '[{"date":"..."}]'
  // setItem("키", "값") = 키-값 쌍으로 저장. 같은 키면 덮어씀

  // ── 저장 완료 메시지 표시 ──
  saveFeedback.textContent = "저장됐어요 ✓";

  // ── 입력창 비우기 ──
  thoughtInput.value = "";

  // ── 저장 직후 기록 목록 바로 갱신 ──
  renderHistory();
  // 이 함수는 아래에 정의되어 있음. 저장할 때마다 목록을 새로 그림

  // ── 해설이 있는 명제면 "철학자의 관점 보기" 버튼을 화면에 나타냄 ──
  if (todayProposition.commentary !== "") {
    commentaryBtn.style.display = "inline";
    // style.display = "inline" : display:none 으로 숨겨져 있던 버튼을 보이게 함
    // "inline" = 버튼이 텍스트처럼 한 줄에 놓임 (줄 전체를 차지하지 않음)
  }
});


// ─────────────────────────────────────────────
// 4-1: 오늘 명제의 해설을 미리 채워두기 + 버튼 토글 연결
// ─────────────────────────────────────────────

// commentary 필드가 비어있지 않으면 commentary-text 자리에 내용을 채워둠
// (버튼은 아직 숨김 상태 — 저장 후에만 나타남)
if (todayProposition.commentary !== "") {
  document.getElementById("commentary-text").textContent = todayProposition.commentary;
}

// "철학자의 관점 보기" 버튼 클릭 시 해설 박스를 열었다 닫았다
commentaryBtn.addEventListener("click", function () {
  // commentaryBox가 현재 숨겨진 상태라면 → 열기
  if (commentaryBox.style.display === "none") {
    commentaryBox.style.display = "block";
    // "block" = 요소가 한 줄 전체를 차지하며 나타남
    commentaryBtn.textContent = "철학자의 관점 닫기";
    // 버튼 텍스트도 상태에 맞게 바꿔줌
  } else {
    // 이미 열려 있다면 → 닫기
    commentaryBox.style.display = "none";
    commentaryBtn.textContent = "철학자의 관점 보기";
  }
});


// ─────────────────────────────────────────────
// (기존) 출처가 불확실한 명제라면 경고 표시를 추가
// ─────────────────────────────────────────────

// 출처가 불확실한 명제라면 경고 표시를 추가
if (todayProposition.uncertain === true) {
  // if (조건) { } = 조건이 참일 때만 {} 안을 실행
  const noteElement = document.createElement("p");
  // document.createElement("태그명") = 새 HTML 요소를 메모리 안에 만듦 (아직 화면엔 안 보임)

  noteElement.textContent = todayProposition.note;
  // 만든 요소에 텍스트를 넣음

  document.getElementById("proposition-section").appendChild(noteElement);
  // .appendChild() = 지정한 요소 안에 새 요소를 추가해서 화면에 나타나게 함
}


// ─────────────────────────────────────────────
// 5단계: 과거 기록 불러와서 화면에 표시
// ─────────────────────────────────────────────

function renderHistory() {
  // function 함수이름() { } = 나중에 필요할 때 호출할 수 있는 코드 묶음
  // renderHistory = "기록을 (다시) 그린다"는 뜻

  const historyList = document.getElementById("history-list");
  // index.html의 <ul id="history-list"> 요소를 찾아옴

  // ── 목록을 일단 깨끗하게 비우기 ──
  historyList.innerHTML = "";
  // innerHTML = "" 은 해당 요소 안의 내용을 전부 삭제
  // 저장할 때마다 이 함수를 다시 호출하므로, 중복 표시를 막으려면 먼저 비워야 함

  // ── localStorage에서 저장된 기록 꺼내오기 ──
  const savedRaw = localStorage.getItem("philosophy-entries");
  // getItem("키") = 해당 키로 저장된 값을 꺼냄. 아무것도 없으면 null 반환
  // savedRaw는 아직 문자열 상태 → '[{"date":"...","thought":"..."},...]'

  // ── 기록이 하나도 없을 때 안내 메시지 표시 ──
  if (savedRaw === null) {
    const emptyMsg = document.createElement("li");
    emptyMsg.textContent = "아직 기록이 없어요. 오늘의 문장에 첫 생각을 남겨보세요.";
    historyList.appendChild(emptyMsg);
    return;
    // return = 여기서 함수 종료. 아래 코드는 실행 안 됨
  }

  const entries = JSON.parse(savedRaw);
  // JSON.parse() = 문자열을 JavaScript 배열로 되돌림
  // '[{"date":"..."}]' → [{ date: "..." }, ...]

  if (entries.length === 0) {
    // .length = 배열 안의 항목 수. 0이면 비어 있음
    const emptyMsg = document.createElement("li");
    emptyMsg.textContent = "아직 기록이 없어요. 오늘의 문장에 첫 생각을 남겨보세요.";
    historyList.appendChild(emptyMsg);
    return;
  }

  // ── 기록이 있으면 하나씩 화면에 추가 ──
  // entries는 저장할 때 unshift()로 맨 앞에 넣었으므로 이미 최신순 정렬 상태
  entries.forEach(function (entry, index) {
    // forEach의 두 번째 파라미터 index = 이 항목이 배열의 몇 번째인지 (0부터 시작)
    // index 0 = 가장 최신 기록. 수정할 때 "배열의 몇 번째를 바꿀지" 알기 위해 필요

    // ── 목록 항목 뼈대 ──
    const li = document.createElement("li");

    // ── 날짜 줄 ──
    const dateEl = document.createElement("p");
    dateEl.textContent = entry.date;

    // ── 명제 줄 ──
    const propositionEl = document.createElement("p");
    propositionEl.textContent = "「" + entry.propositionText + "」 — " + entry.philosopher;

    // ── 내가 쓴 생각 줄 ──
    const thoughtEl = document.createElement("p");
    thoughtEl.textContent = entry.thought;

    // ── 카드 오른쪽 위 즐겨찾기 별 버튼 ──
    const histFavBtn = document.createElement("button");
    histFavBtn.className = "history-fav-btn";
    histFavBtn.dataset.propId = entry.propositionId;
    // dataset.propId = 이 버튼에 "어떤 명제의 버튼인지" 데이터를 심어둠
    // HTML에서 data-prop-id="4" 처럼 보임
    // 나중에 querySelectorAll(".history-fav-btn[data-prop-id='4']") 로 같은 명제 버튼 전부 찾을 때 씀

    const isFav = getFavorites().includes(entry.propositionId);
    // 이 명제가 현재 즐겨찾기 목록에 있는지 확인
    histFavBtn.textContent = isFav ? "★" : "☆";
    // 조건 ? A : B = 조건이 true면 A, false면 B (삼항 연산자)
    if (isFav) histFavBtn.classList.add("favorited");

    histFavBtn.addEventListener("click", function () {
      const propId = entry.propositionId;
      const currentFavs = getFavorites();

      if (currentFavs.includes(propId)) {
        // 즐겨찾기 해제
        const updated = currentFavs.filter(function (fav) { return fav !== propId; });
        localStorage.setItem("philosophy-favorites", JSON.stringify(updated));
        updateHistoryStars(propId, false);
        // 오늘 명제와 같으면 메인 별 버튼도 동기화
        if (propId === todayProposition.id) {
          favoriteBtn.textContent = "☆";
          favoriteBtn.classList.remove("favorited");
        }
      } else {
        // 즐겨찾기 추가
        currentFavs.push(propId);
        localStorage.setItem("philosophy-favorites", JSON.stringify(currentFavs));
        updateHistoryStars(propId, true);
        if (propId === todayProposition.id) {
          favoriteBtn.textContent = "★";
          favoriteBtn.classList.add("favorited");
        }
      }

      renderFavorites();
      // 즐겨찾기 섹션 즉시 갱신
    });

    // ── 만든 요소들을 li 안에 차례로 넣기 ──
    li.appendChild(dateEl);
    li.appendChild(propositionEl);
    li.appendChild(thoughtEl);
    li.appendChild(histFavBtn);
    // 별 버튼은 CSS로 absolute 위치 지정돼 있어서 appendChild 순서가 시각적 위치에 영향 없음

    // ── 수정 흔적 배지: 수정한 기록에만 표시 ──
    if (entry.edited === true) {
      const editedBadge = document.createElement("p");
      editedBadge.className = "edited-badge";
      // className = CSS에서 .edited-badge 로 스타일 적용

      const d = new Date(entry.editedAt);
      // new Date(숫자) = 밀리초 timestamp를 날짜/시간 객체로 변환
      // 예: new Date(1749843200000) → "2026년 6월 13일 17시 30분" 같은 형태로 분해 가능

      const editedTimeStr = (d.getMonth() + 1) + "월 "
                          + d.getDate() + "일 "
                          + d.getHours() + "시 "
                          + String(d.getMinutes()).padStart(2, "0") + "분";
      // d.getMonth() = 0~11 반환 → +1 해야 1~12
      // d.getDate()  = 일 (1~31)
      // d.getHours() = 시 (0~23)
      // d.getMinutes() = 분 (0~59). padStart(2,"0") = 한 자리 수를 "05" 형태로 맞춤

      editedBadge.textContent = "수정됨 · " + editedTimeStr;
      li.appendChild(editedBadge);
    }

    // ── 수정 버튼: 저장 후 1시간 이내인 항목에만 표시 ──
    const oneHour = 60 * 60 * 1000;
    // 1시간을 밀리초로 환산: 60분 × 60초 × 1000ms = 3,600,000

    const canEdit = entry.savedAt && (Date.now() - entry.savedAt) < oneHour;
    // entry.savedAt  = 저장 당시 timestamp (없으면 undefined → falsy → canEdit = false)
    // Date.now()     = 지금 이 순간의 timestamp
    // 경과 시간(ms)이 oneHour보다 작을 때만 true

    if (canEdit) {
      const editBtn = document.createElement("button");
      editBtn.textContent = "수정";
      editBtn.className = "edit-btn";

      editBtn.addEventListener("click", function () {
        showEditMode(li, index, entry.thought);
      });

      li.appendChild(editBtn);
    }

    // ── 완성된 li를 목록(ul)에 추가해서 화면에 표시 ──
    historyList.appendChild(li);
  });
}

// ─────────────────────────────────────────────
// 6단계: 수정 모드 — 카드를 편집 가능 상태로 전환
// ─────────────────────────────────────────────

function showEditMode(li, index, currentThought) {
  // li           = 편집 모드로 바꿀 카드(<li> 요소)
  // index        = localStorage 배열에서 이 항목의 위치
  // currentThought = 현재 저장된 텍스트 (textarea에 미리 채워둘 내용)

  // ── 기존 "수정" 버튼 제거 ──
  const editBtn = li.querySelector(".edit-btn");
  // .querySelector(".edit-btn") = li 안에서 클래스가 "edit-btn"인 요소를 찾음
  li.removeChild(editBtn);

  // ── 생각 텍스트(<p>)를 편집 가능한 textarea로 교체 ──
  const thoughtEl = li.querySelector("p:last-of-type");
  // "p:last-of-type" = li 안의 <p> 태그 중 마지막 것 (= 내가 쓴 생각 줄)

  const textarea = document.createElement("textarea");
  textarea.value = currentThought;   // 기존 내용을 textarea에 미리 채워둠
  textarea.rows = 4;
  textarea.className = "edit-textarea";

  li.replaceChild(textarea, thoughtEl);
  // replaceChild(새 요소, 교체할 요소) = thoughtEl을 textarea로 바꿔치기

  // ── "저장" 버튼 ──
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "저장";
  saveBtn.className = "save-edit-btn";

  saveBtn.addEventListener("click", function () {
    const newText = textarea.value.trim();
    if (newText === "") {
      return;   // 빈 칸이면 저장 안 함
    }
    saveEditedThought(index, newText);
    // index 위치의 항목을 newText로 업데이트하고 화면을 다시 그림
  });

  // ── "취소" 버튼 ──
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "취소";
  cancelBtn.className = "cancel-edit-btn";

  cancelBtn.addEventListener("click", function () {
    renderHistory();
    // 수정 내용 버리고 화면을 원래대로 다시 그림
  });

  li.appendChild(saveBtn);
  li.appendChild(cancelBtn);
}


function saveEditedThought(index, newText) {
  // index   = 수정할 항목이 배열의 몇 번째인지
  // newText = 사용자가 새로 입력한 텍스트

  // ── localStorage에서 전체 기록 불러오기 ──
  const savedRaw = localStorage.getItem("philosophy-entries");
  if (savedRaw === null) return;   // 기록이 없으면 아무것도 안 함

  const entries = JSON.parse(savedRaw);

  // ── 해당 항목의 thought만 새 텍스트로 교체, 수정 흔적 기록 ──
  entries[index].thought   = newText;
  // .thought = 그 객체 안의 thought 필드만 골라서 바꿈
  // 나머지 필드(date, propositionText 등)는 그대로 유지됨

  entries[index].edited    = true;
  // edited = true → renderHistory가 "수정됨" 배지를 표시하는 조건

  entries[index].editedAt  = Date.now();
  // editedAt = 수정한 이 순간의 timestamp → 배지에 "수정됨 · 6월 7일 14시 03분" 식으로 표시

  // ── 수정된 배열을 localStorage에 다시 저장 ──
  localStorage.setItem("philosophy-entries", JSON.stringify(entries));

  // ── 화면 새로 그리기 ──
  renderHistory();
  // 수정된 내용이 바로 반영되어 보임
}


// ─────────────────────────────────────────────
// 6-1단계: history 별 버튼 일괄 동기화 헬퍼
// ─────────────────────────────────────────────

function updateHistoryStars(propId, isFavorited) {
  // propId      = 동기화할 명제 id
  // isFavorited = true면 ★로, false면 ☆로 바꿈

  const selector = ".history-fav-btn[data-prop-id='" + propId + "']";
  // selector = CSS 선택자 문자열
  // ".history-fav-btn"         → 클래스가 history-fav-btn인 요소
  // "[data-prop-id='숫자']"    → data-prop-id 속성이 이 숫자인 요소
  // 두 조건을 합치면 "이 명제 id를 가진 history 별 버튼 전부"를 의미

  document.querySelectorAll(selector).forEach(function (btn) {
    // querySelectorAll = 조건에 맞는 요소를 전부 찾아 목록으로 반환
    // (getElementById는 하나, querySelectorAll은 여러 개)
    btn.textContent = isFavorited ? "★" : "☆";
    if (isFavorited) {
      btn.classList.add("favorited");
    } else {
      btn.classList.remove("favorited");
    }
  });
}


// ─────────────────────────────────────────────
// 7단계: 즐겨찾기 섹션 그리기
// ─────────────────────────────────────────────

function renderFavorites() {
  const favoritesList = document.getElementById("favorites-list");

  // ── 목록 초기화 ──
  favoritesList.innerHTML = "";

  const favIds = getFavorites();
  // getFavorites() = 앞에서 만들어둔 함수. localStorage에서 id 배열을 반환

  // ── 즐겨찾기가 없을 때 안내 ──
  if (favIds.length === 0) {
    const emptyMsg = document.createElement("li");
    emptyMsg.textContent = "아직 즐겨찾기한 문장이 없어요.";
    emptyMsg.className = "favorites-empty";
    // className = CSS의 .favorites-empty 스타일(점선 테두리, 중앙 정렬) 적용
    favoritesList.appendChild(emptyMsg);
    return;
  }

  // ── 즐겨찾기된 명제를 하나씩 카드로 그리기 ──
  favIds.forEach(function (id) {

    const prop = PROPOSITIONS.find(function (p) { return p.id === id; });
    // PROPOSITIONS.find() = 배열에서 조건을 만족하는 첫 번째 항목 하나를 반환
    // p.id === id → id가 일치하는 명제 객체를 찾음
    // (filter가 조건 맞는 것 전부를 새 배열로 반환하는 것과 달리, find는 하나만 반환)

    if (!prop) return;
    // !prop = prop이 undefined인 경우 (propositions.js에서 해당 id가 삭제됐을 때)
    // return = 이 항목은 건너뛰고 다음 id로 진행

    const li = document.createElement("li");

    // ── 명제 텍스트 줄 ──
    const textEl = document.createElement("p");
    textEl.textContent = "「" + prop.text + "」";

    // ── 철학자 이름 줄 ──
    const philosopherEl = document.createElement("p");
    philosopherEl.textContent = "— " + prop.philosopher;

    // ── ★ 해제 버튼 ──
    const unfavoriteBtn = document.createElement("button");
    unfavoriteBtn.textContent = "★";
    unfavoriteBtn.className = "unfavorite-btn";
    unfavoriteBtn.setAttribute("aria-label", "즐겨찾기 해제");

    unfavoriteBtn.addEventListener("click", function () {
      // ── localStorage에서 이 id 제거 ──
      const currentFavs = getFavorites();
      const updated = currentFavs.filter(function (fav) { return fav !== id; });
      localStorage.setItem("philosophy-favorites", JSON.stringify(updated));

      // ── 오늘 명제를 해제한 경우 → 위쪽 메인 별 버튼도 ☆로 동기화 ──
      if (id === todayProposition.id) {
        favoriteBtn.textContent = "☆";
        favoriteBtn.classList.remove("favorited");
        // 두 별이 따로 노는 것처럼 보이지 않도록 동기화
      }

      renderFavorites();   // 목록 다시 그림 → 해제된 카드가 사라짐
    });

    li.appendChild(textEl);
    li.appendChild(philosopherEl);
    li.appendChild(unfavoriteBtn);
    favoritesList.appendChild(li);
  });
}


// ─────────────────────────────────────────────
// 8단계: 탭 전환
// ─────────────────────────────────────────────

const tabBtns   = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");
// querySelectorAll = 조건에 맞는 요소 전부를 목록(NodeList)으로 반환
// tabBtns   = [오늘 버튼, 저장소 버튼, ...]  — 탭 개수만큼 자동으로 담김
// tabPanels = [panel-today, panel-archive, ...] — 동일

tabBtns.forEach(function (btn) {
  // 모든 탭 버튼에 클릭 리스너를 붙이는 loop
  // 탭이 10개여도 이 코드는 그대로 — 하드코딩 없음

  btn.addEventListener("click", function () {

    // ① 모든 버튼·패널 비활성화
    tabBtns.forEach(function (b) { b.classList.remove("active"); });
    tabPanels.forEach(function (p) { p.classList.remove("active"); });
    // classList.remove("active") = active 클래스를 제거 → 버튼은 흐려지고 패널은 숨겨짐

    // ② 클릭된 버튼만 활성화
    btn.classList.add("active");

    // ③ 버튼의 data-panel 값으로 열 패널을 찾아서 활성화
    const panelId = btn.dataset.panel;
    // btn.dataset.panel = HTML의 data-panel="panel-today" 값을 읽음
    // 예: "panel-today"

    document.getElementById(panelId).classList.add("active");
    // getElementById로 패널 div를 찾아 active 클래스 추가 → display: block 으로 나타남
  });
});

// 페이지 열릴 때 첫 번째 탭(오늘)을 기본으로 활성화
tabBtns[0].click();
// tabBtns[0] = 목록의 첫 번째 버튼 (HTML에서 맨 위에 있는 탭)
// .click()   = 이 버튼을 코드로 클릭한 것과 동일한 효과 — 위의 클릭 리스너가 실행됨


// ── 페이지가 열릴 때 바로 기록 목록 표시 ──
renderHistory();
// 이 한 줄이 없으면, 저장을 눌러야만 기록이 보임
// 이 한 줄이 있으면, 새로고침해도 localStorage에서 기록을 불러와 즉시 표시

// ── 페이지가 열릴 때 즐겨찾기 섹션도 바로 표시 ──
renderFavorites();
