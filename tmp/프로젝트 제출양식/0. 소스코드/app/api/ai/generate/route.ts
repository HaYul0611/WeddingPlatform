import { NextResponse } from 'next/server';

type GenType = 'greeting' | 'translate';
type Tone = 'formal' | 'friendly' | 'emotional' | 'humorous' | 'poetic';

// 로컬 체험형 스마트 Fallback AI 템플릿 엔진 (API Key 부재 시 작동!)
const FALLBACK_TEMPLATES: Record<Tone, string[]> = {
  formal: [
    "서로 다른 색으로 살아온 두 사람이\n이제 하나의 아름다운 그림을 그리려 합니다.\n\n바쁘신 중에도 귀한 걸음 해 주셔서\n저희의 첫 발걸음을 축복해 주시면\n더없는 기쁨이 되겠습니다.",
    "믿음과 사랑으로 한 길을 가고자 합니다.\n소중한 분들을 모시고 다짐하려 하오니\n참석하시어 저희의 앞날을 따뜻하게 안아주십시오."
  ],
  friendly: [
    "우리 결혼합니다! 🎉\n서로 아끼고 사랑하며 이쁘게 잘 살게요.\n드디어 한 가정을 이루는 첫날,\n친구야 꼭 와서 축하해줘! 맛있는 밥 살게 😄",
    "소꿉놀이 같던 연애를 끝내고\n진짜 결혼을 합니다! 😉\n바쁘겠지만 꼭 와서 우리의 새출발을 증명해줘!"
  ],
  emotional: [
    "너라는 따뜻한 봄바람이 불어와\n내 얼어붙었던 세상이 녹아내렸습니다.\n이제 그 온기를 품고 평생을 약속합니다.\n귀한 걸음으로 저희의 사랑을 축복해 주세요.",
    "같은 하늘 아래 같은 생각을 품고\n평생 같은 길을 걷기로 하였습니다.\n서로를 온화하게 빛내며 아름답게 살아가겠습니다."
  ],
  humorous: [
    "드디어 반품 불가의 길로 접어들었습니다! 😂\n세상에서 제일 착하고 예쁜 사람을 낚아채\n행복하게 살 테니, 오셔서 낚시 성공을 축하해 주세요!\n(안 오시면 후회할 정도로 피로연 뷔페가 기가 막힙니다!)",
    "독신 선언 전격 철회! 🎉\n유부남/유부녀 대열에 공식 합류합니다.\n우여곡절 끝에 기적처럼 결혼에 골인한 저희의\n소중한 날을 오셔서 웃음으로 증명해 주세요!"
  ],
  poetic: [
    "한 잎의 꽃잎처럼 흩날리던 우연이\n서로의 정원에 깊이 뿌리내리는 기적이 되었습니다.\n\n우리의 봄날에 피어날 새로운 계절을\n함께 오셔서 맑게 웃어 주십시오.",
    "잔잔히 흐르는 강물이 바다를 만나듯\n서로의 삶이 아름답게 녹아드는 오늘,\n그 첫 물결에 따뜻한 축복을 더해 주소서."
  ]
};

// 번역용 로컬 Fallback 템플릿
const TRANSLATE_FALLBACK: Record<Tone, string> = {
  formal: "We sincerely invite you to share in the joy of our marriage as we begin a new chapter together in love and trust.",
  friendly: "Yay! We are finally getting married! 🎉 Come celebrate our big day with us, we can't wait to see you!",
  emotional: "Two souls coming together as one under the same sky. Please guide us with your love as we walk this beautiful path of life.",
  humorous: "The search is officially over! We are finally tying the knot. 😂 Come for the wedding, stay for the delicious food!",
  poetic: "Like a gentle flower petal drifting into a beautiful garden, our hearts have found their home. Share our spring day together."
};

export async function POST(request: Request) {
  try {
    const { genType, tone, prompt } = await request.json() as {
      genType: GenType;
      tone: Tone;
      prompt: string;
    };

    const apiKey = process.env.GEMINI_API_KEY;

    // 만약 Google Gemini API 키가 환경 변수에 제공되어 있다면 진짜 LLM 호출 진행!
    if (apiKey) {
      const systemInstruction =
        `너는 대한민국 최고의 결혼식 청첩장 문장 작가이자 번역가이다.
        출력은 마크다운이나 기타 데코레이터 없이 오직 순수한 텍스트만 출력해야 한다.
        다음의 조건에 맞춰 사용자가 입력한 프롬프트 및 설정된 톤에 매칭되는 결혼식 초대 문장을 작성해라.
        
        조건:
        1. 생성 유형(genType): ${genType === 'greeting' ? '청첩장 인사말/초대글 작성' : '영어 번역 및 로컬라이징'}
        2. 톤앤매너(tone): ${tone === 'formal' ? '정중하고 고급스러운 격식체 양식' :
          tone === 'friendly' ? '이모지가 포함된 애교 있고 장난스러우며 친근한 반말/해요체' :
            tone === 'emotional' ? '시적이고 감성을 촉촉하게 적시는 따뜻한 감성체' :
              tone === 'humorous' ? '센스 넘치고 읽는 사람을 가볍게 웃게 만드는 위트 넘치는 유머체' :
                '자연과 계절, 인생을 비유한 문학적이고 깊이 있는 시적 문체'
        }
        3. 사용자가 추가로 요청한 프롬프트 요망 사항: "${prompt || '없음'}"
        
        작성 룰:
        - 결과물에 제목이나 아웃라인("예:", "결과:", "인사말:") 등을 절대 쓰지 마라. 오직 본문 문장들만 출력해라.
        - 줄바꿈을 적절히 적용하여 모바일 화면에서 시각적으로 예쁘게 보여지도록 3~6줄 내외로 문단을 가독성 높게 짜라.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemInstruction}\n\n사용자 입력 텍스트/키워드: ${prompt}`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.75,
              maxOutputTokens: 600,
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generatedText) {
          return NextResponse.json({ result: generatedText.trim() });
        }
      }
    }

    // [로컬 Fallback AI 엔진]: API Key가 없거나 호출 실패 시 마법처럼 발동!
    await new Promise((r) => setTimeout(r, 450)); // 자연스러운 AI 생성 시간 체감용 딜레이

    if (genType === 'translate') {
      // 번역 톤 Fallback
      const baseTranslation = TRANSLATE_FALLBACK[tone];
      const finalResult = prompt.trim()
        ? `[English Translation - ${tone.toUpperCase()}]\n${baseTranslation}\n\n(Reflecting: ${prompt})`
        : baseTranslation;
      return NextResponse.json({ result: finalResult });
    } else {
      // 인사말 생성 톤 Fallback
      const templates = FALLBACK_TEMPLATES[tone];
      const randomIdx = Math.floor(Math.random() * templates.length);
      const chosenTemplate = templates[randomIdx];

      // 사용자가 쓴 프롬프트 키워드가 존재하면 템플릿의 끝에 자연스럽게 가공하여 합성!
      let finalResult = chosenTemplate;
      if (prompt.trim()) {
        const keywords = prompt.split(/[,/\s]+/).filter(k => k.trim().length > 0).slice(0, 3);
        if (keywords.length > 0) {
          const decoration = `\n\n저희의 소중한 약속에 '${keywords.join(', ')}'의 따스함을 가득 안고 이쁘게 살아가겠습니다.`;
          finalResult = `${chosenTemplate}${decoration}`;
        } else {
          finalResult = `${chosenTemplate}\n\n평생 서로를 보듬으며 예쁘게 잘 살겠습니다.`;
        }
      }

      return NextResponse.json({ result: finalResult });
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'AI 생성 처리 도중 서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
