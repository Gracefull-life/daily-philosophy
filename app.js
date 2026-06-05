// app.js
// 앱의 두뇌 역할. 화면에 데이터를 불러오고 표시하는 모든 동작을 담당함
// 이 파일은 propositions.js가 먼저 로드된 뒤에 실행됨 (index.html에서 순서가 중요)

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
    thought:          thoughtText
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
    emptyMsg.textContent = "아직 기록이 없어요. 오늘의 명제에 첫 생각을 남겨보세요.";
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
    emptyMsg.textContent = "아직 기록이 없어요. 오늘의 명제에 첫 생각을 남겨보세요.";
    historyList.appendChild(emptyMsg);
    return;
  }

  // ── 기록이 있으면 하나씩 화면에 추가 ──
  // entries는 저장할 때 unshift()로 맨 앞에 넣었으므로 이미 최신순 정렬 상태
  entries.forEach(function (entry) {
    // .forEach() = 배열의 각 항목을 순서대로 꺼내서 함수에 넘김
    // entry = 현재 처리 중인 항목 하나 (날짜, 명제, 생각 등을 가진 객체)

    // ── 목록 항목 뼈대 ──
    const li = document.createElement("li");
    // <li> 요소를 메모리에 만듦 (아직 화면엔 없음)

    // ── 날짜 줄 ──
    const dateEl = document.createElement("p");
    dateEl.textContent = entry.date;
    // entry.date = "2026년 5월 28일" 같은 값

    // ── 명제 줄 ──
    const propositionEl = document.createElement("p");
    propositionEl.textContent = "「" + entry.propositionText + "」 — " + entry.philosopher;
    // 「」 = 글을 인용할 때 쓰는 따옴표 모양 기호

    // ── 내가 쓴 생각 줄 ──
    const thoughtEl = document.createElement("p");
    thoughtEl.textContent = entry.thought;

    // ── 만든 요소들을 li 안에 차례로 넣기 ──
    li.appendChild(dateEl);
    li.appendChild(propositionEl);
    li.appendChild(thoughtEl);

    // ── 완성된 li를 목록(ul)에 추가해서 화면에 표시 ──
    historyList.appendChild(li);
  });
}

// ── 페이지가 열릴 때 바로 기록 목록 표시 ──
renderHistory();
// 이 한 줄이 없으면, 저장을 눌러야만 기록이 보임
// 이 한 줄이 있으면, 새로고침해도 localStorage에서 기록을 불러와 즉시 표시
