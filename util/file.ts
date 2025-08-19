import { uploadFile } from "@/api/axios/cos";
import { Question } from "@/entity/question";

export interface UploadedFile {
  file: File;
  preview: string;
  url?: string;
  isUploading: boolean;
  uploadSuccess: boolean;
  uploadError?: string;
}

export interface FileUploadResult {
  success: boolean;
  url?: string;
  error?: any;
}

/**
 * 生成文件预览
 */
export const generateFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      resolve(preview);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * 上传单个文件
 */
export const uploadSingleFile = async (
  file: File
): Promise<FileUploadResult> => {
  try {
    const result = await uploadFile(file);
    return {
      success: result.success,
      url: result.success ? result.url : undefined,
      error: result.success ? undefined : "上传失败",
    };
  } catch (error) {
    return {
      success: false,
      error: "上传失败",
    };
  }
};

/**
 * 批量上传文件
 */
export const uploadMultipleFiles = async (
  files: File[]
): Promise<UploadedFile[]> => {
  const uploadedFiles: UploadedFile[] = [];

  for (const file of files) {
    // 生成预览
    const preview = await generateFilePreview(file);

    // 创建上传文件对象
    const uploadedFile: UploadedFile = {
      file,
      preview,
      isUploading: true,
      uploadSuccess: false,
    };

    uploadedFiles.push(uploadedFile);

    // 开始上传
    const result = await uploadSingleFile(file);

    // 更新上传状态
    const index = uploadedFiles.length - 1;
    uploadedFiles[index] = {
      ...uploadedFile,
      isUploading: false,
      uploadSuccess: result.success,
      url: result.success ? result.url : undefined,
      uploadError: result.success ? undefined : result.error,
    };
  }

  return uploadedFiles;
};

/**
 * 获取文件图标类型
 */
export const getFileType = (
  file: File
): "image" | "video" | "audio" | "document" => {
  if (file.type.startsWith("image/")) {
    return "image";
  } else if (file.type.startsWith("video/")) {
    return "video";
  } else if (file.type.startsWith("audio/")) {
    return "audio";
  } else {
    return "document";
  }
};

/**
 * 根据文件类型更新问题对象
 */
export const updateQuestionWithFile = (
  question: Partial<Question>,
  file: File,
  url: string
): Partial<Question> => {
  const updated = { ...question };
  const fileType = getFileType(file);

  switch (fileType) {
    case "image":
      updated.images = [...(updated.images || []), url];
      break;
    case "video":
      updated.videos = [...(updated.videos || []), url];
      break;
    case "audio":
      updated.audios = [...(updated.audios || []), url];
      break;
    case "document":
      // 文档类文件作为附件
      updated.attachments = [...(updated.attachments || []), url];
      break;
  }

  return updated;
};

/**
 * 从问题对象中移除文件
 */
export const removeFileFromQuestion = (
  question: Partial<Question>,
  file: File,
  url: string
): Partial<Question> => {
  const updated = { ...question };
  const fileType = getFileType(file);

  switch (fileType) {
    case "image":
      updated.images = updated.images?.filter((u: string) => u !== url) || [];
      break;
    case "video":
      updated.videos = updated.videos?.filter((u: string) => u !== url) || [];
      break;
    case "audio":
      updated.audios = updated.audios?.filter((u: string) => u !== url) || [];
      break;
    case "document":
      updated.attachments =
        updated.attachments?.filter((u: string) => u !== url) || [];
      break;
  }

  return updated;
};

/**
 * 处理文件上传事件
 */
export const handleFileUploadEvent = async (
  event: React.ChangeEvent<HTMLInputElement>,
  onFileAdded: (file: UploadedFile, index: number) => void,
  onFileUploaded: (index: number, result: FileUploadResult) => void
): Promise<void> => {
  const files = Array.from(event.target.files || []);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // 生成预览
    const preview = await generateFilePreview(file);

    // 创建上传文件对象
    const uploadedFile: UploadedFile = {
      file,
      preview,
      isUploading: true,
      uploadSuccess: false,
    };

    // 添加到列表
    onFileAdded(uploadedFile, i);

    // 开始上传
    const result = await uploadSingleFile(file);

    // 更新上传状态
    onFileUploaded(i, result);
  }
};
