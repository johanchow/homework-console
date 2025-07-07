import COS from "cos-js-sdk-v5";

const fetchTempSecret = async (): Promise<{
  secretId: string;
  secretKey: string;
  securityToken: string;
  timestamp: number;
}> => {
  const response = await fetch("/api/cos/temp-secret");
  return response.json();
};

const uploadFile = async (file: File) => {
  const cos = new COS({
    SecretId: process.env.NEXT_PUBLIC_TENCENT_COS_SECRET_ID,
    SecretKey: process.env.NEXT_PUBLIC_TENCENT_COS_SECRET_KEY,
    // SecurityToken: securityToken,
  });

  const bucket = process.env.NEXT_PUBLIC_TENCENT_COS_BUCKET;
  const region = process.env.NEXT_PUBLIC_TENCENT_COS_REGION;
  const key = `homework-mentor/${Math.floor(Date.now() / 1000)}-${file.name}`;
  try {
    await cos.putObject({
      Bucket: bucket!,
      Region: region!,
      Key: key,
      Body: file,
      onProgress: function (progressData) {
        console.log(JSON.stringify(progressData));
      },
    });
    return {
      success: true,
      url: `https://${bucket}.cos.${region}.myqcloud.com/${key}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error,
    };
  }
};

export { fetchTempSecret, uploadFile };
