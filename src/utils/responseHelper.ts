class responseHelper {
    static successResponse<T>(message: string, data: T | null = null) {
        return {
          success: true,
          message,
          data,
          error: null,
        };
      }
    
      static errorResponse(message: string, error: string | null = null) {
        return {
          success: false,
          message,
          data: null,
          error,
        };
      }
  }
  
export default responseHelper
  