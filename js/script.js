// 모든 DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    console.log("MES 시스템 로드 완료");

    // 초기 함수 호출
    initNavigation();
    initRealtimeFeatures();
    renderLineStatus();
    renderPlanTable();
    initPlanForm();
    initThemeMode();
    
    // 신규 추가 기능 초기화
    initProductionChart(); // 📊 차트
    updateProcessWIP();    // 🔄 공정현황 데이터
    initAlertSystem();     // ⚠️ 알림바 제어
});

// 1. 메뉴 클릭 시 화면 전환 로직 (클릭 이슈 해결 버전)
function initNavigation() {
    const menuItems = document.querySelectorAll('#menu-list li');
    const views = document.querySelectorAll('.content-view');
    const titleElem = document.getElementById('menu-title');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            if (!targetId) return;

            // 메뉴 활성화 상태 변경
            menuItems.forEach(m => m.classList.remove('active'));
            item.classList.add('active');

            // 모든 뷰 숨기기 (애니메이션과 충돌 방지 위해 display 속성 초기화)
            views.forEach(v => {
                v.classList.remove('active');
                v.style.display = 'none'; 
            });

            // 선택한 뷰 보이기
            const targetView = document.getElementById(targetId);
            if (targetView) {
                targetView.classList.add('active');
                targetView.style.display = 'block'; 
                titleElem.innerText = item.innerText;
                
                // 차트가 있는 대시보드로 복귀 시 차트 리사이즈 (크기 깨짐 방지)
                if (targetId === 'view-dashboard') {
                    const chartInstance = Chart.getChart("productionChart");
                    if (chartInstance) chartInstance.resize();
                }
            } else {
                console.error(`ID가 ${targetId}인 섹션을 찾을 수 없습니다.`);
            }
        });
    });
}

// 2. [추가] 실시간 생산 추이 차트 (Chart.js)
function initProductionChart() {
    const ctx = document.getElementById('productionChart');
    if (!ctx) return;

    const prodChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['09시', '10시', '11시', '12시', '13시', '14시', '15시'],
            datasets: [{
                label: '실시간 생산량',
                data: [150, 230, 180, 290, 200, 250, 184],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
}

// 3. [추가] 공정 관리(WIP) 수치 실시간 업데이트
function updateProcessWIP() {
    const steps = document.querySelectorAll('.step strong');
    if (steps.length === 0) return;

    setInterval(() => {
        steps.forEach(step => {
            let currentWIP = parseInt(step.innerText.replace(/,/g, ''));
            let change = Math.floor(Math.random() * 5) - 2; // -2 ~ +2 변동
            step.innerText = Math.max(0, currentWIP + change).toLocaleString();
        });
    }, 4000);
}

// 4. [추가] 알림 배너 마우스 제어
function initAlertSystem() {
    const banner = document.querySelector('.alert-banner marquee');
    if (banner) {
        banner.addEventListener('mouseover', () => banner.stop());
        banner.addEventListener('mouseout', () => banner.start());
    }
}

// --- 이하 기존 로직 유지 (실시간 시계, 테마, 폼 등) ---

function initThemeMode() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        if (themeToggle) themeToggle.innerText = '☀️ 낮 모드';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            themeToggle.innerText = isDark ? '☀️ 낮 모드' : '🌙 나이트 모드';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            addLog('INFO', `${isDark ? '나이트' : '라이트'} 모드가 활성화되었습니다.`);
        });
    }
}

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

function addLog(type, message) {
    const logContainer = document.getElementById('log-container');
    if (!logContainer) return;
    const now = new Date();
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = `<span class="log-time">[${now.toLocaleTimeString()}]</span> <span class="type-${type.toLowerCase()}">[${type}]</span> <span class="log-msg">${message}</span>`;
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
}