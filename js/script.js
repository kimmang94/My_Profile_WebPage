// 모든 DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    console.log("MES 시스템 로드 완료"); // 브라우저 콘솔(F12)에서 확인용

    // 초기 함수 호출
    initNavigation();
    initRealtimeFeatures();
    renderLineStatus();
    renderPlanTable();
    initPlanForm();
});

// 1. 메뉴 클릭 시 화면 전환 로직
function initNavigation() {
    const menuItems = document.querySelectorAll('#menu-list li');
    const views = document.querySelectorAll('.content-view');
    const titleElem = document.getElementById('menu-title');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            console.log("클릭된 메뉴 target:", targetId); // 클릭 확인용

            // 1. 모든 메뉴에서 active 클래스 제거 후 클릭한 메뉴에 추가
            menuItems.forEach(m => m.classList.remove('active'));
            item.classList.add('active');

            // 2. 모든 섹션 숨기기
            views.forEach(v => {
                v.classList.remove('active');
                v.style.display = 'none'; // 확실하게 숨김
            });

            // 3. 대상 섹션 보이기
            const targetView = document.getElementById(targetId);
            if (targetView) {
                targetView.classList.add('active');
                targetView.style.display = 'block'; // 확실하게 보임
                titleElem.innerText = item.innerText;
            } else {
                console.error("해당 ID를 가진 섹션을 찾을 수 없습니다:", targetId);
            }
        });
    });
}

// 2. 실시간 시계 및 데이터 업데이트
function initRealtimeFeatures() {
    const timeElem = document.getElementById('current-time');
    const prodElem = document.getElementById('realtime-prod');

    setInterval(() => {
        const now = new Date();
        if (timeElem) timeElem.innerText = now.toLocaleString();

        if (prodElem) {
            let currentVal = parseInt(prodElem.innerText.replace(/,/g, ''));
            if (Math.random() > 0.7) {
                prodElem.innerText = (currentVal + 1).toLocaleString();
            }
        }
    }, 1000);
}

// 3. 대시보드 라인 데이터 렌더링
function renderLineStatus() {
    const lines = [
        { name: "1호 라인", status: "가동중", time: "08:22:10", target: 800, actual: 750 },
        { name: "2호 라인", status: "가동중", time: "10:15:45", target: 800, actual: 620 },
        { name: "3호 라인", status: "비가동", time: "00:00:00", target: 500, actual: 0 }
    ];

    const tableBody = document.getElementById('line-table');
    if (tableBody) {
        tableBody.innerHTML = lines.map(line => `
            <tr>
                <td>${line.name}</td>
                <td><span class="badge ${line.status === '가동중' ? 'bg-green' : 'bg-red'}">${line.status}</span></td>
                <td>${line.time}</td>
                <td>${line.target}</td>
                <td><strong>${line.actual}</strong></td>
            </tr>
        `).join('');
    }
}

// 4. 생산 계획 데이터 및 렌더링
let plans = [
    { id: 'PLN-20260113-01', item: 'CPU 쿨러 팬', qty: 10000, date: '2026-01-20', priority: '긴급', status: '진행중' },
    { id: 'PLN-20260113-02', item: '알루미늄 방열판', qty: 5000, date: '2026-01-22', priority: '보통', status: '대기' }
];

function renderPlanTable() {
    const tbody = document.getElementById('plan-table-body');
    if (tbody) {
        tbody.innerHTML = plans.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>${p.item}</td>
                <td>${p.qty.toLocaleString()}</td>
                <td>${p.date}</td>
                <td><span class="badge ${p.priority === '긴급' ? 'bg-red' : 'bg-blue'}">${p.priority}</span></td>
                <td class="${p.status === '진행중' ? 'status-running' : 'status-waiting'}">${p.status}</td>
            </tr>
        `).join('');
    }
}

// 5. 폼 등록 이벤트
function initPlanForm() {
    const form = document.getElementById('plan-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const newItem = {
                id: 'PLN-' + new Date().getTime().toString().slice(-6),
                item: document.getElementById('plan-item').value,
                qty: parseInt(document.getElementById('plan-qty').value),
                date: document.getElementById('plan-date').value,
                priority: document.getElementById('plan-priority').value,
                status: '대기'
            };
            plans.unshift(newItem);
            renderPlanTable();
            this.reset();
        });
    }
}