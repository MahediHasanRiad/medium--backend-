export const apiResponse = <T>(
  data: T,
  message: string,
): { success: true; message: string; data: T } => {
  return {
    success: true,
    message,
    data,
  };
};
