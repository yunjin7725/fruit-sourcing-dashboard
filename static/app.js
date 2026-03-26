document.addEventListener('DOMContentLoaded', () => {
    // ---- TABS LOGIC ----
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.add('hidden'));

            // Set active to clicked
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            document.getElementById(targetId).classList.remove('hidden');

            if (targetId === 'sourcing-calendar') {
                loadSeasonality(document.getElementById('calendar-date').value);
            } else if (targetId === 'price-comparison') {
                if (!window.globalSeasonData) {
                    loadSeasonality(document.getElementById('calendar-date').value);
                }
                setTimeout(renderPriceComparison, 300);
            } else if (targetId === 'coupang-benchmarking') {
                renderCoupangBenchmarking();
            }
        });
    });

    // ---- CALENDAR LOGIC ----
    const today = new Date().toISOString().split('T')[0];
    const calDateInput = document.getElementById('calendar-date');
    calDateInput.value = today;

    document.getElementById('calc-season-btn').addEventListener('click', () => {
        loadSeasonality(calDateInput.value);
    });

    function loadSeasonality(dateStr) {
        fetch(`/api/season?date=${dateStr}`)
            .then(res => res.json())
            .then(data => {
                window.globalSeasonData = data;
                const renderList = (id, items) => {
                    const ul = document.getElementById(id);
                    ul.innerHTML = '';
                    if (items.length === 0) {
                        ul.innerHTML = '<li>해당되는 품목이 없습니다.</li>';
                    } else {
                        items.forEach(item => {
                            const li = document.createElement('li');
                            li.textContent = item;
                            ul.appendChild(li);
                        });
                    }
                };

                renderList('prepare-list', data.prepare);
                renderList('selling-list', data.selling);
                renderList('drop-list', data.drop);

                if (document.querySelector('.tab-btn[data-tab="price-comparison"]').classList.contains('active')) {
                    renderPriceComparison();
                }
                setTimeout(renderAiSourcingGuide, 100);
            });
    }

    const bestSellingSizes = {
        '사과':      '3kg, 5kg',          // 4~10개입이 가정용 최적
        '배':        '5kg, 7.5kg',         // 6~10개 선물세트
        '복숭아':    '2kg, 3kg',           // 여름 제철, 2kg 소박스 인기
        '포도':      '2kg',                // 송이포도 2kg 기본
        '샤인머스캣': '1.5kg, 2kg',        // 선물용 프리미엄
        '감귤':      '3kg, 5kg',           // 가정용 3kg·선물 5kg
        '단감':      '3kg, 5kg',           // 가정 박스 단위
        '참다래':    '2kg, 3kg',           // 키위 소포장
        '키위':      '2kg, 3kg',
        '토마토':    '2kg, 3kg',           // 가정용 2~3kg
        '방울토마토': '500g, 1kg',          // 소포장 1kg 인기
        '수박':      '4kg, 6kg',           // 반통·소형수박
        '참외':      '3kg, 5kg',           // 성주참외 박스
        '딸기':      '500g, 750g',         // 소포장 딸기 (플랫폼 베스트)
        '멜론':      '2개입, 4kg',         // 개당 무게 약 1.5~2kg
        '망고':      '2개입, 4개입',       // 애플망고 낱개 선물용
        '오렌지':    '3kg, 5kg',           // 수입 오렌지 박스
        '파인애플':  '1개(약 1.2kg), 2개입', // 낱개 또는 2개 포장
        '체리':      '500g, 1kg',          // 수입 체리 소포장
        '바나나':    '1.5kg, 3kg',         // 가정용 소분 (13kg은 도매 박스 단위)
        '레몬':      '500g, 1kg',          // 수입 레몬 소포장
        '자몽':      '3개입, 5개입',       // 낱개 포장
        '아보카도':  '3개입, 5개입',       // 낱개 포장
    };

    function renderAiSourcingGuide() {
        if (!window.globalSeasonData) return;
        const guideDiv = document.getElementById('ai-sourcing-guide');
        
        let combined = [];
        if (window.globalSeasonData.selling) {
             combined = combined.concat(window.globalSeasonData.selling.map(item => ({name: item.split('(')[0].trim(), type: '🔥 현재 성수기 (판매 집중)'})));
        }
        if (window.globalSeasonData.prepare) {
             combined = combined.concat(window.globalSeasonData.prepare.map(item => ({name: item.split('(')[0].trim(), type: '🚨 소싱 준비 요망 (컨택/테스트)'})));
        }

        let uniqueList = [];
        let seenNames = new Set();
        combined.forEach(obj => {
            if(!seenNames.has(obj.name)) {
                seenNames.add(obj.name);
                uniqueList.push(obj);
            }
        });

        if (uniqueList.length === 0) {
            guideDiv.innerHTML = '<div style="color:#888; text-align:center;">이번 주 데이터 기반 추천 품목이 없습니다.</div>';
            return;
        }
        
        let html = '';
        uniqueList.forEach((obj, idx) => {
            let name = obj.name;
            let typeColor = obj.type.includes('성수기') ? '#FFD56F' : '#00F0FF';
            const keywords = ['#' + name + '산지직송', '#고당도' + name, '#특품' + name, '#가정용' + name].slice(0, 3 + Math.floor(Math.random()*2));
            html += `
            <div class="result-card" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <div style="flex:1">
                    <div style="color:${typeColor}; font-size:0.8rem; margin-bottom:5px; font-weight:bold;">${obj.type}</div>
                    <h4 style="color:#fff; margin-bottom:5px; margin-top:0; font-size:1.15rem;">📌 ${name}</h4>
                    <span style="font-size:0.85rem; color:#ccc;">📦 권장 판매 단위: <span style="color:#fff">${bestSellingSizes[name] || '2kg, 3kg, 5kg'}</span></span>
                </div>
                <div style="flex:2">
                    <span style="font-size:0.85rem; color:#FFD56F;">추천 검색 키워드/태그 전략:</span><br>
                    <span style="color:#fff; font-size:0.9rem;">${keywords.join(' ')}</span>
                </div>
            </div>`;
        });
        guideDiv.innerHTML = html;
    }

    // Load initial season data
    loadSeasonality(today);

    // ---- SIMULATOR LOGIC ----
    let priceChart = null;

    const fruitSelect = document.getElementById('fruit-select');
    const targetDate = document.getElementById('target-date');
    const weightSelect = document.getElementById('weight-select');
    const targetMargin = document.getElementById('target-margin');
    const updateBtn = document.getElementById('update-date-btn');
    const platformSelect = document.getElementById('platform-select');
    const platformFee = document.getElementById('platform-fee');
    const packingCost = document.getElementById('packing-cost');
    const shippingCost = document.getElementById('shipping-cost');
    const marketingFee = document.getElementById('marketing-fee');

    targetDate.value = today;
    
    if(platformSelect) {
        platformSelect.addEventListener('change', () => {
            if(platformSelect.value !== 'custom') {
                platformFee.value = platformSelect.value;
                recalculateResult();
            }
        });
    }
    const extraInputs = [packingCost, shippingCost, marketingFee];
    extraInputs.forEach(el => {
        if(el) el.addEventListener('input', recalculateResult);
    });

    // Fetch fruits
    fetch('/api/fruits')
        .then(response => response.json())
        .then(data => {
            fruitSelect.innerHTML = '';
            data.forEach(fruit => {
                const opt = document.createElement('option');
                opt.value = JSON.stringify({
                    item_code: fruit.item_code,
                    kind_code: fruit.kind_code,
                    category_code: fruit.category_code,
                    unit_grade: fruit.unit_grade,
                    item_name: fruit.item_name,
                    kind_name: fruit.kind_name
                });
                opt.textContent = fruit.display_name;
                fruitSelect.appendChild(opt);
            });
            setTimeout(fetchData, 100);
        });

    updateBtn.addEventListener('click', fetchData);
    // 품목 변경 시 자동 갱신
    fruitSelect.addEventListener('change', fetchData);

    function fetchData() {
        const val = fruitSelect.value;
        const dateStr = targetDate.value;
        if (!val || !dateStr) return;

        const pcode = JSON.parse(val);

        updateBtn.textContent = '불러오는 중...';
        updateBtn.disabled = true;

        fetch(`/api/price_trend?item_code=${pcode.item_code}&kind_code=${pcode.kind_code}&category_code=${pcode.category_code}&date=${dateStr}`)
            .then(res => res.json())
            .then(data => {
                updateBtn.textContent = '차트 갱신';
                updateBtn.disabled = false;

                // Convert structure to what renderChart/calculateMargin expects
                // data.trend = [{year: '2026', price: 100}, ...]
                // Reverse it so the chart goes chronologically (oldest to newest)
                const trendReversed = [...data.trend].reverse();

                let baseWeight = 1;
                if (pcode.unit_grade && pcode.unit_grade.includes('kg')) {
                    const match = pcode.unit_grade.match(/(\d+(?:\.\d+)?)kg/);
                    if (match) baseWeight = parseFloat(match[1]) || 1;
                }

                for (let i = 1; i < trendReversed.length - 1; i++) {
                    if (trendReversed[i].price === null) {
                        const prev = trendReversed[i-1].price;
                        const next = trendReversed[i+1].price;
                        if (prev !== null && next !== null) {
                            trendReversed[i].price = Math.round((prev + next) / 2);
                        } else if (prev !== null) {
                            trendReversed[i].price = prev;
                        } else if (next !== null) {
                            trendReversed[i].price = next;
                        }
                    }
                }

                const kgTarget = parseFloat(weightSelect.value) || 1;
                const targetWeightPrices = trendReversed.map(t => t.price ? Math.floor((t.price / baseWeight) * kgTarget) : null);
                const base1kgPrices = trendReversed.map(t => t.price ? Math.floor(t.price / baseWeight) : null);
                const labels = trendReversed.map(t => `${t.year}년`);

                const titleEl = document.getElementById('chart-title');
                if (titleEl) {
                    titleEl.textContent = `3개년 가격 트렌드 (${kgTarget}kg 환산 기준)`;
                }

                renderChart({ labels, prices: targetWeightPrices });
                calculateMargin({ prices: base1kgPrices }, pcode.unit_grade, pcode);
                renderPriceComparison();
            })
            .catch(err => {
                console.error(err);
                updateBtn.textContent = '차트 갱신';
                updateBtn.disabled = false;
                alert('데이터 연결 실패');
            });
    }

    function renderChart(data) {
        const ctx = document.getElementById('priceChart').getContext('2d');
        const labels = data.labels;
        const prices = data.prices;

        if (priceChart) priceChart.destroy();

        priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '도매가 (\u20A9)',
                    data: prices,
                    borderColor: '#00F0FF',
                    backgroundColor: 'rgba(0, 240, 255, 0.2)',
                    borderWidth: 3,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#00F0FF',
                    pointRadius: 5,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    fill: true,
                    tension: 0.4,
                    spanGaps: true
                }]
            },
            plugins: [{
                id: 'pointLabels',
                afterDatasetsDraw(chart) {
                    const { ctx } = chart;
                    chart.data.datasets.forEach((dataset, i) => {
                        const meta = chart.getDatasetMeta(i);
                        meta.data.forEach((point, index) => {
                            const val = dataset.data[index];
                            if (val !== null) {
                                ctx.fillStyle = '#fff';
                                ctx.font = 'bold 12px Pretendard, Arial';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'bottom';
                                ctx.fillText(val.toLocaleString(), point.x, point.y - 10);
                            }
                        });
                    });
                }
            }],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#ccc' } },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff'
                    }
                },
                scales: {
                    x: { ticks: { color: '#888' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { ticks: { color: '#888' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                }
            }
        });
    }

    // Global state for saving
    let currentCost = 0;
    let currentSRP = 0;
    let currentPcode = null;
    let b2bPrices = null;

    // Load B2B data once - b2b 로드 완료 후 마진 재계산 트리거
    fetch('/api/b2b_prices').then(res => res.json()).then(data => {
        b2bPrices = data;
        // b2b 데이터가 늦게 로드된 경우, 이미 pcode가 세팅된 상태라면 다시 렌더링
        if (currentPcode && window._lastTrendData) {
            calculateMargin(window._lastTrendData.priceData, window._lastTrendData.unitGrade, currentPcode);
        }
    });

    // 한글 과일명 동의어/별칭 매핑
    const fruitAliases = {
        '사과':    ['사과', '부사', '후지', '홍로', '아오리', '감홍', '양광', '쓰가루'],
        '배':     ['신고배', '원황배', '화산배', '나주배', '배'],
        '딸기':   ['딸기', '설향', '킹스베리', '죽향', '금실'],
        '포도':   ['포도', '캠벨', '샤인머스캣', '거봉'],
        '감귤':   ['감귤', '천혜향', '한라봉', '하우스귤', '노지귤', '귤'],
        '토마토':  ['토마토'],
        '방울토마토': ['방울토마토', '대추 방울토마토', '대추방울토마토'],
        '대추방울토마토': ['방울토마토', '대추 방울토마토', '대추방울토마토'],
        '수박':   ['수박', '하우스수박'],
        '참외':   ['참외'],
        '복숭아':  ['복숭아'],
        '멜론':   ['멜론'],
        '키위':   ['키위', '참다래'],
        '망고':   ['망고', '애플망고'],
        '오렌지':  ['오렌지'],
        '바나나':  ['바나나'],
        '파인애플': ['파인애플'],
        '체리':   ['체리'],
        '레몬':   ['레몬'],
        '자몽':   ['자몽'],
        '아보카도': ['아보카도'],
        '단감':   ['단감'],
    };

    function isFruitMatch(searchName, searchKind, pname) {
        if (!searchName || !pname) return false;
        const pnameLower = pname.replace(/\s/g, '').toLowerCase();

        // 1. 과일 메인 이름 혹은 별칭이 포함되는지 확인
        const aliasArr = fruitAliases[searchName] || [searchName];
        let baseMatch = aliasArr.some(alias => pname.includes(alias));

        if (!baseMatch) return false;

        // 2. 동음이의어/오매칭 필터링
        // 토마토: 방울토마토 포함 상품은 '토마토' 검색 시 제외 (단, searchName이 방울토마토면 허용)
        if (searchName === '토마토' && (pname.includes('방울') || pname.includes('대추'))) return false;
        // 사과: 복숭아가 포함된 경우 제외
        if (searchName === '사과' && pname.includes('복숭아')) return false;
        // 배: '사과배' 같은 복합 제품 제외
        if (searchName === '배' && pname.includes('사과배')) return false;
        // 망고: 건망고는 다른 카테고리
        if (searchName === '망고' && pname.includes('건망고')) return false;

        // 3. 품종(kind) 교차 검증: 선택한 품종과 다른 품종이 명시된 경우 제외
        const varietyMap = {
            '사과': ['후지','부사','홍로','아오리','쓰가루','감홍','양광'],
            '배':  ['신고','원황','화산'],
            '포도': ['캠벨','샤인머스캣','거봉'],
            '딸기': ['설향','킹스베리','죽향','금실'],
            '감귤': ['천혜향','한라봉','하우스귤','노지귤']
        };
        if (searchKind && searchKind !== '전체' && searchKind !== searchName && varietyMap[searchName]) {
            // 동의어 정규화
            let normalKind = searchKind;
            if (searchKind === '후지') normalKind = '부사';
            if (searchKind === '쓰가루') normalKind = '아오리';

            const kindInName = pname.includes(searchKind) || pname.includes(normalKind);
            if (!kindInName) {
                // 내가 원하는 품종과 다른 품종이 이름에 들어있으면 오매칭
                const wrongKind = varietyMap[searchName].some(v =>
                    v !== searchKind && v !== normalKind && pname.includes(v)
                );
                if (wrongKind) return false;
            }
        }

        return true;
    }

    // 중량 문자열에서 kg 수치 추출 ("2.5kg", "500g", "1kg (2개입)" 등 파싱)
    function parseWeightToKg(weightStr) {
        if (!weightStr) return null;
        const s = String(weightStr);
        // "1kg (2개입)" → 첫 번째 숫자+단위만 파싱
        const m = s.match(/(\d+(?:\.\d+)?)(kg|g)/i);
        if (!m) return null;
        const num = parseFloat(m[1]);
        const unit = m[2].toLowerCase();
        return unit === 'g' ? num / 1000 : num;
    }

    // 도매처 전체 매칭 상품 조회 (중량 무관, 1kg당 단가 반환)
    function getB2bMatchedProducts(searchName, searchKind) {
        const vendorDisplayNames = {
            'econfarm':  '도매처 1',
            'mgb2bmall': '도매처 2',
            'hwanggs3':  '도매처 3'
        };
        const results = [];
        if (!b2bPrices) return results;

        for (let vendor in b2bPrices) {
            const displayName = vendorDisplayNames[vendor] || vendor;
            (b2bPrices[vendor] || []).forEach(row => {
                const pname   = String(row['Product Name'] || row['품목명'] || '');
                const pweight = String(row['Weight'] || row['중량/옵션'] || '');
                const rawPrice = parseFloat(String(row['Wholesale Price'] || row['도매가 (원)'] || '').replace(/,/g, ''));

                if (!isFruitMatch(searchName, searchKind, pname)) return;
                const kgVal = parseWeightToKg(pweight);
                if (!kgVal || isNaN(rawPrice) || rawPrice <= 0) return;

                const pricePerKg = Math.round(rawPrice / kgVal);
                results.push({
                    vendor,
                    displayName,
                    pname,
                    pweight,
                    totalPrice: rawPrice,
                    kgVal,
                    pricePerKg
                });
            });
        }
        return results;
    }

    function calculateMargin(data, unitGradeText, pcode) {
        let kgTarget = parseFloat(weightSelect.value);
        
        if (!data || data.prices.length === 0) {
            document.getElementById('b2b-price-display').innerHTML = "<div style='color:#888;'>데이터 없음</div>";
            return;
        }

        currentPcode = pcode;
        // b2b 데이터 늦게 도착할 경우를 대비해 마지막 인자 저장
        window._lastTrendData = { priceData: data, unitGrade: unitGradeText };

        let validPrices = data.prices.filter(p => p !== null);
        const latestPricePerKg = validPrices.length > 0 ? validPrices[validPrices.length - 1] : 0;
        const weight = parseFloat(weightSelect.value);
        let kamisCost = Math.round(latestPricePerKg * weight);

        // ---- 도매처 상품 조회 (중량 무관, 전체 매칭) ----
        const searchName = pcode ? (pcode.item_name || '') : '';
        const searchKind = pcode ? (pcode.kind_name || '') : '';
        const matchedProducts = getB2bMatchedProducts(searchName, searchKind);

        // KAMIS 라디오 + 직접 입력
        let b2bHtml = `
            <div style="margin-bottom:8px;">
                <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
                    <input type="radio" name="wholesale_cost" value="${kamisCost}" checked>
                    <span>KAMIS 평균가 (1kg당 <b>${latestPricePerKg.toLocaleString()}원</b> × ${weight}kg): <b class="value-highlight" style="font-size:1.2rem;">${kamisCost.toLocaleString()}원</b></span>
                </label>
            </div>
            <div style="margin-bottom:8px;">
                <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
                    <input type="radio" name="wholesale_cost" value="custom" id="custom-wholesale-radio">
                    <span>직접 입력 (총 ${weight}kg 기준): <input type="number" id="custom-wholesale-cost" value="${kamisCost}" style="width:110px; background:#1e1e1e; border:1px solid #444; color:#fff; padding:4px 8px; border-radius:4px;" step="10"> 원</span>
                </label>
            </div>
        `;

        // ---- 제휴 도매처 상품 테이블 (전체 표시, 1kg당 단가 기준 정렬) ----
        if (matchedProducts.length > 0) {
            // 1kg당 단가 오름차순 정렬
            matchedProducts.sort((a, b) => a.pricePerKg - b.pricePerKg);

            // 도매처별 색상 맵
            const vendorColors = { '도매처 1': '#fff', '도매처 2': '#00F0FF', '도매처 3': '#FFD56F' };

            b2bHtml += `
            <div style="margin-top:12px; margin-bottom:6px; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">
                <b>💡 제휴 도매처 단가 비교</b>
                <span style="font-size:0.78rem; color:#888; margin-left:8px;">(${searchName} 관련 전체 상품 · 1kg당 단가 기준 정렬)</span>
            </div>
            <div style="overflow-x:auto;">
            <table class="price-table-sm" style="margin-top:6px; width:100%; border-collapse:collapse;">
                <thead>
                    <tr style="background:rgba(255,255,255,0.07); font-size:0.82rem; color:#aaa;">
                        <th style="padding:6px 8px;">선택</th>
                        <th style="padding:6px 8px;">도매처</th>
                        <th style="padding:6px 8px; text-align:left;">상품명</th>
                        <th style="padding:6px 8px;">규격</th>
                        <th style="padding:6px 8px;">총 금액</th>
                        <th style="padding:6px 8px;">1kg당 단가</th>
                        <th style="padding:6px 8px;">${weight}kg 환산</th>
                    </tr>
                </thead>
                <tbody id="b2b-table-body">
            `;

            matchedProducts.forEach((p, idx) => {
                const rid = `radio_b2b_${idx}`;
                const costForWeight = Math.round(p.pricePerKg * weight);
                const vcolor = vendorColors[p.displayName] || '#fff';
                const isBest = idx === 0 ? '⭐' : '';
                b2bHtml += `
                    <tr style="cursor:pointer; border-bottom:1px solid rgba(255,255,255,0.05); font-size:0.83rem;"
                        onclick="document.getElementById('${rid}').click()">
                        <td style="text-align:center; padding:7px 6px;">
                            <input type="radio" name="wholesale_cost" id="${rid}" value="${costForWeight}">
                        </td>
                        <td style="color:${vcolor}; font-weight:bold; padding:7px 6px; white-space:nowrap;">${isBest}${p.displayName}</td>
                        <td style="padding:7px 6px; color:#ddd;">${p.pname}</td>
                        <td style="padding:7px 6px; color:#aaa; white-space:nowrap;">${p.pweight}</td>
                        <td style="padding:7px 6px; color:#FFD56F; white-space:nowrap;">${p.totalPrice.toLocaleString()}원</td>
                        <td style="padding:7px 6px; color:#00F0FF; font-weight:bold; white-space:nowrap;">${p.pricePerKg.toLocaleString()}원/kg</td>
                        <td style="padding:7px 6px; color:#38ef7d; font-weight:bold; white-space:nowrap;">${costForWeight.toLocaleString()}원</td>
                    </tr>`;
            });

            b2bHtml += `</tbody></table></div>`;
        } else {
            b2bHtml += `
            <div style="margin-top:12px; padding:10px 14px; background:rgba(255,120,80,0.1); border-radius:8px; border:1px solid rgba(255,120,80,0.3); color:#aaa; font-size:0.85rem;">
                ⚠️ <b>${searchName}</b> 관련 상품이 등록된 3개 도매처(CSV)에서 조회되지 않았습니다.<br>
                <span style="font-size:0.78rem; color:#888;">→ KAMIS 평균가 또는 직접 입력으로 계산을 진행하세요.</span>
            </div>`;
        }

        document.getElementById('b2b-price-display').innerHTML = b2bHtml;

        // 라디오 버튼 이벤트 연결
        document.querySelectorAll('input[name="wholesale_cost"]').forEach(r => {
            r.addEventListener('change', recalculateResult);
        });
        const customInput = document.getElementById('custom-wholesale-cost');
        if (customInput) {
            customInput.addEventListener('input', () => {
                document.getElementById('custom-wholesale-radio').checked = true;
                recalculateResult();
            });
        }

        recalculateResult();
    }

    function recalculateResult() {
        const checkedRadio = document.querySelector('input[name="wholesale_cost"]:checked');
        if (!checkedRadio) return;

        let selectedVal = checkedRadio.value;
        if (selectedVal === 'custom') {
            const customInput = document.getElementById('custom-wholesale-cost');
            currentCost = parseFloat(customInput.value) || 0;
        } else {
            currentCost = parseFloat(selectedVal); // 도매 사입가
        }
        const pCost = parseFloat(packingCost.value) || 0;
        const sCost = parseFloat(shippingCost.value) || 0;
        
        let totalBaseCost = currentCost + pCost + sCost;

        const feePercent = parseFloat(platformFee.value) / 100 || 0;
        const mktPercent = parseFloat(marketingFee.value) / 100 || 0;
        const targetMarginPercent = parseFloat(targetMargin.value) / 100 || 0;

        let retailPrice = 0;
        // 판매가 기준이 아닌 '원가 대비 마진율'로 계산
        const denominator = 1 - feePercent - mktPercent;
        if (denominator > 0) {
            retailPrice = (totalBaseCost * (1 + targetMarginPercent)) / denominator;
        } else {
            document.getElementById('suggested-retail-price').textContent = "수수료 과다(계산불가)";
            return;
        }

        currentSRP = Math.ceil(retailPrice / 100) * 100;

        document.getElementById('disp-weight').textContent = weightSelect.value + 'kg';
        try{ document.getElementById('disp-margin').textContent = targetMargin.value + '% (원가대비)'; }catch(e){}

        document.getElementById('suggested-retail-price').textContent = currentSRP.toLocaleString() + '원';

        // Update bars
        const costPct = (totalBaseCost / currentSRP) * 100;
        const feeMktPct = ((feePercent + mktPercent) * currentSRP) / currentSRP * 100;
        const marginPct = (currentSRP - totalBaseCost - ((feePercent + mktPercent) * currentSRP)) / currentSRP * 100;

        document.getElementById('bar-cost').style.width = `${Math.max(0, costPct)}%`;
        document.getElementById('bar-fee').style.width = `${Math.max(0, feeMktPct)}%`;
        document.getElementById('bar-margin').style.width = `${Math.max(0, marginPct)}%`;

        const feeMktValue = Math.round((feePercent + mktPercent) * currentSRP);
        const marginValue = Math.round(currentSRP - totalBaseCost - feeMktValue);

        try {
            document.getElementById('label-cost-val').textContent = `${Math.round(totalBaseCost).toLocaleString()}원`;
            document.getElementById('label-fee-val').textContent = `${feeMktValue.toLocaleString()}원`;
            document.getElementById('label-margin-val').textContent = `${marginValue.toLocaleString()}원`;
        } catch(e) {}

        const actualMarkup = ((marginValue / totalBaseCost) * 100).toFixed(1);
        document.getElementById('bar-margin').title = `원가대비 마진: ${actualMarkup}% (${marginValue.toLocaleString()}원)`;
    }

    weightSelect.addEventListener('change', () => updateBtn.click());
    platformFee.addEventListener('input', recalculateResult);
    targetMargin.addEventListener('input', recalculateResult);

    // ---- PRICE COMPARISON & COUPANG BENCHMARKING LOGIC ----
    document.getElementById('refresh-comparison')?.addEventListener('click', () => {
        renderPriceComparison();
    });

    function renderPriceComparison() {
        const tbody = document.getElementById('comparison-tbody');
        const recommend = document.getElementById('ai-comparison-recommend');
        if (!tbody) return;

        const weightNum = parseFloat(document.getElementById('weight-select').value) || 1;

        const vendorMeta = {
            'econfarm':  { id: '도매처 1', link: 'https://econfarm.adminplus.co.kr/partner/login.html?rtnurl=%2Fpartner%2F%3Fmod%3Dproduct%26actpage%3Dprt.list', color: '#fff' },
            'mgb2bmall': { id: '도매처 2', link: 'https://mgb2bmall.com/', color: '#00F0FF' },
            'hwanggs3':  { id: '도매처 3', link: 'https://hwanggs3.adminplus.co.kr/partner/?mod=product&actpage=prt.list', color: '#FFD56F' }
        };

        if (!currentPcode) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888;">2페이지에서 과일 품목을 먼저 선택하고 차트를 갱신해주세요.</td></tr>`;
            recommend.innerHTML = "과일을 선택하면 추천 도매처 정보가 표출됩니다.";
            return;
        }

        const searchName = currentPcode.item_name || '';
        const searchKind = currentPcode.kind_name || '';
        const allMatched = getB2bMatchedProducts(searchName, searchKind);

        // 도매처별로 그룹화하여 최저 1kg 단가 추출
        const vendorSummary = {};
        for (let vk in vendorMeta) vendorSummary[vk] = { products: [], minPricePerKg: Infinity, bestProduct: '' };

        allMatched.forEach(p => {
            const vk = p.vendor;
            if (vendorSummary[vk]) {
                vendorSummary[vk].products.push(p);
                if (p.pricePerKg < vendorSummary[vk].minPricePerKg) {
                    vendorSummary[vk].minPricePerKg = p.pricePerKg;
                    vendorSummary[vk].bestProduct = p.pname;
                }
            }
        });

        let lowestPerKg = Infinity;
        let bestVendorId = null;
        for (let vk in vendorSummary) {
            if (vendorSummary[vk].minPricePerKg < lowestPerKg) {
                lowestPerKg = vendorSummary[vk].minPricePerKg;
                bestVendorId = vendorMeta[vk].id;
            }
        }

        let html = '';
        for (let vk in vendorMeta) {
            const meta = vendorMeta[vk];
            const summ = vendorSummary[vk];
            const hasData = summ.minPricePerKg < Infinity;
            const pricePerKgText = hasData ? `${summ.minPricePerKg.toLocaleString()}원/kg` : `<span style="color:#888;">조회 불가</span>`;
            const estCostText   = hasData ? `→ ${weightNum}kg: <b style="color:#38ef7d;">${Math.round(summ.minPricePerKg * weightNum).toLocaleString()}원</b>` : '';
            const productCount  = summ.products.length;
            const score = !hasData ? '-' : (summ.minPricePerKg === lowestPerKg ? '★★★★★ 최저가' : '★★★★☆');
            const scoreColor = !hasData ? '#888' : (summ.minPricePerKg === lowestPerKg ? '#38ef7d' : '#FFD56F');

            html += `
                <tr>
                    <td style="color:${meta.color}; font-weight:bold;">
                        <a href="${meta.link}" target="_blank" style="color:inherit; text-decoration:underline;">${meta.id} 🔗</a>
                    </td>
                    <td style="color:#00F0FF; font-weight:bold;">${pricePerKgText}<br><small style="color:#aaa; font-weight:normal;">${estCostText}</small></td>
                    <td><small style="color:#ccc;">${hasData ? summ.bestProduct : '해당 품목 없음'}</small><br><small style="color:#888;">${hasData ? `(총 ${productCount}개 상품)` : ''}</small></td>
                    <td>업체 직접 확인</td>
                    <td style="color:${scoreColor}; font-weight:bold;">${score}</td>
                </tr>`;
        }

        if (!allMatched.length) {
            html = `<tr><td colspan="5" style="text-align:center;color:#888;">등록된 3개 도매처에서 '${searchName}' 관련 상품을 찾을 수 없습니다.<br><small>CSV 데이터를 확인하거나 다른 품목을 선택해주세요.</small></td></tr>`;
            recommend.innerHTML = `등록된 도매처 CSV에서 '${searchName}' 관련 상품이 없어 비교가 어렵습니다.<br><span style="color:#888;font-size:0.85rem;">🔒 로그인 정보: (공통) ID: passloveon / PW: n20130514!</span>`;
        } else {
            const targetMarginVal = document.getElementById('target-margin')?.value || '20';
            recommend.innerHTML = bestVendorId
                ? `<strong style="color:#00F0FF">'${bestVendorId}'</strong>의 1kg당 단가(${lowestPerKg.toLocaleString()}원/kg)가 가장 저렴합니다. 마진율 ${targetMarginVal}% 달성에 유리합니다.<br><span style="color:#888;font-size:0.85rem;">🔒 로그인 정보: (공통) ID: passloveon / PW: n20130514!</span>`
                : '도매처 가격 비교 데이터를 불러왔습니다.';
        }

        tbody.innerHTML = html;
    }

    function renderCoupangBenchmarking() {
        const selectBox = document.getElementById('benchmarking-fruit-select');
        const analyzeBtn = document.getElementById('refresh-benchmarking-btn');
        const top5 = document.getElementById('coupang-top5');
        const aiTitle = document.getElementById('ai-title-suggestion');
        const aiTags = document.getElementById('ai-tag-list');
        const aiReview = document.getElementById('ai-review-analysis');
        if (!top5 || !selectBox) return;

        // 2페이지 현재 드롭다운 텍스트를 바로 가져옴
        const fruitSelectDropdown = document.getElementById('fruit-select');
        let activeFruitName = '선택 없음';
        if(fruitSelectDropdown.selectedIndex >= 0) {
            activeFruitName = fruitSelectDropdown.options[fruitSelectDropdown.selectedIndex].text;
        }
        selectBox.innerHTML = `${activeFruitName} <span style="font-size:0.85rem; color:#888;">(시뮬레이션 중량: ${document.getElementById('weight-select').value}kg)</span>`;

        const updateBenchmarking = (fruitName) => {
            if(!fruitName || fruitName === '선택 없음') return;
            const isChameui = fruitName.includes('참외');
            const isTomato = fruitName.includes('토마토');
            const isMandarin = fruitName.includes('만다린') || fruitName.includes('귤');
            
            let baseName = fruitName;
            if (isChameui) baseName = '성주 꿀참외';
            else if (isTomato) baseName = '고당도 대추 방울토마토';
            else if (isMandarin) baseName = '제주 직송 고당도 감귤';

            const competitors = [];
            for (let i = 1; i <= 10; i++) {
                let price = (Math.floor(Math.random() * 15) + 15) * 1000 + 900;
                let reviews = Math.floor(Math.random() * 10000) + 1000;
                let rating = (Math.random() * 0.5 + 4.5).toFixed(1);
                
                let title = `${baseName} 산지직송 당일수확`;
                if(i%2===0) title = `[프리미엄] 특사이즈 ${baseName} 가정용 선물겸용`;
                if(i%3===0) title = `업계 1위 흠집 못난이 ${baseName} 꿀당도 보장`;
                
                competitors.push({ rank: i, title, price: price.toLocaleString()+'원', reviews: `${reviews.toLocaleString()}개 (${rating}/5)` });
            }

            let top5Html = '';
            competitors.forEach(c => {
                top5Html += `
                <div style="padding:10px; background:rgba(255,255,255,0.05); border-radius:8px; display:flex; gap:10px; align-items:center;">
                    <div style="background:${c.rank <= 3 ? '#FFD56F' : '#00F0FF'}; color:#000; font-weight:bold; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">${c.rank}</div>
                    <div style="flex:1">
                        <div style="font-size:0.95rem; font-weight:bold;">${c.title}</div>
                        <div style="color:#FFD56F; font-size:0.85rem; margin-top:3px;">판매가: ${c.price} <span style="color:#888; margin-left:10px;">💬 누적 리뷰: ${c.reviews}</span></div>
                    </div>
                </div>`;
            });
            top5.innerHTML = top5Html;

            aiTitle.innerHTML = `[당일수확] 13Brix 초고당도 꿀이 뚝뚝 ${baseName} 산지직송 무료배송`;
            
            const seoData = {
                '사과': [
                    { t: '아침금사과', v: '4.2만', c: '경쟁: 낮음', color: '#38ef7d' }, { t: '세척사과', v: '3.1만', c: '경쟁: 보통', color: '#FFD56F' }, 
                    { t: '가정용흠집', v: '8.4만', c: '경쟁: 높음', color: '#FF7B54' }, { t: '당뇨과일', v: '1.2만', c: '경쟁: 낮음', color: '#38ef7d' }, 
                    { t: '경북청송', v: '2.5만', c: '경쟁: 보통', color: '#FFD56F' }, { t: '임산부간식', v: '1.4만', c: '경쟁: 낮음', color: '#38ef7d' }
                ],
                '딸기': [
                    { t: '논산딸기', v: '5.2만', c: '경쟁: 높음', color: '#FF7B54' }, { t: '임산부과일', v: '1.5만', c: '경쟁: 낮음', color: '#38ef7d' }, 
                    { t: '생딸기우유', v: '1.1만', c: '경쟁: 낮음', color: '#38ef7d' }, { t: '프리미엄과일', v: '3.4만', c: '경쟁: 보통', color: '#FFD56F' }, 
                    { t: '어린이간식', v: '2.4만', c: '경쟁: 보통', color: '#FFD56F' }, { t: '무농약딸기', v: '1.9만', c: '경쟁: 낮음', color: '#38ef7d' }
                ],
                '토마토': [
                    { t: '다이어트식단', v: '8.5만', c: '경쟁: 높음', color: '#FF7B54' }, { t: '단마토', v: '5.2만', c: '경쟁: 보통', color: '#FFD56F' }, 
                    { t: '흑토마토', v: '1.8만', c: '경쟁: 낮음', color: '#38ef7d' }, { t: '에어프라이어', v: '9.4만', c: '경쟁: 높음', color: '#FF7B54' }, 
                    { t: '대저짭짤이', v: '6.4만', c: '경쟁: 높음', color: '#FF7B54' }, { t: '건강간식', v: '3.2만', c: '경쟁: 보통', color: '#FFD56F' }
                ],
                '배': [
                    { t: '과일선물세트', v: '6.8만', c: '경쟁: 높음', color: '#FF7B54' }, { t: '기관지에좋은', v: '1.8만', c: '경쟁: 낮음', color: '#38ef7d' }, 
                    { t: '제수용과일', v: '3.5만', c: '경쟁: 보통', color: '#FFD56F' }, { t: '나주배', v: '4.1만', c: '경쟁: 높음', color: '#FF7B54' }, 
                    { t: '도라지배즙', v: '11만', c: '경쟁: 높음', color: '#FF7B54' }, { t: '아이간식', v: '2.1만', c: '경쟁: 보통', color: '#FFD56F' }
                ],
                '감귤': [
                    { t: '타이벡감귤', v: '8.8만', c: '경쟁: 높음', color: '#FF7B54' }, { t: '제주도노지귤', v: '4.5만', c: '경쟁: 보통', color: '#FFD56F' }, 
                    { t: '뀰', v: '2.2만', c: '경쟁: 낮음', color: '#38ef7d' }, { t: '임산부과일', v: '1.4만', c: '경쟁: 낮음', color: '#38ef7d' }, 
                    { t: '로얄과', v: '3.1만', c: '경쟁: 보통', color: '#FFD56F' }, { t: '박스귤', v: '6.5만', c: '경쟁: 높음', color: '#FF7B54' }
                ],
                '수박': [
                    { t: '흑미수박', v: '1.2만', c: '경쟁: 낮음', color: '#38ef7d' }, { t: '고창수박', v: '3.4만', c: '경쟁: 보통', color: '#FFD56F' }, 
                    { t: '애플수박', v: '5.5만', c: '경쟁: 높음', color: '#FF7B54' }, { t: '여름휴가음식', v: '2.8만', c: '경쟁: 낮음', color: '#38ef7d' },
                    { t: '캠핑용과일', v: '3.8만', c: '경쟁: 보통', color: '#FFD56F' }, { t: '씨적은수박', v: '1.9만', c: '경쟁: 낮음', color: '#38ef7d' }
                ],
                '참외': [
                    { t: '성주꿀참외', v: '7.2만', c: '경쟁: 높음', color: '#FF7B54' }, { t: '정품참외', v: '1.5만', c: '경쟁: 낮음', color: '#38ef7d' }, 
                    { t: '가정용못난이', v: '4.1만', c: '경쟁: 보통', color: '#FFD56F' }, { t: '여름제철과일', v: '6.4만', c: '경쟁: 높음', color: '#FF7B54' },
                    { t: '임산부간식', v: '1.2만', c: '경쟁: 낮음', color: '#38ef7d' }, { t: '10brix이상', v: '2.1만', c: '경쟁: 보통', color: '#FFD56F' }
                ]
            };
            
            let selectedSEO = [
                { t: '산지직송', v: '1.2만', c: '경쟁: 낮음', color: '#38ef7d' }, { t: '가정용못난이', v: '4.2만', c: '경쟁: 보통', color: '#FFD56F' },
                { t: '무료배송', v: '55만', c: '경쟁: 높음', color: '#FF7B54' }, { t: '제철과일', v: '6.5만', c: '경쟁: 보통', color: '#FFD56F' },
                { t: '당일수확', v: '2.1만', c: '경쟁: 낮음', color: '#38ef7d' }, { t: '다이어트간식', v: '3.8만', c: '경쟁: 보통', color: '#FFD56F' }
            ];

            for (let k in seoData) {
                if (fruitName.includes(k)) {
                    selectedSEO = seoData[k];
                    break;
                }
            }

            let tagHTML = '<div style="display:flex; flex-wrap:wrap; gap:10px;">';
            selectedSEO.forEach(k => {
                tagHTML += `
                <div style="padding:10px 14px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); border-radius:12px; display:inline-flex; flex-direction:column; min-width:110px;">
                    <span style="font-size:1.05rem; color:#fff; font-weight:bold; margin-bottom:5px;">#${k.t}</span>
                    <span style="font-size:0.8rem; color:#aaa;">검색량: <span style="color:#00F0FF; font-weight:bold;">${k.v}</span></span>
                    <span style="font-size:0.75rem; color:${k.color}; margin-top:3px;">${k.c}</span>
                </div>`;
            });
            tagHTML += '</div>';
            aiTags.innerHTML = tagHTML;

            aiReview.innerHTML = `
                <li><span style="color:#FF7B54">⚠️ 경쟁사 불만 포인트:</span> "크기가 사진과 다르게 너무 작아요", "터져서 배송된게 많아요"</li>
                <li><span style="color:#00F0FF">💡 핵심 솔루션 (차별화!):</span> 상세페이지 첫 뷰에 <b>'에어캡 2중 안심 포장 공정'</b>과 <b>'크기 비교 인증샷'</b>을 필수 배치해 주세요. 구매 전환율이 25% 이상 상승할 수 있습니다.</li>
            `;
        };

        if(analyzeBtn) {
            analyzeBtn.onclick = () => {
                top5.innerHTML = `<div style="text-align:center; padding: 40px; color:#888;">AI가 실시간 스크래핑을 위해 데이터를 분석 중입니다...</div>`;
                setTimeout(() => updateBenchmarking(activeFruitName), 800);
            };
        }
        updateBenchmarking(activeFruitName);

        // 4페이지로 옮겨온 소싱 저장 로직
        const saveItemBtn = document.getElementById('save-item-btn');
        if(saveItemBtn) {
            saveItemBtn.onclick = () => {
                if(!activeFruitName || activeFruitName === '선택 없음') return;
                let savedItems = JSON.parse(localStorage.getItem('premiumSourcingItems') || '[]');
                
                const newItem = {
                    name: activeFruitName,
                    weight: parseFloat(document.getElementById('weight-select').value),
                    cost: currentCost,
                    srp: currentSRP,
                    date: new Date().toLocaleDateString()
                };
                savedItems.push(newItem);
                localStorage.setItem('premiumSourcingItems', JSON.stringify(savedItems));
                alert(`[${activeFruitName}] 품목이 '5. 내 소싱 관리장'에 성공적으로 저장되었습니다!`);
                renderSourcingManager(); // 즉시 갱신
            };
        }
    }

    function renderSourcingManager() {
        const container = document.getElementById('saved-items-container');
        const clearBtn = document.getElementById('clear-sourcing-btn');
        if(!container) return;

        let savedItems = JSON.parse(localStorage.getItem('premiumSourcingItems') || '[]');
        
        if (savedItems.length === 0) {
            container.innerHTML = `<p style="color:#888; text-align:center; padding:20px; width:100%; grid-column:1/-1;">아직 저장된 소싱 품목이 없습니다.<br>2~4단계를 거친 뒤 품목을 저장해주세요!</p>`;
            return;
        }

        let html = '';
        savedItems.forEach((item, idx) => {
            const marginAmount = item.srp - item.cost;
            const marginRate = item.cost > 0 ? (marginAmount / item.cost * 100).toFixed(1) : 0;
            html += `
            <div class="weekly-card slide-in-delay-1" style="position:relative;">
                <h3 style="font-size:1.2rem; color:#fff;">${item.name} <span style="font-size:0.8rem; color:#bbb;">(${item.date})</span></h3>
                <div style="margin-top:15px; background:rgba(0,0,0,0.3); padding:10px; border-radius:8px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <span style="color:#aaa;">판매 단위:</span> <span><b>${item.weight}</b> kg</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <span style="color:#aaa;">예상 원가:</span> <span style="color:#FFD56F">${Math.round(item.cost).toLocaleString()} 원</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding-bottom:10px; border-bottom:1px dashed rgba(255,255,255,0.1); margin-bottom:10px;">
                        <span style="color:#aaa;">추천 판매가:</span> <span style="color:#00F0FF; font-weight:bold;">${Math.round(item.srp).toLocaleString()} 원</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-weight:bold;">
                        <span>예상 마진:</span> <span style="color:#11998e;">${marginRate}%</span>
                    </div>
                </div>
                <button onclick="removeSourcingItem(${idx})" style="position:absolute; top:15px; right:15px; background:transparent; border:none; color:#FF7B54; cursor:pointer;">❌</button>
            </div>`;
        });
        container.innerHTML = html;

        if(clearBtn) {
            clearBtn.onclick = () => {
                if(confirm('소싱 관리장의 모든 저장 내역을 삭제하시겠습니까?')) {
                    localStorage.removeItem('premiumSourcingItems');
                    renderSourcingManager();
                }
            };
        }
    }

    // 전역 함수로 등록하여 인라인 onclick에서 호출 가능하게 함
    window.removeSourcingItem = function(index) {
        let savedItems = JSON.parse(localStorage.getItem('premiumSourcingItems') || '[]');
        savedItems.splice(index, 1);
        localStorage.setItem('premiumSourcingItems', JSON.stringify(savedItems));
        renderSourcingManager();
    };

    // 탭 이동 시 렌더링 동기화
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabId = e.target.getAttribute('data-tab');
            if(tabId === 'price-comparison') {
                renderPriceComparison();
            } else if(tabId === 'coupang-benchmarking') {
                renderCoupangBenchmarking();
            } else if(tabId === 'sourcing-manager') {
                renderSourcingManager();
            }
        });
    });
});
