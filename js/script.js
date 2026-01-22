// 모든 DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    console.log("MES 시스템 로드 완료");

    // 초기 함수 호출
    initNavigation();
    initRealtimeFeatures();
    renderLineStatus();
    renderPlanTable();
    initPlanForm();
    initThemeMode(); // 🌙 나이트 모드 기능 초기화 추가
});

// [추가] 0. 나이트 모드 전환 로직
function initThemeMode() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // 로컬 스토리지 확인하여 기존 설정 적용
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        if (themeToggle) themeToggle.innerText = '☀️ 낮 모드';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            
            if (body.classList.contains('dark-mode')) {
                themeToggle.innerText = '☀️ 낮 모드';
                localStorage.setItem('theme', 'dark');
                addLog('INFO', '나이트 모드가 활성화되었습니다.');
            } else {
                themeToggle.innerText = '🌙 나이트 모드';
                localStorage.setItem('theme', 'light');
                addLog('INFO', '라이트 모드가 활성화되었습니다.');
            }
        });
    }
}

// 1. 메뉴 클릭 시 화면 전환 로직
function initNavigation() {
    const menuItems = document.querySelectorAll('#menu-list li');
    const views = document.querySelectorAll('.content-view');
    const titleElem = document.getElementById('menu-title');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');

            menuItems.forEach(m => m.classList.remove('active'));
            item.classList.add('active');

            views.forEach(v => {
                v.classList.remove('active');
                v.style.display = 'none'; 
            });

            const targetView = document.getElementById(targetId);
            if (targetView) {
                targetView.classList.add('active');
                targetView.style.display = 'block'; 
                titleElem.innerText = item.innerText;
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
            addLog('INFO', `새 생산 지시 등록: ${newItem.item}`);
        });
    }
}

// 로그 관련 시스템
function addLog(type, message) {
    const logContainer = document.getElementById('log-container');
    if (!logContainer) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = `
        <span class="log-time">[${timeStr}]</span>
        <span class="type-${type.toLowerCase()}">[${type}]</span>
        <span class="log-msg">${message}</span>
    `;
    
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// 2초마다 랜덤 로그 및 상태 업데이트 시뮬레이션
setInterval(() => {
    const events = [
        {type: 'INFO', msg: 'Production Line #3 data received.'},
        {type: 'INFO', msg: 'User "admin" logged in.'},
        {type: 'ERROR', msg: 'Sensor timeout at Station B7.'},
        {type: 'INFO', msg: 'Batch report generated: #B20240114.'}
    ];
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    addLog(randomEvent.type, randomEvent.msg);

    // CPU 바 업데이트 시뮬레이션 (요소가 있는 경우만)
    const cpuBar = document.getElementById('cpu-bar');
    const cpuText = document.getElementById('cpu-text');
    if (cpuBar && cpuText) {
        const cpu = Math.floor(Math.random() * 100);
        cpuBar.style.width = cpu + '%';
        cpuText.innerText = cpu + '%';
    }
}, 3000);