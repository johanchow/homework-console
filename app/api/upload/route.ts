import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import COS from "cos-nodejs-sdk-v5";

const cos = new COS({
  SecretId: process.env.TENCENT_COS_SECRET_ID,
  SecretKey: process.env.TENCENT_COS_SECRET_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "没有找到上传的文件" },
        { status: 400 }
      );
    }

    // TODO: 这里需要集成腾讯云COS SDK
    // 目前先模拟上传成功
    const uploadedUrls = files.map((file, index) => {
      // 模拟腾讯云返回的URL
      return `https://example-bucket.cos.ap-beijing.myqcloud.com/uploaded-${Date.now()}-${index}.${file.name.split(".").pop()}`;
    });

    return NextResponse.json({
      success: true,
      data: {
        urls: uploadedUrls,
        count: files.length,
      },
    });
  } catch (error) {
    console.error("上传文件失败:", error);
    return NextResponse.json(
      { success: false, message: "上传文件失败" },
      { status: 500 }
    );
  }
}
