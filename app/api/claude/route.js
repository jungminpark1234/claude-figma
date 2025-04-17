import { NextResponse } from "next/server";

export async function POST(request) {
  // CORS 헤더 설정
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, x-api-key, anthropic-version",
  };

  try {
    const body = await request.json();
    const { apiKey, originalImage, modifiedImage } = body;

    console.log(
      "API 요청 받음 - 이미지 크기:",
      Math.round(originalImage.length / 1024) +
        "KB, " +
        Math.round(modifiedImage.length / 1024) +
        "KB"
    );

    // Claude API 호출
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: '다음 두 Figma 프레임 이미지를 비교하여 정확히 어떤 요소가 추가되었는지, 삭제되었는지, 수정되었는지 분석해주세요. JSON 형식으로 응답해주세요: {"added": [{"name": "요소명", "details": "설명"}], "removed": [...], "modified": [...]}',
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/png",
                  data: originalImage,
                },
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/png",
                  data: modifiedImage,
                },
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    console.log("API 응답 받음:", data.content ? "응답 있음" : "응답 없음");
    return NextResponse.json(data, { headers: corsHeaders });
  } catch (error) {
    console.error("API 오류:", error);
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// OPTIONS 요청 처리 (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, x-api-key, anthropic-version",
      },
    }
  );
}
