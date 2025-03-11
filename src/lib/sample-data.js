export const churchData = {
  "2025-03-10": {
    date: "2025-03-10",
    title: "2025년 3월 10일 주일 예배",
    worship: {
      type: "worship",
      title: "예배 순서",
      items: [
        { order: 1, name: "예배 전 찬양", description: "찬양팀" },
        { order: 2, name: "예배의 부름", description: "인도자" },
        { order: 3, name: "찬송", description: "찬송가 1장 - 다같이" },
        { order: 4, name: "대표기도", description: "김집사" },
        { order: 5, name: "성경봉독", description: "요한복음 3:16-18 - 이집사", verse: "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라 (16절) 하나님이 그 아들을 세상에 보내신 것은 세상을 심판하려 하심이 아니요 그로 말미암아 세상이 구원을 받게 하려 하심이라 (17절) 그를 믿는 자는 심판을 받지 아니하는 것이요 믿지 아니하는 자는 하나님의 독생자의 이름을 믿지 아니하므로 벌써 심판을 받은 것이니라" },
        { order: 6, name: "설교", description: "하나님의 사랑 - 박목사" },
        { order: 7, name: "봉헌", description: "찬송가 50장 - 다같이" },
        { order: 8, name: "광고", description: "인도자" },
        { order: 9, name: "축도", description: "박목사" },
      ],
      nextWeekDuty: [
        { name: "대표기도", person: "이집사" },
        { name: "성경봉독", person: "최집사" }
      ]
    },
    announcements: {
      type: "announcements",
      title: "교회 소식",
      items: [
        { id: 1, title: "새가족 환영", content: "오늘 처음 오신 분들을 환영합니다. 예배 후 새가족실로 오시면 환영 선물을 드립니다." },
        { id: 2, title: "수요 예배", content: "수요일 저녁 7시에 수요예배가 있습니다. 많은 참석 바랍니다." },
        { id: 3, title: "봄 성경학교", content: "다음 주부터 봄 성경학교가 시작됩니다. 신청은 사무실에서 받습니다." },
        { id: 4, title: "교회 대청소", content: "이번 주 토요일 오전 10시부터 교회 대청소가 있습니다. 많은 참여 바랍니다." },
      ]
    },
    churchInfo: {
      type: "churchInfo",
      title: "교회 정보",
      name: "사랑의 교회",
      address: "서울특별시 강남구 사랑로 123",
      tel: "02-123-4567",
      email: "love@church.org",
      pastor: "박사랑 목사",
      services: [
        { name: "주일 예배", time: "오전 11:00" },
        { name: "수요 예배", time: "오후 7:00" },
        { name: "금요 기도회", time: "오후 9:00" },
        { name: "새벽 기도회", time: "오전 5:30 (월-토)" },
      ]
    },
    weeklyVerse: {
      type: "weeklyVerse",
      title: "주간 말씀",
      mainVerse: "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라 (요한복음 3:16)",
      verses: [
        { day: "월요일", reference: "시편 23:1-3", text: "여호와는 나의 목자시니 내게 부족함이 없으리로다..." },
        { day: "화요일", reference: "마태복음 5:3-4", text: "심령이 가난한 자는 복이 있나니 천국이 그들의 것임이요..." },
        { day: "수요일", reference: "빌립보서 4:13", text: "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라" },
        { day: "목요일", reference: "로마서 8:28", text: "우리가 알거니와 하나님을 사랑하는 자 곧 그의 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라" },
        { day: "금요일", reference: "이사야 40:31", text: "오직 여호와를 앙망하는 자는 새 힘을 얻으리니 독수리가 날개치며 올라감 같을 것이요..." },
      ]
    },
    eveningWorship: {
      type: "worship",
      title: "저녁 예배",
      items: [
        { order: 1, name: "찬양", description: "찬양팀" },
        { order: 2, name: "대표기도", description: "최집사" },
        { order: 3, name: "성경봉독", description: "마태복음 6:9-13 - 정집사", verse: "9 그러므로 너희는 이렇게 기도하라 하늘에 계신 우리 아버지여 이름이 거룩히 여김을 받으시오며\n10 나라가 임하시오며 뜻이 하늘에서 이루어진 것 같이 땅에서도 이루어지이다\n11 오늘 우리에게 일용할 양식을 주시옵고\n12 우리가 우리에게 죄 지은 자를 사하여 준 것 같이 우리 죄를 사하여 주시옵고\n13 우리를 시험에 들게 하지 마시옵고 다만 악에서 구하시옵소서 (나라와 권세와 영광이 아버지께 영원히 있사옵나이다 아멘)" },
        { order: 4, name: "설교", description: "주기도문의 의미 - 박목사" },
        { order: 5, name: "봉헌", description: "찬송가 80장 - 다같이" },
        { order: 6, name: "축도", description: "박목사" },
      ],
      nextWeekDuty: [
        { name: "대표기도", person: "김집사" },
        { name: "성경봉독", person: "박집사" }
      ]
    }
  },
  "2025-03-17": {
    date: "2025-03-17",
    title: "2025년 3월 17일 주일 예배",
    worship: {
      type: "worship",
      title: "예배 순서",
      items: [
        { order: 1, name: "예배 전 찬양", description: "찬양팀" },
        { order: 2, name: "예배의 부름", description: "인도자" },
        { order: 3, name: "찬송", description: "찬송가 2장 - 다같이" },
        { order: 4, name: "대표기도", description: "이집사" },
        { order: 5, name: "성경봉독", description: "마태복음 5:1-10 - 최집사", verse: "1 예수께서 무리를 보시고 산에 올라가 앉으시니 제자들이 나아온지라\n2 입을 열어 가르쳐 이르시되\n3 심령이 가난한 자는 복이 있나니 천국이 그들의 것임이요\n4 애통하는 자는 복이 있나니 그들이 위로를 받을 것임이요\n5 온유한 자는 복이 있나니 그들이 땅을 기업으로 받을 것임이요\n6 의에 주리고 목마른 자는 복이 있나니 그들이 배부를 것임이요\n7 긍휼히 여기는 자는 복이 있나니 그들이 긍휼히 여김을 받을 것임이요\n8 마음이 청결한 자는 복이 있나니 그들이 하나님을 볼 것임이요\n9 화평하게 하는 자는 복이 있나니 그들이 하나님의 아들이라 일컬음을 받을 것임이요\n10 의를 위하여 박해를 받은 자는 복이 있나니 천국이 그들의 것임이라" },
        { order: 6, name: "설교", description: "팔복 - 박목사" },
        { order: 7, name: "봉헌", description: "찬송가 60장 - 다같이" },
        { order: 8, name: "광고", description: "인도자" },
        { order: 9, name: "축도", description: "박목사" },
      ],
      nextWeekDuty: [
        { name: "대표기도", person: "박집사" },
        { name: "성경봉독", person: "김집사" }
      ]
    },
    announcements: {
      type: "announcements",
      title: "교회 소식",
      items: [
        { id: 1, title: "새가족 환영", content: "오늘 처음 오신 분들을 환영합니다. 예배 후 새가족실로 오시면 환영 선물을 드립니다." },
        { id: 2, title: "봄 성경학교 시작", content: "오늘부터 봄 성경학교가 시작됩니다. 1층 교육관에서 진행됩니다." },
        { id: 3, title: "부활절 준비 모임", content: "다음 주일 예배 후 부활절 준비 모임이 있습니다." },
        { id: 4, title: "교회 홈페이지 개편", content: "교회 홈페이지가 새롭게 개편되었습니다. 많은 이용 바랍니다." },
      ]
    },
    churchInfo: {
      type: "churchInfo",
      title: "교회 정보",
      name: "사랑의 교회",
      address: "서울특별시 강남구 사랑로 123",
      tel: "02-123-4567",
      email: "love@church.org",
      pastor: "박사랑 목사",
      services: [
        { name: "주일 예배", time: "오전 11:00" },
        { name: "수요 예배", time: "오후 7:00" },
        { name: "금요 기도회", time: "오후 9:00" },
        { name: "새벽 기도회", time: "오전 5:30 (월-토)" },
      ]
    }
  },
  "2024-03-24": {
    date: "2024-03-24",
    title: "2024년 3월 24일 주일 예배",
    worship: {
      type: "worship",
      title: "예배 순서",
      items: [
        { order: 1, name: "예배 전 찬양", description: "찬양팀" },
        { order: 2, name: "예배의 부름", description: "인도자" },
        { order: 3, name: "찬송", description: "찬송가 3장 - 다같이" },
        { order: 4, name: "대표기도", description: "박집사" },
        { order: 5, name: "성경봉독", description: "요한복음 11:25-27 - 김집사", verse: "25 예수께서 이르시되 나는 부활이요 생명이니 나를 믿는 자는 죽어도 살겠고\n26 무릇 살아서 나를 믿는 자는 영원히 죽지 아니하리니 이것을 네가 믿느냐\n27 이르되 주여 그러하외다 주는 그리스도시요 세상에 오시는 하나님의 아들이신 줄 내가 믿나이다" },
        { order: 6, name: "설교", description: "부활과 생명 - 박목사" },
        { order: 7, name: "봉헌", description: "찬송가 70장 - 다같이" },
        { order: 8, name: "광고", description: "인도자" },
        { order: 9, name: "축도", description: "박목사" },
      ],
      nextWeekDuty: [
        { name: "대표기도", person: "정집사" },
        { name: "성경봉독", person: "이집사" }
      ]
    },
    announcements: {
      type: "announcements",
      title: "교회 소식",
      items: [
        { id: 1, title: "새가족 환영", content: "오늘 처음 오신 분들을 환영합니다. 예배 후 새가족실로 오시면 환영 선물을 드립니다." },
        { id: 2, title: "부활절 예배 안내", content: "다음 주일은 부활절입니다. 특별 예배가 준비되어 있습니다." },
        { id: 3, title: "성가대원 모집", content: "성가대에서 새로운 대원을 모집합니다. 관심 있으신 분들은 성가대실로 방문해주세요." },
        { id: 4, title: "교회 주차 안내", content: "교회 주변 도로공사로 인해 주차 공간이 제한됩니다. 대중교통 이용을 권장드립니다." },
      ]
    },
    churchInfo: {
      type: "churchInfo",
      title: "교회 정보",
      name: "사랑의 교회",
      address: "서울특별시 강남구 사랑로 123",
      tel: "02-123-4567",
      email: "love@church.org",
      pastor: "박사랑 목사",
      services: [
        { name: "주일 예배", time: "오전 11:00" },
        { name: "수요 예배", time: "오후 7:00" },
        { name: "금요 기도회", time: "오후 9:00" },
        { name: "새벽 기도회", time: "오전 5:30 (월-토)" },
      ]
    }
  }
};