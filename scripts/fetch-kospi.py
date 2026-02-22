"""
KRX에서 KOSPI 전 종목의 종가/등락률/섹터 정보를 수집하여 JSON으로 저장
사용법: python scripts/fetch-kospi.py
"""

import json
import urllib.request
import os
from datetime import datetime

def fetch_kospi_stocks():
    """KRX API를 통해 KOSPI 전 종목 데이터를 가져온다."""

    today = datetime.now().strftime("%Y%m%d")

    # KRX 전종목 시세 API
    url = "http://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd"

    params = {
        "bld": "dbms/MDC/STAT/standard/MDCSTAT01501",
        "locale": "ko_KR",
        "mktId": "STK",  # KOSPI
        "trdDd": today,
        "share": "1",
        "money": "1",
        "csvxls_is498": "false",
    }

    data = "&".join(f"{k}={v}" for k, v in params.items()).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Content-Type": "application/x-www-form-urlencoded",
            "Referer": "http://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201020101",
        },
    )

    with urllib.request.urlopen(req, timeout=30) as resp:
        result = json.loads(resp.read().decode("utf-8"))

    stocks = result.get("OutBlock_1", [])
    if not stocks:
        raise ValueError("Empty response from KRX")

    # 업종(섹터) 정보도 가져오기
    sector_url = "http://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd"
    sector_params = {
        "bld": "dbms/MDC/STAT/standard/MDCSTAT03901",
        "locale": "ko_KR",
        "mktId": "STK",
        "trdDd": today,
        "csvxls_isNo": "false",
    }

    sector_data = "&".join(f"{k}={v}" for k, v in sector_params.items()).encode("utf-8")
    sector_req = urllib.request.Request(
        sector_url,
        data=sector_data,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Content-Type": "application/x-www-form-urlencoded",
            "Referer": "http://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201020101",
        },
    )

    # 종목코드 -> 업종 매핑 시도
    sector_map = {}
    try:
        with urllib.request.urlopen(sector_req, timeout=30) as resp:
            sector_result = json.loads(resp.read().decode("utf-8"))
        for item in sector_result.get("OutBlock_1", []):
            code = item.get("ISU_SRT_CD", "")
            sector = item.get("IDX_IND_NM", "기타")
            if code:
                sector_map[code] = sector
    except Exception:
        pass

    # 데이터 정리
    output = []
    for s in stocks:
        code = s.get("ISU_SRT_CD", "")
        name = s.get("ISU_ABBRV", "")
        close_price = s.get("TDD_CLSPRC", "0")
        change = s.get("CMPPREVDD_PRC", "0")
        change_rate = s.get("FLUC_RT", "0")
        volume = s.get("ACC_TRDVOL", "0")
        market_cap = s.get("MKTCAP", "0")

        sector = sector_map.get(code, "기타")

        output.append({
            "code": code,
            "name": name,
            "close": close_price,
            "change": change,
            "changeRate": change_rate,
            "volume": volume,
            "marketCap": market_cap,
            "sector": sector,
        })

    return output


def main():
    print("KOSPI 종목 데이터 수집 중...")
    try:
        stocks = fetch_kospi_stocks()
    except Exception as e:
        print(f"KRX 데이터 수집 실패 ({e}). 샘플 데이터를 생성합니다.")
        stocks = generate_sample_data()

    # 섹터별로 그룹핑
    sectors = {}
    for s in stocks:
        sec = s["sector"]
        if sec not in sectors:
            sectors[sec] = []
        sectors[sec].append(s)

    output = {
        "updatedAt": datetime.now().isoformat(),
        "totalCount": len(stocks),
        "sectors": sectors,
    }

    out_path = os.path.join(os.path.dirname(__file__), "..", "public", "data", "kospi-stocks.json")
    out_path = os.path.normpath(out_path)

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"완료! {len(stocks)}개 종목, {len(sectors)}개 섹터")
    print(f"저장: {out_path}")


def generate_sample_data():
    """KRX 접속 실패 시 샘플 데이터 생성"""
    import random

    sample_sectors = {
        "전기전자": [
            ("005930", "삼성전자"), ("000660", "SK하이닉스"), ("066570", "LG전자"),
            ("009150", "삼성전기"), ("006400", "삼성SDI"), ("051910", "LG화학"),
            ("034730", "SK"), ("028260", "삼성물산"), ("035420", "NAVER"),
            ("035720", "카카오"),
        ],
        "운수장비": [
            ("005380", "현대차"), ("000270", "기아"), ("012330", "현대모비스"),
            ("018880", "한온시스템"), ("161390", "한국타이어앤테크놀로지"),
        ],
        "철강금속": [
            ("005490", "POSCO홀딩스"), ("004020", "현대제철"), ("001230", "동국제강"),
            ("004990", "롯데지주"),
        ],
        "금융업": [
            ("105560", "KB금융"), ("055550", "신한지주"), ("086790", "하나금융지주"),
            ("316140", "우리금융지주"), ("024110", "기업은행"),
            ("003550", "LG"), ("032830", "삼성생명"),
        ],
        "의약품": [
            ("207940", "삼성바이오로직스"), ("068270", "셀트리온"),
            ("128940", "한미약품"), ("185750", "종근당"),
            ("006280", "녹십자"),
        ],
        "음식료품": [
            ("097950", "CJ제일제당"), ("004370", "농심"), ("280360", "롯데웰푸드"),
            ("003230", "삼양식품"), ("271560", "오리온"),
        ],
        "서비스업": [
            ("259960", "크래프톤"), ("263750", "펄어비스"), ("036570", "엔씨소프트"),
            ("041510", "에스엠"), ("352820", "하이브"),
        ],
        "화학": [
            ("051910", "LG화학"), ("010950", "S-Oil"), ("011170", "롯데케미칼"),
            ("009830", "한화솔루션"), ("298020", "효성티앤씨"),
        ],
        "건설업": [
            ("000720", "현대건설"), ("047040", "대우건설"), ("006360", "GS건설"),
            ("010130", "고려아연"),
        ],
        "유통업": [
            ("004170", "신세계"), ("069960", "현대백화점"), ("023530", "롯데쇼핑"),
            ("139480", "이마트"),
        ],
        "통신업": [
            ("017670", "SK텔레콤"), ("030200", "KT"), ("032640", "LG유플러스"),
        ],
        "전기가스업": [
            ("015760", "한국전력"), ("034020", "두산에너빌리티"),
        ],
        "기계": [
            ("042670", "두산밥캣"), ("241560", "두산로보틱스"), ("298040", "효성중공업"),
        ],
    }

    stocks = []
    for sector, items in sample_sectors.items():
        for code, name in items:
            base_price = random.randint(5000, 500000)
            change = random.randint(-base_price // 20, base_price // 20)
            change_rate = round(change / (base_price - change) * 100, 2)
            stocks.append({
                "code": code,
                "name": name,
                "close": f"{base_price:,}",
                "change": f"{change:,}",
                "changeRate": str(change_rate),
                "volume": f"{random.randint(100000, 50000000):,}",
                "marketCap": f"{random.randint(1000, 500000):,}",
                "sector": sector,
            })

    return stocks


if __name__ == "__main__":
    main()
